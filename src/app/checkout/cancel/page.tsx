import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingBag, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout Cancelled | NOVA E-Commerce",
  description: "Your checkout session was cancelled. Your cart items remain safely saved.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="h-20 w-20 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-xl shadow-black/40">
        <XCircle className="w-10 h-10 text-rose-400" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Checkout Cancelled
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          No charges were made to your card. Your selected items and quantities remain safely stored in your persistent shopping cart.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/cart" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 shadow-lg shadow-indigo-600/25"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Return to Cart</span>
          </Button>
        </Link>
        <Link href="/shop" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:text-white gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
