"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import convertToSubcurrency from "@/lib/convertToSubcurrency";

interface CheckoutPageProps {
  amount: number;
  eventId?: string;
  onCancel?: () => void;
}

const CheckoutPage = ({ amount, eventId, onCancel }: CheckoutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: convertToSubcurrency(amount),
        eventId,
        donorId: session?.user?.id,
        type: "donation",
      }),
    })
      .then((res) => res.json())
      .then((data: { error?: string; clientSecret: string }) => {
        if (data.error) {
          setErrorMessage(data.error);
          return;
        }
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Failed to initialize payment");
      });
  }, [amount, eventId, session?.user?.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !clientSecret) {
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setLoading(false);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?amount=${amount}${eventId ? `&eventId=${eventId}` : ""}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (e) {
      setErrorMessage("An unexpected error occurred");
    }

    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4 text-red-500">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full"
          >
            Back
          </Button>
        )}
        <Button type="submit" disabled={!stripe || loading} className="w-full">
          {loading ? "Processing..." : `Donate $${amount}`}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutPage;
