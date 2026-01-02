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

    const userId = auth.currentUser.uid;

    const existingQuery = query(
      collection(db, "appointments"),
      where("clinicId", "==", clinicId),
      where("userId", "==", userId),
      where("status", "in", ["waiting", "serving"])
    );

    const existingSnap = await getDocs(existingQuery);

    if (!existingSnap.empty) {
      alert("You already have an active appointment at this clinic.");
      return;
    }

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

    await addDoc(collection(db, "appointments"), {
      clinicId,
      clinicName: clinic.name,
      userId,
      patientName: auth.currentUser.displayName || "Patient",
      token: nextToken,
      status: "waiting",
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "clinics", clinicId), {
      totalTokens: increment(1)
    });

    alert(`Appointment booked! Your token number is ${nextToken}`);
    navigate("/my-appointments");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-emerald-100">
        <p className="text-slate-700 font-semibold">Loading clinic...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="p-6 text-red-700 font-semibold">
        Clinic not found.
      </div>
    );
  }

  const isClosed = !clinic.openTime || !clinic.closeTime;

  const currentToken = clinic.currentToken || 0;
  const totalTokens = clinic.totalTokens || 0;
  const avgTime = clinic.avgTimePerPatient || 10;

  const waitingCount = Math.max(totalTokens - currentToken, 0);
  const estimatedWait =
    waitingCount === 0 ? "No wait" : `~${waitingCount * avgTime} mins`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-emerald-100">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8">
        <div
          className="relative rounded-3xl p-[1.5px]
                     bg-gradient-to-r from-slate-400 to-slate-300
                     hover:from-teal-600 hover:to-emerald-600 transition"
        >
          <div className="bg-white rounded-3xl px-6 py-6 shadow-lg">
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              {clinic.name}
            </h1>

            <p className="text-slate-700">
              📍 {clinic.address}
            </p>

            <p className="text-slate-700 mt-1">
              ⏰ {clinic.openTime} – {clinic.closeTime}
            </p>

            <p className="font-semibold text-lg text-slate-900 mt-4">
              Fees: ₹{clinic.fees}
            </p>

            <div className="mt-3 inline-block px-3 py-1 rounded-full
                            bg-blue-200 text-blue-900 font-semibold text-sm">
              ⏳ Estimated wait: {estimatedWait}
            </div>

            <button
              disabled={isClosed}
              onClick={bookAppointment}
              className={`w-full py-3 mt-8 rounded-xl font-bold text-white
                transition cursor-pointer ${
                  isClosed
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-700 to-emerald-700 hover:scale-[1.02] shadow-lg"
                }`}
            >
              {isClosed ? "Clinic Closed" : "Confirm Appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
