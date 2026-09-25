import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOVA | Modern Full-Stack E-Commerce",
  description:
    "Production-style full-stack e-commerce platform engineered with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, and Stripe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
