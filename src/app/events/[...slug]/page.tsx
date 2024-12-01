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
import { AttendanceDialog } from "@/components/AttendanceDialog";
import { CreateEventForm } from "@/components/CreateEventForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DonateButton } from "@/components/DonateButton";
import { DonationsList } from "@/components/DonationsList"; // Add import
// Functions
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Types
import type { Event } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { eventTypeColors, type EventType } from "@/lib/constants";

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
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [isEventOngoing, setIsEventOngoing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const router = useRouter();
  // Unwrap the params Promise and set the slug. This is because getting slug directly without promise will not work in future versions of Next.js
  useEffect(() => {
    params
      .then((resolvedParams) => {
        if (Array.isArray(resolvedParams.slug)) {
          const eventId = resolvedParams.slug.join("/");
          setSlug(eventId);
        } else {
          setSlug(resolvedParams.slug);
        }
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

  // Add this query to get participant details
  const { data: participants } = api.post.getEventParticipants.useQuery(
    { eventId: event?.id ?? "" },
    {
      enabled: !!event?.id,
      select: (
        data: {
          id: string;
          name: string | null | undefined;
          image: string | null | undefined;
        }[],
      ) =>
        data.map((participant) => ({
          id: participant.id,
          name: participant.name ?? null,
          image: participant.image ?? null,
        })),
    },
  );

  // Add near the top with other queries
  const { data: eventAttendance } = api.post.getEventAttendance.useQuery(
    { eventId: event?.id ?? "" },
    { enabled: !!event?.id && event?.isFinished },
  );

  // Add this query with other queries
  const { data: donations } = api.post.getEventDonations.useQuery(
    { eventId: event?.id ?? "" },
    { enabled: !!event?.id }
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

  const { mutate: submitAttendance } = api.post.submitAttendance.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance submitted successfully",
      });
      setShowAttendanceDialog(false);
      // Invalidate queries to refresh data
      void utils.post.getEventById.invalidate({ id: event?.id ?? "" });
      void utils.post.getUserEventHistory.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  const handleAttendanceSubmit = (
    attendance: { userId: string; attended: boolean; rating: number }[],
  ) => {
    if (!event) return;
    setIsSubmittingAttendance(true);
    submitAttendance({
      eventId: event.id,
      attendance,
    });
  };

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
        setTimeLeft("Event is ongoing");
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

  // Add this effect to check if event is ongoing for 10+ minutes
  useEffect(() => {
    if (!event?.date) return;

    const checkEventStatus = () => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const diffInMinutes = (now.getTime() - eventDate.getTime()) / (1000 * 60);
      setIsEventOngoing(diffInMinutes >= 10);
    };

    const timer = setInterval(checkEventStatus, 60000); // Check every minute
    checkEventStatus(); // Initial check

    return () => clearInterval(timer);
  }, [event?.date]);

  const openInGoogleMaps = (coordinates: { lat: number; lng: number }) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`,
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

  // Update the condition for showing the finish button
  const showFinishButton =
    isEventOngoing &&
    event?.creatorId === session?.user.id &&
    !event?.isFinished;

  // Add a function to check if actions are disabled
  const isActionsDisabled = (event: Event | undefined) => {
    return event?.isFinished ?? false;
  };

  // Add this function before the return statement
  const getEventStatusText = () => {
    if (event?.isFinished) {
      return "This event has already been finished";
    }
    if (isEventOngoing) {
      return "The event is ongoing";
    }
    return `Time until event: ${timeLeft}`;
  };

  return (
    <PageLayout>
      <MaxWidthWrapper>
        {isLoading ? (
          <div className="w-full py-12">
            <div className="rounded-lg bg-white px-4 sm:px-6 lg:px-8">
              {/* Header skeleton */}
              <div className="mb-8 border-b pb-6">
                <div className="flex flex-col items-start justify-between lg:flex-row lg:items-center">
                  <div className="h-12 w-3/4 animate-pulse rounded-lg bg-gray-200 sm:h-16"></div>
                  <div className="mt-4 flex items-center gap-2 sm:mt-0">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200"></div>
                  </div>
                </div>
                <div className="mt-4 h-6 w-24 animate-pulse rounded-full bg-gray-200"></div>
              </div>

              {/* Content skeleton */}
              <div className="mb-8 grid gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-y-8">
                  <div className="space-y-2">
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>

                  <div>
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-gray-200"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-8">
                  <div>
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  <div>
                    <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200"></div>
                    <div className="mt-3 h-10 w-48 animate-pulse rounded-3xl bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
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

              <div className="w-full py-6 sm:py-12">
                <div className="rounded-lg bg-white px-4 sm:px-6 lg:px-8">
                  <div className="mb-6 border-b pb-4 sm:mb-8 sm:pb-6">
                    <div className="flex flex-col items-start gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl lg:text-5xl">
                        {event.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Image
                          src={creator?.image ?? "/defaultAvatar.jpg"}
                          width={40}
                          height={40}
                          alt="Creator Avatar"
                          className="h-8 w-8 rounded-full hover:cursor-pointer sm:h-10 sm:w-10"
                          onClick={() => {
                            if (session?.user.id === creator?.id) {
                              router.push("/profile");
                            } else {
                              router.push(`/profile/${creator?.id}`);
                            }
                          }}
                        />
                        <span
                          className="text-base font-medium hover:cursor-pointer sm:text-lg"
                          onClick={() => {
                            if (session?.user.id === creator?.id) {
                              router.push("/profile");
                            } else {
                              router.push(`/profile/${creator?.id}`);
                            }
                          }}
                        >
                          Hosted by {creator?.name ?? "Unknown"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-1 text-sm font-medium sm:text-base ${
                        eventTypeColors[event.type as EventType]
                      }`}
                    >
                      {event.type === "treePlanting"
                        ? "Tree Planting"
                        : event.type[0]?.toLocaleUpperCase() +
                          event.type.slice(1)}
                    </span>
                  </div>

                  <div className="mb-6 grid gap-6 sm:mb-8 sm:gap-8 md:grid-cols-2">
                    <div className="flex flex-col gap-y-6 sm:gap-y-8">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold sm:text-2xl">
                          Event Details
                        </h3>
                        <div>
                          <p className="max-w-[33ch] whitespace-pre-line break-words text-base text-gray-600 sm:text-lg lg:max-w-prose">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold sm:text-2xl">
                          Participants
                        </h4>
                        <p className="text-base text-gray-600 sm:text-lg">
                          {event.participantsCount} / {event.maxParticipants}{" "}
                          joined
                        </p>
                        <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
                          <div
                            className="h-3 rounded-full bg-[#6AA553]"
                            style={{
                              width: `${(event.participantsCount / event.maxParticipants) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {event.isFinished && (
                          <Button
                            onClick={() => setShowAttendanceDialog(true)}
                            className="w-full rounded-3xl py-4 text-base sm:w-auto sm:py-5 sm:text-lg"
                          >
                            Show Attendance
                          </Button>
                        )}
                        {showFinishButton && (
                          <Button
                            onClick={() => setShowAttendanceDialog(true)}
                            className="w-full rounded-3xl py-4 text-base sm:w-auto sm:py-5 sm:text-lg"
                          >
                            Finish Event
                          </Button>
                        )}
                        {event.creatorId === session?.user.id ? (
                          <>
                            <Button
                              onClick={() => setShowEditForm(true)}
                              className="w-full rounded-3xl bg-yellow-600 py-4 text-base hover:bg-yellow-600/90 sm:w-auto sm:py-5 sm:text-lg"
                              disabled={isActionsDisabled(event)}
                            >
                              Edit Event
                            </Button>
                            <Button
                              onClick={handleEventParticipation}
                              className="w-full rounded-3xl bg-red-600 py-4 text-base hover:bg-red-600/90 sm:w-auto sm:py-5 sm:text-lg"
                              disabled={isActionsDisabled(event)}
                            >
                              Delete Event
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Add the Donate button - place it before the Join/Leave button */}
                            <DonateButton
                              event={event}
                              disabled={isActionsDisabled(event)}
                              className="w-full rounded-3xl bg-purple-600 py-4 text-base hover:bg-purple-600/90 sm:w-auto sm:py-5 sm:text-lg"
                            />
                            <Button
                              onClick={handleEventParticipation}
                              className={`w-full rounded-3xl py-4 text-base sm:w-auto sm:py-5 sm:text-lg ${
                                isParticipant
                                  ? "bg-red-600 hover:bg-red-600/90"
                                  : "bg-[#6AA553] hover:bg-[#6AA553]"
                              }`}
                              disabled={!session || isActionsDisabled(event)}
                            >
                              {isParticipant ? "Leave Event" : "Join Event"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-y-6 sm:gap-y-8">
                      <div>
                        <h4 className="text-xl font-semibold sm:text-2xl">
                          Date & Time
                        </h4>
                        <p className="text-base text-gray-600 sm:text-lg">
                          {new Date(event.date).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm font-medium text-green-800 sm:text-base">
                          {getEventStatusText()}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold sm:text-2xl">
                          Location
                        </h4>
                        <p className="max-w-prose break-words text-base text-gray-600 sm:text-lg">
                          {event.location.address}
                        </p>
                        {event.location.name && (
                          <p className="max-w-prose break-words text-base text-gray-600 sm:text-lg">
                            {event.location.name}
                          </p>
                        )}
                        <Button
                          onClick={() =>
                            openInGoogleMaps(event.location.coordinates)
                          }
                          className="mt-3 w-full rounded-3xl py-4 text-base sm:w-auto sm:py-5 sm:text-lg"
                        >
                          Open in Google Maps
                        </Button>
                      </div>

                      {/* Add the DonationsList component at the bottom of the right column */}
                      {donations && <DonationsList donations={donations} />}
                    </div>
                  </div>

                  <AttendanceDialog
                    isOpen={showAttendanceDialog}
                    onClose={() => setShowAttendanceDialog(false)}
                    participants={participants ?? []}
                    onSubmit={handleAttendanceSubmit}
                    isSubmitting={isSubmittingAttendance}
                    viewOnly={event.isFinished}
                    attendance={eventAttendance}
                  />
                </div>
              </div>
            </>
          )
        )}
        {event && (
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            {event && ( // Add this additional check
              <DialogContent
                className="max-h-[90vh] max-w-[800px] overflow-hidden p-0"
                aria-describedby="edit-event-dialog-description"
              >
                <DialogHeader className="ml-4 mt-4">
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <div id="edit-event-dialog-description">
                  <CreateEventForm
                    onClose={() => setShowEditForm(false)}
                    initialData={{
                      id: event.id,
                      title: event.name,
                      description: event.description,
                      date: new Date(event.date),
                      location: {
                        address: event.location.address,
                        name: event.location.name,
                        coordinates: {
                          lat: event.location.coordinates.lat,
                          lng: event.location.coordinates.lng,
                        },
                      },
                      type: event.type as
                        | "cleaning"
                        | "treePlanting"
                        | "volunteering"
                        | "other",
                      maxParticipants: event.maxParticipants,
                    }}
                    isEditing={true}
                  />
                </div>
              </DialogContent>
            )}
          </Dialog>
        )}
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default EventPage;
