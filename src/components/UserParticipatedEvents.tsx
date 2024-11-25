import { api } from "@/trpc/react";
import { EventCard } from "./EventCard";

export function UserParticipatedEvents({ userId }: { userId?: string }) {
  if (!userId) {
    return (
      <div className="text-center text-gray-500">
        Please log in to view your participated events.
      </div>
    );
  }

  const {
    data: events,
    isLoading,
    error,
  } = api.post.getUserParticipatedEvents.useQuery(
    { userId },
    { enabled: true },
  );

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading events: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-12 flex justify-center py-8 sm:mt-0">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-500">
        You are not participating in any upcoming events.
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-0 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
