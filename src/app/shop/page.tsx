import React, { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductFilters } from "@/components/shop/product-filters";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop All Products | NOVA E-Commerce",
  description: "Browse the complete collection of minimalist tech, acoustics, workspace essentials, and daily carry.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 8;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;

  const categorySlug = resolvedParams.category?.trim();
  const searchQuery = resolvedParams.search?.trim();
  const minPriceNum = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPriceNum = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sortParam = resolvedParams.sort || "featured";
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);

  // 1. Build dynamic Prisma where filter
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (minPriceNum !== undefined || maxPriceNum !== undefined) {
    where.price = {};
    if (minPriceNum !== undefined && !isNaN(minPriceNum)) {
      where.price.gte = minPriceNum;
    }
    if (maxPriceNum !== undefined && !isNaN(maxPriceNum)) {
      where.price.lte = maxPriceNum;
    }
  }

  // 2. Build dynamic Prisma orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
    createdAt: "desc",
  };

  switch (sortParam) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "featured":
    default:
      orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
      break;
  }

  // 3. Fetch products, total count, and all categories in parallel
  const [categories, totalCount, products] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  // Helper to build pagination link with current search params preserved
  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (searchQuery) params.set("search", searchQuery);
    if (minPriceNum !== undefined && !isNaN(minPriceNum)) params.set("minPrice", String(minPriceNum));
    if (maxPriceNum !== undefined && !isNaN(maxPriceNum)) params.set("maxPrice", String(maxPriceNum));
    if (sortParam && sortParam !== "featured") params.set("sort", sortParam);
    params.set("page", String(pageNumber));
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {categorySlug
              ? categories.find((c) => c.slug === categorySlug)?.name || "Store Catalog"
              : "All Products"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Showing {startItem}–{endItem} of {totalCount} crafted products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Filters Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-48 w-full bg-zinc-900 rounded-2xl animate-pulse" />}>
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        {/* Right Column: Product Grid & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            emptyMessage={
              searchQuery
                ? `No products found matching "${searchQuery}". Try adjusting your query or resetting filters.`
                : "No products found matching your current filter criteria."
            }
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
              <Link
                href={getPageUrl(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
              >
                <Button variant="outline" size="sm" disabled={currentPage <= 1} className="gap-1 text-xs">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
              </Link>

              <div className="text-xs text-zinc-400">
                Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </div>

              <Link
                href={getPageUrl(currentPage + 1)}
                className={currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  className="gap-1 text-xs"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
