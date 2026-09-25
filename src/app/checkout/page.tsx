import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getCheckoutSummaryAction } from "@/actions/checkout-actions";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout | NOVA E-Commerce",
  description: "Secure Stripe checkout with real-time stock verification.",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const res = await getCheckoutSummaryAction();

  if (!res.success || !res.data) {
    const isCartEmpty = res.message?.includes("empty") || false;

    if (isCartEmpty) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="h-20 w-20 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl shadow-black/40">
            <ShoppingBag className="w-10 h-10 text-zinc-500" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Your cart is empty
            </h1>
            <p className="text-sm text-zinc-400">
              There are no items ready for checkout. Explore our collection of premium audio and computing hardware.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8"
              >
                Browse Shop
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    // General Error State
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Checkout Error</h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {res.message || "Failed to load checkout details. Please try again."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/cart">
            <Button variant="outline" size="md">
              Return to Cart
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

  const summary = res.data;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete your order with secure Stripe payment processing.
          </p>
        </div>

        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cart</span>
        </Link>
      </div>

      {/* Main Interactive Checkout View */}
      <CheckoutView initialSummary={summary} />
    </div>
  );
}
