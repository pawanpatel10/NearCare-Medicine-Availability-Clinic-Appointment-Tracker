import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, actionCodeSettings } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    role: "user",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ------------------------------
  // Email/Password Login
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // 🟡 Keep pharmacy lat/lng logic (UNCHANGED)
      if (form.role === "pharmacy") {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        if (!data.lat || !data.lng) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await setDoc(
                docRef,
                {
                  ...data,
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  updatedAt: new Date(),
                },
                { merge: true }
              );
            },
            async () => {
              await setDoc(
                docRef,
                {
                  ...data,
                  lat: 25.4358,
                  lng: 81.8463,
                  updatedAt: new Date(),
                },
                { merge: true }
              );
            }
          );
        }
      }

      // ✅ Refresh auth context to ensure state is updated
      await refreshUser();

      // ✅ FIXED: Redirect using Firestore, NOT dropdown role
      await redirectUsingFirestore(user);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Email Link Authentication
  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendSignInLinkToEmail(auth, form.email, actionCodeSettings);

      // Save email to localStorage for later retrieval
      window.localStorage.setItem("emailForSignIn", form.email);

      // Show success message
      setLinkSent(true);
      setForm({ ...form, email: "", password: "" });

      // Auto-hide the success message after 5 seconds
      setTimeout(() => setLinkSent(false), 5000);
    } catch (err) {
      console.error(err);
      setError(`Failed to send email link: ${err.message}`);
    }
  };

  // ------------------------------
  // Google Login
  // ------------------------------
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create user with null role - will be redirected to role selection
        await setDoc(docRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: null, // No role yet - will select on next page
          createdAt: new Date(),
        });
        await refreshUser();
        navigate("/select-role");
      } else {
        await refreshUser();
        await redirectUsingFirestore(user);
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // 🔥 SINGLE SOURCE OF TRUTH REDIRECT
  // ------------------------------
  const redirectUsingFirestore = async (user) => {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      navigate("/signup");
      return;
    }

    const data = snap.data();

    if (!data.role) {
      navigate("/login");
    } else if (data.role === "clinic") {
      navigate("/doctor-dashboard");
    } else if (data.role === "pharmacy") {
      navigate("/pharmacy-dashboard");
    } else {
      navigate("/home");
    }
  };

  // ------------------------------
  // JSX (UNCHANGED)
  // ------------------------------
  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        {linkSent && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✅ Sign-in link sent to {form.email}! Check your email.
          </div>
        )}

        <label>User Type</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="mb-2"
        >
          <option value="user">Patient / User</option>
          <option value="pharmacy">Pharmacy Owner</option>
          <option value="clinic">Doctor / Clinic</option>
        </select>

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
          placeholder="Enter password"
          onChange={handleChange}
          required
        />

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <div style={{ textAlign: "center", margin: "10px 0" }}>OR</div>

        <button
          type="button"
          onClick={handleEmailLinkSignIn}
          className="email-link-btn"
          disabled={isLoading}
          style={{
            background: "#3b82f6",
            color: "white",
            width: "100%",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "10px",
          }}
        >
          📧 Sign in with Email Link
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-btn"
          disabled={isLoading}
          style={{ background: "#db4437", color: "white" }}
        >
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p className="link">Forgot password?</p>
      </form>
    </div>
  );
}

export default Login;
