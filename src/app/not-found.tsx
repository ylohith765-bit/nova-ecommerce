import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-xl">
          <PackageX className="w-8 h-8 text-rose-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Product or Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            The product or page you requested could not be located. It may have been discontinued,
            renamed, or the address may be incorrect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button size="md" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Browse Catalog
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto border-zinc-800 text-zinc-300 gap-2">
              <Home className="w-4 h-4" /> Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
