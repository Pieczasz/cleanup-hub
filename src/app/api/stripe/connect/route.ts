import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a Stripe account
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    if (user.stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe account already exists" },
        { status: 400 },
      );
    }

    const account = await createConnectAccount(session.user.id);

    if (!account?.id) {
      throw new Error("Failed to create Stripe account");
    }

    const accountLinks = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/settings`,
      return_url: `${process.env.NEXTAUTH_URL}/settings`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLinks.url });
  } catch (error) {
    console.error("Error creating connect account:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode ?? 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create Stripe account" },
      { status: 500 },
    );
  }
}

async function createConnectAccount(userId: string) {
  const account = await stripe.accounts.create({
    type: "express",
    metadata: {
      userId,
    },
  });

  await db
    .update(users)
    .set({ stripeAccountId: account.id })
    .where(eq(users.id, userId));

  return account;
}
