import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="pb-6 border-b border-zinc-800">
        <Skeleton className="h-8 w-44 bg-zinc-900" />
        <Skeleton className="h-4 w-64 bg-zinc-900/60 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left items column */}
        <div className="lg:col-span-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center gap-4"
            >
              <Skeleton className="h-20 w-20 rounded-xl bg-zinc-900 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48 bg-zinc-900" />
                <Skeleton className="h-4 w-24 bg-zinc-900/60" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg bg-zinc-900" />
            </div>
          ))}
        </div>

        {/* Right summary column */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-6">
          <Skeleton className="h-6 w-36 bg-zinc-900" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20 bg-zinc-900/60" />
              <Skeleton className="h-4 w-16 bg-zinc-900/60" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 bg-zinc-900/60" />
              <Skeleton className="h-4 w-16 bg-zinc-900/60" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
