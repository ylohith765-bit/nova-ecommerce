import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="pb-6 border-b border-zinc-800">
        <Skeleton className="h-8 w-36 bg-zinc-900" />
        <Skeleton className="h-4 w-72 bg-zinc-900/60 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <Skeleton className="h-6 w-48 bg-zinc-900" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
              <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
              <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
              <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
            </div>
          </div>
        </div>

        {/* Right Column: Order summary skeleton */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-6">
          <Skeleton className="h-6 w-36 bg-zinc-900" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-lg bg-zinc-900 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-zinc-900" />
                  <Skeleton className="h-3 w-16 bg-zinc-900/60" />
                </div>
                <Skeleton className="h-4 w-12 bg-zinc-900" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
