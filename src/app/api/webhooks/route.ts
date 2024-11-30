import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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