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
  // JSX (MODERNIZED)
  // ------------------------------
  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue to NearCare</p>

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
            Sign-in link sent! Check your email.
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
            User Type
          </label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">👤 Patient / User</option>
            <option value="pharmacy">💊 Pharmacy Owner</option>
            <option value="clinic">🏥 Doctor / Clinic</option>
          </select>
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
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="auth-spinner"></span>
              Signing in...
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </>
          )}
        </button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-buttons">
          <button
            type="button"
            onClick={handleEmailLinkSignIn}
            className="social-btn email-link"
            disabled={isLoading}
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
            Email Link
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="social-btn google"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        </div>

        <p className="link" onClick={() => navigate("/signup")}>
          Don't have an account? <span>Create one</span>
        </p>
      </form>
    </div>
  );
}

export default Login;
