import { stripe, stripeConfig } from "./stripe";
import { users } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

export async function createStripeAccount(userId: string) {
  try {
    // First check if user already has a Stripe account
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (existingUser?.stripeAccountId) {
      // If they have an account, create a new account link
      const accountLink = await stripe.accountLinks.create({
        account: existingUser.stripeAccountId,
        refresh_url: stripeConfig.connectAccountRefreshURL,
        return_url: stripeConfig.connectAccountReturnURL,
        type: "account_onboarding",
      });
      return { url: accountLink.url };
    }

    // Create a new connected account
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: "individual",
      metadata: {
        userId,
      },
    });

    // Save the account ID to the user record
    await db
      .update(users)
      .set({ stripeAccountId: account.id })
      .where(sql`id = ${userId}`);

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: stripeConfig.connectAccountRefreshURL,
      return_url: stripeConfig.connectAccountReturnURL,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Stripe account creation error:", error);
    throw new Error("Failed to create Stripe account. Please try again later.");
  }
}

export async function getStripeAccountStatus(userId: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user?.stripeAccountId) {
    return { connected: false };
  }

  const account = await stripe.accounts.retrieve(user.stripeAccountId);
  return { connected: account.charges_enabled };
}

interface Event {
  id: string;
  name: string;
  creatorId: string;
}

export async function createDonationSession(
  event: Event,
  amount: number,
  donorId: string,
): Promise<{ url: string }> {
  try {
    const creator = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, event.creatorId),
    });

    if (!creator?.stripeAccountId) {
      throw new Error("Event creator has not connected their Stripe account");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation for ${event.name}`,
              description: `Support ${event.name} event`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(amount * 100 * 0.05), // 5% platform fee
        transfer_data: {
          destination: creator.stripeAccountId,
        },
        metadata: {
          eventId: event.id,
          donorId,
          type: "donation",
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/events/${event.id}?donation=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${event.id}?donation=cancelled`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
  } catch (error) {
    console.error("Stripe session creation error:", error);
    throw new Error(
      "Failed to create donation session. Please try again later.",
    );
  }
}
