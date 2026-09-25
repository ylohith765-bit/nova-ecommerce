import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StockBadge } from "@/components/shop/stock-badge";
import { ImageGallery } from "@/components/shop/image-gallery";
import { QuantitySelector } from "@/components/shop/quantity-selector";
import { ProductCard } from "@/components/shop/product-card";
import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "Product Not Found | NOVA",
    };
  }

  return {
    title: `${product.name} | NOVA E-Commerce`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch up to 4 related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { isFeatured: "desc" },
  });

  const numericPrice = Number(product.price);
  const numericComparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = numericComparePrice && numericComparePrice > numericPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numericComparePrice - numericPrice) / numericComparePrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* 1. Breadcrumbs & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
        <nav className="flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-white transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
        </Link>
      </div>

      {/* 2. Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Gallery (7 Cols) */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="inline-block text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing & Stock Status */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatPrice(numericPrice)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 line-through">
                    {formatPrice(numericComparePrice)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Save {discountPercent}%
                  </span>
                </div>
              )}
            </div>

            <StockBadge stock={product.stock} />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Overview
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Availability Details */}
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
            <span>Availability in Warehouse:</span>
            <span className="font-semibold text-zinc-200">
              {product.stock > 0 ? `${product.stock} units available` : "Unavailable"}
            </span>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="pt-2">
            <QuantitySelector
              productId={product.id}
              stock={product.stock}
              productName={product.name}
              slug={product.slug}
            />
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 border-t border-zinc-800 space-y-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Complimentary insured shipping on orders over $150</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>30-day effortless returns with prepaid shipping label</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
              <span>2-year complete hardware warranty &amp; technical support</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Related from {product.category?.name || "this collection"}
            </h2>
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View all in category &rarr;
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
