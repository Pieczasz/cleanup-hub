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
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [zoom, setZoom] = useState(6);
  const defaultCenter: Coordinates = { lat: 52.237049, lng: 19.017532 };
  const [center, setCenter] = useState(defaultCenter);
  const mapRef = useRef<LeafletMap | null>(null);

  // Separate useEffect for initial location request
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        console.log("Requesting user location...");

        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                console.log("Got position:", pos);
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

        console.log("Setting new location:", newLocation);
        setUserLocation(newLocation);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error in getUserLocation:", errorMessage);
      }
    };

    void getUserLocation();
  }, []);

  // New useEffect to handle map updates when user location changes
  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
      setZoom(10);

      // If the map reference exists, we can also programmatically update it
      if (mapRef.current) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 12);
      }
    }
  }, [userLocation]);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const { data: events } = api.post.getEventsFromMostPopular.useQuery();
  const { data: creator } = api.post.getUserById.useQuery(
    {
      id: events?.[0]?.creatorId ?? "",
    },
    { enabled: !!events?.[0]?.creatorId },
  );

  // Handle map cleanup
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
        zoom={zoom}
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
