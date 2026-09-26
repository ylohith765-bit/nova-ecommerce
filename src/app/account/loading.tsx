import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Account Header skeleton */}
      <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
        <Skeleton className="h-16 w-16 rounded-2xl bg-zinc-900" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 bg-zinc-900" />
          <Skeleton className="h-4 w-48 bg-zinc-900/60" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left overview */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <Skeleton className="h-5 w-32 bg-zinc-900" />
          <Skeleton className="h-4 w-full bg-zinc-900/60" />
          <Skeleton className="h-4 w-3/4 bg-zinc-900/60" />
          <Skeleton className="h-4 w-1/2 bg-zinc-900/60" />
        </div>

        {/* Right profile form & orders */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <Skeleton className="h-6 w-36 bg-zinc-900" />
            <Skeleton className="h-10 w-full rounded-xl bg-zinc-900" />
            <Skeleton className="h-10 w-32 rounded-xl bg-zinc-900" />
          </div>
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <Skeleton className="h-6 w-36 bg-zinc-900" />
            <Skeleton className="h-16 w-full rounded-xl bg-zinc-900/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
