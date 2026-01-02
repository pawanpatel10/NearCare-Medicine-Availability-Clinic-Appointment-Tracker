import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import {
  MapPin,
  Phone,
  Clock,
  Store,
  Search,
  Navigation,
  ArrowLeft,
  Save,
} from "lucide-react";
import Navbar from "./Navbar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet Marker Fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PharmacyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [coords, setCoords] = useState([25.4358, 81.8463]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch existing pharmacy data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Try pharmacies collection first
        const pharmacyDoc = await getDoc(doc(db, "pharmacies", user.uid));
        if (pharmacyDoc.exists()) {
          const data = pharmacyDoc.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setOpenTime(data.openTime || "09:00");
          setCloseTime(data.closeTime || "21:00");
          if (data.lat && data.lng) {
            setCoords([data.lat, data.lng]);
          }
          setSearchQuery(data.address || "");
        } else {
          // Fallback to users collection
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || "");
            setPhone(data.phone || "");
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Location helpers
  const detectLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const newPos = [pos.coords.latitude, pos.coords.longitude];
      setCoords(newPos);
      reverseGeocode(newPos[0], newPos[1]);
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
        setSearchQuery(data.display_name);
      }
    } catch (err) {
      console.error("Geocode error", err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSelectSuggestion = (s) => {
    const newPos = [parseFloat(s.lat), parseFloat(s.lon)];
    setCoords(newPos);
    setAddress(s.display_name);
    setSearchQuery(s.display_name);
    setSuggestions([]);
  };

  // Map Components
  function MapController({ targetCoords }) {
    const map = useMap();
    useEffect(() => {
      map.flyTo(targetCoords, 16, { animate: true });
    }, [targetCoords, map]);
    return null;
  }

  function MapClickTracker() {
    useMapEvents({
      click(e) {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setCoords(newPos);
        reverseGeocode(newPos[0], newPos[1]);
      },
    });
    return <Marker position={coords} />;
  }

  // Save handler
  const handleSave = async () => {
    if (!name || !phone || phone.length < 10) {
      alert("Please fill in name and valid phone number");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;

      // Update pharmacies collection
      await updateDoc(doc(db, "pharmacies", user.uid), {
        name,
        phone,
        address,
        openTime,
        closeTime,
        lat: coords[0],
        lng: coords[1],
        updatedAt: serverTimestamp(),
      });

      // Also update users collection for consistency
      await updateDoc(doc(db, "users", user.uid), {
        name,
        phone,
        updatedAt: serverTimestamp(),
      });

      alert("Profile updated successfully!");
      navigate("/pharmacy-dashboard");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/pharmacy-dashboard")}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Store Profile</h1>
            <p className="text-gray-500 text-sm">
              Update your pharmacy information
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Store Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Store size={16} /> Store Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MedPlus Pharmacy"
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} /> Contact Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
            />
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock size={16} /> Opens At
              </label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock size={16} /> Closes At
              </label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <MapPin size={16} /> Store Location
            </label>

            {/* Search Box */}
            <div className="relative mb-4">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search your store location..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => onSelectSuggestion(s)}
                      className="p-3 hover:bg-teal-50 cursor-pointer text-sm flex items-start gap-2 border-b last:border-0 text-gray-600"
                    >
                      <MapPin
                        size={14}
                        className="text-teal-500 mt-0.5 shrink-0"
                      />
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Map */}
            <div className="h-56 rounded-2xl overflow-hidden border-2 border-gray-100 relative">
              <button
                onClick={detectLocation}
                className="absolute top-3 right-3 z-1000 bg-white p-2.5 rounded-full shadow-md text-teal-600 hover:scale-110 active:scale-90 transition-all"
              >
                <Navigation size={18} />
              </button>
              <MapContainer
                center={coords}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickTracker />
                <MapController targetCoords={coords} />
              </MapContainer>
            </div>

            {/* Selected Address */}
            {address && (
              <div className="mt-3 bg-teal-50 p-3 rounded-xl border border-teal-100">
                <p className="text-xs font-bold text-teal-600 uppercase mb-1">
                  Selected Address:
                </p>
                <p className="text-sm font-medium text-teal-900">{address}</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
