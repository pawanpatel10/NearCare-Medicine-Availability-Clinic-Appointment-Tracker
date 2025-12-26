import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Navbar from "./Navbar"; // <--- Importing the shared Navbar

export default function ClinicHome() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("Doctor");
  const [queueStatus, setQueueStatus] = useState({ currentToken: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);

  // 1. Fetch Doctor's Profile & Queue Status on Load
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Get Doctor Name
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setDoctorName(userDoc.data().name);

        // Get Live Queue Data
        const clinicDoc = await getDoc(doc(db, "clinics", user.uid));
        if (clinicDoc.exists()) setQueueStatus(clinicDoc.data());
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [navigate]);

  // 2. The "Killer Feature": Call Next Patient
  const callNextPatient = async () => {
    if (!auth.currentUser) return;
    
    const clinicRef = doc(db, "clinics", auth.currentUser.uid);
    await updateDoc(clinicRef, {
      currentToken: increment(1)
    });
    
    // Update UI instantly
    setQueueStatus(prev => ({ ...prev, currentToken: prev.currentToken + 1 }));
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-pulse text-blue-600 font-semibold">Loading Dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Shared Navbar handles Logo and Logout now */}
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        
        {/* Header Section */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
                Welcome, Dr. {doctorName} 👋
            </h1>
            <p className="text-gray-500">Manage your clinic and live queue from here.</p>
        </div>
        
        {/* 1. The "Live Queue Controller" (Hero Section) */}
        <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          {/* Decorative Background Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

          <div className="z-10 text-center md:text-left">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1">
                Live Queue Status
            </h2>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-6xl font-black text-gray-900">
                #{queueStatus.currentToken || 0}
              </span>
              <span className="text-gray-400 font-medium">serving now</span>
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

        {/* 2. Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Today's List Card */}
          <div 
            onClick={() => navigate("/clinic/appointments")}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Coming Soon</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Today's Appointments</h3>
            <p className="text-gray-500 text-sm">View the full list of patients waiting in line.</p>
          </div>

          {/* Settings Card */}
          <div 
            onClick={() => navigate("/clinic/settings")}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
          >
             <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Manage Clinic Profile</h3>
            <p className="text-gray-500 text-sm">Update opening hours, location, and fees.</p>
          </div>

        </div>

        {/* 3. Demo Tip */}
        <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg">
           <p className="text-sm text-blue-700 flex items-center gap-2">
             💡 <strong>Pro Tip:</strong> Pressing "Call Next Patient" will instantly update the patient's phone screen. Try it!
           </p>
        </div>

      </main>
    </div>
  );
}