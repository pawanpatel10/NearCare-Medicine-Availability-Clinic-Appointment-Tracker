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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* 1. Hero Section with Gradient */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Hello, {userName.split(' ')[0]} 👋
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Your health is our priority. What do you need today?
            </p>

            {/* Fake Search Bar for aesthetics
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 flex items-center max-w-md border border-white/30 cursor-pointer hover:bg-white/30 transition">
              <svg className="w-5 h-5 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-blue-50 text-sm">Search for doctors, medicines...</span>
            </div> */}
          </div>
        </div>

        {/* 2. Quick Status (Optional - adds "App" feel) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">System Online</p>
              <p className="text-xs text-gray-500">Pharmacies are updating stock live</p>
            </div>
          </div>
        </div>

        {/* 3. Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Find Medicines */}
          <div 
            onClick={() => navigate("/search-medicines")}
            className="group bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition">
              <span className="text-2xl">💊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Find Medicines</h3>
            <p className="text-gray-500 text-sm mb-4">
              Locate nearby pharmacies that have your prescription in stock.
            </p>
            <span className="text-blue-600 font-medium text-sm flex items-center group-hover:underline">
              Search Now &rarr;
            </span>
          </div>

          {/* Card 2: Book Appointment */}
          <div 
            onClick={() => navigate("/book-appointment")}
            className="group bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="bg-purple-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 transition">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Book Clinic</h3>
            <p className="text-gray-500 text-sm mb-4">
              Get a digital token, track the live queue, and skip the waiting room.
            </p>
            <span className="text-purple-600 font-medium text-sm flex items-center group-hover:underline">
              Book Visit &rarr;
            </span>
          </div>

          {/* Card 3: My Appointments */}
          <div 
            onClick={() => navigate("/my-appointments")}
            className="group bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="bg-teal-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">My Bookings</h3>
            <p className="text-gray-500 text-sm mb-4">
              View your active tokens, history, and live wait times.
            </p>
            <span className="text-teal-600 font-medium text-sm flex items-center group-hover:underline">
              View Status &rarr;
            </span>
          </div>
        </div>

        {/* 4. Emergency Footer */}
        <div className="mt-12 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <div>
            <h4 className="font-bold text-red-700">Emergency?</h4>
            <p className="text-sm text-red-600">
              This app is for non-critical appointments. For medical emergencies, please dial <strong className="underline">102</strong> or <strong className="underline">108</strong> immediately.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}