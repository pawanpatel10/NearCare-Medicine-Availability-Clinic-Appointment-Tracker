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
  serverTimestamp
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function ClinicBooking() {
  const { clinicId } = useParams();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 live waiting count
  const [waitingCount, setWaitingCount] = useState(0);

  // 🔹 Load clinic
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

  // 🔥 count ONLY waiting appointments
  useEffect(() => {
    const fetchWaiting = async () => {
      const q = query(
        collection(db, "appointments"),
        where("clinicId", "==", clinicId),
        where("status", "==", "waiting")
      );
      const snap = await getDocs(q);
      setWaitingCount(snap.size);
    };
    fetchWaiting();
  }, [clinicId]);

  const bookAppointment = async () => {
    if (!auth.currentUser || !clinic) return;

    const userId = auth.currentUser.uid;

    // ✅ block multiple active bookings
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

    // 🔢 token = currentToken + waiting + 1
    const currentToken = clinic.currentToken || 0;
    const nextToken = currentToken + waitingCount + 1;

    await addDoc(collection(db, "appointments"), {
      clinicId,
      clinicName: clinic.name,
      userId,
      patientName: auth.currentUser.displayName || "Patient",
      token: nextToken,
      status: "waiting",
      createdAt: serverTimestamp()
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

  const avgTime = clinic.avgTimePerPatient || 10;

  // 🕒 TIME LOGIC (same as BookAppointment)
  const now = new Date();

  const [openH, openM] = clinic.openTime.split(":").map(Number);
  const [closeH, closeM] = clinic.closeTime.split(":").map(Number);

  const openingTime = new Date(now);
  openingTime.setHours(openH, openM, 0, 0);

  const closingTime = new Date(now);
  closingTime.setHours(closeH, closeM, 0, 0);

  const effectiveStart = now < openingTime ? openingTime : now;

  const estimatedServiceTime = new Date(
    effectiveStart.getTime() + waitingCount * avgTime * 60000
  );

  const outOfTimeRange = estimatedServiceTime > closingTime;

  // ⏳ ETA DISPLAY
  const estimatedWait =
    waitingCount === 0
      ? now < openingTime
        ? `Opens at ${clinic.openTime}`
        : "No wait"
      : `~${waitingCount * avgTime} mins`;

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

            {outOfTimeRange && (
              <p className="text-sm text-red-700 font-medium mt-2">
                ⚠️ No slots available today
              </p>
            )}

            <button
              disabled={outOfTimeRange}
              onClick={bookAppointment}
              className={`w-full py-3 mt-8 rounded-xl font-bold text-white
                transition cursor-pointer ${
                  outOfTimeRange
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-700 to-emerald-700 hover:scale-[1.02] shadow-lg"
                }`}
            >
              {outOfTimeRange ? "Fully Booked" : "Confirm Appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
