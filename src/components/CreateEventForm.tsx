// Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker24h } from "@/components/ui/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

// Zod and Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Functions
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "use-debounce";
import { api } from "@/trpc/react";

// Map Component
const MapWithNoSSR = dynamic(() => import("./MapSelection"), {
  ssr: false,
});

// Icons
import { FaLocationDot } from "react-icons/fa6";
import { useRouter } from "next/navigation"; // Changed from next/router
import { Loader2, Check } from "lucide-react";

// Type definitions for Nominatim API responses

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Validation Schema
const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  type: z.enum(["cleaning", "treePlanting", "volunteering", "other"]),
  date: z
    .date()
    .refine((date) => date > new Date(), "Date must be in the future"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  location: z.object({
    address: z.string().optional(),
    name: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  maxParticipants: z
    .number()
    .min(2, "Minimum 2 participants")
    .max(10000, "Maximum 10,000 participants"),
});

type FormSchema = z.infer<typeof formSchema>;

// Fetch coordinates from an address using Nominatim API
async function fetchCoordinatesFromAddress(address: string): Promise<{
  lat: number;
  lng: number;
  display_name: string;
}> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address,
    )}&addressdetails=1&limit=5`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data from Nominatim API");
  }

  const data = (await response.json()) as NominatimSearchResult[];

  if (!data || data.length === 0) {
    throw new Error("Address not found");
  }

  const result = data[0];
  if (result) {
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
    };
  } else {
    throw new Error("Address not found");
  }
}

interface CreateEventFormProps {
  onClose: () => void;
  initialData?: {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: {
      address: string;
      name?: string;
      coordinates: { lat: number; lng: number };
    };
    type: "cleaning" | "treePlanting" | "volunteering" | "other";
    maxParticipants: number;
  };
  isEditing?: boolean;
}

export function CreateEventForm({
  onClose,
  initialData,
  isEditing,
}: CreateEventFormProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<Coordinates | null>(initialData?.location.coordinates ?? null);
  const [locationName, setLocationName] = useState(
    initialData?.location.name ?? "",
  );
  const [selectedAddress, setSelectedAddress] = useState<string>(
    initialData?.location.address ?? "",
  );
  const [addressSuggestions, setAddressSuggestions] = useState<
    NominatimSearchResult[]
  >([]);

  const [debouncedAddress] = useDebounce("", 500) as unknown as [string];

  const router = useRouter();

  const createEventMutation = api.post.createEvent.useMutation({
    onSuccess: (data) => {
      if (data?.id) {
        toast({
          title: "Success!",
          description:
            "Event created successfully. You've been added as a participant.",
        });

        // Close dialog and cleanup map
        setShowMap(false); // Ensure map is hidden
        onClose(); // Close the dialog

        // Use the new navigation pattern
        setTimeout(() => {
          // Use replace to avoid history stack issues
          window.location.href = `/events/${data.id}`;
        }, 1000);
      } else {
        console.error("Unexpected data shape or missing event ID:", data);
        toast({
          title: "Error",
          description: "Failed to fetch event details for redirection.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = api.post.updateEvent.useMutation({
    onSuccess: (data) => {
      if (data?.id) {
        toast({
          title: "Success!",
          description:
            "Event updated successfully. Your changes has been saved. If you don't see the changes, please refresh the page.",
        });
        router.refresh();
        onClose();
      } else {
        console.error("Unexpected data shape or missing event ID:", data);
        toast({
          title: "Error",
          description: "Failed to fetch event details for redirection.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          type: initialData.type,
          date: initialData.date,
          location: initialData.location,
          maxParticipants: initialData.maxParticipants,
        }
      : {
          title: "",
          description: "",
          type: "cleaning",
          location: {
            address: "",
            name: "",
            coordinates: { lat: 0, lng: 0 },
          },
          maxParticipants: 10,
        },
  });

  const getSavedLocation = () => {
    const savedLocation = localStorage.getItem("savedLocation");
    return savedLocation
      ? (JSON.parse(savedLocation) as {
          coordinates: Coordinates;
          name?: string;
        })
      : null;
  };

  useEffect(() => {
    const savedLocation = getSavedLocation();
    if (savedLocation) {
      const savedName = savedLocation.name ?? "";
      setLocationName(savedName);
      form.setValue("location.coordinates", savedLocation.coordinates);
      form.setValue("location.name", savedName);
    }
  }, [form]);

  const [initialLocation, setInitialLocation] = useState<
    { coordinates: Coordinates; name?: string } | undefined
  >(
    initialData
      ? {
          coordinates: initialData.location.coordinates,
          name: initialData.location.name,
        }
      : (getSavedLocation() ?? undefined),
  );

  useEffect(() => {
    if (debouncedAddress) {
      void handleAddressSearch(debouncedAddress);
    } else {
      setAddressSuggestions([]);
    }
  }, [debouncedAddress]);

  const handleAddressSearch = async (address: string): Promise<void> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address,
        )}&addressdetails=1&limit=5`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address suggestions");
      }

      const data = (await response.json()) as NominatimSearchResult[];
      setAddressSuggestions(data);
    } catch {
      setAddressSuggestions([]);
      toast({
        title: "Error",
        description: "Failed to fetch address suggestions.",
      });
    }
  };

  const handleSelectAddress = async (address: string): Promise<void> => {
    form.setValue("location.address", address);
    setSelectedAddress(address);
    try {
      const { lat, lng } = await fetchCoordinatesFromAddress(address);
      setSelectedCoordinates({ lat, lng });
      form.setValue("location.coordinates", { lat, lng });
      setAddressSuggestions([]);
    } catch {
      toast({ title: "Error", description: "Failed to fetch coordinates." });
    }
  };

  const onSubmit = (data: FormSchema): void => {
    if (!selectedAddress || !selectedCoordinates) {
      toast({
        title: "Error",
        description: "Please select a location with a valid address",
        variant: "destructive",
      });
      return;
    }

    localStorage.removeItem("savedLocation");

    const eventData = {
      title: data.title,
      description: data.description,
      date: data.date,
      location: {
        address: selectedAddress,
        name:
          (locationName || data.location.name) ?? selectedAddress.split(",")[0],
        coordinates: selectedCoordinates,
      },
      type: data.type ?? "other",
      maxParticipants: data.maxParticipants,
    };

    if (isEditing && initialData) {
      updateEventMutation.mutate({ eventId: initialData.id, ...eventData });
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  const handleMapLocationSelect = async (location: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
  }): Promise<void> => {
    const { lat, lng, name, address } = location;
    const coordinates = { lat, lng };
    const finalName = name ?? locationName ?? "";
    const finalAddress = address ?? selectedAddress ?? "";

    form.setValue("location.coordinates", coordinates);
    form.setValue("location.name", finalName);
    form.setValue("location.address", finalAddress);
    setSelectedCoordinates(coordinates);
    setLocationName(finalName);
    setSelectedAddress(finalAddress);
    setInitialLocation({ coordinates, name: finalName });
    setShowMap(false);
  };

  return (
    <ScrollArea className="h-[80vh] w-full rounded-md">
      <div className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-6"
          >
            <div className="flex flex-row items-end gap-x-4">
              <div className="w-3/4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Local Park Clean-Up" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="rounded-3xl py-6 lg:w-[180px]">
                            <SelectValue placeholder="Type of Event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Type of Event</SelectLabel>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="treePlanting">
                                Tree Planting
                              </SelectItem>
                              <SelectItem value="volunteering">
                                Volunteering
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date and Time</FormLabel>
                  <FormControl>
                    <DateTimePicker24h
                      date={field.value}
                      setDate={(date) => field.onChange(date)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Participants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter max participants"
                      min={2}
                      max={10000}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description of the event"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Location</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Input
                    placeholder="Enter an address"
                    value={selectedAddress}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedAddress(value);
                      if (value) void handleAddressSearch(value);
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  onClick={() => setShowMap(true)}
                  variant={"outline"}
                >
                  <FaLocationDot />
                </Button>
              </div>
              {addressSuggestions.length > 0 && (
                <div className="mt-2 max-h-60 overflow-auto rounded-md border border-gray-300">
                  {addressSuggestions.map((suggestion) => (
                    <div
                      key={`${suggestion.lat}-${suggestion.lon}`}
                      className="cursor-pointer p-2 hover:bg-gray-200"
                      onClick={() =>
                        void handleSelectAddress(suggestion.display_name)
                      }
                    >
                      {suggestion.display_name}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 w-full">
                {selectedAddress && (
                  <p className="text-sm">
                    <span className="font-semibold">Selected Address:</span>{" "}
                    {selectedAddress}
                  </p>
                )}
              </div>
            </div>
            {showMap && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-md">
                  <div id="modal-map-container">
                    <MapWithNoSSR
                      key={showMap ? "map" : undefined} // Only assign key if map is shown
                      onLocationSelect={handleMapLocationSelect}
                      onClose={() => setShowMap(false)}
                      initialLocation={initialLocation}
                    />
                  </div>
                  <div></div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createEventMutation.status === "pending"}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createEventMutation.status === "pending" ||
                  updateEventMutation.status === "pending"
                }
                className="min-w-[100px]"
              >
                {createEventMutation.status === "pending" ||
                updateEventMutation.status === "pending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : createEventMutation.isSuccess ||
                  updateEventMutation.isSuccess ? (
                  <Check className="h-4 w-4" />
                ) : isEditing ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
