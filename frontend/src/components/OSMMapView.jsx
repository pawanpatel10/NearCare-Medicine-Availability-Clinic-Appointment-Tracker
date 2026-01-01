import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Component to handle map updates
const MapUpdater = ({ userLocation, pharmacies, selectedPlace }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace) {
      // Show route to selected place
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(selectedPlace.lat, selectedPlace.lon)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 4, opacity: 0.7 }]
        },
        createMarker: () => null, // Don't create default markers
      }).addTo(map);

      // Fit bounds to show route
      const bounds = L.latLngBounds([
        [userLocation[0], userLocation[1]],
        [selectedPlace.lat, selectedPlace.lon]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      return () => {
        map.removeControl(routingControl);
      };
    } else if (pharmacies.length > 0) {
      // Zoom out to show all pharmacies
      const bounds = L.latLngBounds([
        [userLocation[0], userLocation[1]],
        ...pharmacies.map(p => [p.lat, p.lon])
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Default zoom to user location
      map.setView(userLocation, 15);
    }
  }, [map, userLocation, pharmacies, selectedPlace]);

  return null;
};

const OSMMapView = ({ userLocation, pharmacies, accuracy, selectedPlace }) => {
  return (
    <MapContainer
      center={userLocation}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater 
        userLocation={userLocation} 
        pharmacies={pharmacies} 
        selectedPlace={selectedPlace}
      />

      {/* User */}
      <Marker position={userLocation}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Accuracy Circle */}
      {accuracy && (
        <Circle
          center={userLocation}
          radius={accuracy}
          pathOptions={{ color: "blue" }}
        />
      )}

      {/* Pharmacies/Clinics */}
      {pharmacies.map((p) => (
        <Marker 
          key={p.id} 
          position={[p.lat, p.lon]}
        >
          <Popup>
            <b>{p.name}</b><br />
            {p.placeType === "pharmacy" && (
              <>
                Medicine: {p.medicine}<br />
                Dosage: {p.dosage} mg<br />
                Type: {p.type}<br />
                Price: ₹{p.price}<br />
              </>
            )}
            {p.placeType === "clinic" && (
              <>
                {p.doctorName && <><b>Dr. {p.doctorName}</b><br /></>}
                {p.fees && <>Fees: ₹{p.fees}<br /></>}
                {p.openTime && p.closeTime && <>Hours: {p.openTime} - {p.closeTime}<br /></>}
              </>
            )}
            Distance: {p.distance < 1 ? `${(p.distance * 1000).toFixed(0)} m` : `${p.distance.toFixed(2)} km`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OSMMapView;
