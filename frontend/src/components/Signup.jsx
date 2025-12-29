import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  
  const [form, setForm] = useState({
    role: "user",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    lat: null,
    lng: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Reset location when role changes to pharmacy
    if (name === "role" && value === "pharmacy") {
      setLocationGranted(false);
      setForm(prev => ({ ...prev, address: "", lat: null, lng: null }));
    }
  };

  // Reverse geocoding function to get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Error getting address:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Get location for pharmacy
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    setError("");
    console.log("Requesting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Location received:", position.coords);
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          console.log("Address:", address);
          
          setForm(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: address
          }));
          setLocationGranted(true);
          setLoadingLocation(false);
        } catch (err) {
          console.error("Address fetch error:", err);
          // Still save coordinates even if address fails
          setForm(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          }));
          setLocationGranted(true);
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoadingLocation(false);
        setLocationGranted(false);
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            setError("❌ Location access denied. Please allow location access in your browser settings and try again.");
            break;
          case 2: // POSITION_UNAVAILABLE
            setError("❌ Location unavailable. Please check that your device's location services are enabled.");
            break;
          case 3: // TIMEOUT
            setError("❌ Location request timed out. Please check your internet connection and try again.");
            break;
          default:
            setError("❌ Failed to get location: " + error.message);
        }
      },
      { 
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    // Check if pharmacy has granted location access
    if (form.role === "pharmacy" && !locationGranted) {
      return setError("Please grant location access to continue as a pharmacy.");
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: form.name });

      const docRef = doc(db, "users", user.uid);

      // Default user data
      const userData = {
        uid: user.uid,
        name: form.name,
        email: form.email,
        role: form.role,
        createdAt: new Date()
      };

      // If pharmacy, save with location data
      if (form.role === "pharmacy") {
        await setDoc(docRef, {
          ...userData,
          lat: form.lat,
          lng: form.lng,
          address: form.address,
          isOpen: true,
          currentToken: 0
        });
        setLoading(false);
        navigate("/pharmacy-dashboard");
      } else {
        // Regular user or clinic
        await setDoc(docRef, userData);
        setLoading(false);
        if (form.role === "clinic") navigate("/doctor-dashboard");
        else navigate("/home");
      }

    } catch (err) {
      setLoading(false);
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered.");
      } else {
        setError("Failed to create an account.");
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        <label>Account Type</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">Patient / User</option>
          <option value="pharmacy">Pharmacy Owner</option>
          <option value="clinic">Doctor / Clinic</option>
        </select>

        <label>Full Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter full name"
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create password"
          onChange={handleChange}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          onChange={handleChange}
          required
        />

        {form.role === "pharmacy" && (
          <>
            <label>Pharmacy Address *</label>
            {!locationGranted ? (
              <button
                type="button"
                onClick={requestLocation}
                disabled={loadingLocation}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "10px",
                  marginBottom: "10px",
                  cursor: loadingLocation ? "not-allowed" : "pointer"
                }}
              >
                {loadingLocation ? "Getting Location..." : "📍 Get My Location"}
              </button>
            ) : (
              <div style={{
                backgroundColor: "#e8f5e9",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "10px",
                fontSize: "14px"
              }}>
                <p style={{ margin: "0 0 5px 0", color: "#2e7d32", fontWeight: "bold" }}>
                  ✓ Location Captured
                </p>
                <p style={{ margin: "0", color: "#555" }}>
                  {form.address}
                </p>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={loadingLocation}
                  style={{
                    backgroundColor: "transparent",
                    color: "#1976d2",
                    border: "none",
                    padding: "5px 0",
                    marginTop: "5px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "13px"
                  }}
                >
                  Update Location
                </button>
              </div>
            )}
          </>
        )}

        


<button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="link" onClick={() => navigate("/login")} style={{cursor: "pointer"}}>
           Already have an account? Login
        </p>
      </form>
    </div>
  );
}

export default Signup;
