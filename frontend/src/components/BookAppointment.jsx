import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      const snap = await getDocs(collection(db, "clinics"));
      setClinics(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchClinics();
  }, []);

  if (loading) {
    return <div className="p-6">Loading clinics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          Book a Clinic Appointment
        </h1>

        {clinics.length === 0 ? (
          <p className="text-gray-500">No clinics available.</p>
        ) : (
          <div className="space-y-4">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-lg">{clinic.name}</p>
                  <p className="text-sm text-gray-500">
                    Fees: ₹{clinic.fees || "N/A"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/book-appointment/${clinic.id}`)
                  }
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
