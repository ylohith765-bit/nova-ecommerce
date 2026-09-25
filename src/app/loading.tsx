import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3 pb-6 border-b border-zinc-800">
        <Skeleton className="h-8 w-64 bg-zinc-900" />
        <Skeleton className="h-4 w-96 bg-zinc-900/60" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl bg-zinc-900" />
            <Skeleton className="h-5 w-3/4 bg-zinc-900" />
            <Skeleton className="h-4 w-1/2 bg-zinc-900/60" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-20 bg-zinc-900" />
              <Skeleton className="h-5 w-16 bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
