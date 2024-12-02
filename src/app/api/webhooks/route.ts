import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/server/db";
import { donations } from "@/server/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      console.log(`⚠️ Webhook signature verification failed.`);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent status: ${paymentIntent.status}`);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(
          `❌ Payment failed: ${paymentIntent.last_payment_error?.message}`,
        );
        break;
      }
      default: {
        console.warn(`Unhandled event type: ${event.type}`);
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Processing completed checkout session:", session.id);

      try {
        await db.insert(donations).values({
          id: crypto.randomUUID(),
          eventId:
            session.metadata?.eventId ??
            (() => {
              throw new Error("eventId is missing in session metadata");
            })(),
          donorId: session.metadata?.donorId ?? undefined,
          amount: session.amount_total!,
          platformFee: Number(session.metadata?.platformFee) || 0,
          stripeSessionId: session.id,
          status: "completed",
          createdAt: new Date(),
        });

        console.log(
          `Donation recorded successfully: ${session.id}, Amount: ${session.amount_total}, Fee: ${session.metadata?.platformFee}`,
        );
      } catch (error) {
        console.error("Failed to record donation:", error);
        throw error; // Re-throw to trigger error response
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
