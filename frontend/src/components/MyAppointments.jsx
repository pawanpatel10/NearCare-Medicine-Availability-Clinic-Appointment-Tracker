import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  orderBy
} from "firebase/firestore";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

export default function MyAppointments() {
  const { currentUser, loading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [clinicMap, setClinicMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    // ✅ ORDER BY TOKEN (NOT createdAt)
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", currentUser.uid),
      orderBy("token", "asc")
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const appts = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setAppointments(appts);

        // Load clinic data
        const clinicIds = [...new Set(appts.map(a => a.clinicId))];
        const clinicData = {};

        await Promise.all(
          clinicIds.map(async cid => {
            const cSnap = await getDoc(doc(db, "clinics", cid));
            if (cSnap.exists()) clinicData[cid] = cSnap.data();
          })
        );

        setClinicMap(clinicData);
        setLoading(false);
      },
      err => {
        console.error("Snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser, authLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

        {loading ? (
          <p className="text-gray-500">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map(a => {
              const clinic = clinicMap[a.clinicId];
              const avgTime = clinic?.avgTimePerPatient || 10;

              let statusText = a.status || "Waiting";
              let waitText = "Waiting...";
              let badgeColor = "bg-yellow-100 text-yellow-700";

              if (clinic) {
                const remaining =
                  a.token - (clinic.currentToken || 0) - 1;

                if (remaining < 0) {
                  statusText = "Being Served";
                  waitText = "It's your turn";
                  badgeColor = "bg-green-100 text-green-700";
                } else if (remaining === 0) {
                  statusText = "Next";
                  waitText = `~${avgTime} mins`;
                  badgeColor = "bg-blue-100 text-blue-700";
                } else {
                  waitText = `~${remaining * avgTime} mins`;
                }
              }

              if (a.status === "completed") {
                statusText = "Completed";
                waitText = "Visit completed";
                badgeColor = "bg-gray-200 text-gray-700";
              }

              return (
                <div key={a.id} className="bg-white p-4 rounded-lg border">
                  <p className="font-semibold text-lg">{a.clinicName}</p>
                  <p className="text-sm text-gray-500">Token #{a.token}</p>
                  <p className="text-sm text-gray-500">⏳ {waitText}</p>

                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${badgeColor}`}
                  >
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
