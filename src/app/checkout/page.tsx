import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getCartAction } from "@/actions/cart-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout (Phase 6 Preview) | NOVA",
  description: "Phase 6 checkout gateway preview for NOVA e-commerce.",
};

export default async function CheckoutPlaceholderPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const res = await getCartAction();
  const cart = res.data;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
          <p className="text-sm text-zinc-400">
            Please add items to your cart before proceeding to checkout.
          </p>
        </div>
        <Link href="/shop">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
            Explore Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cart</span>
        </Link>

        <span className="text-xs text-zinc-500 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Secure 256-Bit SSL
        </span>
      </div>

      {/* Main Notice Card */}
      <div className="p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-zinc-900/40 text-center space-y-6 shadow-2xl shadow-indigo-950/40">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <CreditCard className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 5 Complete &bull; Phase 6 Coming Up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Checkout &amp; Stripe Gateway
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Your shopping cart has been successfully persisted to PostgreSQL via Supabase.
            Live Stripe payment sessions, webhook listeners, and automatic order creation will be fully enabled in <strong>Phase 6</strong>.
          </p>
        </div>

        {/* Current Order Summary Snapshot */}
        <div className="max-w-md mx-auto p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Cart Snapshot ({cart.itemCount} items)
          </h2>
          <div className="divide-y divide-zinc-800 text-xs">
            {cart.items.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between">
                <span className="text-zinc-200 truncate max-w-[200px]">
                  {item.quantity} × {item.product.name}
                </span>
                <span className="font-semibold text-white">
                  {formatPrice(item.itemSubtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-zinc-700/80 flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-200">Subtotal</span>
            <span className="font-bold text-indigo-400 text-base">
              {formatPrice(cart.subtotal)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/cart">
            <Button variant="outline" size="md" className="border-zinc-700 text-zinc-200 hover:text-white">
              Edit Cart
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="primary" size="md" className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Security assurances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-zinc-400">
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-1">
          <ShieldCheck className="w-5 h-5 mx-auto text-violet-400" />
          <p className="font-semibold text-zinc-200">Zero Client-Side Pricing</p>
          <p className="text-[11px] text-zinc-500">All prices calculated directly from database</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-1">
          <Lock className="w-5 h-5 mx-auto text-emerald-400" />
          <p className="font-semibold text-zinc-200">Encrypted User Cart</p>
          <p className="text-[11px] text-zinc-500">Guaranteed isolation per authenticated user</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-1">
          <CreditCard className="w-5 h-5 mx-auto text-indigo-400" />
          <p className="font-semibold text-zinc-200">Stripe Ready</p>
          <p className="text-[11px] text-zinc-500">Built to seamlessly accept Stripe Checkout in Phase 6</p>
        </div>
      </div>
    </div>
  );
}
