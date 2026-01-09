import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [locationMethod, setLocationMethod] = useState("address"); // "address" or "gps"

  const [form, setForm] = useState({
    role: "",
    name: currentUser?.displayName || currentUser?.name || "",
    phone: "",
    // Pharmacy-specific fields
    address: "",
    lat: null,
    lng: null,
    // Clinic-specific fields
    specialization: "",
    clinicName: "",
  });

  // Geocode address to coordinates using OpenStreetMap Nominatim
  const geocodeAddress = async (address) => {
    if (!address.trim()) return null;

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "NearCare-App",
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  // Get user's GPS location
  const getLocation = () => {
    setLocationStatus("Getting your location...");

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported. Please enter address.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setLocationStatus(
          `✅ GPS Location: ${pos.coords.latitude.toFixed(
            4
          )}, ${pos.coords.longitude.toFixed(4)}`
        );
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationStatus(
          "⚠️ Could not get GPS location. Please enter address."
        );
        if (form.role === "pharmacy") {
          setLocationMethod("address");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Get location for clinic when role changes
  useEffect(() => {
    if (form.role === "clinic") {
      getLocation();
    }
  }, [form.role]);

  // Get GPS location for pharmacy when method changes to GPS
  useEffect(() => {
    if (form.role === "pharmacy" && locationMethod === "gps") {
      getLocation();
    }
  }, [form.role, locationMethod]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!form.role) {
      setError("Please select a role");
      setIsLoading(false);
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter your name");
      setIsLoading(false);
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number");
      setIsLoading(false);
      return;
    }

    if (form.role === "pharmacy" && !form.address.trim()) {
      setError("Please enter your pharmacy address");
      setIsLoading(false);
      return;
    }

    if (form.role === "clinic" && !form.clinicName.trim()) {
      setError("Please enter your clinic name");
      setIsLoading(false);
      return;
    }

    try {
      let finalLat = form.lat;
      let finalLng = form.lng;

      // For pharmacy with address method, geocode the address
      if (form.role === "pharmacy" && locationMethod === "address") {
        setLocationStatus("Finding location from address...");
        const geocoded = await geocodeAddress(form.address);
        if (!geocoded) {
          setError(
            "Could not find location for this address. Please check the address or use GPS."
          );
          setIsLoading(false);
          return;
        }
        finalLat = geocoded.lat;
        finalLng = geocoded.lng;
        setLocationStatus(`✅ Found: ${geocoded.displayName}`);
      }

      // For clinic, we need GPS location
      if (form.role === "clinic" && (!finalLat || !finalLng)) {
        setError(
          "Location is required for clinics. Please allow location access."
        );
        setIsLoading(false);
        return;
      }

      const docRef = doc(db, "users", currentUser.uid);

      // Base data for all roles
      let userData = {
        uid: currentUser.uid,
        name: form.name.trim(),
        email: currentUser.email,
        role: form.role,
        phone: form.phone.trim(),
        updatedAt: new Date(),
      };

      // Add role-specific fields
      if (form.role === "pharmacy") {
        userData = {
          ...userData,
          address: form.address.trim(),
          lat: finalLat || 25.4358,
          lng: finalLng || 81.8463,
          isOpen: true,
          currentToken: 0,
        };
      } else if (form.role === "clinic") {
        userData = {
          ...userData,
          clinicName: form.clinicName.trim(),
          specialization: form.specialization.trim(),
          lat: finalLat || 25.4358,
          lng: finalLng || 81.8463,
        };
      } else if (form.role === "user") {
        // User can optionally have location
        if (finalLat && finalLng) {
          userData.lat = finalLat;
          userData.lng = finalLng;
        }
      }

      await setDoc(docRef, userData, { merge: true });

      // Refresh auth context to get updated role
      await refreshUser();

      // Navigate to appropriate dashboard
      if (form.role === "clinic") {
        navigate("/doctor-dashboard");
      } else if (form.role === "pharmacy") {
        navigate("/pharmacy-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Complete Your Profile</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
          Please select your role and provide additional details
        </p>

        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        {/* Role Selection */}
        <label>I am a... *</label>
        <select
          name="role"
          value={form.role}
          onChange={(e) => {
            handleChange(e);
            setLocationStatus("");
            setLocationMethod("address");
            setForm((prev) => ({ ...prev, lat: null, lng: null }));
          }}
          required
          style={{ marginBottom: "15px" }}
        >
          <option value="">-- Select your role --</option>
          <option value="user">Patient / User</option>
          <option value="clinic">Doctor / Clinic</option>
          <option value="pharmacy">Pharmacy Owner</option>
        </select>

        {/* Common Fields */}
        <label>
          {form.role === "pharmacy" ? "Pharmacy Name *" : "Full Name *"}
        </label>
        <input
          type="text"
          name="name"
          placeholder={
            form.role === "pharmacy"
              ? "Enter pharmacy name"
              : "Enter your full name"
          }
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Phone Number *</label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter phone number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        {/* Clinic-specific Fields */}
        {form.role === "clinic" && (
          <>
            <label>Clinic Name *</label>
            <input
              type="text"
              name="clinicName"
              placeholder="Enter clinic name"
              value={form.clinicName}
              onChange={handleChange}
              required
            />

            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              placeholder="e.g., General Physician, Dentist, etc."
              value={form.specialization}
              onChange={handleChange}
            />

            <div
              style={{
                padding: "10px",
                backgroundColor: "#e0f2fe",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <p style={{ fontSize: "13px", color: "#0369a1", margin: 0 }}>
                📍 {locationStatus || "Getting your clinic location..."}
              </p>
              <button
                type="button"
                onClick={getLocation}
                style={{
                  marginTop: "8px",
                  background: "transparent",
                  border: "none",
                  color: "#0284c7",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "13px",
                  padding: 0,
                }}
              >
                Refresh location
              </button>
            </div>
          </>
        )}

        {/* Pharmacy-specific Fields */}
        {form.role === "pharmacy" && (
          <>
            <label>Pharmacy Address *</label>
            <input
              type="text"
              name="address"
              placeholder="Enter full address (e.g., 123 Main St, City, State)"
              value={form.address}
              onChange={handleChange}
              required
            />

            {/* Location Method Toggle */}
            <div
              style={{
                padding: "12px",
                backgroundColor: "#e0f2fe",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                How should we get your location?
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setLocationMethod("address")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border:
                      locationMethod === "address"
                        ? "none"
                        : "1px solid #cbd5e1",
                    background:
                      locationMethod === "address" ? "#0d9488" : "white",
                    color: locationMethod === "address" ? "white" : "#334155",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  📍 From Address
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMethod("gps")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border:
                      locationMethod === "gps" ? "none" : "1px solid #cbd5e1",
                    background: locationMethod === "gps" ? "#0d9488" : "white",
                    color: locationMethod === "gps" ? "white" : "#334155",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  🛰️ Use GPS
                </button>
              </div>

              {locationMethod === "address" && (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  We'll convert your address to coordinates automatically.
                </p>
              )}

              {locationMethod === "gps" && (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  {locationStatus ||
                    "Click 'Use GPS' to get your current location"}
                </p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          className="login-btn"
          disabled={isLoading || geocoding}
          style={{ marginTop: "15px" }}
        >
          {isLoading
            ? "Saving..."
            : geocoding
            ? "Finding location..."
            : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}

export default RoleSelection;
