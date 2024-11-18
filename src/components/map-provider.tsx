"use client";

// Components
import PageLayout from "./PageLayout";
import MaxWidthWrapper from "./MaxWidthWrapper";

// Import necessary modules and functions from external libraries and our own project
import { type Libraries, useJsApiLoader } from "@react-google-maps/api";
import { type ReactNode } from "react";

// Animations
import { motion } from "framer-motion";

// Define a list of libraries to load from the Google Maps API
const libraries = ["places", "drawing", "geometry"];

// Define a function component called MapProvider that takes a children prop
export function MapProvider({ children }: { children: ReactNode }) {
  // Load the Google Maps JavaScript API asynchronously
  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries as Libraries,
  });

  if (loadError)
    return (
      <PageLayout>
        <MaxWidthWrapper>
          <div className="flex items-center justify-center text-center">
            <h3 className="text-3xl font-bold">Error loading map</h3>
            <h5 className="text-xl font-semibold">
              Please refresh the page or communicate with our support
            </h5>
          </div>
        </MaxWidthWrapper>
      </PageLayout>
    );

  if (!scriptLoaded)
    return (
      <PageLayout>
        <MaxWidthWrapper>
          <div className="mb-8 flex w-full flex-col items-center justify-center gap-y-32">
            <motion.div
              className="h-[571px] w-full rounded-3xl"
              style={{
                background: `linear-gradient(135deg, #a1a1aa, #52525b)`, // Base gradient
                backgroundSize: "200% 200%", // Larger size for animation
              }}
              initial={{ backgroundPosition: "0% 100%" }} // Start position
              animate={{ backgroundPosition: "100% 0%" }} // End position
              transition={{
                duration: 1, // Animation duration
                repeat: Infinity, // Infinite loop
                repeatType: "reverse", // Reverse back and forth
                ease: "easeInOut", // Smooth easing
              }}
            />
          </div>
        </MaxWidthWrapper>
      </PageLayout>
    );

  // Return the children prop wrapped by this MapProvider component
  return children;
}
