import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebaseConfig"; // Import from your config
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import Firestore instance
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

  // 1. Handle Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // Firebase function to check credentials
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      
      console.log("Logged in:", user.email);
      handleRedirect(form.role);
      
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  // 2. Handle Google Login (Bonus Points)
// Inside Login.js (handleGoogleLogin)

const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // NEW USER: Don't set a role yet!
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "", // <--- EMPTY ROLE
        phone: "",
        createdAt: new Date()
      });
      navigate("/complete-profile");
      
    } else {
      // EXISTING USER
      const data = docSnap.data();
      
      // If role or phone is missing, send to profile page
      if (!data.role || !data.phone) {
        navigate("/complete-profile");
      } else {
        // Send to correct dashboard
        if (data.role === "clinic") navigate("/doctor-dashboard");
        else if (data.role === "pharmacy") navigate("/pharmacy-dashboard");
        else navigate("/home");
      }
    }
  } catch (err) {
    console.error(err);
    setError("Google sign-in failed");
  }
};

  // 3. Logic to send them to the right page
  const handleRedirect = (role) => {
    if (role === "pharmacy") {
      navigate("/pharmacy-dashboard");
    } else if (role === "clinic") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/home"); // Regular user
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* Show Error Message if login fails */}
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        <label>User Type</label>
        <select name="role" value={form.role} onChange={handleChange}>
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

        {/* Google Button */}
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