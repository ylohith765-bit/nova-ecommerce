import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getCartAction } from "@/actions/cart-actions";
import { CartView } from "@/components/cart/cart-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping Cart | NOVA E-Commerce",
  description:
    "Review your items, adjust quantities, and proceed to checkout with our persistent shopping cart.",
};

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login?callbackUrl=/cart");
  }

  const res = await getCartAction();

  if (!res.success || !res.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Error Loading Cart</h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {res.message || "Failed to load your cart. Please try again."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/cart">
            <Button variant="outline" size="md">
              Retry
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

  const cart = res.data;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Shopping Cart
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review your selected products, update quantities, or proceed to checkout.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Cart Interactive View */}
      <CartView initialCart={cart} />
    </div>
  );
}
