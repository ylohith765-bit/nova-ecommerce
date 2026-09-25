import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { processSuccessfulPayment } from "@/lib/order-service";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET environment variable is not defined.");
    return NextResponse.json(
      { error: "Webhook secret is not configured on server" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown signature error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed for session: ${session.id}`);

        if (session.payment_status === "paid") {
          const result = await processSuccessfulPayment({
            sessionId: session.id,
          });

          if (result.alreadyProcessed) {
            console.log(`Session ${session.id} was already processed previously.`);
          } else {
            console.log(
              `Order successfully created: ${result.order.orderNumber} for session ${session.id}`
            );
          }
        } else {
          console.log(
            `Session ${session.id} payment_status is '${session.payment_status}', deferring order creation.`
          );
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Received payment_intent.succeeded: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error processing event";
    console.error(`Error processing Stripe webhook: ${errorMsg}`);
    return NextResponse.json(
      { error: `Webhook processing error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
