import React from "react";
import Link from "next/link";
import { ProductCard, ProductCardProps } from "./product-card";
import { Button } from "@/components/ui/button";
import { PackageSearch, RotateCcw } from "lucide-react";

interface ProductGridProps {
  products: ProductCardProps["product"][];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No products found matching your current search and filter criteria.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 w-full min-h-[360px] space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 shadow-lg">
          <PackageSearch className="w-8 h-8 text-zinc-400" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-lg font-semibold text-white">No products found</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {emptyMessage}
          </p>
        </div>
        <div className="pt-2">
          <Link href="/shop">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-200 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
