import type { NextApiRequest, NextApiResponse } from "next";
import { handleStripeWebhook } from "@/lib/stripeWebhooks";

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body to validate the signature
  },
};

export default async function webhookHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await handleStripeWebhook(req, res);
}
