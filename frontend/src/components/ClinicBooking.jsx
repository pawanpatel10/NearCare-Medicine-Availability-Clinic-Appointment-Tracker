import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function ClinicBooking() {
  const { clinicId } = useParams();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinic = async () => {
      const snap = await getDoc(doc(db, "clinics", clinicId));
      if (snap.exists()) {
        setClinic(snap.data());
      }
      setLoading(false);
    };

    loadClinic();
  }, [clinicId]);

  const bookAppointment = async () => {
    if (!auth.currentUser || !clinic) return;

    // 1️⃣ Check if user already booked (ignore cancelled)
    const q = query(
    const userId = auth.currentUser.uid;

    // 🔒 Block if user already has ACTIVE appointment
    const existingQuery = query(
      collection(db, "appointments"),
      where("clinicId", "==", clinicId),
      where("userId", "==", userId),
      where("status", "in", ["waiting", "serving"]) // ✅ FIX
    );

    const existing = await getDocs(q);
    const activeExisting = existing.docs.find((d) => {
      const status = (d.data().status || "active").toLowerCase();
      return status !== "cancelled";
    });
    if (activeExisting) {
      alert("You already have an appointment at this clinic.");
      return;
    }

    // 2️⃣ Get current token count
    const tokenQuery = query(
      collection(db, "appointments"),
      where("clinicId", "==", clinicId)
    );

    const tokenSnap = await getDocs(tokenQuery);
    const activeCount = tokenSnap.docs.filter((d) => {
      const status = (d.data().status || "active").toLowerCase();
      return status !== "cancelled";
    }).length;
    const nextToken = activeCount + 1;

    // 🧾 Create appointment
    await addDoc(collection(db, "appointments"), {
      clinicId,
      clinicName: clinic.name,
      userId,
      patientName: auth.currentUser.displayName || "Patient",
      token: nextToken,
      status: "waiting",
      createdAt: serverTimestamp()
    });

    // 🔥 Update clinic queue
    await updateDoc(doc(db, "clinics", clinicId), {
      totalTokens: increment(1)
    });

    alert(`Appointment booked! Your token number is ${nextToken}`);
    navigate("/my-appointments");
  };


  if (loading) {
    return <div className="p-6">Loading clinic...</div>;
  }

  if (!clinic) {
    return <div className="p-6 text-red-600">Clinic not found.</div>;
  }

  // 🔴 Closed logic
  const isClosed = !clinic.openTime || !clinic.closeTime;

  // ⏳ ETA logic
  const currentToken = clinic.currentToken || 0;
  const totalTokens = clinic.totalTokens || 0;
  const avgTime = clinic.avgTimePerPatient || 10;

  const waitingCount = Math.max(totalTokens - currentToken, 0);
  const estimatedWait =
    waitingCount === 0 ? "No wait" : `~${waitingCount * avgTime} mins`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
        <h1 className="text-xl font-bold mb-2">{clinic.name}</h1>

        <p className="text-gray-600">📍 {clinic.address}</p>

        <p className="text-gray-600">
          ⏰ {clinic.openTime} – {clinic.closeTime}
        </p>

        <p className="font-semibold text-lg mt-3">
          Fees: ₹{clinic.fees}
        </p>

        <p className="mt-2 text-blue-600 font-medium">
          ⏳ Estimated wait: {estimatedWait}
        </p>

        <button
          disabled={isClosed}
          onClick={bookAppointment}
          className={`w-full py-3 mt-6 rounded-lg font-bold text-white transition ${
            isClosed
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isClosed ? "Clinic Closed" : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
}
