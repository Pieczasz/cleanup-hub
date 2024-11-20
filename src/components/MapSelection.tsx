import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import type { Map as LeafletMap, DivIcon, LatLngExpression } from "leaflet";
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
const customIcon: DivIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <svg viewBox="0 0 512 512" width="50" height="50">
      <g transform="translate(0,512) scale(0.1,-0.1)" fill="#000000">
        <path d="M2425 4890 c-579 -62 -1066 -441 -1260 -980 -65 -181 -77 -262 -82 -553 -5 -287 1 -362 42 -522 32 -123 84 -248 160 -385 138 -251 954 -1759 985 -1820 41 -82 113 -152 186 -180 156 -58 301 12 395 192 23 46 263 479 532 963 270 484 508 916 529 960 48 99 102 271 124 390 35 201 28 579 -16 773 -114 513 -487 926 -985 1091 -192 63 -426 91 -610 71z m298 -1046 c138 -31 291 -119 385 -222 104 -115 192 -303 192 -414 0 -99 -75 -272 -165 -381 -90 -108 -228 -199 -370 -243 -86 -27 -324 -27 -410 0 -142 44 -280 135 -370 243 -90 109 -165 282 -165 381 0 111 88 299 192 414 92 100 236 186 372 219 92 23 245 24 339 3z"/>
      </g>
    </svg>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 50],
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
