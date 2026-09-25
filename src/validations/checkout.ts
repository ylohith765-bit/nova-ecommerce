import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(7, "Please enter a valid phone number"),
  street: z.string().trim().min(5, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State or region is required"),
  postalCode: z.string().trim().min(3, "Postal or ZIP code is required"),
  country: z.string().trim().default("United States"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSessionSchema = z.object({
  addressId: z.string().min(1, "Shipping address is required"),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
