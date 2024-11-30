import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

interface PaymentRequestBody {
  amount: number;
  eventId?: string;
  donorId?: string;
  type?: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, eventId, donorId, type } =
      (await request.json()) as PaymentRequestBody;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId: eventId ?? null,
        donorId: donorId ?? null,
        type: type ?? null,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
