import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, actionCodeSettings } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

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
      setForm((prev) => ({ ...prev, address: "", lat: null, lng: null }));
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

          setForm((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: address,
          }));
          setLocationGranted(true);
          setLoadingLocation(false);
        } catch (err) {
          console.error("Address fetch error:", err);
          // Still save coordinates even if address fails
          setForm((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
              4
            )}`,
          }));
          setLocationGranted(true);
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoadingLocation(false);
        setLocationGranted(false);

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            setError(
              "❌ Location access denied. Please allow location access in your browser settings and try again."
            );
            break;
          case 2: // POSITION_UNAVAILABLE
            setError(
              "❌ Location unavailable. Please check that your device's location services are enabled."
            );
            break;
          case 3: // TIMEOUT
            setError(
              "❌ Location request timed out. Please check your internet connection and try again."
            );
            break;
          default:
            setError("❌ Failed to get location: " + error.message);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
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

      // Create user with null role - will select role on next page
      const userData = {
        uid: user.uid,
        name: form.name,
        email: form.email,
        role: null, // No role yet - will select on role selection page
        createdAt: new Date(),
      };

      await setDoc(docRef, userData);
      setLoading(false);
      navigate("/select-role");
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

  // ✅ Email Link Signup
  const handleEmailLinkSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name) {
      return setError("Please enter your name");
    }
    if (!form.email) {
      return setError("Please enter your email");
    }

    try {
      setLoading(true);

      // Send email link for signup
      await sendSignInLinkToEmail(auth, form.email, actionCodeSettings);

      // Save user data to localStorage for later retrieval after email verification
      const userData = {
        name: form.name,
        email: form.email,
        role: null, // Will select role after email verification
      };

      window.localStorage.setItem("newUserData", JSON.stringify(userData));
      window.localStorage.setItem("emailForSignIn", form.email);

      setLoading(false);
      setLinkSent(true);

      // Clear form
      setForm({
        role: "user",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        lat: null,
        lng: null,
      });

      // Reset after 5 seconds
      setTimeout(() => setLinkSent(false), 5000);
    } catch (err) {
      setLoading(false);
      console.error(err);
      setError(`Failed to send signup link: ${err.message}`);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="auth-subtitle">
          Join NearCare and access healthcare services
        </p>

        {error && (
          <div className="error-message">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {linkSent && (
          <div className="success-message">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Signup link sent! Check your email to complete registration.
          </div>
        )}

        <div className="form-group">
          <label>
            <svg
              className="inline w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <svg
              className="inline w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <svg
              className="inline w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <svg
              className="inline w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="auth-spinner"></span>
              Creating Account...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create Account
            </>
          )}
        </button>

        <div className="divider">
          <span>or sign up with</span>
        </div>

        <button
          type="button"
          onClick={handleEmailLinkSignUp}
          className="btn-secondary"
          disabled={loading}
          style={{ width: "100%" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {loading ? "Sending..." : "Sign Up with Email Link"}
        </button>

        <p className="link" onClick={() => navigate("/login")}>
          Already have an account? <span>Sign in</span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
