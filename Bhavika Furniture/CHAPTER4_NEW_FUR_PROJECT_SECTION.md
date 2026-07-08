# CHAPTER 4 (CONTINUED): PROJECT WORK – BHAVIKA FURNITURE E-COMMERCE & CMS PLATFORM

---

## 4.10 Introduction to the Second Project

During the internship period, alongside contributing to the ERP and HRMS system at Airwix Technologies, I independently developed a second full-stack web project titled **"Bhavika Furniture"** — a furniture e-commerce platform with a built-in content management system (CMS). This project was undertaken as a hands-on personal initiative to apply and consolidate the full-stack development skills acquired during the internship in a real-world product scenario.

The Bhavika Furniture project is a complete, production-ready web application consisting of two integrated parts: a public-facing storefront for furniture browsing, and a dynamic admin content management panel for store administration. The project was built entirely using modern web technologies and demonstrates the ability to independently design, develop, and deliver a full-stack product from scratch — covering database design, REST API development, responsive UI, and CMS functionality.

---

## 4.11 Problem Identification

Small furniture retailers and boutique home décor businesses typically face two major challenges when establishing an online presence:

First, building a custom storefront is expensive and requires ongoing developer involvement for even simple content changes such as updating a hero image, adding a new product, or editing a contact address. Business owners are dependent on developers for tasks that should be self-serviceable.

Second, most off-the-shelf e-commerce solutions are either too complex and expensive for small businesses, or too rigid to accommodate the specific branding and content requirements of a boutique brand.

The Bhavika Furniture project addresses both problems by combining a polished, brand-forward storefront with a fully dynamic CMS admin panel. The admin panel allows non-technical store owners to manage all website content — products, categories, homepage sections, team members, contact details, SEO settings, orders, and more — without requiring any code changes. Every piece of content visible on the storefront is configurable from the admin panel in real time.

---

## 4.12 Objectives of the Project

· Build a complete full-stack furniture e-commerce web application with a public storefront and an admin CMS panel.

· Design a dynamic, configuration-driven admin system capable of managing 23 content entities without hard-coding individual forms for each entity.

· Implement a MongoDB-backed data persistence layer with automatic seeding of default content on first startup.

· Create a responsive, accessible, and visually consistent public storefront driven entirely by CMS-configurable content.

· Apply monorepo architecture using pnpm workspaces and Turborepo for structured multi-package project management.

· Demonstrate practical full-stack skills including REST API design, component-based UI development, image upload management, server-side validation, and real-time content visibility controls.

---

## 4.13 Methodology / Approach Adopted

The project followed a feature-driven iterative development approach. Development was organized into logical layers:

**Phase 1 – Architecture and Setup:**
Established the monorepo structure using pnpm workspaces and Turborepo. Configured the frontend (Vite + React + TypeScript) and backend (Node.js + Express + MongoDB) as separate workspace applications, with a shared `@repo/schemas` package for cross-layer Zod validation.

**Phase 2 – Backend API and Data Layer:**
Designed the MongoDB data model, implemented the Express REST API, built the dynamic `entityConfigs` system, and developed server-side validation, normalization, and activity logging logic.

**Phase 3 – Admin CMS Panel:**
Developed the admin layout, overview dashboard, universal entity management component (`AdminDashboard.tsx`), and the configuration-driven dynamic form renderer (`DynamicForm.tsx`).

**Phase 4 – Public Storefront:**
Built all public-facing pages (Home, Category, About, Contact) with full CMS integration, responsive design, and page visibility control driven by admin toggles.

**Phase 5 – Integration and Refinement:**
Connected all layers, implemented image upload and serving, added in-memory API caching on the frontend, and applied performance optimizations including lazy loading and image format optimization.

---

## 4.14 Design, Development, and Implementation

### 4.14.1 Technology Stack

| Technology / Tool | Purpose |
|---|---|
| React.js (v18) with TypeScript | Frontend UI — storefront and admin panel |
| Vite | Frontend build tool and development server |
| Tailwind CSS (v4) | Utility-first CSS for responsive styling |
| Ant Design (v5) | UI component library for admin forms and tables |
| React Router DOM (v7) | Client-side routing |
| React Hook Form | Form state management and validation |
| React Quill | Rich text editor for descriptions and page content |
| Node.js + Express.js | Backend REST API server |
| MongoDB (Mongoose) | NoSQL database for all application data |
| Multer | Image upload middleware (memory storage) |
| Zod | Shared validation schemas |
| pnpm Workspaces + Turborepo | Monorepo management and build orchestration |
| Axios | HTTP client for frontend API calls |

### 4.14.2 Project Architecture

The project uses a monorepo structure managed with pnpm workspaces and Turborepo:

```
new-fur/
├── apps/
│   ├── frontend/          ← React + Vite + TypeScript SPA (Port 5173)
│   └── backend/           ← Node.js + Express REST API (Port 3000)
├── packages/
│   └── schemas/           ← Shared Zod validation schemas
├── pnpm-workspace.yaml
└── turbo.json             ← Parallel dev/build pipeline
```

The `turbo run dev` command starts both the frontend and backend in parallel. The shared `@repo/schemas` package is referenced by both applications using workspace linking (`workspace:*`), enabling shared validation logic without code duplication.

### 4.14.3 Backend Implementation

**Database Models:**

| Model | Purpose |
|---|---|
| `DbState` | Single Mongoose document storing all CMS content as a structured JSON object |
| `Image` | Stores uploaded images as binary Buffer with filename, contentType, and timestamps |

**Automatic Data Seeding:**
On first startup, `initDb()` seeds the database with default content (products, categories, homepage settings, testimonials, contact details, page visibility). A secondary function `ensureCommerceData()` adds commerce entities (orders, customers, coupons, shipping settings, activity log) if absent, ensuring the application is fully functional immediately after deployment.

**Mutation Queue:**
To prevent race conditions on the shared database document, all write operations are serialized through a JavaScript Promise-based mutation queue. Each write operation waits for the previous one to complete before proceeding.

**REST API Endpoints:**

Admin API (`/api/admin`):

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/upload` | POST | Upload image to MongoDB |
| `/api/admin/images/:id` | GET | Serve image by ID |
| `/api/admin/config/:entity` | GET | Fetch field config for dynamic UI rendering |
| `/api/admin/data/:entity` | GET | Fetch entity data (search, filter, paginate) |
| `/api/admin/data/:entity` | POST | Create new entity record |
| `/api/admin/data/:entity/:id` | PUT | Update entity record |
| `/api/admin/data/:entity/:id` | DELETE | Delete entity record |
| `/api/admin/data/:entity/bulk-status` | POST | Bulk activate or hide records |

Storefront API (`/api/store`):

| Endpoint | Method | Description |
|---|---|---|
| `/api/store/catalog` | GET | Active products and categories |
| `/api/store/content/:entity` | GET | Public CMS content |
| `/api/store/coupons/validate` | POST | Validate a coupon code |
| `/api/store/orders` | POST | Place a customer order |

**Dynamic Entity Configuration:**
A central `entityConfigs` object defines field schemas for all 23 managed entities. This single object drives backend validation, frontend form generation, and admin table column rendering — eliminating code duplication across the entire stack.

**Server-Side Validation:**
Business rules enforced include required field checks, number and date format validation, unique constraints (SKUs, slugs, coupon codes, email addresses), and commerce-specific rules such as sale price must be lower than regular price, coupon percentage cannot exceed 100%, and SEO title length limits.

**Activity Logging:**
Every create, update, and delete operation automatically appends an entry to the `activity_log` entity with action name, entity type, item label, user, and timestamp. The log is capped at 250 entries.

### 4.14.4 Frontend Implementation

**Public Storefront:**

*Home Page* — Fetches and renders CMS-configurable hero section (title, subtitle, background image, CTA button), a bento-style category grid, a features section, and a testimonials panel. All content is dynamically driven from the admin.

*Category Page* — Displays either a directory of all active categories or a filtered product grid based on URL parameter (`?type=slug`). A sticky filter bar with category thumbnails allows quick switching between collections. Respects admin visibility toggles.

*About Page* — Renders brand story (rich text), team member cards with photos and bios, and a gallery section, all from CMS data.

*Contact Page* — Displays configurable addresses, phone numbers, email addresses, and store location cards from the CMS, alongside a contact message form.

*Page Visibility System* — The public layout fetches `page_visibility` configuration. If a page section is toggled off by the admin, the corresponding route renders a "Page Unavailable" screen instead of its content, enabling instant publish/unpublish without code changes.

**Admin Panel:**

*Admin Overview Dashboard* — Displays four key business metrics (paid revenue, open orders, customer count, low-stock alerts), a recent orders feed, a store health panel showing catalog readiness and order completion percentages, a low-stock inventory list, and a latest activity log.

*Admin Dashboard (Universal Entity Manager)* — A single reusable component powering all 22 entity management sections. It renders auto-generated data tables from entity field configuration, includes search and filter controls, supports bulk activate/hide operations, and provides an inline page visibility toggle switch per section.

*Dynamic Form Renderer* — A fully dynamic form component that renders appropriate input controls for 13 field types (text, number, select, datetime, rich text, image, image gallery, key-value pairs, tags, category selector, etc.) based on configuration fetched from the backend. Integrates with the media library for image reuse and handles direct file uploads.

**Performance Optimizations:**

| Technique | Implementation |
|---|---|
| Lazy loading | All page components loaded via `React.lazy()` and `Suspense` |
| API response caching | 10-second in-memory TTL cache in `storefrontApi.ts` |
| Image optimization | Unsplash URLs rewritten to WebP format at appropriate width |
| Code splitting | Vendor and UI chunks split separately via Vite `manualChunks` |

---

## 4.15 Entities Managed by the CMS

The admin panel provides full CRUD management for the following 23 entities:

| Group | Entities |
|---|---|
| Business | Orders, Customers |
| Website | Home Page, Home Features, Home Testimonials |
| Catalog | Categories, Products |
| Marketing | Coupons, Media Library, SEO Settings |
| About | About Page, Team Members, Gallery |
| Contact | Addresses, Phone Numbers, Emails, Store Locations |
| Administration | Shipping Settings, Admin Users, Activity Log, Page Visibility |

---

## 4.16 Results and Discussion

The Bhavika Furniture project was successfully completed as a fully functional full-stack application. Key outcomes achieved include:

· A complete public storefront with four fully CMS-driven pages (Home, Collections, About, Contact), fully responsive across mobile and desktop devices.

· A dynamic admin CMS panel managing 23 content entities through a single reusable dashboard and form component, eliminating the need to write individual forms or table views for each entity.

· A working image upload system that stores images in MongoDB and serves them via a dedicated API endpoint, with media library reuse across all entities.

· A real-time page visibility control system allowing store sections to be published or hidden instantly via admin toggle switches.

· An automatic activity log that records every content change with actor, action, and timestamp, providing a complete audit trail.

· A functional coupon system with configurable discount types (percentage, fixed amount, free shipping), usage limits, and minimum order requirements.

· A complete order management workflow supporting the full order lifecycle from New through Processing, Shipped, and Delivered states.

· Performance optimizations including lazy-loaded routes, in-memory API caching, and WebP image format optimization for Unsplash-sourced imagery.

The project demonstrated that a configuration-driven architecture can significantly reduce development effort when building CMS-style applications. The single `entityConfigs` object serving as the source of truth for validation, form rendering, and table generation proved to be a highly effective design pattern that is directly applicable to the type of enterprise software development practiced at Airwix Technologies.

---

## 4.17 Challenges Faced and Solutions

**Challenge 1 – Single Document Write Concurrency:**
Storing all application data in a single MongoDB document introduced the risk of race conditions during concurrent write operations. A JavaScript Promise-based mutation queue was implemented to serialize all writes, ensuring each operation completes before the next begins without requiring database-level locking.

**Challenge 2 – Configuration-Driven Form for 13 Field Types:**
Building one form component that dynamically renders appropriate inputs for 13 different field types across 23 entities required careful abstraction. The solution was a `Controller`-based render switch in `DynamicForm.tsx` where each field type maps to its corresponding Ant Design or custom input component, keeping the implementation clean and easily extensible.

**Challenge 3 – Boolean Inconsistency in Active Status:**
The `active` field was stored as the string `'true'`/`'false'` due to form select controls sending string values. All filtering logic was made consistent by checking for both native boolean `=== true` and string `=== 'true'` values throughout the frontend and backend, ensuring correct behavior across all 23 entities.

**Challenge 4 – Responsive Admin Sidebar on Mobile:**
A translate-based toggle pattern was implemented for the admin sidebar — always rendered in the DOM but translated off-screen on mobile, with a smooth CSS transition animation. A backdrop overlay prevents interaction with the main content while the sidebar is open, replicating the behavior of native mobile navigation drawers.

**Challenge 5 – Image Storage and Serving:**
Multer was configured with memory storage to keep uploaded files in memory as Buffers rather than writing to disk. The Buffer is then stored directly in MongoDB via the `Image` model, and served back to the client through a dedicated `/api/admin/images/:id` endpoint that reads the stored Buffer and sets the correct `Content-Type` header based on the stored MIME type.

---

## 4.18 Comparison: ERP & HRMS Project vs. Bhavika Furniture Project

| Aspect | ERP & HRMS System (Airwix Technologies) | Bhavika Furniture E-Commerce CMS |
|---|---|---|
| Project Type | Enterprise team project (production system) | Individual full-stack personal project |
| Team Size | Full development team with senior mentors | Solo development |
| Primary Stack | React.js, Node.js, MongoDB, MySQL, JWT | React.js (TypeScript), Node.js, MongoDB, Vite |
| Architecture | Multi-module Agile team project | Monorepo (pnpm workspaces + Turborepo) |
| Authentication | JWT with RBAC (4 roles) | No authentication (open admin) |
| Database Design | Normalized collections (MongoDB + MySQL hybrid) | Single-document CMS store + Image collection |
| Key Learning | Enterprise SDLC, team collaboration, code reviews | Monorepo setup, TypeScript, config-driven UI |
| Complexity | Multi-module enterprise ERP with payroll, HR, auth | Full-stack CMS with dynamic entity management |
| UI Framework | React.js with CSS modules | React + TypeScript + Tailwind CSS + Ant Design |
| State Management | Context API + React Query | React hooks (useState, useEffect, useMemo) |

Both projects complemented each other significantly. The professional coding standards, API design patterns, and component architecture practices learned through the ERP/HRMS work at Airwix Technologies were directly applied and reinforced through the independent development of the Bhavika Furniture platform.
