import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/server/auth";
import { api } from "@/trpc/react"; // Change to react import

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create mutation hook at the top level
const addStripeAccountIdMutation = api.post.addStripeAccountId.useMutation();

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountLinks = await stripe.accountLinks.create({
      account: (await createConnectAccount(session.user.id)).id,
      refresh_url: `${process.env.NEXTAUTH_URL}/settings`,
      return_url: `${process.env.NEXTAUTH_URL}/settings`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLinks.url });
  } catch (error) {
    console.error("Error creating connect account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

  // Use the mutation
  addStripeAccountIdMutation.mutate({ accountId: account.id });

  return account;
}
