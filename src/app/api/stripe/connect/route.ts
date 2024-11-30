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

async function verifyStripeConnect() {
  try {
    // Try to retrieve account capabilities to verify Connect access
    await stripe.accounts.list({ limit: 1 });
    return true;
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeError &&
      error.message.includes("signed up for Connect")
    ) {
      return false;
    }
    throw error; // Re-throw other errors
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log("Unauthorized attempt to connect Stripe account");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log user attempting to connect
    console.log("User attempting to connect Stripe:", {
      userId: session.user.id,
      email: session.user.email,
    });

    // Verify Stripe Connect is enabled
    const hasConnect = await verifyStripeConnect();
    if (!hasConnect) {
      console.log("Stripe Connect not enabled for account");
      return NextResponse.json(
        {
          error:
            "Stripe Connect is not enabled for this account. Please contact the administrator.",
          code: "STRIPE_CONNECT_NOT_ENABLED",
        },
        { status: 503 },
      );
    }

    // Check if user already has a Stripe account
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      console.log("User not found in database:", session.user.id);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    if (!user.email) {
      console.log("User email missing:", session.user.id);
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 },
      );
    }

    if (user.stripeAccountId) {
      // Check if the account has completed onboarding
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      
      if (account.details_submitted) {
        console.log("User has already completed Stripe onboarding:", {
          userId: user.id,
          stripeAccountId: user.stripeAccountId,
        });
        return NextResponse.json(
          { error: "Stripe account already exists and is fully setup" },
          { status: 400 },
        );
      }

      // Account exists but onboarding is incomplete - create new onboarding link
      const accountLinks = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.NEXTAUTH_URL}/settings`,
        return_url: `${process.env.NEXTAUTH_URL}/settings`,
        type: "account_onboarding",
      });

      console.log("Regenerating onboarding link for incomplete account:", {
        userId: user.id,
        stripeAccountId: user.stripeAccountId,
      });

      return NextResponse.json({ url: accountLinks.url });
    }

    try {
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
    } catch (stripeError) {
      console.error("Stripe account creation error:", stripeError);
      return NextResponse.json(
        {
          error:
            "Failed to create Stripe account. Please ensure your email is verified and try again.",
          details:
            stripeError instanceof Error ? stripeError.message : undefined,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    // Enhanced error logging
    console.error("Error creating connect account:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Stripe.errors.StripeError ? error.type : "unknown",
      code: error instanceof Stripe.errors.StripeError ? error.code : undefined,
    });

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          type: error.type,
        },
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
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.email) {
    throw new Error("User email is required for Stripe Connect");
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: user.email,
    country: "PL", // Assuming Poland is the default country
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
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
