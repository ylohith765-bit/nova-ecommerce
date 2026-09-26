import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: product ? `Edit ${product.name} | NOVA Admin` : "Edit Product | NOVA Admin",
    description: "Update product attributes, inventory, and media.",
  };
}

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    stock: product.stock,
    categoryId: product.categoryId,
    images: product.images,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Edit &quot;{product.name}&quot;
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modify catalog details, update warehouse stock, and toggle active visibility.
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        categories={categories}
        initialData={initialData}
        isEdit={true}
      />
    </div>
  );
}
