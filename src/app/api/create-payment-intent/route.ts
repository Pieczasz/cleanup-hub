import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import type { events } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      amount: number;
      eventId: string;
      donorId: string;
    };
    const { amount, eventId, donorId } = body;

    // Get event and creator details
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      include: {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!event.creator ?? !event.creator.stripeAccountId) {
      return NextResponse.json(
        { error: "Event creator has not connected their Stripe account" },
        { status: 400 },
      );
    }

    // Calculate platform fee (8%)
    const platformFee = Math.round(amount * 0.08);

    // Create Checkout Session with connected account
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation for ${event.title}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/events/${eventId}`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          destination: event.creator.stripeAccountId!,
        },
      },
      metadata: {
        eventId,
        donorId,
        type: "donation",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
