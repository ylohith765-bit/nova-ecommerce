import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product | NOVA Admin",
  description: "Create a new product in the store catalogue.",
};

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Products
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Add New Product
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure catalog item details, inventory counts, pricing, and media.
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm categories={categories} />
    </div>
  );
}
