"use client";

// Components
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

// tRPC
import { api } from "@/trpc/react";

// Functions
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const LoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center gap-x-5 gap-y-4 lg:flex-row lg:gap-y-0">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="mb-7 w-[300px] shadow-md lg:w-[340px]">
        <CardHeader className="flex items-center justify-center text-center">
          <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200"></div>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4">
          <div className="flex flex-row items-center">
            <div className="mr-3 h-12 w-12 animate-pulse rounded-full bg-gray-200"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="flex flex-row gap-x-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-row gap-x-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-row gap-x-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <div className="h-14 w-48 animate-pulse rounded-3xl bg-gray-200"></div>
        </CardFooter>
      </Card>
    ))}
  </div>
);

const MostPopularEvents = () => {
  const router = useRouter();
  const { data: events, isLoading: eventsLoading } =
    api.post.getMostPopularEvents.useQuery({
      limit: 3,
      offset: 0,
    });

  // Single query for all users
  const { data: usersData, isLoading: usersLoading } =
    api.post.getUsersByIds.useQuery(
      { userIds: events?.map((event) => event.creatorId) ?? [] },
      { enabled: !!events },
    );

  if (eventsLoading || usersLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center">
        <h2 className="mb-16 text-center text-4xl font-bold">
          Most Popular <br />
          Clean-Up Events
        </h2>
        <LoadingSkeleton />
      </div>
    );
  }

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <h2 className="mb-16 text-center text-4xl font-bold">
        Most Popular <br />
        Clean-Up Events
      </h2>
      <div className="flex flex-col items-center justify-center gap-x-5 gap-y-4 lg:flex-row lg:gap-y-0">
        {events?.map((event) => {
          const creator = usersData?.find(
            (user) => user.id === event.creatorId,
          );
          return (
            <Card
              key={event.id}
              className="mb-7 w-[300px] shadow-md lg:w-[340px]"
            >
              <CardHeader className="flex items-center justify-center text-center">
                <h4 className="text-center text-2xl font-semibold">
                  {event.name}
                </h4>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-4">
                <div className="flex flex-row items-center">
                  <Avatar className="mr-3 h-12 w-12">
                    <AvatarImage src={creator?.image ?? ""} />
                    <AvatarFallback>{creator?.name?.[0] ?? "O"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-base font-semibold">Organizer</p>
                    <p className="text-base">{creator?.name ?? "Unknown"}</p>
                  </div>
                </div>
                <div className="flex flex-row gap-x-2">
                  <p>Participants</p>
                  <p className="font-semibold">
                    {event.participantsCount}/{event.maxParticipants}
                  </p>
                </div>
                <div className="flex flex-row gap-x-2">
                  <p>Location</p>
                  <a className="font-semibold">
                    {truncateText(event.location.address, 20)}
                  </a>
                </div>
                <div className="flex flex-row gap-x-2">
                  <p>Date</p>
                  <p className="font-semibold">
                    {format(new Date(event.date), "MMM dd HH:mm")}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-center">
                <Button
                  className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  Join a Clean-Up
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MostPopularEvents;
