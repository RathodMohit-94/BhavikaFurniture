# ADDITIONAL PROJECT UNDERTAKEN DURING INTERNSHIP PERIOD

---

## Annexure E: Personal Full Stack Project – Bhavika Furniture E-Commerce & CMS Platform

### E.1 Project Overview

In addition to the ERP and HRMS development work carried out at Airwix Technologies, I independently developed a complete full-stack web application titled **"Bhavika Furniture"** — a furniture e-commerce and content management platform — during the internship period. This project was undertaken as a personal initiative to apply and reinforce the full-stack development skills acquired during the internship in a real-world commerce scenario.

The Bhavika Furniture project is a fully functional, production-ready web application consisting of a public-facing storefront for furniture browsing and a dynamic content management system (CMS) for store administration. The project was built entirely using modern web technologies and demonstrates the end-to-end capability of a full-stack developer — from database design and REST API development to responsive UI design and CMS implementation.

---

### E.2 Project Objectives

- Design and develop a full-stack furniture e-commerce website with a public storefront and an admin content management system.
- Build a dynamic, configuration-driven admin panel capable of managing 23+ content entities without hard-coding individual forms.
- Implement a MongoDB-backed data persistence layer with automatic seeding of default content.
- Create a responsive, accessible, and visually polished public storefront driven entirely by admin-configurable content.
- Apply monorepo architecture using pnpm workspaces and Turborepo for multi-package project management.
- Demonstrate the practical application of full-stack skills including REST API design, component-based UI development, image management, and real-time content visibility controls.

---

### E.3 Technology Stack

| Technology / Tool | Purpose |
|---|---|
| React.js (v18) | Front-end framework for building the storefront and admin UI |
| TypeScript | Static typing for all frontend components and services |
| Vite | Frontend build tool and development server |
| Tailwind CSS (v4) | Utility-first CSS framework for responsive styling |
| Ant Design (v5) | UI component library for admin panel forms and tables |
| React Router DOM (v7) | Client-side routing for public and admin pages |
| React Hook Form | Form state management and validation in the admin CMS |
| React Quill | Rich text editor for product descriptions and page content |
| Node.js | Back-end JavaScript runtime |
| Express.js | REST API framework for all backend routes |
| MongoDB (Mongoose) | NoSQL database for persisting all application data |
| Multer | Multipart file upload middleware for image handling |
| Zod | Schema validation in the shared packages layer |
| pnpm Workspaces | Monorepo package management |
| Turborepo | Monorepo build orchestration and task pipeline |
| Axios | HTTP client for frontend API communication |
| Lucide React | Icon library used throughout the application |

---

### E.4 Project Architecture

The project follows a **monorepo architecture** managed with pnpm workspaces and Turborepo, structured as follows:

```
new-fur/                        ← Monorepo root
├── apps/
│   ├── frontend/               ← React + Vite + TypeScript SPA (Port 5173)
│   └── backend/                ← Node.js + Express REST API (Port 3000)
├── packages/
│   └── schemas/                ← Shared Zod validation schemas (@repo/schemas)
├── package.json                ← Root workspace orchestration
├── pnpm-workspace.yaml         ← pnpm workspaces configuration
└── turbo.json                  ← Turborepo task pipeline (dev, build)
```

The frontend and backend share validation schemas through the `@repo/schemas` workspace package, demonstrating proper code sharing across a monorepo. The `turbo run dev` command starts both applications in parallel, with the backend serving the REST API and the frontend consuming it.

---

### E.5 Backend Implementation

**Entry Point and Middleware Setup (`app.js`):**
The Express application configures response compression, CORS, JSON body parsing (up to 50 MB for rich content), and static file serving for uploaded images. The `x-powered-by` header is disabled for security. A `/health` endpoint is provided for uptime monitoring.

**Database Layer:**
MongoDB is used via Mongoose. Two models are defined:

| Model | Purpose |
|---|---|
| `DbState` | Single-document store holding all CMS data as a structured JSON object |
| `Image` | Stores uploaded images as binary Buffer data with content-type metadata |

**Automatic Data Seeding:**
On first startup, `initDb()` seeds the database with default content including products, categories, homepage settings, testimonials, team members, contact details, and page visibility configuration. A secondary function `ensureCommerceData()` populates commerce entities (orders, customers, coupons, shipping settings, activity log) if absent. This ensures the application is fully functional immediately after deployment without manual data entry.

**Mutation Queue Pattern:**
To prevent race conditions on the shared database document during concurrent write operations, all database mutations are serialized through a JavaScript Promise-based mutation queue. This guarantees that each write operation completes before the next one begins.

**REST API Endpoints:**

*Admin API (`/api/admin`):*

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/upload` | POST | Upload image (stored in MongoDB as binary) |
| `/api/admin/images/:id` | GET | Serve image by MongoDB ObjectId |
| `/api/admin/config/:entity` | GET | Fetch entity field configuration for dynamic UI |
| `/api/admin/data/:entity` | GET | Fetch entity data with search, filter, and pagination |
| `/api/admin/data/:entity` | POST | Create a new entity record |
| `/api/admin/data/:entity/:id` | PUT | Update an existing entity record |
| `/api/admin/data/:entity/:id` | DELETE | Delete an entity record |
| `/api/admin/data/:entity/bulk-status` | POST | Bulk activate or hide selected records |
| `/api/admin/dashboard` | GET | Aggregated analytics data |
| `/api/admin/inventory/low-stock` | GET | Products with stock ≤ 5 units |
| `/api/admin/orders/:id/workflow` | PATCH | Update order fulfillment status |

*Storefront API (`/api/store`):*

| Endpoint | Method | Description |
|---|---|---|
| `/api/store/catalog` | GET | Fetch active products and categories for public display |
| `/api/store/content/:entity` | GET | Fetch public content for any CMS entity |
| `/api/store/coupons/validate` | POST | Validate a coupon code |
| `/api/store/orders` | POST | Place a customer order |

**Dynamic Entity Configuration (`entityConfigs`):**
A central configuration object defines field schemas for all 23 managed entities. Each entity's configuration specifies field names, types (text, number, select, rich-text, image, image-gallery, key-value, tags, datetime, textarea, category-select), labels, and required status. This single configuration object drives the backend validation logic, the frontend form generation, and the admin table column rendering — eliminating code duplication across the stack.

**Server-Side Validation:**
The `validatePayload()` function enforces business rules including:
- Required field checks
- Number and datetime format validation
- Select option constraint enforcement
- Unique field constraints (SKUs, slugs, coupon codes, email addresses)
- Commerce-specific rules (sale price < regular price, coupon percentage ≤ 100%, SEO title ≤ 70 characters)

**Activity Logging:**
Every create, update, and delete operation automatically appends an entry to the `activity_log` collection. The log is capped at 250 entries and records the action, entity type, item label, user, and timestamp.

---

### E.6 Frontend Implementation

**Routing Structure:**
```
/            → Public Layout (Topbar + Footer)
  /          → Home Page
  /category  → Category / Product Listing Page
  /about     → About Us Page
  /contact   → Contact Page
/admin       → Admin Panel (CMS)
```

All public pages are lazy-loaded using `React.lazy()` and `Suspense` for optimal initial load performance.

**Design System:**
A cohesive design language was implemented using CSS custom properties:

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#171329` | Primary text and dark backgrounds |
| `--violet` | `#6c4cff` | Primary brand accent, CTAs |
| `--coral` | `#ff5c4d` | Secondary accent, errors |
| `--citrus` | `#dfff5b` | Highlight and notification colour |
| `--lavender` | `#e7ddff` | Light backgrounds and hover states |

Typography uses **DM Sans** for body text and **Manrope** for display headings. Tailwind CSS v4 with `@theme` custom tokens is used throughout for consistent spacing, border-radius, and responsive layout.

**Public Storefront Pages:**

*Home Page (`HomePage.tsx`):*
Fetches homepage settings, features, testimonials, and categories from the CMS API. Renders a full-screen hero section with a decorative layout and configurable headline, subtitle, background image, and CTA button. Below the hero, up to four categories are displayed in a bento-style grid, followed by a features section and a testimonials carousel. All content is dynamically driven from the admin CMS.

*Category Page (`CategoryPage.tsx`):*
Displays either a directory of all active categories or a filtered product grid based on the `?type=slug` URL parameter. A sticky filter bar allows switching between collections. Products are filtered to show only those belonging to active categories, and the page respects the admin's `products` visibility toggle.

*About Page (`AboutPage.tsx`):*
Renders the brand story, team members, and gallery images fetched from the CMS. Rich text content is rendered safely using `dangerouslySetInnerHTML`.

*Contact Page (`ContactPage.tsx`):*
Displays configurable addresses, phone numbers, email addresses, and store locations from the CMS. Includes a contact form with client-side submission handling.

*Page Visibility System (`PublicLayout.tsx`):*
The public layout fetches `page_visibility` configuration from the CMS. If any page section is toggled off by the admin, the corresponding route renders a `PageUnavailable` component instead of the actual page content. This system allows the store owner to instantly hide sections without code changes.

**Admin Panel:**

*Admin Layout (`App.tsx`):*
A fixed sidebar navigation with 22 content entities organized into 7 groups (Business, Website, Catalog, Marketing, About, Contact, Administration). The layout includes a mobile hamburger menu with overlay, a breadcrumb header, and a contextual editing banner describing the currently selected section.

*Admin Overview (`AdminOverview.tsx`):*
A dashboard displaying four key metrics (paid revenue, open orders, customer count, low-stock count), a recent orders list, a store health panel showing catalog readiness and order completion percentages, a low-stock inventory alert list, and a latest activity feed.

*Admin Dashboard (`AdminDashboard.tsx`):*
A single, reusable component that powers all 22 entity management sections. It renders:
- Three stat cards (total items, active count, visibility toggle)
- A searchable, filterable data table with auto-generated columns based on entity field configuration
- Inline edit and delete actions per row
- Bulk activate/hide functionality for products
- A "page visibility" live toggle switch that instantly publishes or unpublishes entire page sections

*Dynamic Form (`DynamicForm.tsx`):*
A fully dynamic form component that renders input controls based on the entity field configuration fetched from the backend. Supported field types include plain text, textarea, number, datetime picker, single/multi-select, category selector, tag input, key-value specification pairs, rich text editor (Quill), single image upload, and multi-image gallery. The form integrates with the media library to allow reuse of previously uploaded images, and handles direct file uploads to the backend.

**Storefront API Service (`storefrontApi.ts`):**
A lightweight Axios wrapper with a 10-second in-memory cache (TTL-based) to prevent redundant API calls during client-side navigation. Cache entries are keyed by URL and automatically invalidated on expiry.

**Image Optimizer (`imageOptimizer.ts`):**
A utility function that rewrites Unsplash image URLs to enforce WebP format, 75% quality, and maximum width constraints — significantly improving page load performance for images sourced from the Unsplash CDN.

---

### E.7 Key Features Implemented

| Feature | Description |
|---|---|
| Dynamic CMS | 23 content entities fully manageable from the admin panel without any code changes |
| Configuration-Driven Forms | Single `entityConfigs` object drives backend validation, frontend forms, and table columns |
| Image Management | Upload to MongoDB, serve via API, media library reuse across entities |
| Page Visibility Toggles | Admin can instantly publish/unpublish entire page sections via a toggle switch |
| Activity Logging | Every mutation automatically logged with action, item, user, and timestamp |
| Storefront API Caching | 10-second in-memory cache prevents redundant API calls during navigation |
| Mutation Queue | Serialized DB writes prevent race conditions on shared document |
| Responsive Design | Full mobile and desktop support with dedicated mobile navigation |
| Rich Text Editing | Quill-based editor for product descriptions, brand story, and team bios |
| Product Specifications | Key-value pair input for structured product specification data |
| Bulk Operations | Select multiple products and activate or hide in a single action |
| Low Stock Alerts | Dashboard highlights products at or below 5 units with visual indicators |
| Coupon System | Percentage, fixed amount, and free-shipping coupon types with validation rules |
| Order Management | Full order lifecycle tracking (New → Processing → Shipped → Delivered) |
| SEO Settings | Configurable meta titles, descriptions, and social sharing images per page |

---

### E.8 Challenges Faced and Solutions

**Challenge 1 – Single Document Database Pattern:**
Storing all application data in a single MongoDB document simplified the architecture but introduced write concurrency risks. A Promise-based mutation queue was implemented to serialize all database writes, ensuring data consistency without introducing complex locking mechanisms.

**Challenge 2 – Configuration-Driven UI Generation:**
Building a single form component that could handle 13 different field types across 23 entities required careful abstraction. The `entityConfigs` object was designed as the single source of truth, and a `Controller`-based render switch in `DynamicForm.tsx` handles each field type, keeping the code DRY and extensible.

**Challenge 3 – Image Storage Strategy:**
Multer was configured with memory storage to avoid writing to disk directly, with images stored as binary Buffers in MongoDB. A dedicated `Image` model with a content-type field allows the backend to serve images with correct MIME types via a dedicated endpoint.

**Challenge 4 – Responsive Admin Layout:**
Building a complex admin sidebar that works on both mobile and desktop required a translate-based toggle pattern — the sidebar is always rendered in the DOM but translated off-screen on mobile, and animated into view when the hamburger menu is triggered. A backdrop overlay prevents interaction with the main content while the sidebar is open.

**Challenge 5 – Active/Inactive Boolean Inconsistency:**
Throughout the data layer, the `active` field was stored as the string `'true'`/`'false'` rather than a native boolean due to form select controls sending string values. All filtering logic consistently handles both `=== true` and `=== 'true'` to ensure correct behavior across all entities.

---

### E.9 Learning Outcomes from Personal Project

- Gained deep practical understanding of **monorepo architecture** using pnpm workspaces and Turborepo.
- Developed proficiency in **TypeScript** for type-safe frontend development with React.
- Learned to design and implement a **configuration-driven UI system** that eliminates code duplication across forms, tables, and validation logic.
- Strengthened skills in **MongoDB schema design**, including the trade-offs of embedded documents versus normalized collections.
- Applied **Tailwind CSS v4** with the new `@theme` configuration system for consistent design tokens.
- Gained experience with **Ant Design 5** component customization using the ConfigProvider theming API.
- Understood the practical challenges of **concurrent write management** in a Node.js environment and implemented a Promise-queue solution.
- Developed an appreciation for **performance optimization** at the frontend level — lazy loading, in-memory caching, and image format optimization — all of which directly complement the optimization techniques learned at Airwix Technologies.

---

### E.10 Project File Structure Summary

| Path | Description |
|---|---|
| `apps/backend/app.js` | Express app entry point, middleware, route mounting |
| `apps/backend/config/db.js` | MongoDB connection setup |
| `apps/backend/models/DbState.js` | Mongoose model for single-document data store |
| `apps/backend/models/Image.js` | Mongoose model for binary image storage |
| `apps/backend/routes/adminRoutes.js` | Admin CRUD, upload, and analytics routes |
| `apps/backend/routes/storeRoutes.js` | Public storefront API routes |
| `apps/backend/controllers/adminController.js` | All business logic, entity configs, validation |
| `apps/frontend/src/App.tsx` | Root router, AdminLayout, Ant Design theme config |
| `apps/frontend/src/modules/admin/AdminDashboard.tsx` | Universal entity management dashboard |
| `apps/frontend/src/modules/admin/AdminOverview.tsx` | Store analytics overview |
| `apps/frontend/src/modules/admin/DynamicForm.tsx` | Configuration-driven form renderer |
| `apps/frontend/src/modules/public/PublicLayout.tsx` | Public layout shell with visibility control |
| `apps/frontend/src/modules/public/HomePage.tsx` | Dynamic homepage with CMS-driven sections |
| `apps/frontend/src/modules/public/CategoryPage.tsx` | Category directory and product grid |
| `apps/frontend/src/modules/public/AboutPage.tsx` | About page with team and gallery |
| `apps/frontend/src/modules/public/ContactPage.tsx` | Contact info and message form |
| `apps/frontend/src/components/common/Topbar.tsx` | Sticky navigation with mega menu |
| `apps/frontend/src/components/common/Footer.tsx` | Footer with newsletter input |
| `apps/frontend/src/services/storefrontApi.ts` | Cached Axios API service layer |
| `apps/frontend/src/utils/imageOptimizer.ts` | Unsplash URL optimizer for WebP/quality |
| `packages/schemas/index.js` | Shared Zod schemas for cross-package validation |
