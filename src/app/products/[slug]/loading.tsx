import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 bg-zinc-900" />
        <Skeleton className="h-4 w-4 bg-zinc-900/60" />
        <Skeleton className="h-4 w-16 bg-zinc-900" />
        <Skeleton className="h-4 w-4 bg-zinc-900/60" />
        <Skeleton className="h-4 w-32 bg-zinc-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery skeleton (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="aspect-square w-full rounded-3xl bg-zinc-900 border border-zinc-800" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl bg-zinc-900" />
            ))}
          </div>
        </div>

        {/* Product Info skeleton (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24 rounded-full bg-zinc-900" />
            <Skeleton className="h-9 w-3/4 bg-zinc-900" />
            <Skeleton className="h-7 w-28 bg-zinc-900" />
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <Skeleton className="h-4 w-full bg-zinc-900/70" />
            <Skeleton className="h-4 w-5/6 bg-zinc-900/70" />
            <Skeleton className="h-4 w-4/6 bg-zinc-900/70" />
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <Skeleton className="h-12 w-full rounded-xl bg-zinc-900" />
            <Skeleton className="h-12 w-full rounded-xl bg-zinc-900/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
