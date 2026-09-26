import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-44 bg-zinc-900" />
          <Skeleton className="h-4 w-72 bg-zinc-900/60" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl bg-zinc-900" />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-zinc-900" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36 bg-zinc-900" />
                <Skeleton className="h-3 w-48 bg-zinc-900/60" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full bg-zinc-900" />
            <Skeleton className="h-8 w-24 rounded-lg bg-zinc-900" />
          </div>
        ))}
      </div>
    </div>
  );
}
