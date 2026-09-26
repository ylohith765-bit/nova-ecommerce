import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountOrdersLoading() {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="pb-6 border-b border-zinc-800 space-y-2">
        <Skeleton className="h-8 w-44 bg-zinc-900" />
        <Skeleton className="h-4 w-64 bg-zinc-900/60" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 bg-zinc-900" />
                <Skeleton className="h-3 w-24 bg-zinc-900/60" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-zinc-900" />
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-zinc-800/60">
              <Skeleton className="h-14 w-14 rounded-lg bg-zinc-900" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48 bg-zinc-900" />
                <Skeleton className="h-3 w-20 bg-zinc-900/60" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
