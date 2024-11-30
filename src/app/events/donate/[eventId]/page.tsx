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
import { motion } from "framer-motion";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

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
        title: data.name,
      });
    }
  }, [data, isLoading, error, router]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(value >= 0 ? value : 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!event || !eventId) {
      return;
    }
    e.preventDefault();
    if (amount >= 1) {
      setShowCheckout(true);
    }
  };

  if (isLoading) {
    return (
      <MaxWidthWrapper>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </MaxWidthWrapper>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <MaxWidthWrapper>
      <motion.main
        className="my-20 flex min-h-[60vh] flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl tracking-tight text-gray-900">
            How much do you want to donate for{" "}
            <span className="font-bold">{event.title}</span>?
          </h2>

          {!showCheckout ? (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl text-gray-700">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min={1}
                  step={0.01}
                  className="text-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={amount < 1}
                className="w-full text-lg"
              >
                Continue to Payment
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Elements
                stripe={stripePromise}
                options={{
                  mode: "payment",
                  amount: convertToSubcurrency(amount),
                  currency: "usd",
                }}
              >
                <div className="space-y-4">
                  <CheckoutPage
                    amount={amount}
                    eventId={eventId!}
                    onCancel={() => setShowCheckout(false)}
                  />
                </div>
              </Elements>
            </motion.div>
          )}
        </motion.div>
      </motion.main>
    </MaxWidthWrapper>
  );
}
