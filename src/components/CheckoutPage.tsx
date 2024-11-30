// src/components/CheckoutPage.tsx
"use client";

import React from "react";
import { Button } from "./ui/button";

interface CheckoutPageProps {
  amount: number;
  eventId?: string;
  onCancel?: () => void;
}

const CheckoutPage = ({ amount, eventId, onCancel }: CheckoutPageProps) => {
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
          <Button type="submit" className="w-full">
            Proceed to Checkout
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
