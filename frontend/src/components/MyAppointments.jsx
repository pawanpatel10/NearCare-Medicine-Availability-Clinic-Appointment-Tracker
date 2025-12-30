import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

export default function MyAppointments() {
  const { currentUser, loading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [clinicMap, setClinicMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  // ❌ Cancel appointment
  const cancelAppointment = async (id, status) => {
    if (
      !id ||
      status === "cancelled" ||
      status === "completed" ||
      status === "serving"
    )
      return;

    const ok = window.confirm("Cancel this appointment?");
    if (!ok) return;

    try {
      setCancelingId(id);
      await updateDoc(doc(db, "appointments", id), {
        status: "cancelled"
      });
    } catch (err) {
      console.error("Cancel appointment failed", err);
      alert("Could not cancel appointment.");
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", currentUser.uid)
      //orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        // ✅ SORT NEWEST FIRST
        const appts = snap.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => {
            const t1 = a.createdAt?.seconds || 0;
            const t2 = b.createdAt?.seconds || 0;
            return t2 - t1;
          });
        setAppointments(appts);

        // 🔹 Load clinic data
        const clinicIds = [...new Set(appts.map(a => a.clinicId))];
        const map = {};

        await Promise.all(
          clinicIds.map(async cid => {
            const cSnap = await getDoc(doc(db, "clinics", cid));
            if (cSnap.exists()) map[cid] = cSnap.data();
          })
        );

        setClinicMap(map);
        setLoading(false);
      },
      () => {
        setAppointments([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authLoading, currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          My Appointments
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Please wait comfortably. We will keep you updated.
        </p>

        <div className="bg-white/70 rounded-2xl shadow-md p-5 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <p className="text-gray-600">Loading appointments…</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-600">You have no appointments.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map(a => {
                const status = (a.status || "waiting").toLowerCase();
                const clinic = clinicMap[a.clinicId];

                let statusText = status.toUpperCase();
                let etaText = null;
                let badgeStyle =
                  "bg-yellow-100 text-yellow-800";

                if (status === "cancelled") {
                  badgeStyle = "bg-red-100 text-red-700";
                } else if (status === "completed") {
                  badgeStyle = "bg-gray-200 text-gray-700";
                } else if (status === "serving") {
                  badgeStyle = "bg-green-100 text-green-800";
                  etaText = "🩺 It's your turn. Please come to the clinic.";
                } else if (clinic) {
                  const currentToken = clinic.currentToken || 0;
                  const avgTime = clinic.avgTimePerPatient || 10;

                  const remaining =
                    a.token - currentToken - 1;

                  if (remaining <= 0) {
                    etaText = "🩺 It's your turn. Please come to the clinic.";
                    badgeStyle = "bg-green-100 text-green-800";
                  } else {
                    etaText = `⏳ Estimated wait: ~${remaining * avgTime} mins`;
                  }
                }

                return (
                  <div
                    key={a.id}
                    className="border rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-gray-800">
                        🏥 {a.clinicName}
                      </p>

                      <p className="text-sm text-gray-600">
                        Token #{a.token}
                      </p>

                      {etaText && (
                        <p className="text-sm text-blue-700">
                          {etaText}
                        </p>
                      )}

                      <span
                        className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${badgeStyle}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        cancelAppointment(a.id, status)
                      }
                      disabled={
                        cancelingId === a.id ||
                        status === "serving" ||
                        status === "completed" ||
                        status === "cancelled"
                      }
                      className="ml-3 px-4 py-2 text-sm font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelingId === a.id
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}