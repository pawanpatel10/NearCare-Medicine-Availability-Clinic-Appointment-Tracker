import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Navbar from "./Navbar";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map(a => (
              <div
                key={a.id}
                className="bg-white p-4 rounded-lg border flex justify-between"
              >
                <div>
                  <p className="font-semibold">{a.clinicName}</p>
                  <p className="text-sm text-gray-500">{a.time}</p>
                </div>
                <span className="font-bold text-blue-600">
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
