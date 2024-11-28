"use client";

// Components
import { EventCard } from "./EventCard";
import Link from "next/link";

// tRPC
import { api } from "@/trpc/react";

const EventCardSkeleton = () => (
  <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div>
      <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
    </div>
    <div className="flex items-center gap-4">
      <div className="animate-pulse rounded-full bg-gray-200 px-3 py-1 text-sm"></div>
      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
);

// Interfaces
interface UserEventsProps {
  userId?: string;
}

export function UserEvents({ userId }: UserEventsProps) {
  const { data: events, isLoading } = api.post.getUserEvents.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId },
  );

  if (isLoading) {
    return (
      <div className="w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="mt-12 py-8 text-center sm:mt-0">
        <p className="mb-4 text-gray-500">
          You haven&apos;t created any events yet.
        </p>
        <Link href="/events" className="text-primary hover:underline">
          Create your first event
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

interface PastUserEventsProps {
  userId?: string;
}

export function PastUserEvents({ userId }: PastUserEventsProps) {
  const { data: eventHistory, isLoading } =
    api.post.getUserEventHistory.useQuery(
      { userId: userId ?? "" },
      { enabled: !!userId },
    );

  if (isLoading) {
    return (
      <div className="mt-12 flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!eventHistory?.length) {
    return (
      <div className="mt-12 py-8 text-center sm:mt-0">
        <p className="text-gray-500">No past events found.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-0">
      {eventHistory.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
        >
          <div>
            <h3 className="font-semibold">{event.eventName}</h3>
            <p className="text-sm text-gray-600">
              {event.date
                ? new Date(event.date).toLocaleDateString()
                : "Date not available"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                event.attended
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {event.attended ? "Attended" : "Absent"}
            </span>
            {event.attended && (
              <span className="text-sm text-gray-600">
                Rating: {event.rating}/5
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
