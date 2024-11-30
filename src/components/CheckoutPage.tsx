// src/components/CheckoutPage.tsx
"use client";

import React from "react";
import { Button } from "./ui/button";
import { useState } from "react";

interface CheckoutPageProps {
  amount: number;
  eventId?: string;
  onCancel?: () => void;
}

const CheckoutPage = ({ amount, eventId, onCancel }: CheckoutPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          eventId,
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.url) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
    setIsLoading(false);
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
        <form action="/api/checkout_sessions" method="POST" className="w-full">
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="eventId" value={eventId} />
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
