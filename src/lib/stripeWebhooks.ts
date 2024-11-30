import { stripe } from "./stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";
import { donations, users } from "@/server/db/schema";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";

export const handleStripeWebhook = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const sig = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    return res
      .status(400)
      .json({ error: "Missing signature or webhook secret" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err);
    return res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { eventId, donorId, type } = paymentIntent.metadata;

        if (type === "donation" && eventId) {
          await db.insert(donations).values({
            eventId,
            donorId: donorId ?? null,
            amount: Math.floor(paymentIntent.amount / 100),
            paymentIntentId: paymentIntent.id,
            isAnonymous: !donorId,
          });
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object;

        if (account.metadata?.userId) {
          await db
            .update(users)
            .set({ stripeAccountId: account.id })
            .where(eq(users.id, account.metadata.userId));
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
        );
        const { eventId, donorId, type } = paymentIntent.metadata;

        if (type === "donation" && eventId) {
          await db.insert(donations).values({
            eventId,
            donorId: donorId ?? null,
            amount: Math.floor(paymentIntent.amount / 100),
            paymentIntentId: paymentIntent.id,
            isAnonymous: !donorId,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// Helper function to get raw body as buffer
async function buffer(req: NextApiRequest) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else if (chunk instanceof Buffer) {
      chunks.push(chunk);
    }
  }

  return Buffer.concat(chunks);
}

// Update API config to handle raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
