import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
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
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Navigation,
  Building2,
  Stethoscope,
} from "lucide-react";
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

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Independent States
  const [selectedRole, setSelectedRole] = useState("user");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState([25.4358, 81.8463]); // Initial: Prayagraj
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      setName(auth.currentUser.displayName || "");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // --- LOCATION LOGIC ---
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

  // --- INTERNAL MAP COMPONENTS ---
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

  // --- SAVE LOGIC ---
  const handleFinalSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);

      // 1. Update master users doc
      await updateDoc(userRef, {
        name,
        phone,
        role: selectedRole,
        isProfileComplete: true,
        updatedAt: serverTimestamp(),
      });

      // 2. Initialize specialized collection based on role
      const common = {
        name,
        address,
        phone,
        lat: coords[0],
        lng: coords[1],
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };

      if (selectedRole === "pharmacy") {
        await setDoc(doc(db, "pharmacies", user.uid), {
          ...common,
          isVerified: false,
        });
        // Refresh auth context before navigating
        await refreshUser();
        navigate("/pharmacy-dashboard");
      } else if (selectedRole === "clinic") {
        await setDoc(doc(db, "clinics", user.uid), {
          ...common,
          isOpen: true,
          currentToken: 0,
          totalTokens: 0,
          fees: "",
          openTime: "",
          closeTime: "",
        });
        // Refresh auth context before navigating
        await refreshUser();
        navigate("/doctor-dashboard");
      } else {
        await setDoc(doc(db, "patients", user.uid), {
          name,
          address,
          phone,
          lat: coords[0],
          lng: coords[1],
          createdAt: serverTimestamp(),
        });
        // Refresh auth context before navigating
        await refreshUser();
        navigate("/home");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile");
    }
    setLoading(false);
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 400 : -400, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? -400 : 400, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 relative">
        {/* Step Indicator */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                step >= i ? "bg-indigo-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={step}>
          {/* STEP 1: CHOOSE ROLE */}
          {step === 1 && (
            <motion.div
              key="s1"
              custom={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                I am a...
              </h2>
              <p className="text-slate-500 mb-6">
                Pick your role to get the right tools.
              </p>
              <div className="space-y-4">
                {[
                  {
                    id: "user",
                    title: "Patient",
                    icon: <User />,
                    desc: "Book appointments & find meds",
                  },
                  {
                    id: "pharmacy",
                    title: "Pharmacy",
                    icon: <Building2 />,
                    desc: "Manage stock & medicine finders",
                  },
                  {
                    id: "clinic",
                    title: "Doctor",
                    icon: <Stethoscope />,
                    desc: "Manage your clinic & tokens",
                  },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.id);
                      setStep(2);
                    }}
                    className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 text-left transition-all ${
                      selectedRole === role.id
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-slate-100 hover:border-indigo-200"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        selectedRole === role.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{role.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {role.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div
              key="s2"
              custom={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                About You
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                Providing valid info builds trust.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {selectedRole === "user"
                      ? "Full Name"
                      : "Registered Business Name"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-4 mt-1 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full p-4 mt-1 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!name || phone.length < 10}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all"
                  >
                    Next: Set Location
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOCATION */}
          {step === 3 && (
            <motion.div
              key="s3"
              custom={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {selectedRole === "user" ? "Set Home 🏠" : "Pin Location 📍"}
              </h2>
              <p className="text-slate-500 mb-6 font-medium">
                Verify your address on the map.
              </p>

              <div className="space-y-4 relative">
                <div className="relative z-[2000]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                  <input
                    type="text"
                    placeholder="Search area or street..."
                    className="w-full p-4 pl-12 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none shadow-sm text-sm font-semibold"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {suggestions.length > 0 && (
                    <ul className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden max-h-40 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          onClick={() => onSelectSuggestion(s)}
                          className="p-3 hover:bg-indigo-50 cursor-pointer text-[11px] flex items-start gap-2 border-b last:border-0 text-slate-600 leading-tight"
                        >
                          <MapPin className="size-3 text-indigo-500 mt-0.5 shrink-0" />{" "}
                          {s.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="h-44 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative z-0">
                  <button
                    onClick={detectLocation}
                    className="absolute top-3 right-3 z-[1000] bg-white p-2.5 rounded-full shadow-md text-indigo-600 hover:scale-110 active:scale-90 transition-all"
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

                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">
                    Confirming Address:
                  </p>
                  <p className="text-[11px] font-bold text-indigo-900 line-clamp-2 leading-relaxed">
                    {address || "Please select on map..."}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="p-4 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={handleFinalSave}
                    disabled={loading || !address}
                    className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 transition-all"
                  >
                    {loading ? "Saving..." : "Finish Profile"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
