import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-zinc-800/60 rounded-lg" />
          <Skeleton className="h-4 w-72 bg-zinc-800/40 rounded-md" />
        </div>
        <Skeleton className="h-4 w-28 bg-zinc-800/40 rounded-md" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left items column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between pb-3 border-b border-zinc-800">
            <Skeleton className="h-4 w-24 bg-zinc-800/60 rounded" />
            <Skeleton className="h-4 w-16 bg-zinc-800/60 rounded" />
          </div>

          <div className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-20 w-20 rounded-xl bg-zinc-800/60 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16 bg-zinc-800/40 rounded" />
                    <Skeleton className="h-5 w-48 bg-zinc-800/60 rounded" />
                    <Skeleton className="h-3 w-28 bg-zinc-800/40 rounded" />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                  <Skeleton className="h-9 w-28 rounded-xl bg-zinc-800/60" />
                  <Skeleton className="h-6 w-16 bg-zinc-800/60 rounded" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800/60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right summary column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-6">
            <Skeleton className="h-6 w-32 bg-zinc-800/60 rounded" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-zinc-800/40 rounded" />
              <Skeleton className="h-4 w-full bg-zinc-800/40 rounded" />
              <Skeleton className="h-4 w-full bg-zinc-800/40 rounded" />
            </div>
            <Skeleton className="h-12 w-full bg-zinc-800/80 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
