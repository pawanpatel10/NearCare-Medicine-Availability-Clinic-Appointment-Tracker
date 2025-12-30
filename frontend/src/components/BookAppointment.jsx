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
    // 🔴 Real-time clinic listener
    const unsub = onSnapshot(collection(db, "clinics"), (snap) => {
      const clinicList = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.name && c.address && c.openTime && c.closeTime)
        .sort((a, b) => {
          // 1️⃣ Sort by fees (low → high)
          if ((a.fees || 0) !== (b.fees || 0)) {
            return (a.fees || 0) - (b.fees || 0);
          }

          // 2️⃣ If fees same, sort by estimated wait
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
    return (
      <div className="p-6 text-lg text-gray-600">
        Loading clinics…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />

  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-2">
      Book a Clinic Appointment
    </h1>

    <p className="text-sm text-gray-600 mb-6">
      Choose a clinic based on waiting time and fees.
    </p>

    {clinics.length === 0 ? (
      <p className="text-gray-500">No clinics available.</p>
    ) : (
      <div className="space-y-3">
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

          const waitBadge =
            waitingCount === 0
              ? "bg-green-100 text-green-700"
              : waitingCount <= 4
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-700";

          return (
            <div
              key={clinic.id}
              className="bg-white px-4 py-3 rounded-lg border shadow-sm
                         hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                {/* LEFT */}
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800">
                    🏥 {clinic.name}
                  </p>

                  <p className="text-xs text-gray-600">
                    📍 {clinic.address}
                  </p>

                  <p className="text-xs text-gray-600">
                    ⏰ {clinic.openTime} – {clinic.closeTime}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-700">
                      💰 ₹{clinic.fees}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${waitBadge}`}
                    >
                      ⏳ {estimatedWait}
                    </span>
                  </div>
                </div>

                {/* RIGHT */}
                <button
                  disabled={isClosed}
                  onClick={() =>
                    navigate(`/book-appointment/${clinic.id}`)
                  }
                  className={`px-4 py-1.5 text-sm rounded-md font-semibold
                    transition ${
                      isClosed
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {isClosed ? "Closed" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>
  );
}