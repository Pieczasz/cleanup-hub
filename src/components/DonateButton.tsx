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
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import type { Event } from "@/server/db/schema";

interface DonateButtonProps {
  event: Event;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const DonateButton = ({
  event,
  disabled,
  className,
  title,
}: DonateButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<{
    status: string;
    details_submitted?: boolean;
    payouts_enabled?: boolean;
    charges_enabled?: boolean;
  } | null>(null);

  const { data: creator } = api.post.getUserById.useQuery(
    { id: event.creatorId },
    { enabled: !!event.creatorId },
  );

  useEffect(() => {
    const checkStripeStatus = async () => {
      if (!creator?.stripeAccountId) return;

      try {
        const response = await fetch(
          `/api/stripe/accountStatus?userId=${event.creatorId}`,
        );
        const data = (await response.json()) as {
          status: string;
          details_submitted?: boolean;
          payouts_enabled?: boolean;
          charges_enabled?: boolean;
        };
        setAccount(data);
      } catch (error) {
        console.error("Failed to check stripe status:", error);
      }
    };

    void checkStripeStatus();
  }, [creator?.stripeAccountId, event.creatorId]);

  const handleDonateClick = () => {
    setIsLoading(true);
    router.push(`/events/donate/${event.id}`);
  };

  // Fix: Check all required conditions
  if (
    !creator?.stripeAccountId ||
    !account ||
    account.status !== "connected" ||
    !account.details_submitted ||
    !account.charges_enabled
  ) {
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
              {title ??
                "Event creator needs to complete their Stripe account setup to receive donations"}
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
