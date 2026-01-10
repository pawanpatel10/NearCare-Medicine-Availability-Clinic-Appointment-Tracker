import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const LocationContext = createContext({
  location: null,
  accuracy: null,
  loading: false,
  error: null,
  refreshLocation: () => {},
});

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null); // best accepted [lat, lon]
  const [accuracy, setAccuracy] = useState(null); // best accepted accuracy
  const [rawAccuracy, setRawAccuracy] = useState(null); // latest reported accuracy
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const attemptRef = useRef(0);
  const bestAccuracyRef = useRef(null);

  const refreshLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Clear any previous watcher
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    attemptRef.current = 0;
    const start = Date.now();
    setLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        attemptRef.current += 1;
        const thisAcc = pos.coords.accuracy;
        setRawAccuracy(thisAcc);

        const isBetter =
          bestAccuracyRef.current === null || thisAcc < bestAccuracyRef.current;

        // Ignore extremely coarse fixes (> 5000 m) unless we have nothing yet
        const isTooCoarse = thisAcc > 5000 && bestAccuracyRef.current !== null;

        if (!isTooCoarse && isBetter) {
          bestAccuracyRef.current = thisAcc;
          setLocation([pos.coords.latitude, pos.coords.longitude]);
          setAccuracy(thisAcc);
        }
        // Stop watching when accuracy is good or after a few readings / time budget
        const goodFix = thisAcc <= 25;
        const tooManyAttempts = attemptRef.current >= 3;
        const timedOut = Date.now() - start > 15000;
        if (goodFix || tooManyAttempts || timedOut) {
          navigator.geolocation.clearWatch(id);
          watchIdRef.current = null;
        }
        setLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        setError(
          err?.message ||
            "Unable to access your location. Please enable location services."
        );
        setLoading(false);
        if (id) {
          navigator.geolocation.clearWatch(id);
          watchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, timeout: 45000, maximumAge: 0 }
    );

    watchIdRef.current = id;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, accuracy, loading, error, refreshLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
