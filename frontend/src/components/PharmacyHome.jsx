import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Navbar from "./Navbar";

export default function PharmacyHome() {
  const navigate = useNavigate();
  const [pharmacyData, setPharmacyData] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch Pharmacy Data & Stats from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // 1. Fetch pharmacy profile from 'pharmacies' collection
        const pharmacyDoc = await getDoc(doc(db, "pharmacies", user.uid));
        if (pharmacyDoc.exists()) {
          setPharmacyData(pharmacyDoc.data());
        } else {
          // Fallback to users collection if pharmacy doc doesn't exist
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setPharmacyData(userDoc.data());
          }
        }

        // 2. Fetch inventory stats
        const inventoryQuery = query(
          collection(db, "pharmacy_inventory"),
          where("pharmacyId", "==", user.uid)
        );
        const inventorySnap = await getDocs(inventoryQuery);

        let totalItems = 0;
        let lowStock = 0;
        let outOfStock = 0;

        inventorySnap.forEach((doc) => {
          const item = doc.data();
          totalItems++;
          if (item.stock === 0) outOfStock++;
          else if (item.stock <= 10) lowStock++;
        });

        setStats({ totalItems, lowStock, outOfStock });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );

  const pharmacyName = pharmacyData?.name || "Pharmacy";
  const isProfileComplete = pharmacyData?.address && pharmacyData?.phone;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        {/* Profile Incomplete Warning */}
        {!isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">
                  Complete your store profile
                </p>
                <p className="text-amber-600 text-sm">
                  Add address and contact info so customers can find you.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/pharmacy/profile")}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Complete Now
            </button>
          </div>
        )}

        {/* Hero / Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl p-8 text-white shadow-lg mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {pharmacyName} 👋
            </h1>
            <p className="text-teal-50 text-lg">
              Manage your inventory and help customers find medicines nearby.
            </p>
            {pharmacyData?.address && (
              <p className="text-teal-100 text-sm mt-2 flex items-center gap-1">
                📍 {pharmacyData.address.substring(0, 60)}...
              </p>
            )}
          </div>
        </div>

        {/* Live Stats from Database */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl">
              📦
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.totalItems}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 text-xl">
              ⚠️
            </div>
            <div>
              <p className="text-gray-500 text-sm">Low Stock (≤10)</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.lowStock} Items
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600 text-xl">
              ❌
            </div>
            <div>
              <p className="text-gray-500 text-sm">Out of Stock</p>
              <p className="text-xl font-bold text-gray-800">
                {stats.outOfStock} Items
              </p>
            </div>
          </div>
        </div>

        {/* Main Actions Grid */}
        <h2 className="text-gray-700 font-bold text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Manage Inventory */}
          <div
            onClick={() => navigate("/pharmacy/inventory")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-teal-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">
                💊
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Manage Inventory
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Add new medicines, update prices, or remove expired items.
            </p>
            <span className="text-teal-600 font-medium text-sm group-hover:underline flex items-center gap-1">
              Open Inventory &rarr;
            </span>
          </div>

          {/* Card 2: AI Scanner */}
          <div
            onClick={() => navigate("/inventory-scanner")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">
                📸
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">AI Scanner</h3>
            <p className="text-gray-500 text-sm mb-4">
              Scan medicine packages with AI to auto-add to inventory.
            </p>
            <span className="text-blue-600 font-medium text-sm group-hover:underline flex items-center gap-1">
              Open Scanner &rarr;
            </span>
          </div>

          {/* Card 3: Store Profile */}
          <div
            onClick={() => navigate("/pharmacy/profile")}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="bg-purple-50 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
              <span className="text-2xl group-hover:text-white transition-colors">
                ⚙️
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Store Profile
            </h3>
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
              Keeping your stock updated increases your visibility in the "Find
              Medicines" search results by 40%.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
