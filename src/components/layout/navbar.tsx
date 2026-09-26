"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Search,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const isLoading = status === "loading";
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Audio", href: "/shop?category=audio-headphones" },
    { label: "Computing", href: "/shop?category=computing-peripherals" },
    { label: "Wearables", href: "/shop?category=wearables-smartwatches" },
    { label: "Workspace", href: "/shop?category=minimalist-workspace" },
  ];

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
    setMobileMenuOpen(false);
    setMobileSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group focus:outline-hidden"
            aria-label="NOVA Homepage"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              N
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              NOVA
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-xs font-medium transition-colors hover:text-white ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-zinc-400"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`inline-flex items-center gap-1.5 py-1 text-xs font-semibold transition-colors hover:text-indigo-300 ${
                  pathname.startsWith("/admin")
                    ? "text-indigo-400"
                    : "text-zinc-400"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions (Search, Cart, Auth) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut */}
          <Link
            href="/shop"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            title="Search Store"
            aria-label="Search all products"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Cart Icon & Live Count */}
          <Link
            href="/cart"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
              pathname === "/cart"
                ? "bg-zinc-800 text-white border-zinc-700"
                : "border-zinc-800/80 bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700"
            }`}
            title="Shopping Cart"
            aria-label={`Shopping Cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold transition-all ${
                cartCount > 0
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {cartCount}
            </span>
          </Link>

          {/* User Auth Buttons */}
          {isLoading ? (
            <div className="h-9 w-20 bg-zinc-800/60 rounded-xl animate-pulse hidden sm:block" />
          ) : user ? (
            <div className="hidden sm:flex items-center gap-2.5">
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-indigo-500/40 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs gap-1.5 h-8 px-2.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800/60 h-8 px-2.5 text-xs ${
                    pathname.startsWith("/account")
                      ? "bg-zinc-900 text-white border-zinc-700"
                      : ""
                  }`}
                  aria-label="Manage Account"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="max-w-[90px] truncate">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 h-8 px-2 text-xs"
                title="Sign out"
                aria-label="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-300 hover:text-white text-xs h-8 px-3"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 lg:hidden transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-950/98 backdrop-blur-xl px-4 py-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Mobile Quick Search Form */}
          <form onSubmit={handleMobileSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white"
              aria-label="Submit search"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-zinc-900 text-white font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm text-indigo-400 font-semibold flex items-center gap-2 hover:bg-zinc-900/60"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Console
              </Link>
            )}
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                pathname === "/cart"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Shopping Cart</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                ({cartCount})
              </span>
            </Link>
          </nav>

          {/* User Account / Auth Actions */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-zinc-200 hover:bg-zinc-900/60"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    <span>My Account ({user.name || user.email})</span>
                  </div>
                  {isAdmin && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/40 text-indigo-400 bg-indigo-500/10">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-950/20 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" className="w-full bg-indigo-600 text-white">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
