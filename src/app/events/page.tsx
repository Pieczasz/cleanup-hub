"use client";

import { MapComponent } from "@/components/GoogleMap";
import { MapProvider } from "@/components/map-provider";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";
import React from "react";

const Events = () => {
  return (
    <MapProvider>
      <PageLayout>
        <MaxWidthWrapper>
          <div className="flex w-full flex-col items-center justify-center gap-y-32">
            <div className="h-40 w-full">
              <MapComponent />
            </div>
            <div>atakstais</div>
          </div>
        </MaxWidthWrapper>
      </PageLayout>
    </MapProvider>
  );
};

export default Events;
