// src/components/CheckoutPage.tsx
"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";

interface CheckoutPageProps {
  amount: number;
  eventId?: string;
  onCancel?: () => void;
}

const CheckoutPage = ({ amount, eventId, onCancel }: CheckoutPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100,
          eventId,
        }),
      });

      const data: { url?: string } = (await response.json()) as {
        url?: string;
      };

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white/10 p-4">
        <p className="text-lg">Donation Amount: ${amount}</p>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Back
          </Button>
        )}
        <form onSubmit={handleSubmit} className="w-full">
          <Button
            type="submit"
            className="w-full"
            disabled={!eventId || isLoading}
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
