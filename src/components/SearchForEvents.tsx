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
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

// Hooks
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "use-debounce";
// Types
import type { Event } from "@/server/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { CreateEventForm } from "./CreateEventForm";

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
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const router = useRouter();
  const session = useSession();
  const [groupBy, setGroupBy] = useState<
    "Closest" | "Newest" | "Upcoming" | "MostPopular"
  >("Upcoming");
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // TRPC queries for different grouping options
  // TODO: Optimize by using a single query with different parameters
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

  const searchQuery = api.post.searchEvents.useQuery(
    { searchTerm: debouncedSearch, limit: ITEMS_PER_PAGE, offset: 0 },
    { enabled: debouncedSearch.length >= 3 },
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

  // Update events based on the selected grouping option and search term
  useEffect(() => {
    setIsLoading(true);
    let currentEvents: Event[] | undefined;

    if (debouncedSearch.length >= 3) {
      currentEvents = searchQuery.data;
    } else {
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
    }

    if (currentEvents) {
      setEvents(currentEvents);
    }
    setIsLoading(false);
  }, [
    groupBy,
    debouncedSearch,
    searchQuery.data,
    closestEventsQuery.data,
    newestEventsQuery.data,
    upcomingEventsQuery.data,
    mostPopularEventsQuery.data,
  ]);

  return (
    <div className="flex w-full flex-col gap-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search events (min. 3 characters)"
          className="min-w-[35%] flex-1 rounded-3xl py-6"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          value={groupBy}
          onValueChange={(value) =>
            setGroupBy(
              value as "Upcoming" | "Newest" | "Closest" | "MostPopular",
            )
          }
        >
          <SelectTrigger className="w-[30%] rounded-3xl py-6">
            <SelectValue placeholder="Group By" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group By</SelectLabel>
              <SelectItem value="Upcoming">Upcoming Events</SelectItem>
              <SelectItem value="Newest">Newest Events</SelectItem>
              <SelectItem value="Closest">Closest Events</SelectItem>
              <SelectItem value="MostPopular">Most Popular Events</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex w-full items-center justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-1/2 rounded-3xl py-6 text-lg text-white lg:w-1/4">
              Host an Event
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-h-[90vh] max-w-[800px] overflow-hidden p-0"
            aria-describedby="create-event-dialog-description"
          >
            <DialogHeader className="ml-4 mt-4">
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div id="create-event-dialog-description">
              <CreateEventForm onClose={() => setDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{event.name}</h3>
                  <span className="text-sm text-gray-500">
                    {event.participantsCount}/{event.maxParticipants}{" "}
                    participants
                  </span>
                </div>
                <p className="mt-2 text-gray-600">
                  {event.description.substring(0, 25)}
                  {event.description.length > 25 && "..."}
                </p>
                <div className="mt-2 flex gap-x-4 text-base text-gray-500">
                  <span>{event.date}</span>
                  <span>
                    Type:{" "}
                    {event.type === "treePlanting"
                      ? "Tree Planting"
                      : event.type[0]?.toLocaleUpperCase() +
                        event.type.slice(1)}
                  </span>
                  {groupBy === "Closest" && event.distance && (
                    <span>{event.distance.toFixed(1)} km away</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {events.length >= itemsPerPage && (
        <div className="mt-4 flex w-full items-center justify-center">
          <Button
            onClick={() => {
              setItemsPerPage(itemsPerPage + 20);
            }}
            className="w-1/2 rounded-3xl py-6 text-lg text-white lg:w-1/4"
          >
            Search for More Events
          </Button>
        </div>
      )}
    </div>
  );
});

SearchForEvents.displayName = "SearchForEvents";

export default SearchForEvents;
