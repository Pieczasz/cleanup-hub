import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      amount: number;
      eventId: string;
      donorId?: string;
    };
    const { amount, eventId } = body;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const donorId = body.donorId;

    // Get event and creator details
    const event = await db.query.events.findFirst({
      where: (events) => eq(events.id, eventId),
      with: {
        creator: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.creator) {
      return NextResponse.json(
        { error: "Event creator not found" },
        { status: 404 },
      );
    }

    if (!event.creator.stripeAccountId) {
      return NextResponse.json(
        { error: "Event creator has not connected their Stripe account" },
        { status: 400 },
      );
    }

    // Calculate platform fee (8%)
    const platformFee = Math.round(amount * 100 * 0.08); // Convert to cents before calculating fee

    // Create Checkout Session with connected account
    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"] as const,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation for ${event.title}`,
              description: `Support this cleanup event`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${eventId}`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: event.creator.stripeAccountId,
        },
      },
      metadata: {
        eventId,
        donorId: donorId ?? "",
        type: "donation",
        platformFee: platformFee.toString(),
      },
    } as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
