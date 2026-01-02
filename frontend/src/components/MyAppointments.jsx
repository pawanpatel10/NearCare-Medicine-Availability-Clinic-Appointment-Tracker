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
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-emerald-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          My Appointments
        </h1>

        <p className="text-lg text-slate-700 mb-6">
          Please wait comfortably. We will keep you updated.
        </p>

        {loading ? (
          <p className="text-slate-700">Loading appointments…</p>
        ) : appointments.length === 0 ? (
          <p className="text-slate-700">You have no appointments.</p>
        ) : (
          <div className="space-y-6">
            {appointments.map(a => {
              const status = (a.status || "waiting").toLowerCase();
              const clinic = clinicMap[a.clinicId];

              let statusText = status.toUpperCase();
              let etaText = null;
              let badgeStyle =
                "bg-yellow-200 text-yellow-900 border border-yellow-400";

              if (status === "cancelled") {
                badgeStyle = "bg-red-200 text-red-800 border border-red-400";
              } else if (status === "completed") {
                badgeStyle = "bg-slate-200 text-slate-700 border border-slate-400";
              } else if (status === "serving") {
                badgeStyle =
                  "bg-emerald-200 text-emerald-800 border border-emerald-400";
                etaText = "🩺 It's your turn. Please come to the clinic.";
              } else if (clinic) {
                const currentToken = clinic.currentToken || 0;
                const avgTime = clinic.avgTimePerPatient || 10;
                const remaining = a.token - currentToken - 1;

                if (remaining <= 0) {
                  etaText = "🩺 It's your turn. Please come to the clinic.";
                  badgeStyle =
                    "bg-emerald-200 text-emerald-800 border border-emerald-400";
                } else {
                  etaText = `⏳ Estimated wait: ~${remaining * avgTime} mins`;
                }
              }

              return (
                <div
                  key={a.id}
                  className="relative rounded-2xl p-[1.5px]
                             bg-gradient-to-r from-slate-400 to-slate-300
                             hover:from-teal-600 hover:to-emerald-600
                             transition"
                >
                  <div className="bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-xl transition flex items-center justify-between">
                    {/* LEFT */}
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-900">
                        🏥 {a.clinicName}
                      </p>

                      <p className="text-sm text-slate-700">
                        Token #{a.token}
                      </p>

                      {etaText && (
                        <p className="text-sm text-blue-800 font-medium">
                          {etaText}
                        </p>
                      )}

                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${badgeStyle}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    {/* RIGHT */}
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
                      className="ml-4 px-4 py-2 text-sm font-bold rounded-xl
                                 border border-red-400 text-red-700
                                 hover:bg-red-100 transition cursor-pointer
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelingId === a.id
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
