"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              NOVA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/"
              className={`transition-colors hover:text-white ${
                pathname === "/" ? "text-white font-medium" : "text-zinc-400"
              }`}
            >
              Overview
            </Link>
            {user && (
              <Link
                href="/account/orders"
                className={`transition-colors hover:text-white ${
                  pathname.startsWith("/account/orders")
                    ? "text-white font-medium"
                    : "text-zinc-400"
                }`}
              >
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`inline-flex items-center gap-1.5 transition-colors hover:text-indigo-300 ${
                  pathname.startsWith("/admin")
                    ? "text-indigo-400 font-medium"
                    : "text-zinc-400"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Auth Navigation */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 bg-zinc-800/60 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex border-indigo-500/40 text-indigo-400 bg-indigo-500/10 text-[11px]"
                >
                  Admin
                </Badge>
              )}

              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800/60 ${
                    pathname === "/account" ? "bg-zinc-900 text-white border-zinc-700" : ""
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
