# 🏛 WAHAJ Store — Full Architecture Audit Report

**Date:** June 9, 2026
**Scope:** Homepage, Category System, Admin Dashboard, Analytics, Search Bar
**Goal:** Map current architecture, identify gaps, plan restructuring.

---

## 1. CATEGORY SYSTEM AUDIT

### 1.1 Current Implementation

There are **3 separate category systems** that barely overlap:

| System | IDs | Used By | Stored In |
|--------|-----|---------|-----------|
| **Product Data Categories** | `crowns`, `earrings`, `bracelets`, `zircon`, `sets`, `other` | Product CRUD, Admin form dropdown, Analytics | `lib/data.ts` (seed) |
| **UI Filter Categories** | `new`, `sets`, `offers`, `trend`, `clients` | CategoryNav (homepage horizontal pills), product filtering | **Hardcoded** in `WahajStorefront.tsx:545-551` |
| **Menu Icons** | `new`, `offers`, `trend`, `sets` | Story circles (above folds) | Firestore `/store_settings/menu_icons` |

### 1.2 Disconnect

- `CategoryNav` (line 545-632) uses **hardcoded text-only pills** — no icons, no images, no admin control.
- Menu Icons only cover 4 IDs — **`clients` is missing**.
- Product data categories (`crowns`, `earrings`, etc.) are **never shown** on the storefront as category navigation.
- Only `"sets"` shares an ID across all 3 systems.

### 1.3 Category Icons Not Appearing

| Issue | Location | Fix Needed |
|-------|----------|------------|
| CategoryNav has no icon/image field | `WahajStorefront.tsx:545-551` | Add icon support to luxuryCategories |
| `clients` excluded from menu icons | `lib/imagekit.ts:6` | Add to MENU_ICON_IDS |
| Admin has no category CRUD | AdminDashboard.tsx | New tab + Firestore collection |
| No Firestore categories collection | — | Must be created |

### 1.4 Related Files

| File | Lines | Purpose |
|------|-------|---------|
| `components/storefront/WahajStorefront.tsx` | 545-632 | CategoryNav component (hardcoded) |
| `components/storefront/WahajStorefront.tsx` | 220-229 | Product filtering logic |
| `components/storefront/LifestyleHero.tsx` | 25-57 | Hero slide → category destination |
| `lib/data.ts` | 6-43 | Product categories seed |
| `lib/types.ts` | 36-41 | Category type |
| `lib/imagekit.ts` | 6-8 | MENU_ICON_IDS definition |
| `lib/store-menu-icons.ts` | 9-50 | Menu icons Firestore CRUD |
| `app/api/store-menu-icons/route.ts` | 19-59 | Menu icons API |
| `components/admin/AdminDashboard.tsx` | 1274-1388 | MenuIconsManager |
| `components/admin/AdminDashboard.tsx` | 1633-1638 | Category dropdown in Products |

---

## 2. ADMIN DASHBOARD AUDIT

### 2.1 All Admin Tabs

| Tab | Storefront Impact | Status |
|-----|-------------------|--------|
| **Overview** (`الرئيسية`) | ❌ Internal KPIs | ✅ Finished |
| **Hero** (`الهيرو`) | ✅ **Direct** — drives LifestyleHero | ✅ Finished |
| **Products** (`المنتجات`) | ✅ **Direct** — drives Product Grid | ✅ Finished |
| **Orders** (`الطلبات`) | ✅ **Direct** — order history | ✅ Finished |
| **Customers** (`العميلات`) | ⚠️ VIP toggle affects pricing | ⚠️ Partial (no Firestore sync) |
| **Coupons** (`الكوبونات`) | ✅ **Direct** — checkout validation | ✅ Finished |
| **Content** (`الموقع`) | ✅ **Direct** — UI copy, Stories, Menu Icons | ✅ Finished |
| **Notifications** (`الإشعارات`) | ❌ Internal only (no push) | ✅ Finished |
| **Analytics** (`التحليلات`) | ❌ Internal only | ✅ Finished |
| **AI** (hidden, accessed via Products) | ❌ Generates copy for admin | ✅ Finished |

### 2.2 Unfinished / Partial Features

| Feature | Gap | Location |
|---------|-----|----------|
| **Customers → Firestore sync** | VIP toggle is localStorage only | 1923-1970 |
| **Coupon usage increment** | `used` count never updated on checkout | 1983-2017 |
| **Notification delivery** | "إرسال" button just marks sent — no push/email | 2319 |
| **Analytics date range** | Hardcoded 7-day window, no date picker | 3288-3305 |
| **Real-time admin sync** | Admin fetches once; no `onSnapshot` listener | 231-281 |
| **AI tab hidden** | Only accessible via Products → AI button | 2469-2531 |

### 2.3 localStorage vs Firestore Patterns

| Pattern | Used By | Risk |
|---------|---------|------|
| Admin → API → Firestore → Storefront `onSnapshot` | Products, Orders, Hero, MenuIcons | ✅ Best |
| Admin → localStorage → Storefront reads localStorage | Content, Stories, Notifications | ⚠️ Single-machine |
| Admin writes to both localStorage + Firestore | Hero Slides, Hero Settings | ✅ Redundant |
| Admin reads localStorage only | Customers, Coupon usage | ⚠️ Lost on clear |

### 2.4 Security

| Issue | Severity |
|-------|----------|
| Public read on `/api/products`, `/api/hero-slides`, `/api/store-menu-icons` | Low (intentional) |
| Public POST on `/api/orders` | Low (intentional for checkout) |
| Default credentials in code (`admin@wahaj.local` / `wahaj-demo-2026`) | ⚠️ High |
| Weak default JWT secret in code | ⚠️ High |

### 2.5 Related Files

| File | Lines |
|------|-------|
| `components/admin/AdminDashboard.tsx` | 1-3325 (entire admin) |
| `app/api/admin/login/route.ts` | Full file |
| `lib/auth.ts` | Full file |
| `lib/admin-local.ts` | Full file |
| `lib/products.ts` | 12-68 |
| `lib/orders.ts` | 7-60 |
| `lib/hero-slides.ts` | 5-96 |
| `lib/validation.ts` | Full file |
| `lib/firebase-admin.ts` | Full file |

---

## 3. ANALYTICS AUDIT

### 3.1 Current State: 100% Mock Data

**No real event tracking exists.** All analytics data is hardcoded seed data from `lib/data.ts:381-412`.

| Metric | Source | Real? |
|--------|--------|-------|
| Product Views | `lib/data.ts` (each product: 1840, 1240, etc.) | ❌ Hardcoded |
| Product Sold | `lib/data.ts` (each product: 120, 85, etc.) | ❌ Hardcoded |
| Reviews/Ratings | `lib/data.ts` (each product: 4.8, 4.9) | ❌ Hardcoded |
| Conversion Rate | Derived from mock views/orders | ❌ Fake |
| Daily Sales | `lib/data.ts` (7 days: 8.5k-18k YER) | ❌ Hardcoded |
| Category Distribution | `lib/data.ts` (6 categories, fixed %) | ❌ Hardcoded |
| Hourly Activity | `lib/data.ts` (24h: 120-890 visits) | ❌ Hardcoded |
| Abandoned Carts | `lib/data.ts` (18) | ❌ Hardcoded |

### 3.2 What is NOT Tracked

- Page views
- Product clicks / detail page opens
- Search queries
- Add-to-cart events
- WhatsApp click-throughs
- Checkout funnel
- Share events

### 3.3 Firebase Analytics

`@firebase/analytics` is in `package-lock.json` but **never initialized or called**.

### 3.4 Files Involved

| File | Lines | Purpose |
|------|-------|---------|
| `lib/data.ts` | 381-412 | Hardcoded analytics seed |
| `components/admin/AdminDashboard.tsx` | 372-380 | Conversion calculation |
| `components/admin/AdminDashboard.tsx` | 2375-2467 | AnalyticsManager UI |
| `components/admin/AdminDashboard.tsx` | 850-962 | Overview (KPI charts) |
| `components/admin/AdminDashboard.tsx` | 3288-3324 | Builder functions |
| `lib/types.ts` | 19-31 | views, sold fields on Product |
| `lib/product-record.ts` | 31-72 | views/sold Firestore mapping |

---

## 4. SEARCH BAR AUDIT

### 4.1 Location & Mechanism

- **File:** `WahajStorefront.tsx`
- **Rendered inside** `<Header>` component at lines 479-497
- **State:** `query` lives in `WahajStorefront` (line 76), passed as prop to Header
- **Filtering:** `useMemo` at lines 217-237 — matches against `product.name` and `product.tags`
- **Debounce:** ❌ **None** — filters synchronously on every keystroke
- **Glass style:** Dynamic backgrounds based on hero contrast detection

### 4.2 Move Below Hero

| Task | Difficulty |
|------|------------|
| Extract SearchBar as standalone component | Easy (30 min) |
| Pass query/setQuery/contrast props | Easy |
| Move render position after `<LifestyleHero />` | Easy |
| Fix contrast detection (hero bottom region no longer applies) | Medium |
| Keep glassmorphism (`.glass` class already exists in globals.css:219) | Trivial |

---

## 5. HOMEPAGE STRUCTURE AUDIT

### 5.1 Current Render Order

```
<Header />              ← Fixed top: logo, search, menu, cart
<LifestyleHero />       ← Full-viewport slider
<OfferBar />            ← Marquee offers
<CategoryNav />         ← Horizontal text pills
<section id="products"> ← Product grid (filtered)
<LuxuryInfo />          ← Value props + footer links
<BottomNavigation />    ← Fixed bottom bar (mobile)
<FloatingWhatsApp />
<CartSheet />
<MenuSheet />
```

### 5.2 Target Render Order

```
Hero Slider
↓
Search Bar (glass effect)
↓
Circular Categories
↓
Featured Products
↓
Product Grid
```

### 5.3 Restructuring Difficulty Assessment

| Component | Change | Effort |
|-----------|--------|--------|
| **Extract SearchBar** | New file, move JSX | ~30 min |
| **Create CircularCategoryNav** | New component with icons/images | ~1.5 hrs |
| **Extract ProductGrid** | New file, move inline grid | ~45 min |
| **Reorder WahajStorefront** | Rearrange JSX, adjust lifecycle | ~1 hr |
| **Adjust Hero bottom gradient** | feather into search bar area | ~15 min |
| **Fix contrast detection** | Disable auto-contrast for moved search | ~15 min |

**Total: ~3-4 hours**

---

## 6. CIRCULAR CATEGORY DESIGN FEASIBILITY

### 6.1 Requirements vs Current

| Requirement | Current | Gap |
|-------------|---------|-----|
| Category name | ✅ `Category.type.name` | Not editable from admin |
| Category image/icon | ✅ `Category.type.icon` + `Category.type.image` | Not uploaded via admin |
| Sorting order | ❌ Not in type | No `sortOrder` field |
| Visibility toggle | ❌ Not in type | No `visible` field |
| Admin dashboard management | ❌ No CRUD | No tab, no API, no Firestore collection |

### 6.2 What Exists (Reusable)

- `Category` type in `lib/types.ts:36-41` (needs extension)
- `MenuIconsManager` in `AdminDashboard:1274-1388` (pattern for icon upload)
- ImageKit folder `/categories` already defined in `lib/imagekit.ts`
- Product management pattern (`lib/products.ts`, `lib/product-record.ts`) — copy for categories
- API route pattern (`app/api/products/route.ts`) — copy for categories

### 6.3 What's Missing

| Item | Required Action |
|------|-----------------|
| `sortOrder`, `visible`, `description` on Category type | Update `lib/types.ts` |
| Firestore `categories` collection | Create + seed |
| `lib/category-record.ts` | Firestore ↔ Category mapping |
| `lib/categories.ts` | Seed data + helpers |
| `lib/category-management.ts` | Admin CRUD (like products.ts) |
| `app/api/categories/route.ts` | GET/POST |
| `app/api/categories/[id]/route.ts` | PUT/DELETE |
| `app/api/categories/reorder/route.ts` | PUT bulk sort |
| Categories tab in AdminDashboard | New `CategoriesManager` component |
| CategoryNav rewrite (hardcoded → dynamic) | `WahajStorefront.tsx` rewrite |
| Filter mapping (UI category → product field) | Add `filterRules` logic |

### 6.4 Recommended Implementation Plan

**Phase 1 — Foundation (~4-6 hrs)**
1. Extend `Category` type with `sortOrder`, `visible`, `description`
2. Create `lib/category-record.ts` (Firestore conversion)
3. Create `lib/categories.ts` (seed from existing data.ts categories)
4. Create `lib/category-management.ts` (admin CRUD)
5. Create API routes for categories

**Phase 2 — Admin Dashboard (~6-8 hrs)**
6. Add Categories tab to AdminDashboard tabs array
7. Build `CategoriesManager` component (drag-drop reorder, visibility, image upload)
8. Integrate with ImageKit `/categories` folder

**Phase 3 — Storefront (~4-6 hrs)**
9. Replace hardcoded `luxuryCategories` with Firestore-fetched data
10. Build circular glass category cards with images
11. Map category filter rules to existing product filtering

### 6.5 Key Architectural Decision Needed

| Question | Options | Recommendation |
|----------|---------|----------------|
| Category → Product filter mapping | 1:1 by category.id, or filterRules JSON | **filterRules**: each category defines `{ filterBy: "status", values: ["new"] }` or `{ filterBy: "category", values: ["sets"] }` or `{ filterBy: "compareAt", exists: true }` |

---

## 7. FILE MAP SUMMARY

```
Project Root (M5/)
├── app/
│   ├── page.tsx                              ← Renders WahajStorefront
│   ├── layout.tsx                            ← Root layout, fonts, globals
│   ├── globals.css                           ← .glass, .satin-surface, gradients
│   ├── product/[slug]/page.tsx               ← Product detail
│   ├── admin/
│   │   └── page.tsx                          ← AdminDashboard wrapper
│   │   └── login/page.tsx                    ← Admin login
│   └── api/
│       ├── products/route.ts                 ← Products CRUD
│       ├── orders/route.ts                   ← Orders CRUD
│       ├── hero-slides/route.ts              ← Hero slider CRUD
│       ├── store-menu-icons/route.ts         ← Menu icons CRUD
│       ├── imagekit-auth/route.ts            ← ImageKit auth
│       ├── imagekit-upload/route.ts          ← ImageKit upload proxy
│       ├── imagekit-delete/route.ts          ← ImageKit delete
│       └── admin/
│           ├── login/route.ts                ← Admin login
│           ├── logout/route.ts               ← Admin logout
│           └── ai/route.ts                   ← AI assistant
│
├── components/
│   ├── storefront/
│   │   ├── WahajStorefront.tsx               ← MAIN (1063 lines)
│   │   ├── LifestyleHero.tsx                 ← Hero carousel (362 lines)
│   │   ├── ProductDetailClient.tsx           ← Product detail (539 lines)
│   │   ├── BrandMark.tsx                     ← Logo
│   │   ├── InfoPage.tsx                      ← Static pages
│   │   └── PremiumSplashLoader.tsx           ← Splash screen
│   └── admin/
│       ├── AdminDashboard.tsx                ← MAIN (3325 lines)
│       └── AdminLogin.tsx                    ← Login form
│
├── lib/
│   ├── types.ts                              ← Shared types
│   ├── data.ts                               ← Seed data
│   ├── admin-local.ts                        ← Admin types + localStorage keys
│   ├── validation.ts                         ← Zod schemas
│   ├── firebase.ts                           ← Client Firebase
│   ├── firebase-admin.ts                     ← Admin Firebase
│   ├── products.ts                           ← Product Firestore operations
│   ├── product-record.ts                     ← Product ↔ Firestore mapping
│   ├── orders.ts                             ← Order Firestore operations
│   ├── hero-slides.ts                        ← Hero slides Firestore operations
│   ├── store-menu-icons.ts                   ← Menu icons Firestore operations
│   ├── imagekit.ts                           ← ImageKit utilities
│   ├── imagekit-server.ts                    ← Server ImageKit SDK
│   ├── auth.ts                               ← JWT auth
│   ├── whatsapp.ts                           ← WhatsApp message builders
│   ├── contrast.ts                           ← Hero contrast detection
│   └── cn.ts                                 ← Classnames helper
│
└── [config files]
    ├── package.json
    ├── tailwind.config.ts
    ├── next.config.mjs
    └── tsconfig.json
```
