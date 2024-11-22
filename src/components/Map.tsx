import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { api } from "@/trpc/react";

const customIcon = L.icon({
  iconUrl: "/locationMarker.svg",
  iconSize: [24, 24],
  iconAnchor: [16, 29],
  popupAnchor: [5, -25],
});
type Coordinates = {
  lat: number;
  lng: number;
};

const OpenStreetMap: React.FC = () => {
  const [center] = useState<Coordinates>({ lat: 52.237049, lng: 19.017532 });
  const mapRef = useRef<LeafletMap | null>(null);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const {
    data: events,
    isLoading,
    error,
  } = api.post.getEventsFromMostPopular.useQuery();

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
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={6}
        className="map-container"
        key="main-map"
        id="main-map"
        ref={mapRef}
      >
        <TileLayer
          attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={`https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=${accessToken}`}
        />

        {events?.map((event) => (
          <Marker
            key={event.id}
            position={[
              event.location.coordinates.lat,
              event.location.coordinates.lng,
            ]}
            icon={customIcon}
          >
            <Popup>
              <h3 className="font-semibold">{event.name}</h3>
              <p>Location: {event.location.address}</p>
              <p>Participants: {event.participantsCount}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;
