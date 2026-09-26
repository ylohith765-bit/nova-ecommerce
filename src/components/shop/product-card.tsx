import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { StockBadge } from "./stock-badge";
import { QuickAddToCart } from "./quick-add-to-cart";
import { ArrowUpRight } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number | string | { toString(): string };
    compareAtPrice?: number | string | { toString(): string } | null;
    stock: number;
    images: string[];
    isFeatured?: boolean;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const numericPrice = Number(product.price);
  const numericComparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = numericComparePrice && numericComparePrice > numericPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numericComparePrice - numericPrice) / numericComparePrice) * 100)
    : 0;

  const primaryImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden hover:border-zinc-700/80 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Product Image Area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/3] sm:aspect-square w-full bg-zinc-950 overflow-hidden block"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.category ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-800/80">
              {product.category.name}
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5">
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/90 text-white shadow-sm">
                Save {discountPercent}%
              </span>
            )}
            <StockBadge stock={product.stock} />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-5 justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
              <Link
                href={`/products/${product.slug}`}
                className="hover:underline focus:outline-hidden"
              >
                {product.name}
              </Link>
            </h3>
            <Link
              href={`/products/${product.slug}`}
              className="text-zinc-500 hover:text-indigo-400 transition-colors shrink-0 mt-0.5"
              aria-label={`View full details of ${product.name}`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {product.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Quick Add Button */}
        <div className="pt-3 border-t border-zinc-800/60 mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                {formatPrice(numericPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-500 line-through">
                  {formatPrice(numericComparePrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
            </span>
          </div>

          <QuickAddToCart
            productId={product.id}
            productName={product.name}
            stock={product.stock}
          />
        </div>
      </div>
    </div>
  );
}
