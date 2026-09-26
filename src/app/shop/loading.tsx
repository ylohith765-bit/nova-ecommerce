import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3 pb-6 border-b border-zinc-800">
        <Skeleton className="h-8 w-48 bg-zinc-900" />
        <Skeleton className="h-4 w-80 bg-zinc-900/60" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="hidden lg:block space-y-6">
          <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 bg-zinc-900" />
            <Skeleton className="h-8 w-full bg-zinc-900/50" />
            <Skeleton className="h-8 w-full bg-zinc-900/50" />
            <Skeleton className="h-8 w-full bg-zinc-900/50" />
            <Skeleton className="h-8 w-full bg-zinc-900/50" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32 bg-zinc-900" />
            <Skeleton className="h-9 w-40 rounded-xl bg-zinc-900" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-4"
              >
                <Skeleton className="aspect-square w-full rounded-xl bg-zinc-900" />
                <Skeleton className="h-5 w-3/4 bg-zinc-900" />
                <Skeleton className="h-4 w-1/2 bg-zinc-900/60" />
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                  <Skeleton className="h-6 w-20 bg-zinc-900" />
                  <Skeleton className="h-9 w-24 rounded-xl bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
