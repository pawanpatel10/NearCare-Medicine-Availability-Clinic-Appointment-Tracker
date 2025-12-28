import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const OSMMapView = ({ userLocation, pharmacies, accuracy }) => {
  return (
    <MapContainer
      center={userLocation}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

      {/* Pharmacies */}
      {pharmacies.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lon]}>
          <Popup>
  <b>{p.name}</b><br />
  Medicine: {p.medicine}<br />
  Dosage: {p.dosage} mg<br />
  Type: {p.type}<br />
  Price: ₹{p.price}
</Popup>

        </Marker>
      ))}
    </MapContainer>
  );
};

export default OSMMapView;
