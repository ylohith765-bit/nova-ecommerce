"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  deleteProductAction,
  updateProductStockAction,
} from "@/actions/admin-actions";
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  X,
  Filter,
} from "lucide-react";

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  orderCount?: number;
}

interface ProductsTableProps {
  initialProducts: ProductRow[];
  categories: Array<{ id: string; name: string }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentSearch?: string;
  currentCategory?: string;
  currentStockStatus?: string;
  currentStatus?: string;
}

export function ProductsTable({
  initialProducts,
  categories,
  totalCount,
  totalPages,
  currentPage,
  currentSearch = "",
  currentCategory = "all",
  currentStockStatus = "all",
  currentStatus = "all",
}: ProductsTableProps) {
  const router = useRouter();

  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [search, setSearch] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);
  const [stockStatus, setStockStatus] = useState(currentStockStatus);
  const [status, setStatus] = useState(currentStatus);

  // Inline Stock Edit State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInputValue, setStockInputValue] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Deletion State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const applyFilters = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category && category !== "all") params.set("categoryId", category);
    if (stockStatus && stockStatus !== "all") params.set("stockStatus", stockStatus);
    if (status && status !== "all") params.set("status", status);

    Object.entries(newParams).forEach(([k, v]) => {
      if (v === "all" || v === "") {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });

    router.push(`/admin/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ page: 1, search });
  };

  // Inline Stock Update
  const handleStartStockEdit = (product: ProductRow) => {
    setEditingStockId(product.id);
    setStockInputValue(product.stock);
  };

  const handleSaveStock = async (productId: string) => {
    if (stockInputValue < 0) return;
    setIsUpdatingStock(true);
    setFeedback(null);

    try {
      const res = await updateProductStockAction(productId, stockInputValue);
      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to update stock.",
        });
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock: stockInputValue } : p
        )
      );
      setEditingStockId(null);
      setFeedback({
        type: "success",
        message: res.message || "Stock updated successfully.",
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Failed to update stock." });
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Delete Action
  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await deleteProductAction(productId);
      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to delete product.",
        });
        setConfirmDeleteId(null);
        return;
      }

      if (res.data?.wasDeactivated) {
        // Was deactivated rather than hard-deleted
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isActive: false } : p))
        );
      } else {
        // Hard deleted
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }

      setConfirmDeleteId(null);
      setFeedback({
        type: "success",
        message: res.message || "Product handled successfully.",
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Error deleting product." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-white underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title or slug..."
                className="pl-9 bg-zinc-900/90 border-zinc-800 text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
              Search
            </Button>
          </form>

          {/* Add Product CTA */}
          <Link href="/admin/products/new">
            <Button size="sm" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              applyFilters({ page: 1, categoryId: e.target.value });
            }}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Status Dropdown */}
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              applyFilters({ page: 1, stockStatus: e.target.value });
            }}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs focus:ring-indigo-500"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock (&gt; 10)</option>
            <option value="low_stock">Low Stock (&le; 10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Active Status Dropdown */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              applyFilters({ page: 1, status: e.target.value });
            }}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {(search || category !== "all" || stockStatus !== "all" || status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setStockStatus("all");
                setStatus("all");
                router.push("/admin/products");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Warehouse Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock <= 10 && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                            {p.images[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-600">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                            <span className="font-bold text-white block truncate">
                              {p.name}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 block truncate">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-zinc-300 font-medium">
                          {p.category.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">
                          {formatPrice(p.price)}
                        </span>
                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                          <span className="block text-[10px] text-zinc-500 line-through">
                            {formatPrice(p.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock with quick inline editor */}
                      <td className="py-3 px-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={stockInputValue}
                              onChange={(e) =>
                                setStockInputValue(Math.max(0, parseInt(e.target.value) || 0))
                              }
                              className="w-16 px-1.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveStock(p.id)}
                              disabled={isUpdatingStock}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save stock"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStockId(null)}
                              className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => handleStartStockEdit(p)}
                              className="font-bold cursor-pointer hover:underline text-white"
                              title="Click to edit stock"
                            >
                              {p.stock}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                isOut
                                  ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                                  : isLow
                                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                  : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              }`}
                            >
                              {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                            </Badge>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            p.isActive
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : "border-zinc-700 text-zinc-400 bg-zinc-800/40"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      {/* Created date */}
                      <td className="py-3 px-4 text-zinc-400 text-xs whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-indigo-950/30 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                            title="Delete / Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ page: currentPage - 1 })}
                disabled={currentPage <= 1}
                className="border-zinc-800 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ page: currentPage + 1 })}
                disabled={currentPage >= totalPages}
                className="border-zinc-800 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete or Deactivate Product?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to remove this product? If the product has historical customer orders, it will be <strong>safely deactivated</strong> so that historical receipts and orders remain 100% intact.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="border-zinc-700 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteProduct(confirmDeleteId)}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Processing...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
