"use client";

//Map component from library
import { GoogleMap } from "@react-google-maps/api";
import { useEffect, useState } from "react";

//Map's styling
const defaultMapContainerStyle = {
  width: "100%",
  height: "70vh",
  borderRadius: "25px 0px 0px 25px",
};

//Fallback to Poland's coordinates
const fallbackCenter = {
  lat: 51.919438, // Latitude of Poland
  lng: 19.145136, // Longitude of Poland
};

//Default zoom levels
const fallbackZoom = 5; // Default for fallback (Poland)
const userLocationZoom = 10; // Default if user's location is available

//Map options
const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: "auto",
  mapTypeId: "roadmap",
};

const MapComponent = () => {
  const [mapCenter, setMapCenter] = useState(fallbackCenter); // Default to Poland
  const [mapZoom, setMapZoom] = useState(fallbackZoom); // Default zoom

  useEffect(() => {
    // Attempt to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapZoom(userLocationZoom); // Increase zoom if user's location is available
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Keep fallbackCenter and fallbackZoom if location access is denied
        },
      );
    }
  }, []);

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={defaultMapOptions}
      ></GoogleMap>
    </div>
  );
};

export { MapComponent };
