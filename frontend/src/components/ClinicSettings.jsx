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
    avgTimePerPatient: "10",
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
        avgTimePerPatient: Number(form.avgTimePerPatient),
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
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <p className="text-teal-700 font-semibold animate-pulse">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 mt-6">
        <div className="relative bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-teal-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">
              ⚙️ Clinic Settings
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Manage your clinic information and availability
            </p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">
                📋 Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Clinic Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter clinic name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
                             focus:ring-2 focus:ring-teal-500 focus:border-transparent
                             transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Clinic Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address with landmark"
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
                             focus:ring-2 focus:ring-teal-500 focus:border-transparent
                             transition"
                  required
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">
                📍 Location
              </h2>

              <button
                type="button"
                onClick={getLocation}
                disabled={gettingLocation}
                className={`w-full p-4 rounded-xl font-medium transition-all
                  ${
                    form.lat && form.lng
                      ? "bg-emerald-50 border border-emerald-400 text-emerald-700"
                      : "bg-cyan-50 border border-cyan-400 text-cyan-700"
                  }
                  ${gettingLocation ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}
                `}
              >
                {gettingLocation
                  ? "📍 Getting Location..."
                  : form.lat && form.lng
                    ? `✅ Location Captured (${form.lat.toFixed(6)}, ${form.lng.toFixed(6)})`
                    : "📍 Click to Capture Clinic Location"}
              </button>

              <p className="text-xs text-slate-500">
                <span className="font-medium">Required:</span> Location helps patients find your clinic on the map
              </p>
            </div>

            {/* Fees & Timing Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">
                💰 Fees & Timing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Consultation Fees (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fees"
                    type="number"
                    value={form.fees}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
                               focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
                               focus:ring-2 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">
                🕒 Operating Hours
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Opening Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="openTime"
                    type="time"
                    value={form.openTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
                               focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Closing Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="closeTime"
                    type="time"
                    value={form.closeTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
                               focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={saveChanges}
                className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600
                           text-white px-6 py-4 rounded-xl font-semibold
                           shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
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
