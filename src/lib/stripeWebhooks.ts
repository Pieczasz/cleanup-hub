import { stripe } from "./stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";
import { donations } from "@/server/db/schema";

export const handleStripeWebhook = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const sig = req.headers["stripe-signature"];
  let event;

  if (!sig) {
    console.error("Webhook Error: Missing stripe-signature header");
    res.status(400).send("Webhook Error: Missing stripe-signature header");
    return;
  }

  try {
    event = stripe.webhooks.constructEvent(
      typeof req.body === "string" ? req.body : JSON.stringify(req.body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Webhook Error: ${err.message}`);
    } else {
      console.error("Webhook Error: Unknown error");
    }
    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      // Extract metadata from paymentIntent
      const { donorId } = paymentIntent.metadata;
      if (donorId) {
        // Record the donation in the database
        await db.insert(donations).values({
          donorId,
          eventId: event.id, // Add the missing eventId property
          amount: paymentIntent.amount_received / 100, // Convert from cents to dollars
          paymentIntentId: paymentIntent.id,
        });
      } else {
        console.warn("PaymentIntent missing metadata");
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
