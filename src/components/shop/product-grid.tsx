import React from "react";
import { ProductCard, ProductCardProps } from "./product-card";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: ProductCardProps["product"][];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No products found matching your criteria.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 w-full min-h-[300px]">
        <div className="h-14 w-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-4">
          <PackageSearch className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-white">No products found</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm leading-relaxed">
          {emptyMessage}
        </p>
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
