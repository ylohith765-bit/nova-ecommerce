"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { ActionResponse } from "@/types";

export interface CheckoutSummary {
  items: Array<{
    id: string;
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
    subtotal: number;
    stock: number;
  }>;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  addresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

/**
 * Fetches the verified server-side summary of items and totals for checkout.
 */
export async function getCheckoutSummaryAction(): Promise<
  ActionResponse<CheckoutSummary>
> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "You must be signed in to access checkout.",
        requiresAuth: true,
      };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty. Please add products to check out.",
      };
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      // Validate product existence and active status
      if (!item.product || !item.product.isActive) {
        return {
          success: false,
          message: `Product "${item.product?.name || "Unknown"}" is no longer available.`,
        };
      }

      // Validate stock
      if (item.quantity > item.product.stock) {
        return {
          success: false,
          message: `Quantity for "${item.product.name}" (${item.quantity}) exceeds available stock (${item.product.stock}). Please adjust your cart.`,
        };
      }

      const unitPrice = Number(item.product.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0] || "",
        price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        stock: item.product.stock,
      });
    }

    const shippingFee = subtotal >= 150 ? 0 : 15;
    const tax = Number((subtotal * 0.08).toFixed(2)); // 8% estimated tax
    const total = Number((subtotal + shippingFee + tax).toFixed(2));

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: {
        items: validatedItems,
        subtotal,
        shippingFee,
        tax,
        total,
        addresses,
      },
    };
  } catch (error) {
    console.error("getCheckoutSummaryAction error:", error);
    return {
      success: false,
      message: "An error occurred while preparing your checkout.",
    };
  }
}

export interface AddressInput {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

/**
 * Creates and associates a new shipping address for the authenticated user.
 */
export async function createShippingAddressAction(
  data: AddressInput
): Promise<ActionResponse<{ addressId: string }>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "Unauthorized.",
        requiresAuth: true,
      };
    }

    if (!data.fullName || !data.street || !data.city || !data.state || !data.postalCode) {
      return {
        success: false,
        message: "Please fill in all required shipping address fields.",
      };
    }

    // If marked default, unset previous default
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is the first address, make it default if so
    const existingCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || "N/A",
        street: data.street.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country?.trim() || "United States",
        isDefault: existingCount === 0 ? true : !!data.isDefault,
      },
    });

    return {
      success: true,
      message: "Shipping address saved successfully.",
      data: { addressId: newAddress.id },
    };
  } catch (error) {
    console.error("createShippingAddressAction error:", error);
    return {
      success: false,
      message: "Failed to save shipping address.",
    };
  }
}

/**
 * Creates a Stripe Checkout Session in TEST mode using verified database values.
 */
export async function createCheckoutSessionAction(
  addressId: string
): Promise<ActionResponse<{ sessionUrl: string }>> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "You must be signed in to proceed with checkout.",
        requiresAuth: true,
      };
    }

    if (!addressId) {
      return {
        success: false,
        message: "Please select or provide a valid shipping address.",
      };
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== user.id) {
      return {
        success: false,
        message: "Invalid shipping address selected.",
      };
    }

    // Fetch user's cart from PostgreSQL
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty.",
      };
    }

    // Strict stock & pricing verification
    let subtotal = 0;
    const stripeLineItems = [];

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return {
          success: false,
          message: `Product "${item.product?.name || "Unknown"}" is no longer available.`,
        };
      }

      if (item.quantity > item.product.stock) {
        return {
          success: false,
          message: `Requested quantity for "${item.product.name}" exceeds warehouse stock (${item.product.stock} units available).`,
        };
      }

      const unitPrice = Number(item.product.price);
      subtotal += unitPrice * item.quantity;

      // Construct Stripe line item with amount in smallest currency unit (cents)
      stripeLineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description.slice(0, 200),
            images: item.product.images?.length > 0 ? [item.product.images[0]] : [],
            metadata: {
              productId: item.productId,
            },
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.quantity,
      });
    }

    // Shipping fee line item if applicable
    const shippingFee = subtotal >= 150 ? 0 : 15;
    if (shippingFee > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Standard Insured Shipping",
            description: "Delivered within 3-5 business days",
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }

    // Estimated tax line item
    const tax = Number((subtotal * 0.08).toFixed(2));
    if (tax > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Estimated Sales Tax (8%)",
            description: "State & local sales taxes",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: stripeLineItems,
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        addressId: address.id,
        cartId: cart.id,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
    });

    if (!session.url) {
      return {
        success: false,
        message: "Failed to generate Stripe checkout session URL.",
      };
    }

    return {
      success: true,
      message: "Stripe Checkout session created.",
      data: { sessionUrl: session.url },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Stripe checkout error";
    console.error("createCheckoutSessionAction error:", error);

    if (errorMsg.includes("Invalid API Key") || errorMsg.includes("placeholder")) {
      return {
        success: false,
        message:
          "Stripe Test Mode requires a valid Stripe Secret Key. Please configure STRIPE_SECRET_KEY in your .env file.",
      };
    }

    return {
      success: false,
      message: `Failed to initiate payment: ${errorMsg}`,
    };
  }
}
