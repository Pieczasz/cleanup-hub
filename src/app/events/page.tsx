"use client";
import { CreateEventForm } from "@/components/CreateEventForm";
import OpenStreetMap from "@/components/Map";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";
import SearchForEvents from "@/components/SearchForEvents";
import React, { useEffect, useRef, useState } from "react";

const Events = () => {
  const searchForEventsRef = useRef<{ openHostEventDialog: () => void }>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const openDialogHandler = () => {
      setIsModalOpen(true); // Track modal state
      searchForEventsRef.current?.openHostEventDialog();
    };

    window.addEventListener("open-host-event-dialog", openDialogHandler);

    return () => {
      window.removeEventListener("open-host-event-dialog", openDialogHandler);
    };
  }, []);

  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="mb-8 flex w-full flex-col items-center justify-center gap-y-32">
          {!isModalOpen && (
            <div className="h-[571px] w-full">
              <OpenStreetMap />
            </div>
          )}
          {isModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
              <CreateEventForm onClose={() => setIsModalOpen(false)} />
            </div>
          )}
          <div>
            <SearchForEvents ref={searchForEventsRef} />
          </div>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default Events;
