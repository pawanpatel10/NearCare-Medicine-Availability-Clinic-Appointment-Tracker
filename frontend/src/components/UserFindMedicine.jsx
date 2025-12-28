import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import OSMMapView from "./OSMMapView";

const UserFindMedicine = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📍 Get user location once with fallback
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
      },
      (err) => {
        console.error("Location error:", err);
        setUserLocation([25.4358, 81.8463]); // fallback
        setAccuracy(0);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 🔍 Search medicine → pharmacy users
  const handleSearch = async () => {
    if (!search) return;

    setLoading(true);
    setPlaces([]);

    try {
      // 1️⃣ Search inventory
      const invQuery = query(
        collection(db, "pharmacy_inventory"),
        where("name_lower", ">=", search.toLowerCase().trim()),
        where("name_lower", "<=", search.toLowerCase().trim() + "\uf8ff"),
        where("stock", ">", 0)
      );

      const inventorySnap = await getDocs(invQuery);

      if (inventorySnap.empty) {
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch pharmacy users
      const pharmacyPromises = inventorySnap.docs.map(async (docSnap) => {
        const item = docSnap.data();
        const userSnap = await getDoc(doc(db, "users", item.pharmacyId));
        if (userSnap.exists() && userSnap.data().role === "pharmacy") {
          const pharmacy = userSnap.data();
          if (!pharmacy.lat || !pharmacy.lng) return null;

          return {
            id: item.pharmacyId,
            lat: pharmacy.lat,
            lon: pharmacy.lng,
            name: pharmacy.name,
            address: pharmacy.address || "Address not available",
            medicine: item.name,
            price: item.price,
            dosage: item.dosage,
            type: item.type,
            isOpen: pharmacy.isOpen
          };
        }
        return null;
      });

      const results = await Promise.all(pharmacyPromises);
      setPlaces(results.filter(Boolean));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userLocation) return <p className="text-gray-600">Fetching location...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* 🔍 Search Box */}
      <div className="flex mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicine (e.g. Oxitocin)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r-md hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-600 mb-2">Finding nearby pharmacies...</p>}

      {/* 🗺 Map */}
      <div className="h-96 border border-gray-300 rounded-lg overflow-hidden mb-4">
        <OSMMapView
          userLocation={userLocation}
          pharmacies={places}
          accuracy={accuracy}
        />
      </div>

      {/* 📋 List */}
      {places.length > 0 && (
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-lg font-semibold mb-2">
            Pharmacies with {search.trim()}:
          </h3>
          <ul className="space-y-2">
            {places.map((p) => (
              <li
                key={p.id}
                className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-blue-600">{p.name}</div>
                  {p.isOpen ? (
                    <span className="text-green-600 font-medium">Open</span>
                  ) : (
                    <span className="text-red-600 font-medium">Closed</span>
                  )}
                </div>
                <div className="text-gray-600">{p.address}</div>
                <div className="text-gray-800 mt-1">
                  {p.medicine} - {p.type} - {p.dosage}mg - ₹{p.price}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserFindMedicine;
