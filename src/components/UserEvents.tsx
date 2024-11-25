"use client";
import { EventCard } from "./EventCard";
import Link from "next/link";
import { api } from "@/trpc/react";

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
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="mt-12 py-8 text-center sm:mt-0">
        <p className="mb-4 text-gray-500">
          You haven&apos;t created any events yet.
        </p>
        <Link href="/events/create" className="text-primary hover:underline">
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
