# NOVA — Production Full-Stack E-Commerce Platform

NOVA is a modern, high-performance, full-stack e-commerce web application engineered with the **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, **Auth.js (NextAuth v5)**, and **Stripe Test Mode**.

---

## ✨ Features

- **Public Storefront**: Responsive product catalog, faceted filtering, search, category navigation, sorting, and dynamic product detail pages.
- **Authentication & Security**: Auth.js (NextAuth v5) credentials strategy, secure `bcryptjs` password hashing, protected user routes, and Role-Based Access Control (RBAC).
- **Cart & Wishlist**: Persistent shopping cart with real-time stock boundary enforcement and item favoriting.
- **Secure Stripe Checkout**: Test-mode Stripe Checkout integration with strict server-side price calculation and webhook signature verification (`stripe.webhooks.constructEvent`).
- **Transactional Order Processing**: Atomic order creation, inventory deduction, and cart clearance via Prisma transactions (`$transaction`).
- **Admin Management Portal**: Administrative dashboard with live revenue metrics, inventory tracking, low-stock alerts, product/category CRUD, and order fulfillment status updates.
- **Design System**: Built with modern typography, dark mode foundation, fluid micro-interactions, responsive mobile layouts, and custom UI primitives.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16 (App Router)** | Hybrid Server/Client components, SSR, SEO, Server Actions, Route Handlers |
| **React 19** | Modern UI primitives and concurrent rendering |
| **TypeScript 5** | End-to-end type safety |
| **Tailwind CSS v4** | Modern, tokenized utility styling |
| **PostgreSQL** | Relational data persistence |
| **Prisma ORM 6.4.1** | Type-safe database client, schema migrations, and relational modeling |
| **Auth.js / NextAuth v5** | Secure credential authentication, password hashing (`bcryptjs`), and RBAC |
| **Stripe SDK** | Test-mode payment checkout and webhook verification |
| **Zod** | Runtime schema validation for forms, APIs, and environment variables |
| **React Hook Form** | High-performance, declarative form state management |
| **Lucide Icons** | Consistent, modern iconography |

---

## 📁 Project Structure

```
nova-ecommerce/
├── prisma/
│   └── schema.prisma           # Complete PostgreSQL schema (Users, Products, Carts, Orders, Payments)
├── public/                     # Static assets, brand images
├── src/
│   ├── actions/                # Next.js Server Actions (Mutations & safe execution wrappers)
│   ├── app/                    # Next.js App Router pages, layouts, and route handlers
│   │   ├── globals.css         # Global design system & theme variables
│   │   ├── layout.tsx          # Root layout with fonts, metadata, and themes
│   │   └── page.tsx            # Foundation landing & status overview
│   ├── components/
│   │   └── ui/                 # Reusable atomic UI components (Button, Input, Card, Badge, Skeleton)
│   ├── hooks/                  # Custom React hooks (e.g. useDebounce)
│   ├── lib/
│   │   ├── env.ts              # Zod runtime environment variable validation
│   │   ├── prisma.ts           # Singleton Prisma client instance
│   │   ├── stripe.ts           # Stripe client in Test Mode
│   │   └── utils.ts            # Classnames merger (cn), currency and date formatters
│   ├── types/
│   │   └── index.ts            # Global TypeScript interfaces, DTOs, and domain types
│   └── validations/            # Zod schemas (auth, product, category, checkout)
├── .env.example                # Template for required environment variables
├── .env                        # Local development variables (git-ignored)
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URI | `postgresql://user:pass@localhost:5432/nova_ecommerce?schema=public` |
| `AUTH_SECRET` | NextAuth v5 secret key | `min-32-character-random-secret` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe Test Secret Key | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Test Publishable Key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | Public redirect base URL | `http://localhost:3000` |

---

## 🛠️ How to Install and Run Locally

### 1. Prerequisites
- **Node.js** v20+ (tested on Node v24)
- **npm** v10+
- **PostgreSQL** instance running locally or hosted (Supabase, Neon, etc.)

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Push Database Schema (When PostgreSQL is connected)
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Start development server on port 3000 |
| `npm run build` | `next build` | Create optimized production build |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint checks |
| `npx prisma studio` | `prisma studio` | Open Prisma Web GUI to inspect database records |
| `npx prisma validate` | `prisma validate` | Validate schema syntax and model integrity |

---

## 🗺️ Development Roadmap

- [x] **Phase 1: Project Foundation** (Next.js App Router, TypeScript, Tailwind CSS, Prisma Schema, Stripe/Auth dependencies, UI primitives, validation schemas)
- [ ] **Phase 2: Authentication & User Accounts** (Auth.js credentials, registration, login, protected routes, profile & addresses)
- [ ] **Phase 3: Public Catalog & Shopping Experience** (Navbar, Footer, Catalog filtering, Search, Sorting, Product details)
- [ ] **Phase 4: Cart & Wishlist System** (Database-persisted cart, real-time stock limits, cart drawer, wishlist)
- [ ] **Phase 5: Stripe Checkout & Webhook Integration** (Server-side price verification, Stripe checkout session, webhook handler, order creation)
- [ ] **Phase 6: Admin Management Portal** (Dashboard metrics, product/category CRUD, stock management, order status pipeline)
- [ ] **Phase 7: Polish & End-to-End Verification** (Loading skeletons, toast notifications, error handling)
