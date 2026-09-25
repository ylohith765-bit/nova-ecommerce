import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/account/profile-form";
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Calendar,
  Package,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default async function AccountPage() {
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      _count: {
        select: {
          orders: true,
          addresses: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-zinc-400">Account not found.</p>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-600/20">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {user.name || "Customer"}
              </h1>
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className={isAdmin ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300"}
              >
                {user.role}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/account/orders">
            <Button variant="outline" size="sm" className="gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              <span>Orders ({user._count.orders})</span>
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-200 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="text-zinc-500">Account Role</p>
                <p className="font-semibold text-zinc-200 mt-0.5">{user.role}</p>
              </div>
              <div>
                <p className="text-zinc-500">Primary Email</p>
                <p className="font-mono text-zinc-300 mt-0.5 break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-zinc-500">Member Since</p>
                <p className="text-zinc-300 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800/80">
                <p className="text-zinc-500">Saved Addresses</p>
                <p className="text-zinc-300 mt-0.5">{user._count.addresses} address(es)</p>
              </div>
            </CardContent>
          </Card>

          {/* Role Policy Notice */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <p>
              Your security role is managed by the system administrator. Normal accounts cannot alter role privileges.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Profile & Quick Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Profile Settings</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Update your display name. Email address changes require administrative verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialName={user.name} />
            </CardContent>
          </Card>

          {/* Orders Teaser Card */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-white">Recent Orders</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Track, view receipts, and review past orders.
                </CardDescription>
              </div>
              <Link href="/account/orders">
                <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 text-xs gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {user._count.orders === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  No orders placed yet. Products you purchase will appear here.
                </div>
              ) : (
                <div className="text-xs text-zinc-400">
                  You have {user._count.orders} active or fulfilled order(s).
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
