import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔴 REAL-TIME listener (IMPORTANT)
    const unsub = onSnapshot(collection(db, "clinics"), (snap) => {
      const clinicList = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        // show only fully configured clinics
        .filter(c => c.name && c.address && c.openTime && c.closeTime)
        // sort by estimated wait (smart UX)
        .sort((a, b) => {
          const waitA =
            Math.max((a.totalTokens || 0) - (a.currentToken || 0), 0) *
            (a.avgTimePerPatient || 10);

          const waitB =
            Math.max((b.totalTokens || 0) - (b.currentToken || 0), 0) *
            (b.avgTimePerPatient || 10);

          return waitA - waitB;
        });

      setClinics(clinicList);
      setLoading(false);
    });

    return () => unsub();
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
              const isClosed = !clinic.openTime || !clinic.closeTime;

              const currentToken = clinic.currentToken || 0;
              const totalTokens = clinic.totalTokens || 0;
              const avgTime = clinic.avgTimePerPatient || 10;

              const waitingCount = Math.max(
                totalTokens - currentToken,
                0
              );

              const estimatedWait =
                waitingCount === 0
                  ? "No wait"
                  : `~${waitingCount * avgTime} mins`;

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

                    <p className="text-sm mt-1 text-blue-600 font-medium">
                      ⏳ Estimated wait: {estimatedWait}
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
