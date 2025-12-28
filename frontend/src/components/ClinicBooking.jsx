import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
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
    await addDoc(collection(db, "appointments"), {
      clinicId,
      userId: auth.currentUser.uid,
      patientName: auth.currentUser.displayName,
      time: "Today",
      token: Date.now(), // temporary
      createdAt: new Date()
    });

    alert("Appointment booked!");
  };

  if (!clinic) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
        <h1 className="text-xl font-bold mb-2">{clinic.name}</h1>
        <p className="text-gray-500 mb-4">Fees: ₹{clinic.fees}</p>

        <button
          onClick={bookAppointment}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold"
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  );
}
