import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCustomersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40 bg-zinc-900" />
        <Skeleton className="h-4 w-80 bg-zinc-900/60" />
      </div>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex gap-4">
        <Skeleton className="h-9 w-64 rounded-lg bg-zinc-900" />
        <Skeleton className="h-9 w-36 rounded-lg bg-zinc-900" />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full bg-zinc-900" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36 bg-zinc-900" />
                <Skeleton className="h-3 w-48 bg-zinc-900/60" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-zinc-900" />
            <Skeleton className="h-4 w-24 bg-zinc-900" />
            <Skeleton className="h-4 w-16 bg-zinc-900" />
          </div>
        ))}
      </div>
    </div>
  );
}
