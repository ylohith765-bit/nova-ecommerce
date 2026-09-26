"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/admin-actions";
import { formatDate } from "@/lib/utils";
import {
  FolderPlus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Boxes,
  X,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  productCount: number;
}

interface CategoriesManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // Dialog / Modal state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Delete confirmation state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Status & feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const openCreateModal = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setSelectedCategory(null);
    setFeedback(null);
    setModalMode("create");
  };

  const openEditModal = (cat: CategoryItem) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setFeedback(null);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (modalMode === "create") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFeedback({
        type: "error",
        message: "Category name and slug are required.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (modalMode === "create") {
        const res = await createCategoryAction({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          image: image.trim() || undefined,
        });

        if (res.success && res.data) {
          setCategories((prev) => [
            ...prev,
            {
              id: res.data!.id,
              name: name.trim(),
              slug: slug.trim(),
              description: description.trim() || null,
              image: image.trim() || null,
              createdAt: new Date(),
              productCount: 0,
            },
          ]);
          setFeedback({
            type: "success",
            message: res.message || "Category created successfully.",
          });
          closeModal();
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Failed to create category.",
          });
        }
      } else if (modalMode === "edit" && selectedCategory) {
        const res = await updateCategoryAction(selectedCategory.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          image: image.trim() || undefined,
        });

        if (res.success) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === selectedCategory.id
                ? {
                    ...c,
                    name: name.trim(),
                    slug: slug.trim(),
                    description: description.trim() || null,
                    image: image.trim() || null,
                  }
                : c
            )
          );
          setFeedback({
            type: "success",
            message: res.message || "Category updated successfully.",
          });
          closeModal();
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Failed to update category.",
          });
        }
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await deleteCategoryAction(categoryToDelete.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setFeedback({
          type: "success",
          message: res.message || "Category deleted successfully.",
        });
        setCategoryToDelete(null);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Failed to delete category.",
        });
        setCategoryToDelete(null);
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred deleting category.",
      });
      setCategoryToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product taxonomy, category slugs, and catalog groupings.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0">
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>
      )}

      {/* Categories Table / Card Grid */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Category</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Boxes className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-base font-medium">No categories found</p>
                    <p className="text-xs mt-1">Click &quot;Add Category&quot; to create your first category.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{cat.name}</div>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground font-mono text-xs">
                      /{cat.slug}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="font-medium">
                        {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(cat.createdAt)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(cat)}
                        className="h-8 px-2.5 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryToDelete(cat)}
                        className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Category */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-md shadow-2xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">
                  {modalMode === "create" ? "Add New Category" : `Edit "${selectedCategory?.name}"`}
                </CardTitle>
                <CardDescription className="text-xs">
                  {modalMode === "create"
                    ? "Specify name and slug for catalog filtering."
                    : "Update details for this category."}
                </CardDescription>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Audio & Headphones"
                    value={name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    URL Slug <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. audio-headphones"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used in search and filter URLs: /shop?category={slug || "slug"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Description <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of products in this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Cover Image URL <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : modalMode === "create" ? (
                      "Create Category"
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-md shadow-2xl border-destructive/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Delete Category?</CardTitle>
                  <CardDescription className="text-xs">
                    Confirm deletion of &quot;{categoryToDelete.name}&quot;
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <p className="text-sm text-muted-foreground">
                {categoryToDelete.productCount > 0 ? (
                  <span className="text-destructive font-medium">
                    Warning: This category currently contains {categoryToDelete.productCount} product(s).
                    The database relationship will block deletion until all products in this category are reassigned or removed.
                  </span>
                ) : (
                  <span>
                    Are you sure you want to delete this category? This action cannot be undone.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCategoryToDelete(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
