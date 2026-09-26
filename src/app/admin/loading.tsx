import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Welcome Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-60 bg-zinc-900" />
        <Skeleton className="h-4 w-96 bg-zinc-900/60" />
      </div>

      {/* 5 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20 bg-zinc-900/60" />
              <Skeleton className="h-8 w-8 rounded-xl bg-zinc-900" />
            </div>
            <Skeleton className="h-7 w-24 bg-zinc-900" />
            <Skeleton className="h-3 w-16 bg-zinc-900/60" />
          </div>
        ))}
      </div>

      {/* Main Grid: Orders & Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <Skeleton className="h-6 w-36 bg-zinc-900" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3 flex justify-between items-center border-t border-zinc-800/60">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 bg-zinc-900" />
                <Skeleton className="h-3 w-40 bg-zinc-900/60" />
              </div>
              <Skeleton className="h-5 w-16 bg-zinc-900" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <Skeleton className="h-6 w-44 bg-zinc-900" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between border-t border-zinc-800/60">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-zinc-900" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 bg-zinc-900" />
                  <Skeleton className="h-3 w-20 bg-zinc-900/60" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-zinc-900" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
