"use client";

// Components
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Functions
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

import { useToast } from "@/hooks/use-toast";

// Types
import type { Event } from "@/server/db/schema";
import { Button } from "@/components/ui/button";

interface PostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const EventPage = ({ params }: PostPageProps) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [slug, setSlug] = useState<string | null>(null);
  const [isSlugResolved, setIsSlugResolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Unwrap the params Promise and set the slug. This is because getting slug directly without promise will not work in future versions of Next.js
  useEffect(() => {
    params
      .then((resolvedParams) => {
        setSlug(resolvedParams.slug?.join(""));
        setIsSlugResolved(true); // Mark slug as resolved
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  // Always call the useQuery hook, but disable it if the slug is not ready
  const { data, isLoading, error } = api.post.getEventById.useQuery(
    { id: slug ?? "" }, // Provide a fallback to prevent errors
    {
      enabled: isSlugResolved && !!slug, // Execute only after slug is resolved
    },
  );

  // Ensure we handle array data safely
  const event = Array.isArray(data) ? (data[0] as Event) : data;

  const { data: creator } = api.post.getUserById.useQuery(
    { id: event?.creatorId ?? "" },
    { enabled: !!event?.creatorId },
  );

  const utils = api.useContext();
  const { mutate: joinEvent } = api.post.joinEvent.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined the event!",
      });
      void utils.post.getEventById.invalidate({ id: slug ?? "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: leaveEvent } = api.post.leaveEvent.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully left the event!",
      });
      void utils.post.getEventById.invalidate({ id: slug ?? "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteEvent } = api.post.deleteEvent.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event has been deleted",
      });
      // Redirect to home page after deletion
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isParticipant = event?.participantIds.includes(session?.user.id ?? "");

  // Redirect to 404 if no event is found and not loading
  if (isSlugResolved && !isLoading && !event) {
    notFound();
  }

  // Add countdown timer
  useEffect(() => {
    if (!event?.date) return;

    const timer = setInterval(() => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Event has ended");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [event?.date]);

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank",
    );
  };

  const handleEventParticipation = () => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please sign in to join events",
        variant: "destructive",
      });
      return;
    }

    if (event?.creatorId === session.user.id) {
      setShowDeleteDialog(true);
      return;
    }

    if (isParticipant) {
      leaveEvent({ eventId: event!.id });
    } else {
      joinEvent({ eventId: event!.id });
    }
  };

  return (
    <PageLayout>
      <MaxWidthWrapper>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <p className="text-center text-xl font-semibold text-red-500">
            Error loading event details
          </p>
        ) : (
          event && (
            <>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      As the event creator, leaving will delete the event for
                      all participants. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteEvent({ eventId: event.id })}
                    >
                      Delete Event
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="w-full py-12">
                <div className="rounded-lg bg-white px-4 sm:px-6 lg:px-8">
                  <div className="mb-8 border-b pb-6">
                    <div className="flex flex-col items-start justify-between lg:flex-row lg:items-center">
                      <h2 className="text-3xl font-bold text-gray-800 sm:text-5xl">
                        {event.name}
                      </h2>
                      <div className="mt-4 flex items-center gap-2 sm:mt-0">
                        <Image
                          src={creator?.image ?? "/defaultAvatar.jpg"}
                          width={40}
                          height={40}
                          alt="Creator Avatar"
                          className="rounded-full"
                        />
                        <span className="text-lg font-medium">
                          Hosted by {creator?.name ?? "Unknown"}
                        </span>
                      </div>
                    </div>
                    <span className="mt-3 inline-block rounded-full bg-blue-100 px-4 py-2 text-base text-blue-800">
                      {event.type === "treePlanting"
                        ? "Tree Planting"
                        : event.type[0]?.toLocaleUpperCase() +
                          event.type.slice(1)}
                    </span>
                  </div>

                  <div className="mb-8 grid gap-8 md:grid-cols-2">
                    <div className="flex flex-col gap-y-8">
                      <div>
                        <h3 className="text-2xl font-semibold">
                          Event Details
                        </h3>
                        <p className="text-lg text-gray-600">
                          {event.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-2xl font-semibold">Participants</h4>
                        <p className="text-lg text-gray-600">
                          {event.participantsCount} / {event.maxParticipants}{" "}
                          joined
                        </p>
                        <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
                          <div
                            className="h-3 rounded-full bg-blue-500"
                            style={{
                              width: `${(event.participantsCount / event.maxParticipants) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <Button
                        onClick={handleEventParticipation}
                        className={`hidden max-w-full rounded-3xl py-5 text-lg md:max-w-[10rem] lg:flex ${
                          event.creatorId === session?.user.id
                            ? "bg-red-600 hover:bg-red-600/90"
                            : isParticipant
                              ? "bg-red-600 hover:bg-red-600/90"
                              : "bg-blue-600 hover:bg-blue-600/90"
                        }`}
                        disabled={!session}
                      >
                        {event.creatorId === session?.user.id
                          ? "Delete Event"
                          : isParticipant
                            ? "Leave Event"
                            : "Join Event"}
                      </Button>
                    </div>

                    <div className="flex flex-col gap-y-8">
                      <div>
                        <h4 className="text-2xl font-semibold">Date & Time</h4>
                        <p className="text-lg text-gray-600">
                          {new Date(event.date).toLocaleString()}
                        </p>
                        <p className="mt-2 text-base font-medium text-blue-600">
                          Time until event: {timeLeft}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-2xl font-semibold">Location</h4>
                        <p className="text-lg text-gray-600">
                          {event.location.address}
                        </p>
                        {event.location.name && (
                          <p className="text-lg text-gray-600">
                            {event.location.name}
                          </p>
                        )}
                        <Button
                          onClick={() =>
                            openInGoogleMaps(
                              event.location.coordinates.lat,
                              event.location.coordinates.lng,
                            )
                          }
                          className="mt-3 max-w-full rounded-3xl bg-blue-600 py-5 text-lg text-white hover:bg-blue-600/90"
                        >
                          Open in Google Maps
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex w-full items-center justify-center lg:hidden">
                    <Button
                      onClick={handleEventParticipation}
                      className={`max-w-full rounded-3xl py-5 text-lg ${
                        event.creatorId === session?.user.id
                          ? "bg-red-600 hover:bg-red-600/90"
                          : isParticipant
                            ? "bg-red-600 hover:bg-red-600/90"
                            : "bg-blue-600 hover:bg-blue-600/90"
                      }`}
                      disabled={!session}
                    >
                      {event.creatorId === session?.user.id
                        ? "Delete Event"
                        : isParticipant
                          ? "Leave Event"
                          : "Join Event"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default EventPage;
