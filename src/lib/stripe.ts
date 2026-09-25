import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: {
    name: "NOVA E-Commerce",
    version: "1.0.0",
  },
});

/**
 * Returns the Stripe instance, verifying that a non-empty secret key is available.
 */
export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined. Please add your Stripe Test Secret Key to your environment variables."
    );
  }
  return stripe;
}
