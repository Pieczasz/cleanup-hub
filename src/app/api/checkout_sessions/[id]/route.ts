import { NextResponse } from "next/server";
import Stripe from "stripe";
import { type NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    if (!context.params.id?.startsWith("cs_")) {
      throw new Error("Invalid session ID");
    }

    const session = await stripe.checkout.sessions.retrieve(context.params.id);

    return NextResponse.json({
      amount_total: session.amount_total,
      status: session.status,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve checkout session" },
      { status: 404 },
    );
  }
}
