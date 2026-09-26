import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { processSuccessfulPayment } from "@/lib/order-service";
import { formatPrice, formatDate } from "@/lib/utils";

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payment: true;
    shippingAddress: true;
  };
}>;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmation | NOVA E-Commerce",
  description: "Your order has been confirmed and is being processed.",
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login?callbackUrl=/checkout/success");
  }

  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Missing Checkout Session</h1>
          <p className="text-xs text-zinc-400">
            No active Stripe checkout session was referenced. If you completed a payment, please check your order history.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/account/orders">
            <Button variant="outline" size="md">
              Order History
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="primary" size="md" className="bg-indigo-600 text-white">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 1. Fetch order from database
  let order: OrderWithDetails | null = await prisma.order.findUnique({
    where: { stripeSessionId: session_id },
    include: {
      items: true,
      payment: true,
      shippingAddress: true,
    },
  });

  // 2. Fallback reconciliation if webhook was slightly delayed
  if (!order) {
    try {
      const result = await processSuccessfulPayment({ sessionId: session_id });
      order = result.order as OrderWithDetails;
    } catch (err) {
      console.error("Order reconciliation error on success page:", err);
    }
  }

  // If still not verified or found
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Payment Processing</h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Your payment is currently being processed by Stripe. Please allow a few moments for the webhook confirmation to update your account.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link href="/account/orders">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
              View Order History
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Security check: ensure order belongs to authenticated user
  if (order.userId !== user.id) {
    redirect("/account/orders");
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Confirmation Hero Card */}
      <div className="p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-zinc-900/40 text-center space-y-4 shadow-2xl shadow-emerald-950/20">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Stripe Test Payment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Thank you for your order!
          </h1>
          <p className="text-sm text-zinc-300 max-w-md mx-auto">
            Your payment of{" "}
            <strong className="text-white">
              {formatPrice(Number(order.totalAmount))}
            </strong>{" "}
            has been verified. We&apos;ve sent a confirmation email to{" "}
            <span className="text-indigo-300 font-medium">{user.email}</span>.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-zinc-400">Order Number:</span>
          <span className="font-mono font-bold text-white bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Line Items (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                Purchased Items ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
              </h2>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs">
                {order.status}
              </Badge>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productTitle}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-600">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.productTitle}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Qty: {item.quantity} &bull; {formatPrice(Number(item.price))} each
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white shrink-0">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address Display */}
          {order.shippingAddress && (
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-400 font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shipping Address</span>
              </div>
              <p className="font-bold text-white text-sm">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-zinc-300">{order.shippingAddress.street}</p>
              <p className="text-zinc-400">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              <p className="text-zinc-500 text-[11px]">
                Phone: {order.shippingAddress.phone}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Financial Summary & Actions (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md space-y-5">
            <h2 className="text-base font-bold text-white">Payment Receipt</h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Date</span>
                <span className="text-zinc-200">{formatDate(order.createdAt)}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Payment Status</span>
                <span className="font-semibold text-emerald-400">
                  {order.payment?.status || "PAID"}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Payment Method</span>
                <span className="uppercase text-zinc-300 font-medium">
                  {order.payment?.paymentMethod || "Credit Card (Test)"}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-zinc-200">
                    {Number(order.shippingFee) === 0 ? "FREE" : formatPrice(Number(order.shippingFee))}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Sales Tax</span>
                  <span className="text-zinc-200">{formatPrice(Number(order.tax))}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total Paid</span>
                <span className="text-xl font-extrabold text-white">
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 space-y-2.5">
              <Link href="/account/orders" className="block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2">
                  <span>View All Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/shop" className="block">
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
