// src/components/DonateButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import type { Event } from "@/server/db/schema";

interface DonateButtonProps {
  event: Event;
  disabled?: boolean;
  className?: string;
}

export const DonateButton = ({
  event,
  disabled,
  className,
}: DonateButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: creator } = api.post.getUserById.useQuery(
    { id: event.creatorId },
    { enabled: !!event.creatorId },
  );

  const handleDonateClick = () => {
    setIsLoading(true);
    router.push(`/events/donate/${event.id}`);
  };

  if (!creator?.stripeAccountId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className={className} disabled={true}>
              Donations Unavailable
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Event creator needs to connect their Stripe account to receive
              donations
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      onClick={handleDonateClick}
      disabled={disabled ?? isLoading}
      className={className}
    >
      {isLoading ? "Loading..." : "Donate"}
    </Button>
  );
};
