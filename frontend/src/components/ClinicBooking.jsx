import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function ClinicBooking() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState(null);

  useEffect(() => {
    const loadClinic = async () => {
      const snap = await getDoc(doc(db, "clinics", clinicId));
      if (snap.exists()) setClinic(snap.data());
    };
    loadClinic();
  }, [clinicId]);

  const bookAppointment = async () => {
    if (!auth.currentUser) return;

    // 1️⃣ Check if user already booked (ignore cancelled)
    const q = query(
      collection(db, "appointments"),
      where("clinicId", "==", clinicId),
      where("userId", "==", auth.currentUser.uid)
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

    // 3️⃣ Create appointment
    await addDoc(collection(db, "appointments"), {
      clinicId,
      clinicName: clinic.name,
      userId: auth.currentUser.uid,
      patientName: auth.currentUser.displayName || "Patient",
      token: nextToken,
      status: "active",
      createdAt: serverTimestamp()
    });

    alert(`Appointment booked! Your token number is ${nextToken}`);
  };

  if (!clinic) return <div className="p-6">Loading...</div>;

  // ✅ ADD THIS BEFORE RETURN
  const isClosed = !clinic.openTime || !clinic.closeTime;

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

        {/* ✅ UPDATED BUTTON */}
        <button
          disabled={isClosed}
          onClick={bookAppointment}
          className={`w-full py-3 rounded-lg font-bold text-white transition ${
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
