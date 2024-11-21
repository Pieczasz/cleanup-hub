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
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

// Type definitions for Nominatim API responses
interface NominatimAddress {
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  address: NominatimAddress;
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
    address: z.string(),
    name: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
  }),
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

async function fetchAddressFromCoordinates(
  lat: number,
  lng: number,
): Promise<string> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch address from Nominatim API");
  }

  const data = (await response.json()) as NominatimReverseResult;

  if (data?.address) {
    const address = data.address;
    const readableAddress = [
      address.road,
      address.suburb,
      address.city,
      address.state,
      address.country,
    ]
      .filter((part): part is string => Boolean(part))
      .join(", ");
    return readableAddress;
  }

  throw new Error("Address not found");
}

interface CreateEventFormProps {
  onClose: () => void;
}

export function CreateEventForm({ onClose }: CreateEventFormProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<Coordinates | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [name, setName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    NominatimSearchResult[]
  >([]);
  const [previousMapLocation, setPreviousMapLocation] = useState<{
    coordinates: Coordinates;
    name: string;
  } | null>(null);

  const [debouncedAddress] = useDebounce(manualAddress, 500);

  // TODO: Add redirection after adding an event
  const router = useRouter();

  const createEventMutation = api.post.createEvent.useMutation({
    onSuccess: (data: unknown) => {
      if (typeof data === "object") {
        toast({
          title: "Success!",
          description: "Event created successfully",
        });
      } else {
        console.error("Unexpected data shape:", data);
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
    defaultValues: {
      title: "",
      description: "",
      type: "cleaning",
      location: {
        name: "",
        address: "",
        coordinates: { lat: 0, lng: 0 },
      },
    },
  });

  useEffect(() => {
    console.log("Debounced Address:", debouncedAddress); // Log debounced address
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
    setManualAddress(address); // Update the manual address state
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
    createEventMutation.mutate({
      title: data.title,
      description: data.description,
      date: data.date,
      location: {
        name: name || manualAddress, // Use map name or manual input
        address: selectedAddress || manualAddress,
        coordinates: selectedCoordinates ?? { lat: 0, lng: 0 },
      },
      type: data.type || "other",
    });
  };

  const handleMapLocationSelect = async (
    locationData: Coordinates & { name?: string },
  ): Promise<void> => {
    const { lat, lng, name = "" } = locationData;

    setPreviousMapLocation({
      coordinates: { lat, lng },
      name: name,
    });

    // Update form and component state
    setName(name);
    setSelectedCoordinates({ lat, lng });
    form.setValue("location.coordinates", { lat, lng });
    form.setValue("location.name", name);

    // Clear manual address input
    setManualAddress("");

    // Attempt to fetch address
    try {
      const address = await fetchAddressFromCoordinates(lat, lng);
      setSelectedAddress(address);
    } catch {
      setSelectedAddress("Unable to fetch address");
    }

    setShowMap(false);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  const handleAddressChange = (value: string): void => {
    if (previousMapLocation) {
      setName(value);
    }

    setManualAddress(value); // Update manualAddress
    setName(""); // Clear the name from the map selection if manually typing
    setSelectedCoordinates(null); // Reset coordinates when typing manually
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
                    placeholder="Enter an address or use the map"
                    value={name || manualAddress}
                    onChange={(e) => handleAddressChange(e.target.value)} // Update manualAddress
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
                      onLocationSelect={handleMapLocationSelect}
                      onClose={handleCloseMap}
                      initialPosition={
                        previousMapLocation?.coordinates ?? {
                          lat: 52.237049,
                          lng: 19.017532,
                        }
                      }
                      initialLocationName={previousMapLocation?.name ?? ""}
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
                disabled={createEventMutation.status === "pending"}
                className="min-w-[100px]"
              >
                {createEventMutation.status === "pending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : createEventMutation.isSuccess ? (
                  <Check className="h-4 w-4" />
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
