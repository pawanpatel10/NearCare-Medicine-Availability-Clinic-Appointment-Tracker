import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";

export default function PharmacyHome() {
  const navigate = useNavigate();
  const [pharmacyName, setPharmacyName] = useState("Pharmacy");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Pharmacy Owner Name
  useEffect(() => {
    const fetchPharmacyData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setPharmacyName(userDoc.data().name);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyData();
  }, [navigate]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Shared Navbar */}
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        
        {/* 1. Hero / Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl p-8 text-white shadow-lg mb-10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {pharmacyName} 👋
            </h1>
            <p className="text-teal-50 text-lg">
              Manage your inventory and track medicine requests live.
            </p>
          </div>
        </div>

        {/* 2. Quick Stats Row (Optional but looks professional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl">📦</div>
                <div>
                    <p className="text-gray-500 text-sm">Total Items</p>
                    <p className="text-xl font-bold text-gray-800">124</p>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 text-xl">⚠️</div>
                <div>
                    <p className="text-gray-500 text-sm">Low Stock</p>
                    <p className="text-xl font-bold text-gray-800">8 Items</p>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl">🔍</div>
                <div>
                    <p className="text-gray-500 text-sm">User Searches</p>
                    <p className="text-xl font-bold text-gray-800">42 Today</p>
                </div>
            </div>
        </div>

        {/* 3. Main Actions Grid */}
        <h2 className="text-gray-700 font-bold text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Manage Inventory */}
          <div 
            onClick={() => navigate("/pharmacy/inventory")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-teal-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">💊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Inventory</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add new medicines, update prices, or remove expired items.
            </p>
            <span className="text-teal-600 font-medium text-sm group-hover:underline flex items-center gap-1">
              Open Inventory &rarr;
            </span>
          </div>

          {/* Card 2: Update Stock */}
          <div 
            onClick={() => navigate("/pharmacy/stock")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">📊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Quick Stock Update</h3>
            <p className="text-gray-500 text-sm mb-4">
              Fast-track updating quantities for your most popular medicines.
            </p>
            <span className="text-green-600 font-medium text-sm group-hover:underline flex items-center gap-1">
              Update Stock &rarr;
            </span>
          </div>

          {/* Card 3: Medicine Requests */}
          <div 
            onClick={() => navigate("/pharmacy/requests")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">📢</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Live Requests</h3>
            <p className="text-gray-500 text-sm mb-4">
              See what medicines people nearby are searching for right now.
            </p>
            <span className="text-blue-600 font-medium text-sm group-hover:underline flex items-center gap-1">
              View Demands &rarr;
            </span>
          </div>

          {/* Card 4: Edit Profile */}
          <div 
            onClick={() => navigate("/pharmacy/profile")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-purple-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">⚙️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Store Profile</h3>
            <p className="text-gray-500 text-sm mb-4">
              Update shop timings, address, and contact details.
            </p>
            <span className="text-purple-600 font-medium text-sm group-hover:underline flex items-center gap-1">
              Edit Settings &rarr;
            </span>
          </div>

        </div>

        {/* Pro Tip Footer */}
        <div className="mt-10 bg-teal-50 p-4 rounded-lg border border-teal-100 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-bold text-teal-800 text-sm">Did you know?</h4>
            <p className="text-sm text-teal-700">
               Keeping your stock updated increases your visibility in the "Find Medicines" search results by 40%.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}