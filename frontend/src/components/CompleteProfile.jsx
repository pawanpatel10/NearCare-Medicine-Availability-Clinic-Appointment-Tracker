import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user"); // default

  useEffect(() => {
    if (auth.currentUser) {
      setName(auth.currentUser.displayName || "");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (phone.length < 10) {
      alert("Enter valid phone number");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // 🔹 Create / Update user profile
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          phone,
          role,
          isProfileComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 🔹 Initialize clinic document if role = clinic
      if (role === "clinic") {
        await createClinicProfile(user.uid, name);
        navigate("/doctor-dashboard");
      } else if (role === "pharmacy") {
        navigate("/pharmacy-dashboard");
      } else {
        navigate("/home");
      }

    } catch (error) {
      console.error("Save profile error:", error);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Create clinic document safely
  const createClinicProfile = async (uid, doctorName) => {
    const clinicRef = doc(db, "clinics", uid);
    const snap = await getDoc(clinicRef);

    if (!snap.exists()) {
      await setDoc(clinicRef, {
        name: doctorName,
        address: "",
        fees: "",
        openTime: "",
        closeTime: "",
        currentToken: 0,
        totalTokens: 0,
        createdAt: serverTimestamp(),
      });
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSave}>
        <h2>Finish Setup 🚀</h2>

        <label>I am a...</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">Patient</option>
          <option value="clinic">Doctor (Clinic)</option>
          <option value="pharmacy">Pharmacy Owner</option>
        </select>

        <label>Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Mobile Number</label>
        <input
          type="tel"
          placeholder="9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Setting up..." : "Get Started"}
        </button>
      </form>
    </div>
  );
}
