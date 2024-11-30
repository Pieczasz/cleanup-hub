"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function StripeSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: { url?: string } = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create connect account:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Stripe Settings</h2>
      <p className="text-gray-600">
        Connect your Stripe account to receive donations from your events
      </p>
      <Button onClick={handleConnectStripe} disabled={isLoading}>
        {isLoading ? "Loading..." : "Connect Stripe Account"}
      </Button>
    </div>
  );
}
