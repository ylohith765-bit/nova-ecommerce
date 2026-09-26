import React from "react";
import { getAdminCategoriesAction } from "@/actions/admin-actions";
import { CategoriesManager } from "@/components/admin/categories-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories | NOVA Admin",
  description: "Manage product categories and store taxonomy.",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const result = await getAdminCategoriesAction();
  const categories = result.success && result.data ? result.data : [];

  return <CategoriesManager initialCategories={categories} />;
}
