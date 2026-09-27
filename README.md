# NOVA — E-Commerce Platform

A production-grade, full-stack e-commerce web platform engineered with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, **Auth.js (NextAuth v5)**, and **Stripe Test Mode**.

---

## 1. Project Overview
NOVA is designed as a minimalist, high-performance direct-to-consumer e-commerce destination specializing in acoustics, precision mechanical peripherals, smart titanium wearables, and minimalist workspace equipment. 

The application is built strictly around architectural integrity, type safety, server-side data validation, transactional consistency, and accessible responsive design across all devices.

---

## 2. Key Features
- **Modern Public Storefront**: High-impact hero section, category showcases, faceted product filtering, search, and dynamic product detail pages with real-time stock indicators.
- **Robust Authentication**: Auth.js credentials provider with secure `bcryptjs` password hashing, protected customer routes, and server-enforced Role-Based Access Control (RBAC).
- **Persistent Shopping Cart**: Database-persisted shopping cart for authenticated users with optimistic client feedback, live stock limits, and item-level controls.
- **Secure Stripe Test Checkout**: Server-calculated pricing, automated shipping/tax calculation, and Stripe Hosted Checkout Sessions operating exclusively in **Stripe Test Mode**.
- **Transactional Order Processing**: Atomic fulfillment pipeline via Prisma `$transaction` that reserves stock, creates orders and line items, logs payment records, and clears the cart upon verified payment.
- **Idempotent Stripe Webhook**: Robust webhook listener verifying cryptographic signatures (`stripe.webhooks.constructEvent`) with duplicate event protection.
- **Comprehensive Admin Console**: Dedicated administrative suite featuring live financial and operational KPIs, product & category CRUD, real-time inventory management, customer metrics, and order fulfillment status pipelines.
- **Design System & Polish**: Minimalist dark UI system, Geist typography, touch-accessible interactive elements, loading skeleton states, empty states, and custom 404 error boundaries.

---

## 3. Tech Stack
| Layer | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16 (App Router & Turbopack) | Hybrid React Server Components, Server Actions, Route Handlers |
| **Language** | TypeScript 5 | End-to-end strict type safety |
| **Styling** | Tailwind CSS v4 & Vanilla CSS | Tokenized variables, dark aesthetic, responsive utilities |
| **Database** | PostgreSQL (Supabase) | Scalable relational database |
| **ORM** | Prisma ORM 6.4.1 | Schema migrations, type-safe queries, relation modeling |
| **Authentication** | Auth.js / NextAuth v5 | JWT session strategy, bcrypt hashing, route guards |
| **Payments** | Stripe SDK (Test Mode) | Hosted checkout sessions and cryptographic webhooks |
| **Validation** | Zod | Runtime schema validation for forms, APIs, and mutations |
| **Form Handling** | React Hook Form & Resolvers | Performant, accessible form control |
| **Icons** | Lucide React | Clean, scalable icon system |

---

## 4. Application Architecture
```
                           Browser Client
                 (React 19 / Server & Client Components)
                                │
                      HTTP / Server Actions
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      Next.js App Router               NextAuth v5 (Auth.js)
  (Page & Route Handlers)             (JWT Session & bcrypt)
               │                                 │
               ▼                                 ▼
      Server Actions Layer ─────────────► Prisma ORM 6.4.1
  (Zod Validation & RBAC Guard)                  │
               │                                 │
               ▼                                 ▼
       Stripe Test API                 Supabase PostgreSQL
  (Checkout Sessions & Webhook)        (Relational Database)
```

---

## 5. Folder Structure
```
nova-ecommerce/
├── prisma/
│   ├── schema.prisma              # Database schema (Models, Enums, Relations)
│   └── seed.ts                    # Initial database seed (24 products, 5 categories)
├── public/                        # Static brand assets and icons
├── src/
│   ├── actions/                   # Server Actions (auth, cart, checkout, admin)
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group (/login, /register)
│   │   ├── account/               # Customer account and order history
│   │   ├── admin/                 # Admin console (products, categories, orders, customers)
│   │   ├── api/                   # API routes (NextAuth, Stripe webhooks)
│   │   ├── cart/                  # Shopping cart view
│   │   ├── checkout/              # Shipping information, summary, cancel/success
│   │   ├── products/              # Product detail dynamic routes & redirects
│   │   ├── shop/                  # Main catalog with search & faceted filters
│   │   ├── globals.css            # Design system tokens and custom scrollbars
│   │   ├── layout.tsx             # Root layout, font definitions, providers, metadata
│   │   └── not-found.tsx          # Custom 404 page with recovery actions
│   ├── components/                # Reusable UI and Domain components
│   │   ├── account/               # Profile and order history components
│   │   ├── admin/                 # Dashboard tables, metrics cards, modal dialogs
│   │   ├── cart/                  # Cart view, item rows, quantity selectors
│   │   ├── checkout/              # Checkout form and summary cards
│   │   ├── layout/                # Navbar, mobile drawer menu, footer
│   │   ├── shop/                  # ProductCard, ProductGrid, ImageGallery, Filters
│   │   └── ui/                    # Design system primitives (Button, Input, Badge, Card)
│   ├── lib/                       # Core utilities (prisma, stripe, auth, utils)
│   ├── types/                     # Shared TypeScript interfaces & DTOs
│   └── validations/               # Zod schemas for input validation
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules (secrets protected)
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript compiler settings
└── README.md                      # Project documentation
```

---

## 6. Authentication
- **Provider**: NextAuth v5 (Auth.js) Credentials Provider.
- **Hashing**: `bcryptjs` with 10 salt rounds.
- **Roles**:
  - `USER`: Default role for all public registrations.
  - `ADMIN`: Elevated role granting access to `/admin` routes and administrative mutations.
- **Server Guards**:
  - `requireAuth()`: Redirects unauthenticated visitors to `/login?callbackUrl=...`.
  - `requireAdmin()`: Validates that the active session has `role === "ADMIN"`. Normal users are redirected to `/account?error=unauthorized`.
- **Session Strategy**: Secure JWT tokens stored in HTTP-only cookies.

---

## 7. Product Search and Filtering
- **Search**: Case-insensitive substring matching against product names and descriptions.
- **Category Filter**: Faceted filtering by category slug with real-time product counts.
- **Price Range**: Minimum and maximum price boundaries with real-time client validation.
- **Sorting Options**:
  - Featured (Default)
  - Price: Low to High
  - Price: High to Low
  - Name: A to Z
  - Newest Arrivals
- **Pagination**: Configurable items-per-page with pagination controls.
- **Empty State**: Friendly messaging with a 1-click "Reset All Filters" button.

---

## 8. Shopping Cart
- **Data Persistence**: Cart items are persisted in PostgreSQL linked to the authenticated user's ID.
- **Stock Guardrails**: The server enforces real-time stock boundary checks:
  - Users cannot add more units than currently exist in warehouse inventory.
  - Adding an existing item increments its quantity instead of creating duplicates.
  - Setting quantity to 0 or clicking the remove button deletes the line item.
- **Optimistic UI Feedback**: 1-click `QuickAddToCart` button provides instant feedback, loading indicators, and checkmark confirmation.

---

## 9. Stripe Test Checkout
- **Mode**: Configured strictly in **Stripe Test Mode** (`sk_test_...`).
- **Server-Side Security**:
  - Prices, totals, and currency codes are queried directly from the PostgreSQL database at checkout creation.
  - Browser-submitted prices are never trusted.
- **Line Items**: Unit amounts are converted to integer cents (`Math.round(unitPrice * 100)`).
- **Shipping & Tax Calculation**:
  - Orders under $150 include $15 standard shipping (free shipping over $150).
  - 8% estimated sales tax is automatically computed.
- **Client Reference**: Attaches `client_reference_id` and metadata (`userId`, `addressId`) to link the Stripe session to the database order.

---

## 10. Order Management
- **Order Lifecycle**: `PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` (or `CANCELLED`).
- **Order Numbering**: Unique human-readable format (e.g. `NOVA-M1A2B3-XYZ9`).
- **Price Preservation**: `OrderItem` stores the purchase-time price so subsequent catalog price updates do not alter historical invoices.
- **Customer View**: Users can inspect their complete order history and detailed invoices at `/account/orders`.

---

## 11. Admin Dashboard
Accessible at `/admin` strictly for authenticated administrators:
- **Financial Metrics**: Total revenue, total orders, total customers, low-stock warnings.
- **Product Management**: Create new products, upload image URLs, edit pricing, manage stock, and toggle active status.
- **Category Management**: Create and edit categories with slug validation and deletion safeguards.
- **Order Fulfillment**: Review order details, customer shipping addresses, payment records, and update order statuses.
- **Customer Directory**: View customer profiles, order counts, and registration dates with sensitive data completely masked.

---

## 12. Inventory Management
- **Live Stock Tracking**: Every product has a verified integer stock value.
- **Out of Stock Guard**: When stock reaches 0, the storefront displays an `Out of Stock` badge and disables checkout buttons.
- **Atomic Stock Decrement**: When a payment succeeds, inventory is decremented inside a database transaction using `Math.max(0, currentStock - purchasedQuantity)`.

---

## 13. Database
The application uses PostgreSQL (hosted on Supabase) via Prisma ORM:
- **`User`**: Account credentials, profile, role (`USER` | `ADMIN`), timestamps.
- **`Category`**: Name, slug, description, image.
- **`Product`**: Title, slug, description, price, compareAtPrice, stock, images, isActive, category relation.
- **`Cart` & `CartItem`**: User-associated shopping cart with unique `cartId_productId` compound constraint.
- **`Address`**: Shipping address lines, phone, postal code, default flag.
- **`Order` & `OrderItem`**: Order status, totals, shipping address snapshot, purchase prices.
- **`Payment`**: Stripe session ID, payment intent, amount, currency, status (`PENDING` | `PAID` | `FAILED`).

---

## 14. Environment Variables
Create a local `.env` file using the template below. **Never commit `.env` to Git.**

```env
# PostgreSQL Database Connection (Supabase / Local)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?schema=public"

# Auth.js / NextAuth v5 Secret (Min 32 characters)
AUTH_SECRET="your-development-auth-secret-min-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Test Mode Keys (https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_placeholder"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"

# Stripe Webhook Signing Secret (from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET="whsec_placeholder"

# Public Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 15. Local Development Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ylohith765-bit/nova-ecommerce.git
   cd nova-ecommerce
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Update .env with your PostgreSQL credentials and Stripe test keys
   ```

---

## 16. Database Setup / Prisma Commands
- **Generate Prisma Client**:
  ```bash
  npx prisma generate
  ```
- **Push schema to database**:
  ```bash
  npx prisma db push
  ```
- **Seed database with initial products and categories**:
  ```bash
  npx prisma db seed
  ```
- **Open Prisma Studio (Visual DB Browser)**:
  ```bash
  npx prisma studio
  ```

---

## 17. Running the Project
- **Development Server**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Production Build & Start**:
  ```bash
  npm run build
  npm run start
  ```

---

## 18. Stripe Test Mode Instructions
1. Open the [Stripe Dashboard](https://dashboard.stripe.com/) and toggle into **Test Mode**.
2. Copy your Test Secret Key (`sk_test_...`) into `.env` as `STRIPE_SECRET_KEY`.
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the printed webhook signing secret (`whsec_...`) into `.env` as `STRIPE_WEBHOOK_SECRET`.
5. Use Stripe's official test card details during checkout:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g. `12/28`)
   - **CVC**: `123`
   - **Postal Code**: `90210`

---

## 19. Test Accounts
For demonstration and evaluation purposes, seed scripts configure the following roles:
- **Administrator Account**:
  - Email: `admin@novastore.com`
  - Access: Full access to `/admin` console and inventory management.
- **Customer Account**:
  - Email: `alice@novastore.com`
  - Access: Customer storefront, persistent cart, order history at `/account`.
- **Self-Registration**:
  - Visitors can also register any new account at `/register` to test the customer onboarding flow.

*(Note: Passwords are encrypted with bcrypt upon account creation).*

---

## 20. Deployment Instructions (Vercel)
1. Push your repository to GitHub: `https://github.com/ylohith765-bit/nova-ecommerce`.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import the `nova-ecommerce` repository.
4. Set the Framework Preset to **Next.js**.
5. In **Environment Variables**, configure the following required variables:
   - `DATABASE_URL`: Your production PostgreSQL connection string.
   - `AUTH_SECRET`: A 32+ character random secret (`openssl rand -base64 32`).
   - `STRIPE_SECRET_KEY`: Your Stripe Test Secret Key (`sk_test_...`).
   - `STRIPE_WEBHOOK_SECRET`: The webhook secret created in your Stripe dashboard.
   - `NEXT_PUBLIC_APP_URL`: Your production Vercel domain (e.g. `https://nova-ecommerce.vercel.app`).
6. Click **Deploy**. Vercel will install dependencies, trigger `postinstall: prisma generate`, compile the Next.js application, and deploy to the edge.

---

## 21. Security Considerations
- **No Secrets in Client Bundles**: Database credentials and Stripe secret keys exist strictly in server-side modules (`src/lib/`, Server Actions, API routes).
- **Server-Side Authorization**: Client-side visibility does not govern permissions. Mutations verify user session and roles server-side using `requireAuth()` and `requireAdmin()`.
- **Cryptographic Webhook Verification**: Stripe webhooks reject any payload without a valid cryptographic signature from Stripe.
- **IDOR Protection**: Carts, addresses, and orders verify database ownership against `currentUser.id` before allowing updates or reads.
- **Injection & XSS Prevention**: Prisma uses parameterized queries natively, preventing SQL injection; React and Next.js escape output by default.

---

## 22. Future Improvements
- Multi-currency conversion and international localized pricing.
- Customer product reviews and verified-buyer star rating systems.
- Real-time inventory notifications via automated email/SMS alerts.
- One-click re-order workflows and downloadable PDF invoices.
- Advanced warehouse multi-location fulfillment tracking.

---

## 📄 License
This project was developed for the NOVA E-Commerce internship technical submission.
