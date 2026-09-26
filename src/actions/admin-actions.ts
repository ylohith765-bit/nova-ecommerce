"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema, categorySchema, ProductInput, CategoryInput } from "@/validations/product";
import { ActionResponse } from "@/types";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

// ============================================================================
// 1. DASHBOARD METRICS
// ============================================================================

export interface AdminDashboardMetrics {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    createdAt: Date;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: OrderStatus;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    stock: number;
    price: number;
    images: string[];
    categoryName: string;
  }>;
}

export async function getAdminDashboardMetricsAction(): Promise<
  ActionResponse<AdminDashboardMetrics>
> {
  try {
    await requireAdmin();

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      lowStockCount,
      outOfStockCount,
      revenueResult,
      recentOrdersRaw,
      lowStockProductsRaw,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      // Calculate revenue strictly from verified PAID orders
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true } },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        take: 6,
        orderBy: { stock: "asc" },
        include: {
          category: { select: { name: true } },
        },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.amount || 0);

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || "Customer",
      customerEmail: o.user?.email || "Unknown",
      createdAt: o.createdAt,
      totalAmount: Number(o.totalAmount),
      paymentStatus: o.payment?.status || "PENDING",
      orderStatus: o.status,
    }));

    const lowStockProducts = lowStockProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      stock: p.stock,
      price: Number(p.price),
      images: p.images,
      categoryName: p.category.name,
    }));

    return {
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        lowStockCount,
        outOfStockCount,
        totalRevenue,
        recentOrders,
        lowStockProducts,
      },
    };
  } catch (error) {
    console.error("getAdminDashboardMetricsAction error:", error);
    return {
      success: false,
      message: "Failed to retrieve admin dashboard metrics.",
    };
  }
}

// ============================================================================
// 2. PRODUCT MANAGEMENT ACTIONS
// ============================================================================

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  status?: "all" | "active" | "inactive";
  page?: number;
  limit?: number;
}

export async function getAdminProductsAction(params: ProductFilterParams = {}) {
  try {
    await requireAdmin();

    const {
      search = "",
      categoryId = "",
      stockStatus = "all",
      status = "all",
      page = 1,
      limit = 12,
    } = params;

    const where: Prisma.ProductWhereInput = {};

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (stockStatus === "in_stock") {
      where.stock = { gt: 10 };
    } else if (stockStatus === "low_stock") {
      where.stock = { lte: 10, gt: 0 };
    } else if (stockStatus === "out_of_stock") {
      where.stock = 0;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: {
        products: products.map((p) => ({
          ...p,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          orderCount: p._count.orderItems,
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("getAdminProductsAction error:", error);
    return {
      success: false,
      message: "Failed to fetch products.",
    };
  }
}

export async function createProductAction(
  data: ProductInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
  try {
    await requireAdmin();

    const validated = productSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid product information provided.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      images,
      categoryId,
      isFeatured,
      isActive,
    } = validated.data;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return {
        success: false,
        message: "The selected category does not exist.",
      };
    }

    // Verify slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return {
        success: false,
        message: `Product slug "${slug}" is already in use. Please provide a unique slug.`,
      };
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        compareAtPrice,
        stock,
        images,
        categoryId,
        isFeatured,
        isActive,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      message: `Product "${product.name}" created successfully.`,
      data: { id: product.id, slug: product.slug },
    };
  } catch (error) {
    console.error("createProductAction error:", error);
    return {
      success: false,
      message: "Failed to create product.",
    };
  }
}

export async function updateProductAction(
  id: string,
  data: ProductInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
  try {
    await requireAdmin();

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    const validated = productSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      images,
      categoryId,
      isFeatured,
      isActive,
    } = validated.data;

    // Category check
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return {
        success: false,
        message: "The selected category does not exist.",
      };
    }

    // Slug check excluding current product
    const duplicateSlug = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });
    if (duplicateSlug) {
      return {
        success: false,
        message: `Product slug "${slug}" is already in use by another product.`,
      };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        compareAtPrice,
        stock,
        images,
        categoryId,
        isFeatured,
        isActive,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      message: `Product "${updated.name}" updated successfully.`,
      data: { id: updated.id, slug: updated.slug },
    };
  } catch (error) {
    console.error("updateProductAction error:", error);
    return {
      success: false,
      message: "Failed to update product.",
    };
  }
}

/**
 * Safely deletes or deactivates a product. If historical OrderItems reference
 * this product, it is soft-deleted (deactivated) to preserve historical receipts.
 */
export async function deleteProductAction(
  id: string
): Promise<ActionResponse<{ wasDeactivated: boolean }>> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    // Check if referenced in historical orders
    if (product._count.orderItems > 0) {
      // Safe deactivation to preserve historical receipts and database integrity
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath("/admin/products");
      revalidatePath("/shop");
      revalidatePath("/");

      return {
        success: true,
        message: `Product "${product.name}" is referenced in ${product._count.orderItems} historical order(s). It has been safely deactivated to preserve past customer receipts.`,
        data: { wasDeactivated: true },
      };
    }

    // Safe hard delete if no historical orders reference it
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      message: `Product "${product.name}" deleted successfully.`,
      data: { wasDeactivated: false },
    };
  } catch (error) {
    console.error("deleteProductAction error:", error);
    return {
      success: false,
      message: "Failed to delete product.",
    };
  }
}

export async function updateProductStockAction(
  id: string,
  newStock: number
): Promise<ActionResponse<{ stock: number }>> {
  try {
    await requireAdmin();

    const stockInt = Math.floor(Number(newStock));
    if (isNaN(stockInt) || stockInt < 0) {
      return {
        success: false,
        message: "Stock must be a non-negative integer.",
      };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: stockInt },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/shop");

    return {
      success: true,
      message: `Stock for "${updated.name}" updated to ${stockInt}.`,
      data: { stock: updated.stock },
    };
  } catch (error) {
    console.error("updateProductStockAction error:", error);
    return {
      success: false,
      message: "Failed to update product stock.",
    };
  }
}

// ============================================================================
// 3. CATEGORY MANAGEMENT ACTIONS
// ============================================================================

export async function getAdminCategoriesAction() {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        ...c,
        productCount: c._count.products,
      })),
    };
  } catch (error) {
    console.error("getAdminCategoriesAction error:", error);
    return {
      success: false,
      message: "Failed to fetch categories.",
    };
  }
}

export async function createCategoryAction(
  data: CategoryInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const validated = categorySchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid category data.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, slug, description, image } = validated.data;

    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return {
        success: false,
        message: `Category slug "${slug}" already exists.`,
      };
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      message: `Category "${category.name}" created successfully.`,
      data: { id: category.id },
    };
  } catch (error) {
    console.error("createCategoryAction error:", error);
    return {
      success: false,
      message: "Failed to create category.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  data: CategoryInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const validated = categorySchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid category data.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, slug, description, image } = validated.data;

    const duplicate = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (duplicate) {
      return {
        success: false,
        message: `Category slug "${slug}" is already in use by another category.`,
      };
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      message: `Category "${updated.name}" updated successfully.`,
      data: { id: updated.id },
    };
  } catch (error) {
    console.error("updateCategoryAction error:", error);
    return {
      success: false,
      message: "Failed to update category.",
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    await requireAdmin();

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        message: `Cannot delete category "${category.name}" because it contains ${category._count.products} product(s). Please reassign or delete these products first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    };
  } catch (error) {
    console.error("deleteCategoryAction error:", error);
    return {
      success: false,
      message: "Failed to delete category.",
    };
  }
}

// ============================================================================
// 4. ORDER MANAGEMENT ACTIONS
// ============================================================================

export interface OrderFilterParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export async function getAdminOrdersAction(params: OrderFilterParams = {}) {
  try {
    await requireAdmin();

    const {
      search = "",
      status = "all",
      paymentStatus = "all",
      page = 1,
      limit = 12,
    } = params;

    const where: Prisma.OrderWhereInput = {};

    if (search.trim()) {
      where.OR = [
        { orderNumber: { contains: search.trim(), mode: "insensitive" } },
        { user: { name: { contains: search.trim(), mode: "insensitive" } } },
        { user: { email: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    if (status && status !== "all") {
      where.status = status as OrderStatus;
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.payment = { status: paymentStatus as PaymentStatus };
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: { select: { status: true, amount: true, paymentMethod: true } },
          shippingAddress: true,
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: {
        orders: orders.map((o) => ({
          ...o,
          subtotal: Number(o.subtotal),
          shippingFee: Number(o.shippingFee),
          tax: Number(o.tax),
          totalAmount: Number(o.totalAmount),
          itemCount: o.items.reduce((s, it) => s + it.quantity, 0),
          items: o.items.map((it) => ({
            ...it,
            price: Number(it.price),
          })),
          payment: o.payment
            ? {
                ...o.payment,
                amount: Number(o.payment.amount),
              }
            : null,
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("getAdminOrdersAction error:", error);
    return {
      success: false,
      message: "Failed to fetch orders.",
    };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResponse<{ status: OrderStatus }>> {
  try {
    await requireAdmin();

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: `Invalid order status: ${newStatus}`,
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);

    return {
      success: true,
      message: `Order #${order.orderNumber} status changed to ${newStatus}.`,
      data: { status: updated.status },
    };
  } catch (error) {
    console.error("updateOrderStatusAction error:", error);
    return {
      success: false,
      message: "Failed to update order status.",
    };
  }
}

// ============================================================================
// 5. CUSTOMER MANAGEMENT ACTIONS
// ============================================================================

export async function getAdminCustomersAction() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
      })),
    };
  } catch (error) {
    console.error("getAdminCustomersAction error:", error);
    return {
      success: false,
      message: "Failed to fetch customer list.",
    };
  }
}
