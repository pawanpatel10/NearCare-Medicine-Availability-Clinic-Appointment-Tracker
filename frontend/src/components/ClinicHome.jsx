import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Navbar from "./Navbar";

export default function ClinicHome() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("Doctor");
  const [queueStatus, setQueueStatus] = useState({
    currentToken: 0,
    totalTokens: 0
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Doctor Profile + Queue Status
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

        // Queue data
        const clinicDoc = await getDoc(doc(db, "clinics", user.uid));
        if (clinicDoc.exists()) {
          const data = clinicDoc.data();
          setQueueStatus({
            currentToken: data.currentToken || 0,
            totalTokens: data.totalTokens || 0
          });
        }
      } catch (err) {
        console.error("Error fetching clinic data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [navigate]);

  // 🔥 Call Next Patient
  const callNextPatient = async () => {
    if (!auth.currentUser) return;

    const clinicRef = doc(db, "clinics", auth.currentUser.uid);

    await updateDoc(clinicRef, {
      currentToken: increment(1)
    });

    // Instant UI update
    setQueueStatus(prev => ({
      ...prev,
      currentToken: prev.currentToken + 1
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-blue-600 font-semibold">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const waitingCount = Math.max(
    queueStatus.totalTokens - queueStatus.currentToken,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, Dr. {doctorName} 👋
          </h1>
          <p className="text-gray-500">
            Manage your clinic and live queue from here.
          </p>
        </div>

        {/* 🔥 Live Queue Status */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

          <div className="z-10 flex gap-10 items-center">
            <div className="text-center">
              <span className="text-6xl font-black text-gray-900">
                #{queueStatus.currentToken}
              </span>
              <p className="text-gray-400 font-medium mt-1">Serving</p>
            </div>

            <div className="text-center">
              <span className="text-4xl font-bold text-blue-600">
                {waitingCount}
              </span>
              <p className="text-gray-400 font-medium mt-1">Waiting</p>
            </div>
          </div>

          <div className="z-10 flex flex-col items-center">
            <button
              onClick={callNextPatient}
              className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-8 py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-3 text-lg font-bold group"
            >
              <span className="group-hover:animate-bounce">📢</span>
              Call Next Patient
            </button>

            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Updates patient screens instantly
            </p>
          </div>
        </section>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate("/doctor-dashboard/appointments")}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Today's Appointments
            </h3>
            <p className="text-gray-500 text-sm">
              View the full list of patients waiting in line.
            </p>
          </div>

          <div
            onClick={() => navigate("/doctor-dashboard/settings")}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Manage Clinic Profile
            </h3>
            <p className="text-gray-500 text-sm">
              Update opening hours, location, and fees.
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Pro Tip:</strong> “Call Next Patient” advances the queue
            and updates patient screens in real time.
          </p>
        </div>
      </main>
    </div>
  );
}
