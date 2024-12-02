import { NextResponse } from "next/server";
import Stripe from "stripe";
import { type NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    console.log(`Retrieving session with ID: ${id}`);

    if (!id.startsWith("cs_")) {
      throw new Error("Invalid session ID");
    }

    const session = await stripe.checkout.sessions.retrieve(id);

    console.log(`Session retrieved: ${JSON.stringify(session)}`);

    // Use the correct key from the metadata
    const eventId = session.metadata?.eventId;

    if (!eventId) {
      console.error("Event ID not found in session metadata");
      return NextResponse.json(
        { error: "Event ID not found in session metadata" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      amount_total: session.amount_total,
      status: session.status,
      event_id: eventId,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve checkout session" },
      { status: 404 }
    );
  }
}
