import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import type { Map as LeafletMap, LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapSelectionProps {
  onLocationSelect: (coordinates: Coordinates) => void;
}

interface MapEventsProps {
  onMapClick: (coords: Coordinates) => void;
}

// Custom marker icon setup
const customIcon = L.icon({
  iconUrl: "/locationMarker.svg",
  iconSize: [24, 24],
  iconAnchor: [16, 29],
  popupAnchor: [5, -25],
});

// MapEvents component to handle click events
const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
};

const MapSelection: React.FC<MapSelectionProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Set default position to center of Poland
  const defaultPosition: LatLngExpression = [52.237049, 19.017532];

  const handleMapClick = (coords: Coordinates) => {
    setPosition(coords);
  };

  const handleSave = () => {
    if (position) {
      onLocationSelect(position);
    }
  };

  // Initialize map and handle resize
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }

    // Cleanup function for map instances
    return () => {
      const mapContainers =
        document.getElementsByClassName("leaflet-container");
      Array.from(mapContainers).forEach((container) => {
        const elem = container as HTMLElement & { _leaflet_id?: string };
        if (elem._leaflet_id) {
          elem._leaflet_id = undefined;
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[400px] w-full rounded-lg border border-gray-200">
        <MapContainer
          center={defaultPosition}
          zoom={6}
          className="h-full w-full rounded-lg"
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png"
          />
          <MapEvents onMapClick={handleMapClick} />
          {position && (
            <Marker position={[position.lat, position.lng]} icon={customIcon}>
              <Popup>Selected location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!position}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          type="button"
        >
          Save Location
        </button>
      </div>
    </div>
  );
};

export default MapSelection;
