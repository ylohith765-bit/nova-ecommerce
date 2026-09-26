"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  adminEmail: string;
  adminName?: string | null;
}

export function AdminSidebar({ adminEmail, adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      exact: false,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      exact: false,
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
      exact: false,
    },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
            N
          </div>
          <div>
            <span className="font-bold text-sm text-white">NOVA Admin</span>
            <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              Control Center
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          aria-label="Toggle admin navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] z-50 bg-zinc-950/95 border-b border-zinc-800 p-4 space-y-3 backdrop-blur-xl animate-in fade-in duration-150">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-zinc-800/80 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Store</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/20 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between shrink-0 min-h-screen border-r border-zinc-800/80 bg-zinc-950/95 p-5">
        <div className="space-y-6">
          {/* Brand & Badge */}
          <div className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                N
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block">
                  NOVA Admin
                </span>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
                  Management Console
                </span>
              </div>
            </Link>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-white truncate">
                  {adminName || "Administrator"}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">{adminEmail}</p>
              </div>
              <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-[10px] shrink-0">
                <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN
              </Badge>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-3 pb-1">
              Navigation
            </p>
            {navItems.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
            <span>Back to Storefront</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
