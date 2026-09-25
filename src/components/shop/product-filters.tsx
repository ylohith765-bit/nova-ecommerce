"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: CategoryOption[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Current filter state from URL
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSort = searchParams.get("sort") || "featured";

  // Local form inputs
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset pagination to page 1 on filter changes
    params.delete("page");

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice ? String(Math.max(0, Number(minPrice))) : null,
      maxPrice: maxPrice ? String(Math.max(0, Number(maxPrice))) : null,
    });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentSearch || currentMinPrice || currentMaxPrice || (currentSort && currentSort !== "featured")
  );

  return (
    <div className="space-y-6">
      {/* Top Filter Bar (Search + Sort + Mobile Toggle) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-950/80 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        {/* Sort Dropdown & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/80 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500">Active Filters:</span>
          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                type="button"
                onClick={() => updateFilters({ category: null })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Query: &quot;{currentSearch}&quot;
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: null });
                }}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(currentMinPrice || currentMaxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Price: ${currentMinPrice || "0"} - ${currentMaxPrice || "Any"}
              <button
                type="button"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  updateFilters({ minPrice: null, maxPrice: null });
                }}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 ml-2 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Sidebar (Desktop Always visible, Mobile collapsible) */}
      <div className={`space-y-6 ${isMobileOpen ? "block" : "hidden lg:block"}`}>
        {/* Category Facets */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Categories
          </h4>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => updateFilters({ category: null })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                !currentCategory
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span>All Categories</span>
            </button>
            {categories.map((cat) => {
              const isSelected = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white font-medium"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Price Range ($)
          </h4>
          <form onSubmit={handlePriceSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" size="sm" className="w-full text-xs">
                Apply Price
              </Button>
              {(currentMinPrice || currentMaxPrice) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    updateFilters({ minPrice: null, maxPrice: null });
                  }}
                  className="text-xs text-zinc-400"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
