import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import Navbar from "./Navbar";

export default function ClinicHome() {
  const navigate = useNavigate();

  const [doctorName, setDoctorName] = useState("Doctor");
  const [currentToken, setCurrentToken] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [hasServing, setHasServing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch clinic + queue status
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Doctor name
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setDoctorName(userDoc.data().name);
        }

        // Clinic current token
        const clinicDoc = await getDoc(doc(db, "clinics", user.uid));
        if (clinicDoc.exists()) {
          setCurrentToken(clinicDoc.data().currentToken || 0);
        }

        // 🔹 Check if someone is being served
        const servingQ = query(
          collection(db, "appointments"),
          where("clinicId", "==", user.uid),
          where("status", "==", "serving")
        );
        const servingSnap = await getDocs(servingQ);
        setHasServing(!servingSnap.empty);

        // 🔹 Count ONLY waiting patients (ignore cancelled/completed)
        const waitingQ = query(
          collection(db, "appointments"),
          where("clinicId", "==", user.uid),
          where("status", "==", "waiting")
        );
        const waitingSnap = await getDocs(waitingQ);
        setWaitingCount(waitingSnap.size);

      } catch (err) {
        console.error("ClinicHome fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [navigate]);

  // ▶ CALL NEXT PATIENT
  const callNextPatient = async () => {
    if (hasServing) {
      alert("Please complete the current consultation first.");
      return;
    }

    const clinicId = auth.currentUser.uid;

    const q = query(
      collection(db, "appointments"),
      where("clinicId", "==", clinicId),
      where("status", "==", "waiting")
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      alert("No patients waiting.");
      return;
    }

    const next = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.token - b.token)[0];

    // Mark as serving
    await updateDoc(doc(db, "appointments", next.id), {
      status: "serving"
    });

    // Update clinic current token
    await updateDoc(doc(db, "clinics", clinicId), {
      currentToken: next.token
    });

    setCurrentToken(next.token);
    setWaitingCount(c => Math.max(c - 1, 0));
    setHasServing(true);
  };

  // ✅ COMPLETE CURRENT PATIENT
  const completeCurrentPatient = async () => {
    const clinicId = auth.currentUser.uid;

    const q = query(
      collection(db, "appointments"),
      where("clinicId", "==", clinicId),
      where("status", "==", "serving")
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      alert("No patient is currently being served.");
      return;
    }

    await updateDoc(snap.docs[0].ref, {
      status: "completed"
    });

    setHasServing(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
        <p className="text-teal-700 font-semibold text-lg animate-pulse">
          Loading Clinic Dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            Dr. {doctorName}
          </h1>
          <p className="text-gray-500 mt-1">
            Live clinic operations & patient queue
          </p>
        </div>

        {/* QUEUE PANEL */}
        <section className="relative bg-white/80 backdrop-blur rounded-3xl border border-teal-100 shadow-xl p-10 mb-12">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-100/40 to-blue-100/30" />

          <div className="relative flex flex-col lg:flex-row justify-between gap-10">
            <div className="flex gap-20">
              <div>
                <p className="text-xs tracking-widest uppercase text-gray-500">
                  Current Token
                </p>
                <p className="text-6xl font-extrabold text-slate-900 mt-2">
                  {currentToken}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-widest uppercase text-gray-500">
                  Waiting Patients
                </p>
                <p className="text-5xl font-bold text-teal-600 mt-2">
                  {waitingCount}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-4 w-full lg:w-80">
              <button
                onClick={callNextPatient}
                disabled={hasServing}
                className={`py-4 rounded-xl font-semibold transition-all ${
                  hasServing
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg hover:scale-[1.02]"
                }`}
              >
                ▶ Call Next Patient
              </button>

              <button
                onClick={completeCurrentPatient}
                disabled={!hasServing}
                className={`py-4 rounded-xl font-semibold transition-all ${
                  hasServing
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:scale-[1.02]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ✔ Mark Completed
              </button>
            </div>
          </div>
        </section>

        {/* NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            onClick={() => navigate("/doctor-dashboard/appointments")}
            className="group cursor-pointer rounded-3xl bg-gradient-to-br from-blue-600 to-teal-600 p-[2px] hover:scale-[1.02] transition"
          >
            <div className="h-full rounded-3xl bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-800">
                Today’s Appointments
              </h3>
              <p className="text-gray-500 mt-1">
                View live queue & patient status
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate("/doctor-dashboard/settings")}
            className="group cursor-pointer rounded-3xl bg-gradient-to-br from-emerald-600 to-green-600 p-[2px] hover:scale-[1.02] transition"
          >
            <div className="h-full rounded-3xl bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-800">
                Clinic Settings
              </h3>
              <p className="text-gray-500 mt-1">
                Manage clinic profile & timings
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
