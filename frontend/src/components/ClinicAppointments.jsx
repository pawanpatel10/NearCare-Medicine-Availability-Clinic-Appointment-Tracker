import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc
} from "firebase/firestore";
import Navbar from "./Navbar";

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [currentToken, setCurrentToken] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const clinicRef = doc(db, "clinics", user.uid);
    const unsubClinic = onSnapshot(clinicRef, snap => {
      if (snap.exists()) {
        setCurrentToken(snap.data().currentToken || 0);
      }
    });

    const q = query(
      collection(db, "appointments"),
      where("clinicId", "==", user.uid)
    );

    const unsubAppts = onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.status !== "cancelled")
        .sort((a, b) => b.token - a.token);

      setAppointments(list);
    });

    return () => {
      unsubClinic();
      unsubAppts();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-8 text-slate-800">
          Today’s Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-slate-500">No patients in queue.</p>
        ) : (
          <div className="relative space-y-6">
            {appointments.map((a, idx) => {
              let badge = "bg-yellow-100 text-yellow-700 border border-yellow-300";
              let label = "Waiting";

              if (a.status === "serving") {
                badge = "bg-emerald-100 text-emerald-700 border border-emerald-300";
                label = "Being Served";
              } else if (a.status === "completed") {
                badge = "bg-slate-200 text-slate-600 border border-slate-300";
                label = "Completed";
              }

              const isCurrent = a.token === currentToken;

              return (
                <div key={a.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full
                      ${isCurrent ? "bg-emerald-500" : "bg-slate-300"}
                    `}
                  />

                  {/* Glow for current */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-3xl blur-xl bg-emerald-300/40 animate-pulse" />
                  )}

                  <div
                    className={`relative rounded-3xl p-[1.5px] transition-all
                      ${
                        isCurrent
                          ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                          : "bg-gradient-to-r from-slate-200 to-slate-100"
                      }
                    `}
                  >
                    <div
                      className={`bg-white/90 backdrop-blur rounded-3xl p-6 flex justify-between items-center
                        ${isCurrent ? "shadow-xl scale-[1.01]" : "shadow-sm"}
                      `}
                    >
                      {/* Left */}
                      <div className="space-y-2">
                        <p className="font-semibold text-lg text-slate-800">
                          {a.patientName}
                        </p>

                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full ${badge}`}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Right – Token */}
                      <div className="flex flex-col items-end">
                        <div
                          className={`px-4 py-2 rounded-xl font-bold text-lg
                            ${
                              isCurrent
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }
                          `}
                        >
                          Token #{a.token}
                        </div>

                        {isCurrent && (
                          <span className="mt-1 text-xs text-emerald-600 font-medium tracking-wide">
                            ● Now Serving
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connector line */}
                  {idx !== appointments.length - 1 && (
                    <div className="absolute left-0 top-full h-6 w-px bg-slate-200 ml-[-0.9rem]" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
