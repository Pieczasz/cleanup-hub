import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const stripeConfig = {
  connectAccountReturnURL: `${process.env.NEXTAUTH_URL}/profile?stripe=success`,
  connectAccountRefreshURL: `${process.env.NEXTAUTH_URL}/profile?stripe=refresh`,
};
