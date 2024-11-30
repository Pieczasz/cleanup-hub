
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
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
      account_type: account.type,
      business_type: account.business_type,
      email: account.email,
    });
  } catch (error) {
    console.error("Error fetching Stripe account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account details" },
      { status: 500 },
    );
  }
}