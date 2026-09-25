import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().url("Image must be a valid URL")).min(1, "At least one product image is required"),
  categoryId: z.string().min(1, "Please select a category"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().optional(),
  image: z.string().url("Must be a valid URL").optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
