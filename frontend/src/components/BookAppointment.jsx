import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function BookAppointment() {
  const navigate = useNavigate();

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [search, setSearch] = useState("");

  // 🔥 waiting count per clinic (ONLY waiting)
  const [waitingMap, setWaitingMap] = useState({});

  useEffect(() => {
    // 🌍 Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationError(null);
        },
        () => {
          setLocationError(
            "Location not available — showing clinics by wait time"
          );
          setUserLocation(null);
        },
        { enableHighAccuracy: true, timeout: 20000 }
      );
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // 🔹 Clinics listener
    const unsubClinics = onSnapshot(collection(db, "clinics"), (snap) => {
      let clinicList = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.name && c.address && c.openTime && c.closeTime);

      if (userLocation) {
        clinicList = clinicList.map(c =>
          c.lat && c.lng
            ? {
                ...c,
                distance: calculateDistance(
                  userLocation[0],
                  userLocation[1],
                  c.lat,
                  c.lng
                )
              }
            : { ...c, distance: null }
        );

        clinicList.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        );
      }

      setClinics(clinicList);
      setLoading(false);
    });

    // 🔥 WAITING appointments only
    const waitingQ = query(
      collection(db, "appointments"),
      where("status", "==", "waiting")
    );

    const unsubWaiting = onSnapshot(waitingQ, (snap) => {
      const map = {};
      snap.docs.forEach(d => {
        const { clinicId } = d.data();
        map[clinicId] = (map[clinicId] || 0) + 1;
      });
      setWaitingMap(map);
    });

    return () => {
      unsubClinics();
      unsubWaiting();
    };
  }, [userLocation]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-emerald-100">
        <p className="text-slate-700 font-semibold">Loading clinics…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-emerald-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">
          Book a Clinic Appointment
        </h1>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics by name or doctor"
            className="w-full px-4 py-3 rounded-xl border border-slate-400
                       focus:outline-none focus:ring-2 focus:ring-teal-600
                       text-slate-900 placeholder-slate-500"
          />
        </div>

        {clinics.length === 0 ? (
          <p className="text-slate-600">No clinics available.</p>
        ) : (
          <div className="space-y-5">
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
                const waitingCount = waitingMap[clinic.id] || 0;
                const avgTime = clinic.avgTimePerPatient || 10;

                const now = new Date();
                const [openH, openM] = clinic.openTime.split(":").map(Number);
                const [closeH, closeM] = clinic.closeTime.split(":").map(Number);

                const openingTime = new Date(now);
                openingTime.setHours(openH, openM, 0, 0);

                const closingTime = new Date(now);
                closingTime.setHours(closeH, closeM, 0, 0);

                const effectiveStart = now < openingTime ? openingTime : now;

                const estimatedServiceTime = new Date(
                  effectiveStart.getTime() +
                    waitingCount * avgTime * 60000
                );

                const outOfTimeRange = estimatedServiceTime > closingTime;
                const bookingsPaused = clinic.bookingsOpen === false;

                const estimatedWait =
                  waitingCount === 0
                    ? now < openingTime
                      ? `Opens at ${clinic.openTime}`
                      : "No wait"
                    : `~${waitingCount * avgTime} mins`;

                const waitBadge =
                  bookingsPaused
                    ? "bg-gray-200 text-gray-700"
                    : outOfTimeRange
                    ? "bg-red-200 text-red-800"
                    : waitingCount === 0
                    ? "bg-emerald-200 text-emerald-800"
                    : waitingCount <= 4
                    ? "bg-yellow-200 text-yellow-900"
                    : "bg-red-200 text-red-800";

                return (
                  <div
                    key={clinic.id}
                    className="relative rounded-2xl p-[1.5px]
                               bg-gradient-to-r from-slate-400 to-slate-300
                               hover:from-teal-600 hover:to-emerald-600
                               transition cursor-pointer"
                  >
                    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">
                            🏥 {clinic.name}
                          </p>

                          <p className="text-xs text-slate-700">
                            📍 {clinic.address}
                          </p>

                          <p className="text-sm text-slate-700">
                            ⏰ {clinic.openTime} – {clinic.closeTime}
                          </p>

                          {clinic.distance != null && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-cyan-200 text-cyan-900">
                              📍 {clinic.distance < 1
                                ? `${(clinic.distance * 1000).toFixed(0)} m`
                                : `${clinic.distance.toFixed(2)} km`} away
                            </span>
                          )}

                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-semibold text-slate-800">
                              💰 ₹{clinic.fees}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${waitBadge}`}
                            >
                              ⏳ {bookingsPaused ? "Bookings paused" : estimatedWait}
                            </span>
                          </div>

                          {outOfTimeRange && !bookingsPaused && (
                            <p className="text-xs text-red-700 mt-1 font-medium">
                              ⚠️ No slots available today
                            </p>
                          )}

                          {bookingsPaused && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              🚫 Bookings paused by clinic
                            </p>
                          )}
                        </div>

                        <button
                          disabled={outOfTimeRange || bookingsPaused}
                          onClick={() =>
                            navigate(`/book-appointment/${clinic.id}`)
                          }
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                            outOfTimeRange || bookingsPaused
                              ? "bg-slate-400 text-slate-600 cursor-not-allowed"
                              : "bg-gradient-to-r from-teal-700 to-emerald-700 text-white hover:scale-[1.05] shadow-lg"
                          }`}
                        >
                          {bookingsPaused
                            ? "Paused"
                            : outOfTimeRange
                            ? "Full"
                            : "Select"}
                        </button>
                      </div>
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
