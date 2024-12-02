import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.stripeAccountId) {
      return NextResponse.json({ status: "not_connected" });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    return NextResponse.json({
      status: "connected",
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
    });
  } catch (error) {
    console.error("Error checking account status:", error);
    return NextResponse.json(
      { error: "Failed to check account status" },
      { status: 500 },
    );
  }
}
