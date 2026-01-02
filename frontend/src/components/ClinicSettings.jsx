import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function ClinicSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    fees: "",
    openTime: "",
    closeTime: "",
    avgTimePerPatient: "10", // ✅ NEW (minutes)
    lat: null,
    lng: null
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const fetchClinicProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const clinicRef = doc(db, "clinics", user.uid);
      const snap = await getDoc(clinicRef);

      if (snap.exists()) {
        setForm(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    };

    fetchClinicProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const saveChanges = async () => {
    const clinicRef = doc(db, "clinics", auth.currentUser.uid);

    await setDoc(
      clinicRef,
      {
        ...form,
        name_lower: form.name.toLowerCase().trim(),
        fees: Number(form.fees),
        avgTimePerPatient: Number(form.avgTimePerPatient), // ✅ convert here
        lat: form.lat,
        lng: form.lng,
        ownerId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    alert("Clinic profile updated");
  };

  const getLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
        setGettingLocation(false);
        alert("Location captured successfully!");
      },
      (err) => {
        console.error("Location error:", err);
        alert("Failed to get location. Please enable location services.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 mt-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">⚙️ Clinic Settings</h1>
            <p className="text-blue-100 text-sm mt-1">Manage your clinic information and availability</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                📋 Basic Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter clinic name"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address with landmark"
                  rows="2"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                📍 Location
              </h2>
              
              <div>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={gettingLocation}
                  className={`w-full p-4 rounded-lg font-medium transition-all ${
                    form.lat && form.lng 
                      ? 'bg-green-50 border-2 border-green-400 text-green-700 hover:bg-green-100' 
                      : 'bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100'
                  } ${gettingLocation ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {gettingLocation 
                    ? "📍 Getting Location..." 
                    : form.lat && form.lng 
                      ? `✅ Location Captured (${form.lat.toFixed(6)}, ${form.lng.toFixed(6)})` 
                      : "📍 Click to Capture Clinic Location"
                  }
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Required:</span> Location helps patients find your clinic on the map
                </p>
              </div>
            </div>

            {/* Fees & Timing Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                💰 Fees & Timing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fees (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fees"
                    type="number"
                    value={form.fees}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    min="0"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avg Time per Patient (min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="avgTimePerPatient"
                    type="number"
                    value={form.avgTimePerPatient}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    min="5"
                    max="60"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                🕒 Operating Hours
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="openTime"
                    type="time"
                    value={form.openTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="closeTime"
                    type="time"
                    value={form.closeTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={saveChanges}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
