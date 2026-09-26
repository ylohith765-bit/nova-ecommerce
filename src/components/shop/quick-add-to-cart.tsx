"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { addToCartAction } from "@/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check, Loader2 } from "lucide-react";

interface QuickAddToCartProps {
  productId: string;
  productName: string;
  stock: number;
}

export function QuickAddToCart({
  productId,
  productName,
  stock,
}: QuickAddToCartProps) {
  const router = useRouter();
  const { status } = useSession();
  const { setCartCount } = useCart();
  const [isPending, setIsPending] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = stock <= 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isPending) return;

    // If unauthenticated, redirect to login
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/shop")}`);
      return;
    }

    setIsPending(true);

    try {
      const res = await addToCartAction(productId, 1);
      if (res.success && res.data) {
        setCartCount(res.data.cartCount);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (err) {
      console.error("Quick add error:", err);
    } finally {
      setIsPending(false);
    }
  };

  if (isOutOfStock) {
    return (
      <Button
        size="sm"
        disabled
        className="w-full h-9 text-xs opacity-50 bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700/40"
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleQuickAdd}
      disabled={isPending}
      aria-label={`Add ${productName} to shopping cart`}
      className={`w-full h-9 text-xs font-semibold transition-all duration-200 ${
        isAdded
          ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/25"
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
          <span>Adding...</span>
        </>
      ) : isAdded ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1.5 text-white stroke-[2.5]" />
          <span>Added to Cart</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          <span>Add to Cart</span>
        </>
      )}
    </Button>
  );
}
