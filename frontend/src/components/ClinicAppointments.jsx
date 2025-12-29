import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
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

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [currentToken, setCurrentToken] = useState(0);

  // 🔹 Listen to clinic queue
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 🔥 Listen to clinic currentToken
    const clinicRef = doc(db, "clinics", user.uid);
    const unsubClinic = onSnapshot(clinicRef, (snap) => {
      if (snap.exists()) {
        setCurrentToken(snap.data().currentToken || 0);
      }
    });

    // 🔹 Listen to ACTIVE appointments only
    const q = query(
      collection(db, "appointments"),
      where("clinicId", "==", user.uid),
      where("status", "==", "active"),
      orderBy("token", "asc")
    );

    const unsubAppts = onSnapshot(q, (snap) => {
      setAppointments(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });

    return () => {
      unsubClinic();
      unsubAppts();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Today's Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500">
            No patients in queue.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => {
              let status = "Waiting";
              let badge = "bg-yellow-100 text-yellow-700";

              if (a.token < currentToken) {
                status = "Completed";
                badge = "bg-gray-200 text-gray-600";
              } else if (a.token === currentToken) {
                status = "Being Served";
                badge = "bg-green-100 text-green-700";
              } else if (a.token === currentToken + 1) {
                status = "Next";
                badge = "bg-blue-100 text-blue-700";
              }

              return (
                <div
                  key={a.id}
                  className="bg-white p-4 rounded border flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {a.patientName}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${badge}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-blue-600 font-bold text-lg">
                    Token #{a.token}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
