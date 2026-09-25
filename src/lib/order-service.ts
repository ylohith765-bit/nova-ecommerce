import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

interface ProcessPaymentParams {
  sessionId: string;
}

/**
 * Idempotently processes a verified Stripe checkout session,
 * creates the Order, OrderItems, Payment record, safely decrements stock,
 * and clears the authenticated user's cart.
 */
export async function processSuccessfulPayment({ sessionId }: ProcessPaymentParams) {
  // 1. First check if order already exists for this Stripe session (fast idempotency exit)
  const existingOrder = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      items: true,
      payment: true,
      shippingAddress: true,
    },
  });

  if (existingOrder) {
    return {
      success: true,
      alreadyProcessed: true,
      order: existingOrder,
    };
  }

  // 2. Fetch session from Stripe to verify authoritative payment status
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "line_items.data.price.product"],
  });

  if (session.payment_status !== "paid") {
    throw new Error(
      `Cannot create order: Stripe session ${sessionId} has payment_status '${session.payment_status}', expected 'paid'.`
    );
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error(`Stripe session ${sessionId} is missing required userId in metadata.`);
  }

  // 3. Resolve shipping address
  let addressId = session.metadata?.addressId;

  if (addressId) {
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!existingAddress || existingAddress.userId !== userId) {
      addressId = undefined;
    }
  }

  // If no valid addressId from metadata, look for user's default address or create from customer details
  if (!addressId) {
    const defaultAddress = await prisma.address.findFirst({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    if (defaultAddress) {
      addressId = defaultAddress.id;
    } else {
      // Create a fallback address from Stripe customer/shipping details
      const customerDetails = session.customer_details;
      const createdAddress = await prisma.address.create({
        data: {
          userId,
          fullName: customerDetails?.name || "Customer",
          phone: customerDetails?.phone || "N/A",
          street: customerDetails?.address?.line1 || "Standard Delivery",
          city: customerDetails?.address?.city || "New York",
          state: customerDetails?.address?.state || "NY",
          postalCode: customerDetails?.address?.postal_code || "10001",
          country: customerDetails?.address?.country || "United States",
          isDefault: true,
        },
      });
      addressId = createdAddress.id;
    }
  }

  // 4. Resolve line items to purchase
  // First, check line items from Stripe
  const lineItems = session.line_items?.data || [];
  const itemsToCreate: Array<{
    productId: string;
    productTitle: string;
    productImage: string;
    price: number;
    quantity: number;
  }> = [];

  // Look up user's active cart as well
  const userCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (lineItems.length > 0) {
    for (const item of lineItems) {
      const productObj = item.price?.product as Stripe.Product | undefined;
      let productId = productObj?.metadata?.productId;

      // If productId wasn't in metadata, match by cart items or product name
      if (!productId && userCart) {
        const matchedCartItem = userCart.items.find(
          (ci) => ci.product.name.toLowerCase() === (item.description || "").toLowerCase()
        );
        if (matchedCartItem) {
          productId = matchedCartItem.productId;
        }
      }

      if (!productId) {
        // Fallback: look up product by name in database
        const dbProduct = await prisma.product.findFirst({
          where: { name: item.description || "" },
        });
        productId = dbProduct?.id;
      }

      if (productId) {
        const dbProduct = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (dbProduct) {
          const unitPrice = item.price?.unit_amount
            ? item.price.unit_amount / 100
            : Number(dbProduct.price);

          itemsToCreate.push({
            productId: dbProduct.id,
            productTitle: dbProduct.name,
            productImage: dbProduct.images[0] || "",
            price: unitPrice,
            quantity: item.quantity || 1,
          });
        }
      }
    }
  }

  // If Stripe line items could not be parsed, fall back to user's cart items
  if (itemsToCreate.length === 0 && userCart && userCart.items.length > 0) {
    for (const ci of userCart.items) {
      itemsToCreate.push({
        productId: ci.productId,
        productTitle: ci.product.name,
        productImage: ci.product.images[0] || "",
        price: Number(ci.product.price),
        quantity: ci.quantity,
      });
    }
  }

  if (itemsToCreate.length === 0) {
    throw new Error(
      `No line items could be resolved for checkout session ${sessionId} and user ${userId}.`
    );
  }

  // 5. Calculate financials
  let subtotal = 0;
  itemsToCreate.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  const totalAmount = session.amount_total
    ? session.amount_total / 100
    : subtotal;
  const shippingFee = subtotal >= 150 ? 0 : 15;
  const tax = Math.max(0, Number((totalAmount - subtotal - shippingFee).toFixed(2)));

  // Generate clean, readable order number
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `NOVA-${timestamp}-${randomSuffix}`;

  // 6. Execute atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Re-check idempotency within transaction lock
    const alreadyDone = await tx.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        items: true,
        payment: true,
        shippingAddress: true,
      },
    });

    if (alreadyDone) {
      return alreadyDone;
    }

    // Safely update product stock
    for (const item of itemsToCreate) {
      const currentProduct = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (currentProduct) {
        // Safe decrement preventing negative stock
        const newStock = Math.max(0, currentProduct.stock - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });
      }
    }

    // Create Order and OrderItems
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "PROCESSING",
        subtotal,
        tax,
        shippingFee,
        totalAmount,
        shippingAddressId: addressId!,
        stripeSessionId: sessionId,
        items: {
          create: itemsToCreate.map((item) => ({
            productId: item.productId,
            productTitle: item.productTitle,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    // Create Payment record
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntentId,
        amount: totalAmount,
        currency: session.currency || "usd",
        status: "PAID",
        paymentMethod: session.payment_method_types?.[0] || "card",
      },
    });

    // Clear user's purchased cart
    if (userCart) {
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });
    }

    return {
      ...order,
      payment,
    };
  });

  return {
    success: true,
    alreadyProcessed: false,
    order: result,
  };
}
