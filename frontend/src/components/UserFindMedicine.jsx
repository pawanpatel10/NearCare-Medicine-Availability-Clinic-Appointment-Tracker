import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import OSMMapView from "./OSMMapView";

const UserFindMedicine = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const [locationError, setLocationError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  
  // New states for clinic search
  const [searchType, setSearchType] = useState("medicine"); // "medicine" or "clinic"
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 📍 Get user location with high accuracy
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setLocationError(null);
      },
      (err) => {
        console.error("Location error:", err);
        setLocationError("Unable to access your location. Please enable location services to search for medicines.");
        setUserLocation(null);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }, []);

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 🔍 Search medicine → pharmacy users
  const handleSearch = async () => {
    if (!search) return;

    setLoading(true);
    setPlaces([]);
    setNotFound(false);
    setSelectedPlace(null);

    try {
      if (searchType === "medicine") {
        await searchMedicine();
      } else {
        await searchClinic();
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search for medicine in pharmacies
  const searchMedicine = async () => {
      // 1️⃣ Search inventory
      const invQuery = query(
        collection(db, "pharmacy_inventory"),
        where("name_lower", ">=", search.toLowerCase().trim()),
        where("name_lower", "<=", search.toLowerCase().trim() + "\uf8ff"),
        where("stock", ">", 0)
      );

      const inventorySnap = await getDocs(invQuery);

      if (inventorySnap.empty) {
        setNotFound(true);
        return;
      }

      // 2️⃣ Fetch pharmacy users
      const pharmacyPromises = inventorySnap.docs.map(async (docSnap) => {
        const item = docSnap.data();
        const userSnap = await getDoc(doc(db, "users", item.pharmacyId));
        if (userSnap.exists() && userSnap.data().role === "pharmacy") {
          const pharmacy = userSnap.data();
          if (!pharmacy.lat || !pharmacy.lng) return null;

          const distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            pharmacy.lat,
            pharmacy.lng
          );

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
            isOpen: pharmacy.isOpen,
            distance: distance,
            placeType: "pharmacy"
          };
        }
        return null;
      });

      const results = await Promise.all(pharmacyPromises);
      const validResults = results.filter(Boolean);
      
      if (validResults.length === 0) {
        setNotFound(true);
      } else {
        // Sort by distance (nearest first)
        validResults.sort((a, b) => a.distance - b.distance);
      }
      setPlaces(validResults);
  };

  // Search for clinics by doctor name or clinic name
  const searchClinic = async () => {
    if (!userLocation) {
      console.error("User location not available");
      setNotFound(true);
      return;
    }

    const searchTerm = search.toLowerCase().trim();
    
    // Get all users with role "clinic"
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "clinic")
    );
    
    const usersSnap = await getDocs(usersQuery);
    
    if (usersSnap.empty) {
      console.log("No clinic users found in database");
      setNotFound(true);
      return;
    }

    console.log(`Found ${usersSnap.docs.length} clinic users`);

    // Filter and process clinic data
    const clinicPromises = usersSnap.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const clinicId = userDoc.id;
      
      // Check if clinic name or doctor name matches search
      const doctorName = (userData.name || "").toLowerCase();
      const clinicNameFromUser = (userData.clinicName || "").toLowerCase();
      
      // Fetch clinic details
      const clinicSnap = await getDoc(doc(db, "clinics", clinicId));
      
      let clinicData = null;
      if (clinicSnap.exists()) {
        clinicData = clinicSnap.data();
      }
      
      const clinicName = clinicData?.name || userData.clinicName || "";
      const clinicNameLower = clinicName.toLowerCase();
      
      // Match against search term
      const matchesSearch = 
        doctorName.includes(searchTerm) || 
        clinicNameLower.includes(searchTerm) ||
        clinicNameFromUser.includes(searchTerm);
      
      if (!matchesSearch) return null;
      
      // Get location from clinic data or user data
      const lat = clinicData?.lat || userData.lat;
      const lng = clinicData?.lng || userData.lng;
      
      // Check if location data exists
      if (!lat || !lng) {
        console.log(`Clinic ${clinicId} has no location data`);
        return null;
      }

      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        lat,
        lng
      );

      return {
        id: clinicId,
        lat: lat,
        lon: lng,
        name: clinicName || userData.name,
        doctorName: userData.name,
        address: (clinicData?.address || userData.address || "Address not available"),
        fees: clinicData?.fees || userData.fees,
        openTime: clinicData?.openTime || userData.openTime,
        closeTime: clinicData?.closeTime || userData.closeTime,
        distance: distance,
        placeType: "clinic"
      };
    });

    const results = await Promise.all(clinicPromises);
    const validResults = results.filter(Boolean);
    
    console.log(`Found ${validResults.length} clinics matching search`);
    
    if (validResults.length === 0) {
      setNotFound(true);
    } else {
      // Sort by distance (nearest first)
      validResults.sort((a, b) => a.distance - b.distance);
    }
    setPlaces(validResults);
  };

  // Handle clicking on a place to show route
  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
  };

  // Handle booking appointment for a clinic
  const handleBookAppointment = (clinicId) => {
    navigate(`/book-appointment/${clinicId}`);
  };

  if (locationError) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Location Required:</strong> {locationError}
        </div>
      </div>
    );
  }

  if (!userLocation) return <p className="text-gray-600">Fetching location...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Search Type Selector */}
      <div className="mb-4">
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="medicine"
              checked={searchType === "medicine"}
              onChange={(e) => setSearchType(e.target.value)}
              className="mr-2"
            />
            <span className="font-medium">Search Medicine</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="clinic"
              checked={searchType === "clinic"}
              onChange={(e) => setSearchType(e.target.value)}
              className="mr-2"
            />
            <span className="font-medium">Search Clinic</span>
          </label>
        </div>
      </div>

      {/* 🔍 Search Box */}
      <div className="flex mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            searchType === "medicine"
              ? "Search medicine (e.g. Oxitocin)"
              : "Search by doctor name or clinic name"
          }
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

      {/* Not Found Message */}
      {notFound && !loading && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <strong>{searchType === "medicine" ? "Medicine Not Available:" : "No Clinics Found:"}</strong> 
          {searchType === "medicine" 
            ? ` No pharmacies found with "${search.trim()}" in stock nearby.`
            : ` No clinics found matching "${search.trim()}".`
          }
        </div>
      )}

      {/* 🗺 Map */}
      <div className="h-96 border border-gray-300 rounded-lg overflow-hidden mb-4">
        <OSMMapView
          userLocation={userLocation}
          pharmacies={places}
          accuracy={accuracy}
          selectedPlace={selectedPlace}
        />
      </div>

      {/* 📋 List */}
      {places.length > 0 && (
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-lg font-semibold mb-2">
            {searchType === "medicine" 
              ? `Pharmacies with ${search.trim()}:` 
              : `Clinics matching "${search.trim()}":`
            }
          </h3>
          <ul className="space-y-2">
            {places.map((p) => (
              <li
                key={p.id}
                className={`p-4 border rounded-lg transition-all ${
                  selectedPlace?.id === p.id
                    ? 'border-blue-500 shadow-lg bg-blue-50'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div 
                  onClick={() => handlePlaceClick(p)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-600">{p.name}</div>
                      {p.placeType === "clinic" && p.doctorName && (
                        <div className="text-sm text-gray-700">Dr. {p.doctorName}</div>
                      )}
                      <div className="text-sm text-gray-500">📍 {p.distance < 1 ? `${(p.distance * 1000).toFixed(0)} m` : `${p.distance.toFixed(2)} km`} away</div>
                    </div>
                    {p.placeType === "pharmacy" && (
                      p.isOpen ? (
                        <span className="text-green-600 font-medium">Open</span>
                      ) : (
                        <span className="text-red-600 font-medium">Closed</span>
                      )
                    )}
                    {p.placeType === "clinic" && p.openTime && p.closeTime && (
                      <span className="text-gray-600 text-sm">
                        🕒 {p.openTime} - {p.closeTime}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">📍 {p.address}</div>
                  {p.placeType === "pharmacy" && (
                    <div className="text-gray-800 mt-1">
                      {p.medicine} - {p.type} - {p.dosage}mg - ₹{p.price}
                    </div>
                  )}
                  {p.placeType === "clinic" && p.fees && (
                    <div className="text-gray-800 mt-1">
                      Consultation Fees: ₹{p.fees}
                    </div>
                  )}
                  {selectedPlace?.id === p.id && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      📍 Route shown on map
                    </div>
                  )}
                </div>
                
                {/* Book Appointment Button for Clinics */}
                {p.placeType === "clinic" && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookAppointment(p.id);
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                    >
                      📅 Book Appointment
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserFindMedicine;
