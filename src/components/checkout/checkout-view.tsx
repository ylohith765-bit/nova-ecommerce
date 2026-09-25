"use client";

import React, { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckoutSummary,
  createShippingAddressAction,
  createCheckoutSessionAction,
  AddressInput,
} from "@/actions/checkout-actions";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

interface CheckoutViewProps {
  initialSummary: CheckoutSummary;
}

export function CheckoutView({ initialSummary }: CheckoutViewProps) {
  const [summary] = useState<CheckoutSummary>(initialSummary);
  const [addresses, setAddresses] = useState(initialSummary.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialSummary.addresses.find((a) => a.isDefault)?.id ||
      initialSummary.addresses[0]?.id ||
      ""
  );

  const [showNewAddressForm, setShowNewAddressForm] = useState(
    initialSummary.addresses.length === 0
  );
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success" | "info";
    message: string;
  } | null>(null);

  // Address form fields
  const [addressForm, setAddressForm] = useState<AddressInput>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    isDefault: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSavingAddress(true);

    try {
      const res = await createShippingAddressAction(addressForm);
      if (!res.success || !res.data) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to save address.",
        });
        return;
      }

      const newAddr = {
        id: res.data.addressId,
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country || "United States",
        isDefault: !!addressForm.isDefault,
      };

      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddressId(newAddr.id);
      setShowNewAddressForm(false);
      setFeedback({
        type: "success",
        message: "Shipping address saved successfully.",
      });
    } catch (err) {
      console.error("Save address error:", err);
      setFeedback({
        type: "error",
        message: "Failed to save address. Please try again.",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleProceedToPayment = async () => {
    setFeedback(null);

    if (!selectedAddressId) {
      setFeedback({
        type: "error",
        message: "Please select or add a shipping address before proceeding.",
      });
      return;
    }

    setIsRedirecting(true);

    try {
      const res = await createCheckoutSessionAction(selectedAddressId);

      if (!res.success || !res.data?.sessionUrl) {
        setFeedback({
          type: "error",
          message: res.message || "Failed to initiate Stripe Checkout session.",
        });
        setIsRedirecting(false);
        return;
      }

      // Redirect to Stripe Hosted Checkout
      window.location.href = res.data.sessionUrl;
    } catch (err) {
      console.error("Stripe Checkout error:", err);
      setFeedback({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200 ${
            feedback.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Details (7 cols) + Right Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping Address & Review */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Shipping Address Selection */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Shipping Address</h2>
              </div>

              {addresses.length > 0 && !showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              )}
            </div>

            {/* Existing Addresses List */}
            {addresses.length > 0 && !showNewAddressForm && (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <label
                      key={addr.id}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-950/30"
                          : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress"
                          value={addr.id}
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-300 mt-0.5">{addr.street}</p>
                          <p className="text-zinc-400">
                            {addr.city}, {addr.state} {addr.postalCode},{" "}
                            {addr.country}
                          </p>
                          <p className="text-zinc-500 text-[11px] mt-1">
                            Phone: {addr.phone}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="space-y-4 pt-2 border-t border-zinc-800/80 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Enter Shipping Information
                  </h3>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Full Recipient Name *
                    </label>
                    <Input
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Street Address *
                  </label>
                  <Input
                    name="street"
                    value={addressForm.street}
                    onChange={handleInputChange}
                    placeholder="123 Innovation Way, Apt 4B"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      City *
                    </label>
                    <Input
                      name="city"
                      value={addressForm.city}
                      onChange={handleInputChange}
                      placeholder="San Francisco"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      State / Province *
                    </label>
                    <Input
                      name="state"
                      value={addressForm.state}
                      onChange={handleInputChange}
                      placeholder="CA"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs text-zinc-400 mb-1">
                      Postal Code *
                    </label>
                    <Input
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={handleInputChange}
                      placeholder="94103"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleInputChange}
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isDefault" className="text-xs text-zinc-300 cursor-pointer">
                    Set as my default shipping address
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingAddress}
                  size="md"
                  className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving Address...
                    </>
                  ) : (
                    "Save & Use This Address"
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Section 2: Items Review Snapshot */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Purchasing Items ({summary.items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
              <NextLink
                href="/cart"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Modify Cart
              </NextLink>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {summary.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-600">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Qty: {item.quantity} &bull; Unit: {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white shrink-0">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Proceed CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md space-y-6 shadow-xl shadow-black/30">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" /> Shipping
                </span>
                <span>
                  {summary.shippingFee === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    formatPrice(summary.shippingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Estimated Sales Tax (8%)</span>
                <span>{formatPrice(summary.tax)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-baseline justify-between">
                <span className="text-base font-bold text-white">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">
                    {formatPrice(summary.total)}
                  </span>
                  <span className="block text-[11px] text-zinc-500">
                    USD &bull; Stripe Test Mode
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Proceed CTA */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={isRedirecting || !selectedAddressId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 text-base gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted 256-bit SSL via Stripe Checkout</span>
              </div>
            </div>
          </div>

          {/* Test Mode Guidelines Notice */}
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-indigo-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Stripe Test Mode Environment</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-300/80">
              No real card will be charged. On the Stripe checkout screen, you can use the official test card:
            </p>
            <p className="font-mono text-xs bg-indigo-900/40 p-1.5 rounded border border-indigo-500/30 text-white">
              4242 &bull; 4242 &bull; 4242 &bull; 4242
            </p>
            <p className="text-[10px] text-zinc-400">
              Expiry: any future date &bull; CVC: any 3 digits &bull; Postal: any valid code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
