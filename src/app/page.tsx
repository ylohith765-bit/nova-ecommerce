import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Database,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Terminal,
  Code2,
  Box,
} from "lucide-react";

export default function Home() {
  const foundations = [
    {
      title: "App Router & TypeScript",
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      desc: "Next.js 16 with React 19, strict TypeScript 5, and server component architecture.",
      status: "Configured",
    },
    {
      title: "PostgreSQL & Prisma ORM",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      desc: "Full schema defined: Users, Addresses, Products, Categories, Carts, Orders, Payments.",
      status: "Validated",
    },
    {
      title: "Auth.js Security",
      icon: <ShieldCheck className="w-5 h-5 text-violet-400" />,
      desc: "NextAuth v5 beta, bcryptjs password hashing, and role-based access control setup.",
      status: "Ready",
    },
    {
      title: "Stripe Payments (Test Mode)",
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      desc: "Stripe SDK client configured, strict server pricing calculation ready, webhook pipeline.",
      status: "Ready",
    },
    {
      title: "Zod & Form Validations",
      icon: <CheckCircle2 className="w-5 h-5 text-amber-400" />,
      desc: "Type-safe runtime schemas for authentication, products, addresses, and checkout.",
      status: "Ready",
    },
    {
      title: "Design System & UI",
      icon: <Box className="w-5 h-5 text-rose-400" />,
      desc: "Tailwind CSS v4 with modular UI primitives (Button, Input, Card, Badge, Skeleton).",
      status: "Active",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto w-full">
      {/* Header / Brand */}
      <header className="flex items-center justify-between pb-8 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              NOVA
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono font-normal">
                v0.1.0
              </span>
            </h1>
            <p className="text-xs text-zinc-500">Production E-Commerce Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success">Phase 1: Foundation Complete</Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
          <Code2 className="w-3.5 h-3.5" />
          <span>Architecture & Core Services Initialized</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1]">
          Engineered for speed, security, and scale.
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          The foundation for NOVA is operational. Configured with Next.js App Router,
          PostgreSQL with Prisma ORM, Auth.js authentication, Stripe test payments,
          and strict server-side validation.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="primary" size="lg">
              Explore Documentation
            </Button>
          </a>
          <a href="#architecture">
            <Button variant="outline" size="lg">
              View Foundation Modules
            </Button>
          </a>
        </div>
      </section>

      {/* Foundation Grid */}
      <section id="architecture" className="py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-400" />
            Initialized Foundation Modules
          </h3>
          <span className="text-xs text-zinc-500">Ready for Phase 2: Auth & Users</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foundations.map((item, index) => (
            <Card
              key={index}
              className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-all group"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-[11px]">
                    {item.status}
                  </Badge>
                </div>
                <CardTitle className="text-base text-zinc-100 pt-3">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 leading-relaxed">
                  {item.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© 2026 NOVA E-Commerce. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>PostgreSQL (Prisma)</span>
          <span>•</span>
          <span>NextAuth v5</span>
          <span>•</span>
          <span>Stripe Test Mode</span>
        </div>
      </footer>
    </main>
  );
}
