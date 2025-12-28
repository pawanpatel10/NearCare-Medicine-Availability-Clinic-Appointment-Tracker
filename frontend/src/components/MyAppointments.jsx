import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import Navbar from "./Navbar";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", user.uid),
      where("status", "==", "active"),        // ✅ show only active bookings
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          // ✅ hide old test data (Date.now() tokens)
          .filter(a => typeof a.token === "number" && a.token < 1000)
      );
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

        {loading ? (
          <p className="text-gray-500">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">
            You have no active appointments.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map(a => (
              <div
                key={a.id}
                className="bg-white p-4 rounded-lg border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {a.clinicName}
                  </p>

                  <p className="text-sm text-gray-500">
                    Booked on:{" "}
                    {a.createdAt?.toDate().toLocaleString()}
                  </p>

                  <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-blue-600 font-bold text-lg">
                    Token #{a.token}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
