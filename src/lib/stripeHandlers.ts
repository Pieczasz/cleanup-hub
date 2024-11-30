import { stripe } from "./stripe";
import { users } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

export async function createStripeAccount(userId: string) {
  // Create a new Stripe account for the user
  const account = await stripe.accounts.create({ type: "express" });

  // Save the Stripe account ID to the user's record
  await db
    .update(users)
    .set({ stripeAccountId: account.id })
    .where(sql`id = ${userId}`);

  // Generate an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXTAUTH_URL}/profile`,
    return_url: `${process.env.NEXTAUTH_URL}/profile`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

export async function getStripeAccountStatus(userId: string) {
  // Retrieve the user's Stripe account status
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

interface User {
  id: string;
  stripeAccountId?: string;
}

export async function createDonationSession(
  event: Event,
  amount: number,
  donorId: string,
): Promise<string> {
  // Create a Stripe Checkout session for donations
  const creator = (await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, event.creatorId),
  })) as User | null;

  if (!creator?.stripeAccountId) {
    throw new Error("Event creator has not connected their Stripe account");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount * 100, // amount in cents
          product_data: {
            name: `Donation to ${event.name}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.floor(amount * 100 * 0.08),
      transfer_data: {
        destination: creator.stripeAccountId,
      },
      metadata: {
        eventId: event.id,
        donorId: donorId,
      },
    },
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/events/${event.id}?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/events/${event.id}?canceled=true`,
  });

  if (!session.url) {
    throw new Error("Failed to create a Stripe session URL");
  }
  return session.url;
}
