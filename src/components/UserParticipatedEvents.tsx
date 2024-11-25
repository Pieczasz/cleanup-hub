import { api } from "@/trpc/react";
import { EventCard } from "./EventCard";

const EventCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center">
          <div className="mr-2 h-5 w-5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex items-center">
          <div className="mr-2 h-5 w-5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex items-center">
          <div className="mr-2 h-5 w-5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-4 h-12 w-full animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

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
      <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-0 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
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
      {events?.map((event) => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
