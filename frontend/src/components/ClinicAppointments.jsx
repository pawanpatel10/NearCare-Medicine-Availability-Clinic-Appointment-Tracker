import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Navbar from "./Navbar";

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("clinicId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Today's Appointments</h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white p-4 rounded border flex justify-between"
              >
                <div>
                  <p className="font-semibold">{a.patientName}</p>
                  <p className="text-sm text-gray-500">{a.time}</p>
                </div>
                <span className="text-blue-600 font-bold">
                  Token #{a.token}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
