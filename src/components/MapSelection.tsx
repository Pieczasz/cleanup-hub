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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapSelectionProps {
  onLocationSelect: (coordinates: Coordinates & { name?: string }) => void;
  onClose: () => void;
}

interface MapEventsProps {
  onMapClick: (coords: Coordinates) => void;
}

const customIcon = L.icon({
  iconUrl: "/locationMarker.svg",
  iconSize: [24, 24],
  iconAnchor: [16, 29],
  popupAnchor: [5, -25],
});

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
};

const MapSelection: React.FC<MapSelectionProps> = ({
  onLocationSelect,
  onClose,
}) => {
  const [position, setPosition] = useState<Coordinates>({
    lat: 52.237049,
    lng: 19.017532,
  });
  const [locationName, setLocationName] = useState<string>("");

  const defaultPosition: LatLngExpression = [52.237049, 19.017532];

  const handleMapClick = (coords: Coordinates) => {
    setPosition(coords);
  };

  const handleSave = () => {
    if (position && locationName) {
      onLocationSelect({
        ...position,
        name: locationName,
      });
    }
  };
  const mapRef = useRef<LeafletMap | null>(null);

  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const mapContainers =
        document.getElementsByClassName("leaflet-container");
      Array.from(mapContainers).forEach((container) => {
        const elem = container as HTMLElement & { _leaflet_id?: string };
        if (elem._leaflet_id) {
          elem._leaflet_id = undefined;
        }
      });
    };
  });

  return (
    <div className="flex flex-col gap-4" id="map-selection">
      <div className="h-[400px] w-full rounded-lg border border-gray-200">
        <MapContainer
          key="map-selection"
          id="map-selection"
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
      <Input
        type="text"
        placeholder="Enter location name (e.g., Local Park Gate, Community Center)"
        value={locationName}
        onChange={(e) => setLocationName(e.target.value)}
        className="w-full"
      />
      <div className="flex flex-row items-center justify-end gap-x-4">
        <Button
          onClick={onClose}
          variant="outline"
          className="rounded-3xl py-6 text-base"
          type="button"
        >
          Close Map
        </Button>
        <Button
          onClick={handleSave}
          disabled={!position || !locationName}
          className="rounded-3xl py-6 text-base text-white"
          type="button"
        >
          Save Location
        </Button>
      </div>
    </div>
  );
};

export default MapSelection;
