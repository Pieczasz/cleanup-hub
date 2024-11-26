import { type Event } from "@/server/db/schema";
import { eventTypeColors, type EventType } from "@/lib/constants";
import Link from "next/link";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {event.name}
              </h3>
              {event.isFinished && (
                <p className="mt-1 text-sm text-green-800">
                  This event has been already finished
                </p>
              )}
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-base font-medium ${
                  eventTypeColors[event.type as EventType]
                }`}
              >
                {event.type === "treePlanting"
                  ? "Tree Planting"
                  : event.type[0]?.toLocaleUpperCase() + event.type.slice(1)}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center text-base text-gray-500">
              <CalendarIcon className="mr-2 h-5 w-5" />
              {event.date}
            </div>
            <div className="flex items-center text-base text-gray-500">
              <MapPinIcon className="mr-2 h-5 w-5" />
              {event.location.address}
            </div>
            <div className="flex items-center text-base text-gray-500">
              <UsersIcon className="mr-2 h-5 w-5" />
              {event.participantsCount} / {event.maxParticipants} participants
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-sm text-gray-600">
            {event.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
