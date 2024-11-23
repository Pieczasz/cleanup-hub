// Components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Functions
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

// Hooks
import { toast } from "@/hooks/use-toast";

// Types
import type { Event } from "@/server/db/schema";

const FormSchema = z.object({
  title: z.string().optional(),
  groupBy: z
    .enum(["Closest", "Newest", "Upcoming", "MostPopular"])
    .default("Closest"),
});

export interface SearchForEventsRef {
  openHostEventDialog: () => void;
}

type Coordinates = {
  lat: number;
  lng: number;
};

const ITEMS_PER_PAGE = 20;

const SearchForEvents = forwardRef<SearchForEventsRef>((_, ref) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const session = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      groupBy: "Closest",
    },
  });

  const { watch } = form;
  const groupBy = watch("groupBy");

  // TRPC queries for different grouping options
  const closestEventsQuery = api.post.getClosestEvents.useQuery(
    {
      lat: userLocation?.lat ?? 0,
      lng: userLocation?.lng ?? 0,
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
    {
      enabled: !!userLocation && groupBy === "Closest",
    },
  );

  const newestEventsQuery = api.post.getNewestEvents.useQuery(
    {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
    {
      enabled: groupBy === "Newest",
    },
  );

  const upcomingEventsQuery = api.post.getUpcomingEvents.useQuery(
    {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
    {
      enabled: groupBy === "Upcoming",
    },
  );

  const mostPopularEventsQuery = api.post.getMostPopularEvents.useQuery(
    {
      limit: ITEMS_PER_PAGE,
      offset: 0,
    },
    {
      enabled: groupBy === "MostPopular",
    },
  );

  // Fetch user location on mount
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        toast({
          title: "Error",
          description: "Geolocation is not supported by your browser.",
        });
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          },
        );

        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to retrieve your location.",
        });
        console.error(error);
      }
    };

    getUserLocation().catch((error) => {
      console.error("Failed to get user location:", error);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    openHostEventDialog: () => setDialogOpen(true),
  }));

  useEffect(() => {
    if (isDialogOpen && session?.status !== "authenticated") {
      router.push("/signIn");
    }
  }, [isDialogOpen, session, router]);

  // Update events based on the selected grouping option
  useEffect(() => {
    setIsLoading(true);
    let currentEvents: Event[] | undefined;

    switch (groupBy) {
      case "Closest":
        currentEvents = closestEventsQuery.data;
        break;
      case "Newest":
        currentEvents = newestEventsQuery.data;
        break;
      case "Upcoming":
        currentEvents = upcomingEventsQuery.data;
        break;
      case "MostPopular":
        currentEvents = mostPopularEventsQuery.data;
        break;
    }

    if (currentEvents) {
      // Filter events by search term if one exists
      const filteredEvents = searchTerm
        ? currentEvents.filter((event) =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : currentEvents;

      setEvents(filteredEvents);
    }
    setIsLoading(false);
  }, [
    groupBy,
    searchTerm,
    closestEventsQuery.data,
    newestEventsQuery.data,
    upcomingEventsQuery.data,
    mostPopularEventsQuery.data,
  ]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setSearchTerm(data.title ?? "");
  };

  return (
    <div className="flex w-full flex-col gap-y-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4 lg:flex-row lg:gap-x-8"
      >
        <Input
          {...form.register("title")}
          placeholder="Event Title"
          className="rounded-3xl py-6 lg:min-w-[450px]"
        />
        <Select
          defaultValue={form.getValues("groupBy")}
          onValueChange={(value) =>
            form.setValue(
              "groupBy",
              value as "Closest" | "Newest" | "Upcoming" | "MostPopular",
            )
          }
        >
          <SelectTrigger className="rounded-3xl py-6 lg:w-[180px]">
            <SelectValue placeholder="Group By" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group By</SelectLabel>
              <SelectItem value="Closest">Closest Events</SelectItem>
              <SelectItem value="Newest">Newest Events</SelectItem>
              <SelectItem value="Upcoming">Upcoming Events</SelectItem>
              <SelectItem value="MostPopular">Most Popular Events</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" className="rounded-3xl py-6">
          Search
        </Button>
      </form>
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li
                key={event.id}
                className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold">{event.name}</h3>
                  <span className="text-sm text-gray-500">
                    {event.participantsCount}/{event.maxParticipants}{" "}
                    participants
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{event.description}</p>
                <div className="mt-2 flex gap-x-4 text-sm text-gray-500">
                  <span>{event.date}</span>
                  <span>Type: {event.type}</span>
                  {groupBy === "Closest" && event.distance && (
                    <span>{event.distance.toFixed(1)} km away</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

SearchForEvents.displayName = "SearchForEvents";

export default SearchForEvents;
