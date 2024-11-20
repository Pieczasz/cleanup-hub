import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = {
  lat: number;
  lng: number;
};

const OpenStreetMap: React.FC = () => {
  const [center] = useState<Coordinates>({ lat: 52.237049, lng: 19.017532 });
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, []);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={5}
        ref={mapRef as React.RefObject<L.Map>}
        className="map-container"
        key="main-map" // Ensures the map container is uniquely identified
      >
        <TileLayer
          attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png"
        />
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;
