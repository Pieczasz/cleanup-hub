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
import { useDebounce } from "use-debounce";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapSelectionProps {
  onLocationSelect: (coordinates: Coordinates & { name?: string }) => void;
  onClose: () => void;
  initialPosition?: Coordinates;
  initialLocationName?: string;
}

interface MapEventsProps {
  onMapClick: (coords: Coordinates) => void;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
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
  initialPosition = { lat: 52.237049, lng: 19.017532 },
  initialLocationName = "",
}) => {
  const [position, setPosition] = useState<Coordinates | null>(
    initialPosition ? { ...initialPosition } : null,
  );
  const [locationName, setLocationName] = useState<string>(initialLocationName);
  const mapRef = useRef<LeafletMap | null>(null);
  const [address, setAddress] = useState("");
  const [debouncedAddress] = useDebounce(address, 500);
  const [addressSuggestions, setAddressSuggestions] = useState<
    NominatimSearchResult[]
  >([]);

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

  const handleAddressSearch = async (address: string): Promise<void> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address,
        )}&addressdetails=1&limit=5`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address suggestions");
      }

      const data = (await response.json()) as NominatimSearchResult[];
      setAddressSuggestions(data);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
    }
  };

  const handleSelectAddress = (suggestion: NominatimSearchResult) => {
    const newPosition = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    };
    setPosition(newPosition);
    setLocationName(suggestion.display_name);
    setAddress(suggestion.display_name);
    setAddressSuggestions([]);

    if (mapRef.current) {
      mapRef.current.setView([newPosition.lat, newPosition.lng], 15);
    }
  };

  useEffect(() => {
    if (debouncedAddress) {
      void handleAddressSearch(debouncedAddress);
    } else {
      setAddressSuggestions([]);
    }
  }, [debouncedAddress]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      if (initialPosition) {
        mapRef.current.setView(
          [initialPosition.lat, initialPosition.lng],
          mapRef.current.getZoom(),
        );
      }

      mapRef.current = null;
    }

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
  }, [initialPosition]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for an address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full"
        />
        {addressSuggestions.length > 0 && (
          <div className="absolute z-[99999] mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {addressSuggestions.map((suggestion) => (
              <div
                key={`${suggestion.lat}-${suggestion.lon}`}
                className="cursor-pointer p-2 hover:bg-gray-100"
                onClick={() => handleSelectAddress(suggestion)}
              >
                {suggestion.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
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
