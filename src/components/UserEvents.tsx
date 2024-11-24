"use client";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

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
      <div className="py-8 text-center">
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
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <Card
          key={event.id}
          className="overflow-hidden transition-shadow hover:shadow-md"
        >
          <Link href={`/events/${event.id}`}>
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-xl">{event.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  {event.date}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  {event.location.name || event.location.address}
                </div>
                <div className="flex items-center text-gray-600">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  {event.participantsCount} / {event.maxParticipants}{" "}
                  participants
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
