// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Functions
import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDebounce } from "use-debounce";

// Types
import type { Map as LeafletMap } from "leaflet";

// Interfaces
interface Coordinates {
  lat: number;
  lng: number;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface MapSelectionProps {
  onLocationSelect: (
    coordinates: Coordinates & { name?: string; address?: string },
  ) => void;
  onClose: () => void;
  initialLocation?: { coordinates: Coordinates; name?: string };
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
  initialLocation,
}) => {
  const [position, setPosition] = useState<Coordinates | null>(
    initialLocation?.coordinates ?? null,
  );
  const [locationName, setLocationName] = useState<string>(
    initialLocation?.name ?? "",
  );
  const mapRef = useRef<LeafletMap | null>(null);
  const [address, setAddress] = useState("");
  const [debouncedAddress] = useDebounce(address, 500);
  const [addressSuggestions, setAddressSuggestions] = useState<
    NominatimSearchResult[]
  >([]);

  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [zoom, setZoom] = useState(6);
  const defaultCenter: Coordinates = { lat: 52.237049, lng: 19.017532 };
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                resolve(pos);
              },
              (err) => {
                console.error("Geolocation error:", err);
                reject(new Error(err.message));
              },
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              },
            );
          },
        );

        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(newLocation);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error in getUserLocation:", errorMessage);
      }
    };

    void getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
      setZoom(10);

      if (mapRef.current) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 12);
      }
    }
  }, [userLocation]);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const handleMapClick = async (coords: Coordinates) => {
    setPosition(coords);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
      );
      if (!response.ok) throw new Error("Failed to fetch address");
      const data = (await response.json()) as NominatimReverseResult;
      setAddress(data.display_name || "");
      if (!locationName) {
        setLocationName(data.display_name?.split(",")[0] ?? "Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleSave = () => {
    if (position) {
      const locationToSave = {
        coordinates: position,
        name: locationName,
        address: address,
      };

      localStorage.setItem("savedLocation", JSON.stringify(locationToSave));

      onLocationSelect({
        ...position,
        name: locationName,
        address: address,
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
    setAddress(suggestion.display_name || "");
    if (!locationName) {
      setLocationName(
        suggestion.display_name.split(",")[0] ?? "Unknown Location",
      );
    }
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
  }, []);

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
          center={center}
          zoom={zoom}
          className="h-full w-full rounded-lg"
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=${accessToken}`}
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
        placeholder="Enter location name (e.g., Local Park, Community Center)"
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
