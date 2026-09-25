"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, AlertCircle } from "lucide-react";

interface QuantitySelectorProps {
  stock: number;
}

export function QuantitySelector({ stock }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState(false);

  const isOutOfStock = stock <= 0;
  const maxAllowed = Math.min(stock, 10);

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxAllowed, prev + 1));
  };

  const handleAddToCartClick = () => {
    setNotice(true);
    setTimeout(() => setNotice(false), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Counter */}
        <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900/60 p-1">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isOutOfStock}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-white">
            {isOutOfStock ? 0 : quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxAllowed || isOutOfStock}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart button */}
        <Button
          type="button"
          size="lg"
          onClick={handleAddToCartClick}
          disabled={isOutOfStock}
          className={`flex-1 font-semibold gap-2 ${
            isOutOfStock
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
        </Button>
      </div>

      {/* Phase 5 Notice banner when clicked */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Shopping cart & checkout persistence will be enabled in <strong>Phase 5</strong>. Product details and availability verified!
          </span>
        </div>
      )}
    </div>
  );
}
