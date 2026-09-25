import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Fetch real counts from Supabase database
  const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/account"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> My Account
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            NOVA Administration Console
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authenticated Administrator: <span className="text-zinc-200 font-medium">{admin.email}</span>
          </p>
        </div>

        <Badge variant="success" className="self-start sm:self-auto py-1 px-3">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Admin Access Verified
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Total Users</CardTitle>
            <Users className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userCount}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Registered customers & admins</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Catalog Products</CardTitle>
            <Package className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{productCount}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Active items in Supabase</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Categories</CardTitle>
            <FolderTree className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{categoryCount}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Taxonomy collections</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Customer Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{orderCount}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Processed transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Role-based Authorization Documentation */}
      <Card className="bg-zinc-900/40 border-zinc-800 p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Role-Based Access Control (RBAC) Status
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
          This route (<code className="text-indigo-300 font-mono bg-indigo-950/50 px-1 py-0.5 rounded">/admin</code>)
          is guarded both at the network boundary (<code className="text-zinc-300 font-mono">proxy.ts</code>) and at the
          server component layer using <code className="text-zinc-300 font-mono">requireAdmin()</code>. Non-admin users
          attempting to navigate here are redirected immediately to their account page with an authorization error.
        </p>
      </Card>
    </div>
  );
}
