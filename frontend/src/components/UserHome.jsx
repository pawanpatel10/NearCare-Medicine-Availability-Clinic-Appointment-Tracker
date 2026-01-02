import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";

export default function UserHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        setUserName(docSnap.exists() ? docSnap.data().name : user.displayName);
      } else {
        navigate("/login");
      }
      setLoading(false);
    };
    fetchUserData();
  }, [navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-emerald-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-emerald-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 text-white shadow-xl mb-10 overflow-hidden
                        bg-gradient-to-r from-teal-700 via-blue-700 to-emerald-700">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Hello, {userName.split(" ")[0]} 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Your health is our priority. What do you need today?
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur
                        p-4 rounded-2xl shadow-md border border-slate-300 mb-8">
          <div className="bg-emerald-200 p-2 rounded-full">
            <svg
              className="w-5 h-5 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              System Online
            </p>
            <p className="text-xs text-slate-600">
              Pharmacies are updating stock live
            </p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Find Medicines */}
          <div
            onClick={() => navigate("/search-medicines")}
            className="group cursor-pointer rounded-2xl p-[1.5px]
                       bg-gradient-to-r from-slate-400 to-slate-300
                       hover:from-blue-600 hover:to-teal-600 transition"
          >
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition h-full">
              <div className="bg-blue-200 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Find Medicines
              </h3>
              <p className="text-slate-700 text-sm mb-4">
                Locate nearby pharmacies that have your prescription in stock.
              </p>
              <span className="text-blue-700 font-semibold text-sm">
                Search Now →
              </span>
            </div>
          </div>

          {/* Book Appointment */}
          <div
            onClick={() => navigate("/book-appointment")}
            className="group cursor-pointer rounded-2xl p-[1.5px]
                       bg-gradient-to-r from-slate-400 to-slate-300
                       hover:from-teal-600 hover:to-emerald-600 transition"
          >
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition h-full">
              <div className="bg-emerald-200 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Book Clinic
              </h3>
              <p className="text-slate-700 text-sm mb-4">
                Get a digital token, track the live queue, and skip the waiting room.
              </p>
              <span className="text-emerald-700 font-semibold text-sm">
                Book Visit →
              </span>
            </div>
          </div>

          {/* My Appointments */}
          <div
            onClick={() => navigate("/my-appointments")}
            className="group cursor-pointer rounded-2xl p-[1.5px]
                       bg-gradient-to-r from-slate-400 to-slate-300
                       hover:from-blue-600 hover:to-emerald-600 transition"
          >
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition h-full">
              <div className="bg-teal-200 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                My Bookings
              </h3>
              <p className="text-slate-700 text-sm mb-4">
                View your active tokens, history, and live wait times.
              </p>
              <span className="text-teal-700 font-semibold text-sm">
                View Status →
              </span>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="mt-12 bg-red-100 border-l-4 border-red-600 p-4 rounded-r-xl flex gap-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="font-bold text-red-800">Emergency?</h4>
            <p className="text-sm text-red-700">
              This app is for non-critical appointments. For medical emergencies,
              please dial <strong className="underline">102</strong> or{" "}
              <strong className="underline">108</strong> immediately.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
