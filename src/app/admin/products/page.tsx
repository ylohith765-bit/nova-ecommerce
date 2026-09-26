import React from "react";
import Link from "next/link";
import {
  getAdminProductsAction,
  getAdminCategoriesAction,
} from "@/actions/admin-actions";
import { ProductsTable, ProductRow } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products Management | NOVA Admin",
  description: "Create, edit, manage stock, and delete store catalog products.",
};

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
    status?: "all" | "active" | "inactive";
    page?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const {
    search = "",
    categoryId = "all",
    stockStatus = "all",
    status = "all",
    page = "1",
  } = await searchParams;

  const pageNumber = Math.max(1, parseInt(page) || 1);

  const [productsRes, categoriesRes] = await Promise.all([
    getAdminProductsAction({
      search,
      categoryId,
      stockStatus,
      status,
      page: pageNumber,
      limit: 12,
    }),
    getAdminCategoriesAction(),
  ]);

  const productsData = productsRes.data || {
    products: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  };

  const categories = categoriesRes.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Product Catalog Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Maintain product listings, warehouse stock allocations, and pricing.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5 shadow-lg shadow-indigo-600/25">
            <Plus className="w-4 h-4" />
            <span>Create New Product</span>
          </Button>
        </Link>
      </div>

      {/* Interactive Products Table Component */}
      <ProductsTable
        initialProducts={productsData.products as ProductRow[]}
        categories={categories}
        totalCount={productsData.totalCount}
        totalPages={productsData.totalPages}
        currentPage={productsData.currentPage}
        currentSearch={search}
        currentCategory={categoryId}
        currentStockStatus={stockStatus}
        currentStatus={status}
      />
    </div>
  );
}
