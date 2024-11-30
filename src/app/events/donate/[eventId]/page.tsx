"use client";

import { useState, useEffect } from "react";
import CheckoutPage from "@/components/CheckoutPage";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

interface Event {
  id: string;
  title: string;
}

export default function DonateEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [isEventIdResolved, setIsEventIdResolved] = useState(false);
  const [amount, setAmount] = useState<number>(5);
  const [showCheckout, setShowCheckout] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const router = useRouter();

  useEffect(() => {
    params
      .then((resolvedParams) => {
        setEventId(resolvedParams.eventId);
        setIsEventIdResolved(true);
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  const { data, isLoading, error } = api.post.getEventById.useQuery(
    { id: eventId ?? "" },
    {
      enabled: isEventIdResolved && !!eventId,
    },
  );

  console.log();
  useEffect(() => {
    if (data) {
      setEvent({
        id: data.id,
        title: data.name, // assuming the database Event has a 'name' field instead of 'title'
      });
    } else if (!isLoading && !error) {
      //   router.push("/404");
    }
  }, [data, isLoading, error, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value >= 0 ? value : 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount >= 1) {
      setShowCheckout(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="m-10 mx-auto max-w-6xl rounded-md border bg-gradient-to-tr from-blue-500 to-purple-500 p-10 text-center text-white">
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-extrabold">{event.title}</h1>
        {!showCheckout ? (
          <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">$</span>
              <Input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                min={1}
                step={0.01}
                className="text-black"
                required
              />
            </div>
            <Button type="submit" disabled={amount < 1} className="w-full">
              Continue to Payment
            </Button>
          </form>
        ) : (
          <>
            <h2 className="mb-4 text-2xl">
              Donating <span className="font-bold">${amount}</span>
            </h2>
            <Elements
              stripe={stripePromise}
              options={{
                mode: "payment",
                amount: convertToSubcurrency(amount),
                currency: "usd",
              }}
            >
              <CheckoutPage
                amount={amount}
                eventId={eventId!}
                onCancel={() => setShowCheckout(false)}
              />
            </Elements>
          </>
        )}
      </div>
    </main>
  );
}
