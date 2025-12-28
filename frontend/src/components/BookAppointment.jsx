import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
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

      const clinicList = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        // show only fully configured clinics
        .filter(c => c.name && c.address && c.openTime && c.closeTime)
        // sort by fees (low → high)
        .sort((a, b) => Number(a.fees) - Number(b.fees));

      setClinics(clinicList);
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
            {clinics.map((clinic) => {
              // 🔴 clinic closed logic
              const isClosed = !clinic.openTime || !clinic.closeTime;

              return (
                <div
                  key={clinic.id}
                  className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-lg">{clinic.name}</p>

                    <p className="text-sm text-gray-600 mt-1">
                      📍 {clinic.address}
                    </p>

                    <p className="text-sm text-gray-600">
                      ⏰ {clinic.openTime} – {clinic.closeTime}
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      💰 Fees: ₹{clinic.fees}
                    </p>
                  </div>

                  <button
                    disabled={isClosed}
                    onClick={() =>
                      navigate(`/book-appointment/${clinic.id}`)
                    }
                    className={`px-5 py-2 rounded-lg text-white transition ${
                      isClosed
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isClosed ? "Clinic Closed" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
