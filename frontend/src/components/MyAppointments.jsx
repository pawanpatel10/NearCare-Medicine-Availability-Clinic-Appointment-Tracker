import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const { currentUser, loading: authLoading } = useAuth();

  const cancelAppointment = async (id) => {
    if (!id || cancelingId === id) return;
    const ok = window.confirm("Cancel this appointment?");
    if (!ok) return;

    try {
      setCancelingId(id);
      await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
    } catch (err) {
      console.error("Cancel appointment failed", err);
      alert("Could not cancel appointment. Please retry.");
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    // Wait for auth to resolve, then subscribe; otherwise refresh skips the listener.
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
      (snap) => {
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Appointments listener error", err);
        setAppointments([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authLoading, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

        {loading ? (
          <p className="text-gray-500">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">
            You have no appointments.
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
                    {(a.status || "active").toUpperCase()}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-blue-600 font-bold text-lg">
                    Token #{a.token}
                  </p>
                  <button
                    className="mt-2 text-sm text-red-600 hover:underline disabled:text-gray-400"
                    disabled={cancelingId === a.id || (a.status || "").toLowerCase() === "cancelled"}
                    onClick={() => cancelAppointment(a.id)}
                  >
                    {cancelingId === a.id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
