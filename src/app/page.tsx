import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NOVA | Minimalist Tech & Lifestyle Products",
  description:
    "Discover high-fidelity audio, mechanical computing peripherals, titanium smartwatches, and minimalist workspace equipment.",
};

export default async function HomePage() {
  // Fetch real categories and featured products from Supabase
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950 py-16 sm:py-24 lg:py-32">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next-Gen Minimalist Hardware &amp; Carry</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Precision tools for your digital &amp; physical craft.
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                NOVA crafts uncompromising acoustic instruments, tactile keyboards,
                aerospace wearables, and modular workspaces built to elevate everyday life.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/25 px-8 font-semibold gap-2"
                  >
                    <span>Shop All 24 Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <a href="#categories" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-zinc-700 hover:bg-zinc-900 text-zinc-200"
                  >
                    Explore 5 Categories
                  </Button>
                </a>
              </div>

              {/* Verified Trust Stats */}
              <div className="pt-6 flex items-center justify-center lg:justify-start gap-8 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-sm">24</span>
                  <span>Curated Items</span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-sm">5</span>
                  <span>Core Collections</span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">100%</span>
                  <span>In Stock</span>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/90 shadow-2xl group">
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                  alt="NOVA ANC Acoustic Studio Pro"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent flex flex-col justify-end p-6">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500 text-white w-fit mb-2">
                    Flagship Release
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    NOVA ANC Acoustic Studio Pro
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Beryllium drivers, 40h battery, spatial acoustic imaging.
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="text-lg font-extrabold text-white">$349.00</span>
                    <Link
                      href="/products/nova-anc-acoustic-studio-pro"
                      className="text-xs font-semibold text-indigo-400 flex items-center gap-1 hover:text-indigo-300"
                    >
                      View Instrument <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section id="categories" className="py-20 border-b border-zinc-800/80 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>Collections</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Shop by Essential Category
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
            >
              Browse complete catalog
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 aspect-[4/5]"
              >
                {/* Category Cover Image with Overlay */}
                {cat.image && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-40 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
                  </div>
                )}

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-950/70 px-2 py-0.5 rounded-full border border-zinc-800">
                    {cat._count.products} products
                  </span>
                  <div className="h-7 w-7 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Title & Description */}
                <div className="relative z-10 space-y-1">
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="py-20 border-b border-zinc-800/80 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Featured Releases</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Engineered for High Performance
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
            >
              View all products
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional Banner Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-indigo-950/40 border-b border-zinc-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Uncompromising Standards
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Crafted with grade-5 titanium, black walnut, and aerospace ceramics.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Every NOVA product undergoes precision acoustic tuning and rigorous stress-testing.
            Enjoy 30-day effortless returns and a complimentary 2-year manufacturer warranty.
          </p>

          <div className="pt-2">
            <Link href="/shop">
              <Button size="lg" className="bg-white hover:bg-zinc-200 text-zinc-900 font-bold px-8">
                Explore the Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
