import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
    closeTime: "",
    avgTimePerPatient: "10" // ✅ NEW (minutes)
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
        setForm(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    };

    fetchClinicProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const saveChanges = async () => {
    const clinicRef = doc(db, "clinics", auth.currentUser.uid);

    await setDoc(
      clinicRef,
      {
        ...form,
        fees: Number(form.fees),
        avgTimePerPatient: Number(form.avgTimePerPatient), // ✅ convert here
        ownerId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

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

        {/* Clinic Details */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Clinic Name"
          className="w-full border p-3 rounded mb-3"
        />

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Clinic Address"
          className="w-full border p-3 rounded mb-3"
        />

        <input
          name="fees"
          type="number"
          value={form.fees}
          onChange={handleChange}
          placeholder="Consultation Fees"
          className="w-full border p-3 rounded mb-3"
        />

        <input
          name="avgTimePerPatient"
          type="number"
          value={form.avgTimePerPatient}
          onChange={handleChange}
          placeholder="Avg time per patient (minutes)"
          className="w-full border p-3 rounded mb-3"
        />

        <div className="flex gap-3">
          <input
            name="openTime"
            type="time"
            value={form.openTime}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />

          <input
            name="closeTime"
            type="time"
            value={form.closeTime}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />
        </div>

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
