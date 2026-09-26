"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export interface CustomerRecord {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  orderCount: number;
}

interface CustomersTableProps {
  customers: CustomerRecord[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || c.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Filter Role:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="USER">Customers (USER)</option>
            <option value="ADMIN">Administrators (ADMIN)</option>
          </select>

          {(searchTerm || roleFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Customer</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Member Since</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-base font-medium">No customers found</p>
                    <p className="text-xs mt-1">Try adjusting your search query.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                          {user.name ? user.name.slice(0, 2) : user.email.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {user.name || "Unnamed Account"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold text-xs">
                          <ShieldAlert className="h-3 w-3" />
                          ADMIN
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 font-normal text-xs text-muted-foreground">
                          <ShieldCheck className="h-3 w-3" />
                          USER
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground">
                        {user.orderCount}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        {user.orderCount === 1 ? "order" : "orders"}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      {user.orderCount > 0 ? (
                        <Link href={`/admin/orders?search=${encodeURIComponent(user.email)}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                            View Orders ({user.orderCount})
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No orders yet
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-3 sm:px-6 text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCustomers.length}</span> of{" "}
          <span className="font-semibold text-foreground">{customers.length}</span> registered users
        </div>
      </div>
    </div>
  );
}
