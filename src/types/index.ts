export type Role = "USER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  image?: string | null;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  requiresAuth?: boolean;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  categoryName?: string;
}

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: ProductSummary;
}

export interface CartSummary {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
}
