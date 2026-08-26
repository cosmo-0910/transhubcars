**Transhub Cars** (`cosmo-0910/transhubcars`) is a luxury automotive marketplace + concierge platform. It combines vehicle inventory, preorders, spare parts, towing, mechanics, and real-time chat under a multi-portal architecture.

Here’s a clear structural map of the app.

---

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vite + React 19)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Client      │  │ Vendor      │  │ Admin       │         │
│  │ (index.html)│  │ (vendor.html)│  │ (admin.html)│         │
│  │ Showroom    │  │ Portal      │  │ Dashboard   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│              shared/ (Auth, DB helpers, Chat, Theme…)       │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Supabase (PostgreSQL  │
              │   + Auth + Storage +    │
              │   Realtime + RLS)       │
              └────────────▲────────────┘
                           │
              ┌────────────┴────────────┐
              │  Node/Express server    │
              │  (port 3001)            │
              │  Service-role admin ops │
              └─────────────────────────┘
```

- **Three separate entry points** (multi-page Vite build) instead of a single SPA with React Router.
- **Shared layer** for auth, data access, chat, theme, and UI primitives.
- **Primary backend** = Supabase (client talks directly with anon key + RLS).
- **Thin Express server** only for privileged admin actions (service-role key).
- **PWA** support via `vite-plugin-pwa`.
- Submodule `TranshubMobile` for a React Native companion app.

---

### 2. Directory / Module Structure

| Path | Role |
|------|------|
| `client/` | Public showroom (home, inventory, services, messaging, profile) |
| `vendor/` | Vendor portal (add cars/parts, manage orders, stats) |
| `admin/` | Superadmin dashboard (moderation, users, towing, stats, settings) |
| `shared/` | Cross-portal code: AuthContext, db helpers, ChatSystem, theme, styles, types |
| `server/` | Express app (`/api/admin/create`, `/api/admin/update`) |
| `migrations/` | Many incremental SQL migrations (RLS, tables, features) |
| `SUPABASE_SCHEMA.sql` | Core schema snapshot |
| `public/` | Static assets (logo, OG image, robots, sitemap) |

Key shared modules:
- `shared/lib/supabase.ts` — anon client
- `shared/lib/db.ts` — large typed data-access layer (cars, orders, parts, towing, audit, upload + watermark, ranking…)
- `shared/lib/AuthContext.tsx` — global auth + profile
- `shared/services/chat.service.ts` + `notification.service.ts`
- `shared/components/` — ChatSystem, NotificationInbox, InstallPrompt, MaintenanceGuard, SearchAutocomplete, etc.

---

### 3. Routing & Navigation Model

No React Router. Navigation is **state-driven** inside each portal:

**Client (`client/App.tsx`)**
- `currentView`: `'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor'`
- Modals/overlays controlled by local state: `selectedCar`, `showInquiry`, `showAuth`, `chatModal`, `discoveryFilter`, `showVendorApp`
- Custom window events for loose coupling: `select-car`, `open-chat`
- Mobile bottom nav + desktop Navbar both mutate `currentView`

**Vendor & Admin**
- Role guard on load → redirect to `/` if wrong role
- Internal sections via `activeSection` state inside their dashboards

Portal switching is done with full page loads (`/admin.html`, `/vendor.html`).

---

### 4. Data Layer & Domain Model

**Core tables** (from schema + migrations):

- `profiles` — roles (`customer` / `vendor` / `admin`), vendor_status, vendor_type, preorder_status, business info, location/online status for tow drivers
- `cars` — inventory (make/model/year/price, gallery, features, approval_status, vendor_id, body_type, condition, etc.)
- `orders` / `cart_items`
- `inquiries` / `preorders`
- `spare_parts` / `spare_part_orders`
- `tow_requests` (geo + driver assignment)
- `mechanics`
- `conversations` / `messages`
- `notifications`
- `media_fingerprints` (SHA-256 dedup for uploads)
- `audit_logs`, `platform_settings`, `usage_logs`

**Access pattern**
- Almost all reads/writes go through `shared/lib/db.ts` → Supabase JS client
- RLS enforces ownership (vendor owns their cars, user owns their orders/cart, public can read approved cars, admins bypass via `is_admin()` function)
- Image uploads: hash check → optional watermark (`shared/lib/watermark.ts`) → Supabase Storage → register fingerprint

**Real-time**
- Chat: Supabase Realtime channels on `messages`
- Towing: realtime updates on `tow_requests` + nearest-driver logic

---

### 5. Feature Map by Portal

**Client Showroom**
- Luxury hero + inventory grid with filters/search
- Brands / Categories / Collections discovery
- Vehicle detail + inquiry (inspection / purchase)
- Preorder form
- Services hub: Spare Parts marketplace, Mechanics list, Emergency Towing (map + geolocation + Nominatim reverse geocode)
- Messaging, User profile, Vendor application, Vendor public profile
- PWA install prompt, dark theme, maintenance mode guard

**Vendor Portal**
- Add/Edit cars (NHTSA API for model/body validation)
- Add/Edit spare parts
- Order fulfillment
- Preorder capability upgrade (store video/image verification)
- Stats (earnings, active listings, sales)

**Admin Portal**
- KPI overview
- Vendor approval queue + preorder access review
- User management (status, roles)
- Global car & parts moderation
- Order management + invoice generation
- Tow truck dispatch (map + matching)
- Message oversight, audit logs, platform settings

---

### 6. Tech Stack Summary

| Layer | Choice |
|-------|--------|
| UI | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind + large custom CSS (glassmorphism, luxury theme) |
| Animation | Framer Motion |
| Icons | Lucide |
| Backend-as-a-Service | Supabase (Auth, Postgres, Storage, Realtime, RLS) |
| Privileged API | Express 5 + `@supabase/supabase-js` (service role) |
| Dev | concurrently (Vite + nodemon server), ts-node |
| PWA | vite-plugin-pwa + Workbox |
| External APIs | NHTSA (vehicle data), Nominatim (geocoding) |

---

### 7. Notable Design Choices & Patterns

- **Multi-page multi-portal** instead of one SPA → clean separation of concerns and simpler auth guards.
- **Fat shared `db.ts`** acts as the single source of truth for all data operations and types.
- **Heavy use of RLS** + a tiny privileged server for admin creation only.
- **Custom events** for cross-component communication in the showroom.
- **Image watermarking + content-hash deduplication** at upload time.
- **Incremental migrations** show organic growth (tow system, chat, ranking, body types, etc.).
- Local SQLite file (`transhub.db`) and some diagnostic scripts exist but the live path is Supabase.

---

### Quick Mental Model

> Three React frontends (showroom / vendor / admin) share auth, data helpers, and UI primitives.  
> They talk almost exclusively to Supabase under RLS.  
> A small Express server exists only so admins can create other admins with the service-role key.  
> Navigation inside each portal is pure React state; portals themselves are separate HTML entry points.

Would you like a deeper dive into any specific part next (e.g. chat flow, towing matching logic, RLS policies, vendor onboarding sequence, or the data model relationships)?