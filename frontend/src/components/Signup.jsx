import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig"; // Import auth AND db
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import "./auth.css";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    role: "user",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validation Checks
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      setLoading(true);

      // 2. Create User in Firebase Auth (Email/Pass)
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      const user = userCredential.user;

      // 3. Update "Display Name" in Auth Profile (Optional but good for UI)
      await updateProfile(user, { displayName: form.name });

      // 4. SAVE ROLE TO FIRESTORE (Crucial Step)
      // We create a document in the "users" collection with the SAME ID as the Auth UID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        role: form.role, // <--- This determines if they are Doctor or Patient
        createdAt: new Date()
      });

      console.log("Account Created:", user.email);
      setLoading(false);
      
      // 5. Redirect based on role
      if (form.role === "pharmacy") navigate("/pharmacy-dashboard");
      else if (form.role === "clinic") navigate("/doctor-dashboard");
      else navigate("/home");

    } catch (err) {
      setLoading(false);
      console.error(err);
      // Firebase specific error handling
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