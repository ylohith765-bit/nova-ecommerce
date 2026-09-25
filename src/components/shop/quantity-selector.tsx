"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { addToCartAction } from "@/actions/cart-actions";
import {
  ShoppingBag,
  Minus,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface QuantitySelectorProps {
  productId: string;
  stock: number;
  productName: string;
  slug: string;
}

export function QuantitySelector({
  productId,
  stock,
  productName,
  slug,
}: QuantitySelectorProps) {
  const router = useRouter();
  const { status } = useSession();
  const { setCartCount } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isOutOfStock = stock <= 0;
  const maxAllowed = Math.max(1, stock);

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
    setFeedback(null);
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxAllowed, prev + 1));
    setFeedback(null);
  };

  const handleAddToCart = async () => {
    setFeedback(null);
    setAddedSuccess(false);

    // If unauthenticated, redirect straight to login with return callback
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }

    if (quantity <= 0 || isOutOfStock) {
      setFeedback({
        type: "error",
        message: "Cannot add out of stock items.",
      });
      return;
    }

    setIsPending(true);

    try {
      const res = await addToCartAction(productId, quantity);

      if (res.requiresAuth) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/products/${slug}`)}`
        );
        return;
      }

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to add product to cart.",
        });
        return;
      }

      // Success
      if (res.data?.cartCount !== undefined) {
        setCartCount(res.data.cartCount);
      }

      setFeedback({
        type: "success",
        message: res.message || `Added ${quantity} × "${productName}" to your cart.`,
      });
      setAddedSuccess(true);
    } catch (err) {
      console.error("Add to cart error:", err);
      setFeedback({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-900/60 p-1">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isOutOfStock || isPending}
            className="h-10 w-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-white select-none">
            {isOutOfStock ? 0 : quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxAllowed || isOutOfStock || isPending}
            className="h-10 w-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart CTA Button */}
        <Button
          type="button"
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPending}
          className={`flex-1 font-semibold gap-2 transition-all ${
            isOutOfStock
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Adding to Cart...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </Button>
      </div>

      {/* Dynamic Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : feedback.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1.5">
            <p className="font-medium">{feedback.message}</p>
            {addedSuccess && (
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  View Cart <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/shop"
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
