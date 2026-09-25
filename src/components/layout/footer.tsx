import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

export function Footer() {
  const perks = [
    {
      icon: <Truck className="w-5 h-5 text-indigo-400" />,
      title: "Complimentary Express Delivery",
      description: "On all qualifying orders over $150.",
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-emerald-400" />,
      title: "30-Day Effortless Returns",
      description: "Satisfaction guaranteed, no hassle.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-violet-400" />,
      title: "2-Year Hardware Warranty",
      description: "Engineered to last with premium materials.",
    },
    {
      icon: <Headphones className="w-5 h-5 text-cyan-400" />,
      title: "Dedicated Concierge Support",
      description: "Expert assistance available 24/7.",
    },
  ];

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-xs">
      {/* Value Perks Banner */}
      <div className="border-b border-zinc-800/60 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 shrink-0">
                {perk.icon}
              </div>
              <div>
                <h4 className="font-semibold text-zinc-200 text-xs">{perk.title}</h4>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand column */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-base">
              N
            </div>
            <span className="text-lg font-bold tracking-tight text-white">NOVA</span>
          </div>
          <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
            NOVA is a premier lifestyle & technology e-commerce brand designed with minimalist principles,
            high-fidelity craftsmanship, and uncompromising digital security.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-zinc-400">All systems operational • Stripe Verified</span>
          </div>
        </div>

        {/* Shop Category Links */}
        <div className="space-y-3">
          <h5 className="font-bold text-zinc-200 tracking-wider uppercase text-[11px]">Shop</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/shop" className="hover:text-white transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/shop?category=audio-headphones" className="hover:text-white transition-colors">
                Audio & Headphones
              </Link>
            </li>
            <li>
              <Link href="/shop?category=computing-peripherals" className="hover:text-white transition-colors">
                Computing
              </Link>
            </li>
            <li>
              <Link href="/shop?category=wearables-smartwatches" className="hover:text-white transition-colors">
                Wearables
              </Link>
            </li>
            <li>
              <Link href="/shop?category=minimalist-workspace" className="hover:text-white transition-colors">
                Workspace
              </Link>
            </li>
          </ul>
        </div>

        {/* Account Links */}
        <div className="space-y-3">
          <h5 className="font-bold text-zinc-200 tracking-wider uppercase text-[11px]">Account</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/account" className="hover:text-white transition-colors">
                My Profile
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-white transition-colors">
                Track Orders
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Company & Social */}
        <div className="space-y-3">
          <h5 className="font-bold text-zinc-200 tracking-wider uppercase text-[11px]">Company</h5>
          <ul className="space-y-2">
            <li>
              <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">About NOVA</span>
            </li>
            <li>
              <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">Sustainability</span>
            </li>
            <li>
              <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">Press & Media</span>
            </li>
            <li>
              <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">support@novastore.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} NOVA E-Commerce Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
