"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductInput } from "@/validations/product";
import {
  createProductAction,
  updateProductAction,
} from "@/actions/admin-actions";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: ProductInput & { id?: string };
  isEdit?: boolean;
}

export function ProductForm({
  categories,
  initialData,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState<string>(
    initialData?.price !== undefined ? String(initialData.price) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialData?.compareAtPrice ? String(initialData.compareAtPrice) : ""
  );
  const [stock, setStock] = useState<string>(
    initialData?.stock !== undefined ? String(initialData.stock) : "0"
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || ""
  );
  const [imagesText, setImagesText] = useState(
    initialData?.images?.join("\n") || ""
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-generate slug from name in creation mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEdit) {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Parse image URLs from multiline string
    const imageList = imagesText
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (imageList.length === 0) {
      setFeedback({
        type: "error",
        message: "Please provide at least one valid image URL for the product.",
      });
      return;
    }

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock, 10);
    const numericCompare = compareAtPrice ? parseFloat(compareAtPrice) : null;

    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFeedback({
        type: "error",
        message: "Price must be a valid positive number.",
      });
      return;
    }

    if (isNaN(numericStock) || numericStock < 0) {
      setFeedback({
        type: "error",
        message: "Stock must be a non-negative integer.",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: ProductInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      price: numericPrice,
      compareAtPrice: numericCompare,
      stock: numericStock,
      categoryId,
      images: imageList,
      isFeatured,
      isActive,
    };

    try {
      let res;
      if (isEdit && initialData?.id) {
        res = await updateProductAction(initialData.id, payload);
      } else {
        res = await createProductAction(payload);
      }

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to save product.",
        });
        setIsSubmitting(false);
        return;
      }

      setFeedback({
        type: "success",
        message: res.message || "Product saved successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: "An unexpected error occurred while saving the product.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <p className="font-semibold">{feedback.message}</p>
        </div>
      )}

      {/* Main Form Sections */}
      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Package className="w-4 h-4" />
            General Product Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Product Title *
              </label>
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. NOVA ANC Acoustic Studio Pro"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Product Slug *
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. nova-anc-acoustic-pro"
                required
              />
              <span className="text-[11px] text-zinc-500">
                Lowercase letters, numbers, and hyphens only
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description * (Minimum 10 characters)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detailed product features, materials, technical specifications..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Product Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs sm:text-sm focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Pricing &amp; Inventory Stock
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Selling Price ($ USD) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299.00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Compare-at Price ($ USD, optional)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="349.00"
              />
              <span className="text-[11px] text-zinc-500">Shows strikethrough discount</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Warehouse Stock (Units) *
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Product Images */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Product Images
          </h2>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Image URLs (One per line or comma-separated) *
            </label>
            <textarea
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              rows={3}
              placeholder="https://images.unsplash.com/photo-..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono text-xs focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-[11px] text-zinc-500">
              The first image URL will be used as the primary catalog thumbnail.
            </span>
          </div>
        </div>

        {/* Section 4: Visibility & Status */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Publishing Status
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="text-white font-medium">Active (Visible in Storefront &amp; Shop)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="text-white font-medium">Featured (Highlighted on Homepage)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
        <Link href="/admin/products">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="border-zinc-800 text-zinc-300 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 shadow-lg shadow-indigo-600/25"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Saving Product...</span>
            </>
          ) : isEdit ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
