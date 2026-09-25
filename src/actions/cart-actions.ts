"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ActionResponse } from "@/types";

export interface CartItemDetail {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    images: string[];
    category: {
      name: string;
      slug: string;
    };
  };
  itemSubtotal: number;
}

export interface UserCartResponse {
  id: string;
  items: CartItemDetail[];
  subtotal: number;
  itemCount: number;
}

/**
 * Retrieves the authenticated user's current shopping cart with fresh DB prices and stock.
 */
export async function getCartAction(): Promise<ActionResponse<UserCartResponse | null>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "You must be signed in to view your cart.",
        data: null,
        requiresAuth: true,
      };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { name: true, slug: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: true,
        data: {
          id: cart?.id || "",
          items: [],
          subtotal: 0,
          itemCount: 0,
        },
      };
    }

    let subtotal = 0;
    let itemCount = 0;

    const formattedItems: CartItemDetail[] = cart.items.map((item) => {
      const price = Number(item.product.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      itemCount += item.quantity;

      return {
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price,
          compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
          stock: item.product.stock,
          images: item.product.images,
          category: {
            name: item.product.category.name,
            slug: item.product.category.slug,
          },
        },
        itemSubtotal,
      };
    });

    return {
      success: true,
      data: {
        id: cart.id,
        items: formattedItems,
        subtotal,
        itemCount,
      },
    };
  } catch (error) {
    console.error("getCartAction error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while loading your cart.",
      data: null,
    };
  }
}

/**
 * Returns the total quantity of items currently in the authenticated user's cart.
 */
export async function getCartCountAction(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return 0;

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          select: { quantity: true },
        },
      },
    });

    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

/**
 * Adds a product to the user's cart, validating real-time stock from the database.
 */
export async function addToCartAction(
  productId: string,
  quantity: number = 1
): Promise<ActionResponse<{ cartCount: number }>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "Please sign in to add products to your cart.",
        requiresAuth: true,
      };
    }

    const requestedQuantity = Math.floor(Number(quantity));
    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return {
        success: false,
        message: "Quantity must be at least 1.",
      };
    }

    // 1. Fetch live product from Supabase to verify existence and stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return {
        success: false,
        message: "This product is unavailable or no longer exists.",
      };
    }

    if (product.stock <= 0) {
      return {
        success: false,
        message: `"${product.name}" is currently out of stock.`,
      };
    }

    // 2. Ensure user has a Cart record
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    // 3. Check if this product is already in the user's cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    const newQuantity = existingCartItem
      ? existingCartItem.quantity + requestedQuantity
      : requestedQuantity;

    // 4. Strict server-side stock validation
    if (newQuantity > product.stock) {
      const alreadyInCart = existingCartItem ? existingCartItem.quantity : 0;
      return {
        success: false,
        message: alreadyInCart > 0
          ? `Cannot add ${requestedQuantity} more. You already have ${alreadyInCart} in your cart, and only ${product.stock} units are in stock.`
          : `Requested quantity (${newQuantity}) exceeds available stock (${product.stock} units).`,
      };
    }

    // 5. Create or update the CartItem
    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: newQuantity,
        },
      });
    }

    // 6. Calculate new total cart items count
    const totalCount = await getCartCountAction();

    revalidatePath("/cart");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: `Added ${requestedQuantity} × "${product.name}" to your cart.`,
      data: { cartCount: totalCount },
    };
  } catch (error) {
    console.error("addToCartAction error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while adding to cart.",
    };
  }
}

/**
 * Updates the quantity of an existing CartItem.
 */
export async function updateCartItemQuantityAction(
  cartItemId: string,
  newQuantity: number
): Promise<ActionResponse<{ quantity: number; cartCount: number }>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "Unauthorized.",
        requiresAuth: true,
      };
    }

    const targetQuantity = Math.floor(Number(newQuantity));
    if (isNaN(targetQuantity) || targetQuantity <= 0) {
      return {
        success: false,
        message: "Quantity must be at least 1.",
      };
    }

    // 1. Fetch CartItem and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      return {
        success: false,
        message: "Item not found in cart.",
      };
    }

    // Enforce that user can ONLY modify items in their own cart
    if (cartItem.cart.userId !== user.id) {
      return {
        success: false,
        message: "Unauthorized: You cannot modify another user's cart.",
      };
    }

    // 2. Validate against product active state and available product stock
    if (!cartItem.product.isActive) {
      return {
        success: false,
        message: `"${cartItem.product.name}" is no longer available.`,
      };
    }

    if (cartItem.product.stock <= 0) {
      return {
        success: false,
        message: `"${cartItem.product.name}" is currently out of stock.`,
      };
    }

    if (targetQuantity > cartItem.product.stock) {
      return {
        success: false,
        message: `Only ${cartItem.product.stock} units of "${cartItem.product.name}" are currently available in stock.`,
      };
    }

    // 3. Update quantity
    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: targetQuantity },
    });

    const totalCount = await getCartCountAction();

    revalidatePath("/cart");

    return {
      success: true,
      message: "Cart updated.",
      data: { quantity: updated.quantity, cartCount: totalCount },
    };
  } catch (error) {
    console.error("updateCartItemQuantityAction error:", error);
    return {
      success: false,
      message: "Failed to update quantity. Please try again.",
    };
  }
}

/**
 * Removes a single item from the authenticated user's cart.
 */
export async function removeCartItemAction(
  cartItemId: string
): Promise<ActionResponse<{ cartCount: number }>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "Unauthorized.",
        requiresAuth: true,
      };
    }

    // Fetch and check ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return {
        success: false,
        message: "Item not found in cart.",
      };
    }

    if (cartItem.cart.userId !== user.id) {
      return {
        success: false,
        message: "Unauthorized: You cannot modify another user's cart.",
      };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    const totalCount = await getCartCountAction();

    revalidatePath("/cart");

    return {
      success: true,
      message: "Item removed from your cart.",
      data: { cartCount: totalCount },
    };
  } catch (error) {
    console.error("removeCartItemAction error:", error);
    return {
      success: false,
      message: "Failed to remove item. Please try again.",
    };
  }
}

/**
 * Clears all items from the authenticated user's cart.
 */
export async function clearCartAction(): Promise<ActionResponse<{ cartCount: number }>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "Unauthorized.",
        requiresAuth: true,
      };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    revalidatePath("/cart");

    return {
      success: true,
      message: "Your cart has been cleared.",
      data: { cartCount: 0 },
    };
  } catch (error) {
    console.error("clearCartAction error:", error);
    return {
      success: false,
      message: "Failed to clear cart. Please try again.",
    };
  }
}
