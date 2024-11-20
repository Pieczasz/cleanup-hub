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

// Map Component
const MapWithNoSSR = dynamic(() => import("./MapSelection"), {
  ssr: false,
});

// Icons
import { FaLocationDot } from "react-icons/fa6";

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
  date: z
    .date()
    .refine((date) => date > new Date(), "Date must be in the future"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  location: z.object({
    address: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
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
  const [addressSuggestions, setAddressSuggestions] = useState<
    NominatimSearchResult[]
  >([]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const [debouncedAddress] = useDebounce("", 500) as unknown as [string];

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: {
        address: "",
        coordinates: { lat: 0, lng: 0 },
      },
    },
  });

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
    console.log(data);
    toast({
      title: "Event Created",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    onClose();
  };

  const handleMapLocationSelect = async (
    coordinates: Coordinates,
  ): Promise<void> => {
    form.setValue("location.coordinates", coordinates);
    setSelectedCoordinates(coordinates);
    try {
      const address = await fetchAddressFromCoordinates(
        coordinates.lat,
        coordinates.lng,
      );
      setSelectedAddress(address);
    } catch {
      setSelectedAddress("Unable to fetch address");
    }
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
                    placeholder="Enter an address"
                    {...form.register("location.address")}
                    onChange={(e) => void handleAddressSearch(e.target.value)}
                  />
                </FormControl>
                <Button type="button" onClick={() => setShowMap(true)} >
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
                    />
                  </div>
                  <div className="mt-4 flex w-full items-center justify-center">
                    <Button type="button" onClick={() => setShowMap(false)}>
                      Close Map
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Event</Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
