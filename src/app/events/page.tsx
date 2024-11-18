"use client";
import { MapComponent } from "@/components/GoogleMap";
import { MapProvider } from "@/components/map-provider";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";
import SearchForEvents from "@/components/SearchForEvents";
import React, { useEffect, useRef } from "react";

const Events = () => {
  const searchForEventsRef = useRef<{ openHostEventDialog: () => void }>(null);

  useEffect(() => {
    const openDialogHandler = () => {
      // Call the method to open the dialog in SearchForEvents
      searchForEventsRef.current?.openHostEventDialog();
    };

    window.addEventListener("open-host-event-dialog", openDialogHandler);

    return () => {
      window.removeEventListener("open-host-event-dialog", openDialogHandler);
    };
  }, []);

  return (
    <MapProvider>
      <PageLayout>
        <MaxWidthWrapper>
          <div className="mb-8 flex w-full flex-col items-center justify-center gap-y-32">
            <div className="h-[571px] w-full">
              <MapComponent />
            </div>
            <div>
              <SearchForEvents ref={searchForEventsRef} />
            </div>
          </div>
        </MaxWidthWrapper>
      </PageLayout>
    </MapProvider>
  );
};

export default Events;
