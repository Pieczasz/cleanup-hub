import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { api } from "@/trpc/react";
import Link from "next/link";
import Image from "next/image";

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

  const { data: events } = api.post.getEventsFromMostPopular.useQuery();

  const { data: creator } = api.post.getUserById.useQuery(
    {
      id: events?.[0]?.creatorId ?? "", // Validate creatorId
    },
    { enabled: !!events?.[0]?.creatorId }, // Only enable if creatorId is valid
  );

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
              <div className="rounded-lg p-4">
                <h3 className="mb-2 text-xl font-semibold text-gray-800">
                  {event.name}
                </h3>
                <div className="mb-2 flex items-center">
                  <Image
                    src={creator?.image ?? "/defaultAvatar.jpg"}
                    width={32}
                    height={32}
                    alt="Creator Avatar"
                    className="mr-2 h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {creator?.name ?? "Unknown"}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600">
                  Participants: {event.participantsCount}/
                  {event.maxParticipants}
                </p>
                <p className="mb-2 text-sm text-gray-600">
                  Type:{" "}
                  {event.type[0]?.toLocaleUpperCase() + event.type.slice(1)}
                </p>
                <p>Date: {event.date}</p>
                <Link
                  href={`/events/${event.id}`}
                  className="text-base text-blue-500"
                >
                  Read More About This Event!
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;
