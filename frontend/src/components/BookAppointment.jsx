import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Try to get user location to sort clinics by proximity
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationError(null);
        },
        (err) => {
          console.warn("Could not get location:", err);
          setLocationError("Location not available — showing clinics by wait time");
          setUserLocation(null);
        },
        { enableHighAccuracy: true, timeout: 20000 }
      );
    } else {
      setLocationError("Geolocation not supported");
    }

    // 🔴 REAL-TIME listener (IMPORTANT)
    // utility: calculate haversine distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const unsub = onSnapshot(collection(db, "clinics"), (snap) => {
      let clinicList = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        // show only fully configured clinics
        .filter(c => c.name && c.address && c.openTime && c.closeTime);

      // attach distance when userLocation is available
      if (userLocation) {
        clinicList = clinicList.map(c => {
          if (c.lat && c.lng) {
            return { ...c, distance: calculateDistance(userLocation[0], userLocation[1], c.lat, c.lng) };
          }
          return { ...c, distance: null };
        });

        // sort by distance (nearest first). Clinics without coords go to the end.
        clinicList.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        // fallback: sort by estimated wait
        clinicList.sort((a, b) => {
          const waitA =
            Math.max((a.totalTokens || 0) - (a.currentToken || 0), 0) *
            (a.avgTimePerPatient || 10);

          const waitB =
            Math.max((b.totalTokens || 0) - (b.currentToken || 0), 0) *
            (b.avgTimePerPatient || 10);

          return waitA - waitB;
        });
      }

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
        <h1 className="text-2xl font-bold mb-6">
          Book a Clinic Appointment
        </h1>

        {/* Search input */}
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics by name or doctor"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {clinics.length === 0 ? (
          <p className="text-gray-500">No clinics available.</p>
        ) : (
          <div className="space-y-4">
            {/** Filter clinics by search term (client-side) */}
            {clinics
              .filter((clinic) => {
                if (!search) return true;
                const term = search.toLowerCase().trim();
                return (
                  (clinic.name || "").toLowerCase().includes(term) ||
                  (clinic.doctorName || "").toLowerCase().includes(term) ||
                  (clinic.specialty || "").toLowerCase().includes(term)
                );
              })
              .map((clinic) => {
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

                    <p className="text-sm text-gray-600">
                      ⏰ {clinic.openTime} – {clinic.closeTime}
                    </p>

                    {clinic.distance != null && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {clinic.distance < 1 ? `${(clinic.distance * 1000).toFixed(0)} m` : `${clinic.distance.toFixed(2)} km`} away
                      </p>
                    )}

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