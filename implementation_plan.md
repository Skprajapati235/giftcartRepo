# Implementation Plan - Dynamic Hero Slides (Backend, Admin Panel & Mobile App)

This plan details the full implementation for transforming the hardcoded `heroSlides` dummy data in the Mobile App into a fully dynamic, database-driven system managed directly from the Admin Dashboard.

---

## 1. Overview & Objectives

* **Mobile App UI Integrity**: The existing visual look, layout, gradient fade, typography, badges, CTA button, and carousel animations in [HomeScreen.js](file:///e:/giftcart/mobile/src/screens/HomeScreen.js) must remain **100% identical**.
* **Dynamic Backend API**: Create a dedicated Mongoose Model, Service, Controller, and Routes under `/api/heroslides` with automatic initial data seeding.
* **Admin Dashboard Management**: Provide a complete Hero Slides management module inside the Admin Panel under **Shop -> Catalog / Settings**, allowing administrators to create, edit, toggle active status, reorder, and delete hero slides with a live mobile card preview.
* **Seamless Mobile Integration**: Connect the mobile app to the backend API via `heroSlideService.js` with fallback support to ensure the app is never empty.

---

## 2. Architecture & Data Schema

### HeroSlide Schema (`backend/models/HeroSlide.js`)

| Field | Type | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- |
| `tag` | String | Subtitle badge text (e.g. `✨ Fresh Blooms`) | No | `""` |
| `title` | String | Main banner title (supports multi-line `\n`) | Yes | — |
| `desc` | String | Description text | No | `""` |
| `cta` | String | CTA button label (e.g. `Shop Flowers`) | No | `"Shop Now"` |
| `categoryMatch` | String | Category name keyword or Category ID to filter on tap | No | `""` |
| `image` | String | Banner image URL | Yes | — |
| `order` | Number | Sorting order index for slides | No | `0` |
| `isActive` | Boolean | Visibility toggle | No | `true` |
| `img` (Virtual) | String | Aliased to `image` for seamless backward compatibility | — | — |

---

## 3. Proposed File Changes & Workflow

### A. Backend (`backend/`)

1. **[NEW] Model**: [`backend/models/HeroSlide.js`](file:///e:/giftcart/backend/models/HeroSlide.js)
   - Defines Mongoose schema with `tag`, `title`, `desc`, `cta`, `categoryMatch`, `image`, `order`, `isActive`, and virtual `img`.
2. **[NEW] Service**: [`backend/services/heroSlideService.js`](file:///e:/giftcart/backend/services/heroSlideService.js)
   - `getPublicHeroSlides()`: Returns active slides sorted by `order: 1, createdAt: -1`.
   - `getHeroSlidesAdmin({ page, limit, search, all })`: Returns paginated/searchable list for the admin panel.
   - `createHeroSlide(payload)`: Validates and saves new slide.
   - `updateHeroSlide(id, payload)`: Updates existing slide (fields & active status).
   - `deleteHeroSlide(id)`: Deletes slide.
   - `seedInitialHeroSlides()`: Automatically seeds the 3 default dummy slides into MongoDB on first run so the system has instant data.
3. **[NEW] Controller**: [`backend/controllers/heroSlideController.js`](file:///e:/giftcart/backend/controllers/heroSlideController.js)
   - Express handlers for `getAll`, `create`, `update`, and `delete`.
4. **[NEW] Routes**: [`backend/routes/heroSlideRoutes.js`](file:///e:/giftcart/backend/routes/heroSlideRoutes.js)
   - `GET /api/heroslides`: Public route for mobile and admin list.
   - `POST /api/heroslides`: Protected by `adminMiddleware`.
   - `PUT /api/heroslides/:id`: Protected by `adminMiddleware`.
   - `DELETE /api/heroslides/:id`: Protected by `adminMiddleware`.
5. **[MODIFY] Server Entry**: [`backend/server.js`](file:///e:/giftcart/backend/server.js)
   - Register route: `app.use("/api/heroslides", require("./routes/heroSlideRoutes"));`
   - Alias: `app.use("/api/hero-slides", require("./routes/heroSlideRoutes"));`

---

### B. Admin Dashboard (`admin-panel/admin-panel/`)

1. **[MODIFY] Navigation Config**: [`src/app/config/adminNavigation.ts`](file:///e:/giftcart/admin-panel/admin-panel/src/app/config/adminNavigation.ts)
   - Add `{ key: "heroSlides", href: "/hero-slides", label: "Hero Slides", icon: SlidersHorizontal }` under **Shop -> Settings**.
2. **[MODIFY] API Service**: [`src/app/services/adminService.ts`](file:///e:/giftcart/admin-panel/admin-panel/src/app/services/adminService.ts)
   - Add `getHeroSlides`, `createHeroSlide`, `updateHeroSlide`, and `deleteHeroSlide`.
3. **[NEW] Page Route**: [`src/app/hero-slides/page.tsx`](file:///e:/giftcart/admin-panel/admin-panel/src/app/hero-slides/page.tsx)
   - Protected admin view rendering `<HeroSlideView />`.
4. **[NEW] Components**:
   - [`src/app/components/hero-slides/index.tsx`](file:///e:/giftcart/admin-panel/admin-panel/src/app/components/hero-slides/index.tsx):
     - Main view with statistics (Total Slides, Active Slides), search, "Add New Slide" button, and delete modal.
   - [`src/app/components/hero-slides/heroSlideList.tsx`](file:///e:/giftcart/admin-panel/admin-panel/src/app/components/hero-slides/heroSlideList.tsx):
     - Table with image thumbnail, Tag, Title, CTA, Category badge, Order, Active toggle switch, Edit and Delete actions.
   - [`src/app/components/hero-slides/addEditHeroSlide.tsx`](file:///e:/giftcart/admin-panel/admin-panel/src/app/components/hero-slides/addEditHeroSlide.tsx):
     - Form fields: Tag, Title, Description, CTA text, Category Match (dropdown from existing categories + custom option), Banner Image (upload via `MediaModal` or URL), Order, and Active switch.
     - **Live Mobile Card Preview**: Renders an exact preview card matching the mobile phone layout so admin can verify the look before saving.

---

### C. Mobile Application (`mobile/`)

1. **[NEW] Service**: [`mobile/src/services/heroSlideService.js`](file:///e:/giftcart/mobile/src/services/heroSlideService.js)
   - Calls `GET /heroslides` with resilient error handling.
2. **[MODIFY] Screen**: [`mobile/src/screens/HomeScreen.js`](file:///e:/giftcart/mobile/src/screens/HomeScreen.js)
   - Keep current dummy slides as `fallbackHeroSlides` for zero downtime / offline fallback.
   - Introduce state: `const [heroSlides, setHeroSlides] = useState(fallbackHeroSlides);`.
   - Update `loadData()` to fetch `heroSlideService.getHeroSlides()` in the `Promise.all` batch.
   - Keep carousel auto-scroll interval synchronized with `heroSlides.length`.
   - Support both `item.img` and `item.image` seamlessly.
   - Enhance `handleHeroCta` to match either `c._id === slide.categoryMatch` or `c.name.toLowerCase().includes(slide.categoryMatch.toLowerCase())`.
   - **No UI styling changes**: layout, sizes, fonts, gradient overlays, and dots remain untouched.

---

## 4. Verification & Testing Steps

1. **Backend Verification**:
   - Seed verification: verify initial 3 slides are present in MongoDB.
   - API endpoints test: GET, POST, PUT, DELETE operations on `/api/heroslides`.
2. **Admin Panel Verification**:
   - Verify "Hero Slides" appears in the sidebar under Shop -> Catalog.
   - Create a new slide with an image and category link.
   - Toggle Active/Inactive status and verify instant state update.
   - Edit slide details and verify persistence.
3. **Mobile App Verification**:
   - Run mobile app and confirm slides load from the database.
   - Pull-to-refresh to verify instant sync with admin changes.
   - Tap CTA button and confirm navigation to the matching category.
   - Confirm layout and animations look pixel-perfect as before.
