import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPlace {
  id: string;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

interface WorldMapProps {
  places: MapPlace[];
}

function FitToPlaces({ places }: { places: MapPlace[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 10);
      return;
    }
    const bounds = places.map((p) => [p.latitude, p.longitude] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
  }, [places, map]);

  return null;
}

export function WorldMap({ places }: WorldMapProps) {
  const navigate = useNavigate();

  return (
    <div className="world-map">
      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        worldCopyJump
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitToPlaces places={places} />
        {places.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: "#ec6fa8",
              fillOpacity: 0.95,
            }}
            eventHandlers={{
              click: () => navigate(`/places/${p.id}`),
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {p.name}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
