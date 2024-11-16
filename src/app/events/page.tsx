"use client";

import { MapComponent } from "@/components/GoogleMap";
import { MapProvider } from "@/components/map-provider";
import PageLayout from "@/components/PageLayout";
import React from "react";

const Events = () => {
  return (
    <MapProvider>
      <PageLayout>
        <div className="flex w-full flex-col items-center justify-center gap-y-32">
          <MapComponent />
        </div>
      </PageLayout>
    </MapProvider>
  );
};

export default Events;
