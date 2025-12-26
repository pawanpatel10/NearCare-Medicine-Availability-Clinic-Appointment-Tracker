import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user"); // Default to User

  useEffect(() => {
    if (auth.currentUser) {
      setName(auth.currentUser.displayName || ""); 
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (phone.length < 10) return alert("Enter valid phone number");
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);

      // Save Role, Name, and Phone
      await updateDoc(userRef, {
        name: name,
        phone: phone,
        role: role, // <--- SAVING THE ROLE THEY CHOSE
        isProfileComplete: true
      });

      // Initialize their specific database entry based on role
      // (e.g., If they are a Clinic, create a 'clinics' doc for them)
      if (role === "clinic") {
        await createClinicProfile(user.uid, name);
      }

      setLoading(false);

      // Redirect based on the role they just chose
      if (role === "clinic") navigate("/doctor-dashboard");
      else if (role === "pharmacy") navigate("/pharmacy-dashboard");
      else navigate("/home");
      
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save.");
      setLoading(false);
    }
  };

  // Helper to setup empty clinic data
  const createClinicProfile = async (uid, doctorName) => {
     // Check if exists first to avoid overwriting
     const clinicRef = doc(db, "clinics", uid);
     const snap = await getDoc(clinicRef);
     if(!snap.exists()) {
       const { setDoc } = await import("firebase/firestore"); // Dynamic import
       await setDoc(clinicRef, {
         name: doctorName,
         currentToken: 0,
         isOpen: true,
         address: "Update your address"
       });
     }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSave}>
        <h2>Finish Setup 🚀</h2>
        
        <label>I am a...</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">Patient (Looking for meds)</option>
          <option value="clinic">Doctor (Manage Clinic)</option>
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