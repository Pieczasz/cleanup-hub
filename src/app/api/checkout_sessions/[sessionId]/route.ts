import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } },
) {
  try {
    const session = await stripe.checkout.sessions.retrieve(params.sessionId);

    return NextResponse.json({
      amount_total: session.amount_total,
      event_id: session.metadata?.eventId,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 404 },
    );
  }
}
