"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import {
  CartItemDetail,
  UserCartResponse,
  updateCartItemQuantityAction,
  removeCartItemAction,
  clearCartAction,
} from "@/actions/cart-actions";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface CartViewProps {
  initialCart: UserCartResponse;
}

export function CartView({ initialCart }: CartViewProps) {
  const [cart, setCart] = useState<UserCartResponse>(initialCart);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { setCartCount } = useCart();

  // Recalculate local subtotal & itemCount helper
  const recalculateCart = (items: CartItemDetail[]): UserCartResponse => {
    let subtotal = 0;
    let itemCount = 0;

    items.forEach((item) => {
      subtotal += item.itemSubtotal;
      itemCount += item.quantity;
    });

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount,
    };
  };

  // Quantity modification
  const handleUpdateQuantity = async (
    item: CartItemDetail,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock) {
      setFeedback({
        type: "error",
        message: `Cannot increase beyond available stock (${item.product.stock} units).`,
      });
      return;
    }

    setFeedback(null);
    setUpdatingIds((prev) => new Set(prev).add(item.id));

    try {
      const res = await updateCartItemQuantityAction(item.id, newQuantity);

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to update item quantity.",
        });
        return;
      }

      // Update state
      const updatedItems = cart.items.map((i) => {
        if (i.id === item.id) {
          return {
            ...i,
            quantity: newQuantity,
            itemSubtotal: i.product.price * newQuantity,
          };
        }
        return i;
      });

      const newCart = recalculateCart(updatedItems);
      setCart(newCart);

      if (res.data?.cartCount !== undefined) {
        setCartCount(res.data.cartCount);
      } else {
        setCartCount(newCart.itemCount);
      }
    } catch (err) {
      console.error("Quantity update error:", err);
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while updating quantity.",
      });
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // Remove single item
  const handleRemoveItem = async (itemId: string) => {
    setFeedback(null);
    setDeletingIds((prev) => new Set(prev).add(itemId));

    try {
      const res = await removeCartItemAction(itemId);

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to remove item.",
        });
        return;
      }

      const updatedItems = cart.items.filter((i) => i.id !== itemId);
      const newCart = recalculateCart(updatedItems);
      setCart(newCart);

      if (res.data?.cartCount !== undefined) {
        setCartCount(res.data.cartCount);
      } else {
        setCartCount(newCart.itemCount);
      }

      setFeedback({
        type: "success",
        message: "Item removed from cart.",
      });
    } catch (err) {
      console.error("Remove item error:", err);
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while removing the item.",
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Clear all items
  const handleClearCart = async () => {
    setFeedback(null);
    setIsClearing(true);

    try {
      const res = await clearCartAction();

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to clear cart.",
        });
        return;
      }

      setCart({
        id: cart.id,
        items: [],
        subtotal: 0,
        itemCount: 0,
      });

      setCartCount(0);
      setShowClearConfirm(false);
      setFeedback({
        type: "success",
        message: "Your cart has been cleared.",
      });
    } catch (err) {
      console.error("Clear cart error:", err);
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while clearing your cart.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  // 1. EMPTY CART STATE
  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-20 w-20 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl shadow-black/40">
          <ShoppingBag className="w-10 h-10 text-zinc-500" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Your cart is empty
          </h1>
          <p className="text-sm text-zinc-400">
            Looks like you haven&apos;t added any items to your shopping cart yet.
            Explore our curated catalog of premium hardware and audio gear.
          </p>
        </div>

        {feedback && (
          <div
            className={`max-w-md mx-auto p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="pt-2">
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 shadow-lg shadow-indigo-600/25 px-8"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. POPULATED CART STATE
  return (
    <div className="space-y-8">
      {/* Top Banner Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Items (8 cols) + Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Cart Items ({cart.itemCount})
            </h2>

            {/* Clear Cart Trigger */}
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-zinc-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <span className="text-xs text-rose-300 font-medium">
                  Clear all items?
                </span>
                <button
                  type="button"
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {isClearing ? "Clearing..." : "Yes, Clear"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                  className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* List of Cart Items */}
          <div className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            {cart.items.map((item) => {
              const isUpdating = updatingIds.has(item.id);
              const isDeleting = deletingIds.has(item.id);
              const isMaxStock = item.quantity >= item.product.stock;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-opacity ${
                    isDeleting ? "opacity-40 pointer-events-none" : ""
                  }`}
                >
                  {/* Product Info & Thumbnail */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
                    >
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-600">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </Link>

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                        {item.product.category?.name || "Product"}
                      </span>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="block font-semibold text-white hover:text-indigo-300 transition-colors text-sm sm:text-base truncate"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>Unit: {formatPrice(item.product.price)}</span>
                        {item.product.stock < 10 && (
                          <span className="text-amber-400 font-medium">
                            • Only {item.product.stock} left in stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Subtotal */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    {/* Quantity controls */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900/80 p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isUpdating}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-semibold text-white">
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto text-indigo-400" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(item, item.quantity + 1)
                          }
                          disabled={isMaxStock || isUpdating}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isMaxStock && (
                        <span className="text-[10px] text-amber-400 font-medium">
                          Max stock reached
                        </span>
                      )}
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-bold text-white block">
                        {formatPrice(item.itemSubtotal)}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {item.quantity} × {formatPrice(item.product.price)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isDeleting}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Remove product"
                      aria-label="Remove product"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-semibold text-white">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Shipping</span>
                <span>
                  {cart.subtotal >= 150 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    "Calculated at checkout"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Estimated Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-baseline justify-between">
                <span className="text-base font-bold text-white">Total</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white">
                    {formatPrice(cart.subtotal)}
                  </span>
                  <span className="block text-[11px] text-zinc-500">
                    USD plus local taxes
                  </span>
                </div>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <div className="space-y-3 pt-2">
              <Link href="/checkout" className="block">
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 shadow-lg shadow-indigo-600/25 py-6 text-base"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <p className="text-[11px] text-center text-zinc-500">
                Stripe payments & checkout integration arriving in <strong>Phase 6</strong>.
              </p>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 space-y-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Encrypted server-side checkout architecture</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Free expedited shipping on orders over $150</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>30-day effortless return and exchange policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
