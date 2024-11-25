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

// Functions
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
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

  const showFinishButton =
    isEventOngoing && event?.creatorId === session?.user.id;

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
                          className="rounded-full hover:cursor-pointer"
                          onClick={() => {
                            if (session?.user.id === creator?.id) {
                              router.push("/profile");
                            } else {
                              router.push(`/profile/${creator?.id}`);
                            }
                          }}
                        />
                        <span
                          className="text-lg font-medium hover:cursor-pointer"
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
                    <span className="mt-3 inline-block rounded-full bg-blue-100 px-4 py-2 text-base text-blue-800">
                      {event.type === "treePlanting"
                        ? "Tree Planting"
                        : event.type[0]?.toLocaleUpperCase() +
                          event.type.slice(1)}
                    </span>
                  </div>

                  <div className="mb-8 grid gap-8 md:grid-cols-2">
                    <div className="flex flex-col gap-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">
                          Event Details
                        </h3>
                        <p className="whitespace-pre-wrap break-words text-lg text-gray-600">
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

                      <div className="flex gap-2">
                        {event.creatorId === session?.user.id ? (
                          <>
                            <Button
                              onClick={() => setShowEditForm(true)}
                              className="max-w-full rounded-3xl bg-yellow-600 py-5 text-lg hover:bg-yellow-600/90"
                            >
                              Edit Event
                            </Button>
                            <Button
                              onClick={handleEventParticipation}
                              className="max-w-full rounded-3xl bg-red-600 py-5 text-lg hover:bg-red-600/90"
                            >
                              Delete Event
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleEventParticipation}
                            className={`max-w-full rounded-3xl py-5 text-lg ${
                              isParticipant
                                ? "bg-red-600 hover:bg-red-600/90"
                                : "bg-blue-600 hover:bg-blue-600/90"
                            }`}
                            disabled={!session}
                          >
                            {isParticipant ? "Leave Event" : "Join Event"}
                          </Button>
                        )}
                      </div>
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
                            openInGoogleMaps(event.location.coordinates)
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
                  {showFinishButton && (
                    <Button
                      onClick={() => setShowAttendanceDialog(true)}
                      className="mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Finish Event
                    </Button>
                  )}
                  <AttendanceDialog
                    isOpen={showAttendanceDialog}
                    onClose={() => setShowAttendanceDialog(false)}
                    participants={participants ?? []}
                    onSubmit={handleAttendanceSubmit}
                    isSubmitting={isSubmittingAttendance}
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
