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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    await handleStripeWebhook(req, res);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}
