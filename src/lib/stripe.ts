import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: {
    name: "NOVA E-Commerce",
    version: "1.0.0",
  },
});
