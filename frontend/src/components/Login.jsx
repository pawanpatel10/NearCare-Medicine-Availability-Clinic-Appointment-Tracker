import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
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

      // ✅ FIXED: Redirect using Firestore, NOT dropdown role
      await redirectUsingFirestore(user);

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  // ------------------------------
  // Google Login
  // ------------------------------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await setDoc(docRef, {
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              role: "",
              phone: "",
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              createdAt: new Date()
            });
            navigate("/complete-profile");
          },
          async () => {
            await setDoc(docRef, {
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              role: "",
              phone: "",
              lat: 25.4358,
              lng: 81.8463,
              createdAt: new Date()
            });
            navigate("/complete-profile");
          }
        );
      } else {
        await redirectUsingFirestore(user);
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed");
    }
  };

  // ------------------------------
  // 🔥 SINGLE SOURCE OF TRUTH REDIRECT
  // ------------------------------
  const redirectUsingFirestore = async (user) => {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      navigate("/complete-profile");
      return;
    }

    const data = snap.data();

    if (!data.role || !data.phone) {
      navigate("/complete-profile");
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

        <button type="submit" className="login-btn">Login</button>

        <div style={{ textAlign: "center", margin: "10px 0" }}>OR</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-btn"
          style={{ background: "#db4437", color: "white" }}
        >
          Sign in with Google
        </button>

        <p className="link">Forgot password?</p>
      </form>
    </div>
  );
}

export default Login;
