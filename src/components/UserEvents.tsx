"use client";

// Components
import { EventCard } from "./EventCard";
import Link from "next/link";

// tRPC
import { api } from "@/trpc/react";

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
      <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-0 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-0 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
