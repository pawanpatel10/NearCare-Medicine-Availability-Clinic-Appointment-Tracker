import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function ClinicSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    fees: "",
    openTime: "",
    closeTime: ""
  });

  useEffect(() => {
    const fetchClinicProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const clinicRef = doc(db, "clinics", user.uid);
      const snap = await getDoc(clinicRef);

      if (snap.exists()) {
        setForm({ ...form, ...snap.data() });
      }
      setLoading(false);
    };

    fetchClinicProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    const clinicRef = doc(db, "clinics", auth.currentUser.uid);
    await updateDoc(clinicRef, form);
    alert("Clinic profile updated");
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm mt-6">
        <h1 className="text-xl font-bold mb-4">Clinic Settings</h1>

        {["name", "address", "fees", "openTime", "closeTime"].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.toUpperCase()}
            className="w-full border p-3 rounded mb-3"
          />
        ))}

        <button
          onClick={saveChanges}
          className="bg-blue-600 text-white px-6 py-3 rounded w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
