# Phase 1 Investigation Report — Repository Baseline

> **Project:** Eid Group — Investment Data Room (code name `tanstack_start_ts`)
> **Date:** 2026-07-22

---

## A. Project Structure & Tooling

### Build Tool & React Version
- **Vite 8** with `@vitejs/plugin-react` (v5) for HMR/bundling
- **React 19.2.0** with JSX transform (`react-jsx`)
- **TypeScript 5.8** (strict mode, `verbatimModuleSyntax: false`)
- Bun for package management (`bun.lock`, `bunfig.toml`)
- Config: `vite.config.ts` uses `@lovable.dev/vite-tanstack-config` which bundles TanStack Start plugin, Vite React, Tailwind CSS v4, Nitro, tsconfig paths alias, env injection, and sandbox detection

### Key Dependencies
| Category | Library | Version |
|---|---|---|
| Framework | `@tanstack/react-start` | ^1.168.26 |
| Routing | `@tanstack/react-router` | ^1.170.16 |
| State/Data | `@tanstack/react-query` | ^5.101.1 |
| Styling | Tailwind CSS v4 + `tw-animate-css` | ^4.2.1 |
| UI Library | shadcn/ui (Radix primitives) | new-york style, slate base |
| Icons | lucide-react | ^0.575.0 |
| Forms | react-hook-form + @hookform/resolvers + zod | ^7.71.2 |
| Backend | Supabase (`@supabase/supabase-js`) | ^2.110.7 |
| SSR server | Nitro (via TanStack Start) | 3.0.260603-beta |
| Charts | recharts | ^2.15.4 |
| Other | date-fns, embla-carousel, sonner (toast), vaul (drawer), cmdk, input-otp, react-day-picker, react-resizable-panels | — |

### Folder Structure
```
src/
├── components/
│   ├── ui/          — ~45 shadcn/ui components (button, card, dialog, etc.)
│   ├── VideoStage.tsx
│   ├── PortalShell.tsx
│   └── LanguageSwitcher.tsx
├── hooks/
│   ├── usePageContent.ts   — fetches page_content from Supabase
│   └── use-mobile.tsx      — breakpoint detection at 768px
├── lib/
│   ├── access.ts           — client-side sessionStorage gating
│   ├── i18n.tsx            — trilingual i18n (ar, en, nl) via React Context
│   ├── utils.ts            — cn() helper (clsx + tailwind-merge)
│   ├── admin.functions.ts  — server functions (login, save, upload)
│   ├── error-capture.ts    — global error listeners for SSR recovery
│   ├── error-page.ts       — fallback SSR error HTML page
│   └── lovable-error-reporting.ts — Lovable editor telemetry
├── integrations/
│   └── supabase/
│       ├── client.ts          — public (anon) Supabase client
│       ├── client.server.ts   — service-role Supabase client
│       ├── auth-attacher.ts   — SSR auth middleware
│       ├── auth-middleware.ts  — auth middleware
│       └── types.ts           — generated DB types (page_content table)
├── routes/                 — file-based routing
├── router.tsx              — TanStack Router factory
├── routeTree.gen.ts        — auto-generated route tree
├── start.ts                — TanStack Start instance + error middleware
├── server.ts               — Nitro SSR fetch handler
└── styles.css              — Tailwind v4 imports + design tokens + custom utilities
public/
└── favicon.ico
supabase/
├── config.toml
└── migrations/
    └── 20260720171719_...sql  — page_content table + storage policy
```

### Routing Library
- **`@tanstack/react-router` v1.170.16** (file-based routing)
- Routes are auto-generated into `src/routeTree.gen.ts` from files in `src/routes/`
- TanStack Start SSR integration via `start.ts` and `server.ts`
- Route tree declaration uses `createFileRoute` in each route file
- Router created in `src/router.tsx` via `createRouter({ routeTree, context: { queryClient }, scrollRestoration: true })`

### Styling Approach
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- Custom CSS in `src/styles.css` using `@theme inline`, `@utility`, `@layer base`, `@custom-variant rtl`
- All design tokens in `styles.css` (luxury dark palette with gold accents)
- Custom utilities: `gold-gradient-text`, `gold-border`, `card-luxe`, `shimmer`, `animate-fade-up`, `animate-soft-pulse`
- Dark-only theme (no light mode)

### UI Component Library
- **shadcn/ui** (New York style, slate base) confirmed via `components.json`
- Radix primitives installed: accordion, alert-dialog, avatar, checkbox, collapsible, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, tooltip, etc.
- CVA + clsx + tailwind-merge pattern for component variants

### State Management
- **No global state manager** (no Zustand, Redux, or similar)
- React Context for i18n (`I18nProvider`/`useI18n`)
- `@tanstack/react-query` for server data (used via `usePageContent` hook)
- Session-only state via `sessionStorage` for access gate
- `localStorage` for language preference

### Deployment Target
- **Lovable Cloud** (the project originates from Lovable.dev)
- Nitro SSR with Cloudflare-compatible output (nitro config lists CF as default target)
- `.env` file references Supabase project `nzjeaopnzsvyerpownfs.supabase.co`
- No Vercel/Netlify config found — deployed via Lovable's own hosting infrastructure

---

## B. Page Flow & Navigation

### Existing Routes

| Route | File | Description |
|---|---|---|
| `/` | `src/routes/index.tsx` | Landing page with splash animation (1.8s) → welcome CTA |
| `/access` | `src/routes/access.tsx` | Password gate — 8-char access code form |
| `/portal` | `src/routes/portal.tsx` | Convenience redirect → `/video/1` |
| `/video/$n` | `src/routes/video.$n.tsx` | Video presentation page (n=1..7) |
| `/documents` | `src/routes/documents.tsx` | PDF document listing |
| `/contact` | `src/routes/contact.tsx` | Contact/social channels page |
| `/admin` | `src/routes/admin.tsx` | Admin panel (server-session-protected) |

### Landing Page & Presentation Flow
- **Landing page exists and is fully implemented** (`src/routes/index.tsx`)
  - Two-phase: "splash" (1.8s logo animation) → "welcome" (title, subtitle, CTA button)
  - "Confidential — Authorized Access Only" badge + language switcher
  - CTA navigates to `/access`
- **Password gate fully implemented** (`src/routes/access.tsx`)
  - Single input for access code
  - Validates against `ACCESS_CODE = "EID2026"` from `src/lib/access.ts`
  - On success: calls `unlock()` (sets `sessionStorage` flag), navigates to `/video/1`
  - On failure: shows error message
- **Presentation flow fully implemented** — 7 video steps with prev/next navigation, progress bar, gallery/images, PDFs, related videos per page
- **No partially implemented features** — everything is either built or uses placeholder content

### Navigation Mechanism
- **Route-based (URL-driven)** navigation via `@tanstack/react-router`
  - `Link` components with `to` and `params` for inter-page navigation
  - `useNavigate` for programmatic redirects
  - `Navigate` component for `/portal` redirect
- Navigation between videos: `/video/$n` with prev/next `Link` components changing `n`
- Protected routes (`/video/$n`, `/documents`, `/contact`) check `isUnlocked()` in `useEffect` and redirect to `/access` if not authenticated
- Step dot indicators at bottom of video pages for visual progress

### Existing Auth/Gating Logic
- **Simple client-side password check** in `src/lib/access.ts`
  - Hardcoded `ACCESS_CODE = "EID2026"`
  - `sessionStorage` key `eid_access_ok` set to `"1"` on successful entry
  - `isUnlocked()` checks `sessionStorage`
  - `lock()` clears the flag
- No server-side validation for the access code
- Admin panel has separate server-side password protection via `adminLogin`/`adminLogout`/`adminStatus` server functions using `ADMIN_PASSCODE` env var and signed sessions

---

## C. Existing Video Implementation

### Video Component
- **Primary:** `src/components/VideoStage.tsx`
  - Receives `videoUrl` and `posterUrl` props (nullable)
  - If `videoUrl` is provided: renders `<video>` with native browser controls
  - If no `videoUrl`: renders a poster image (CSS background) with a play icon overlay and "Video will be added soon" message
- **Secondary (related videos):** Inline in `src/routes/video.$n.tsx` lines 131-141
  - Renders `<video>` elements with `controls playsInline preload="metadata"`

### Video Source References
- **External URLs — not local imports or public folder files**
- Video URLs come from Supabase `page_content` table, fetched via `usePageContent("video-N")` hook
- The hook queries `supabase.from("page_content").select("*").eq("page_key", page_key)`
- Videos are uploaded via admin panel to Supabase storage bucket `media/`
- URLs are signed URLs with 10-year expiry from `createUploadUrl` server function

### Video Element Attributes
```html
<video key={videoUrl} class="aspect-video w-full" controls playsInline preload="metadata" poster={posterUrl}>
  <source src={videoUrl} />
</video>
```
- `controls`: native browser controls (no custom UI)
- `playsInline`: set for iOS Safari compatibility
- `preload="metadata"`: only loads metadata (not full video) on page load
- `poster`: passed from Supabase `image_url` field if available
- No `autoplay` attribute set anywhere
- No `loop` attribute

### Lazy-Loading / IntersectionObserver
- **Minimal:** Only 1 instance of `loading="lazy"` found — on gallery `<img>` elements in `src/routes/video.$n.tsx:91`
- No `IntersectionObserver` usage found in the codebase
- No lazy-loading for video elements themselves
- No dynamic imports or `React.lazy()`

### Poster / Thumbnail Images
- Posters are loaded from Supabase `page_content.image_url` field
- When `videoUrl` is present and `posterUrl` is provided: used as `<video poster={posterUrl}>`
- When no `videoUrl`: poster shown as CSS `backgroundImage` on a div with dark overlay
- Not in WebP/AVIF format (URLs are direct Supabase storage links, format depends on uploaded file)
- No dedicated thumbnail generation pipeline

### Custom vs. Native Video Player UI
- **Native browser controls only** — no custom progress bar, no custom play/pause, no custom controls
- The fallback "no video" state shows a decorative play icon animation but it's not functional (no actual video loaded)

---

## D. Current Performance Optimizations

### Code-Splitting / Route-Level Lazy Loading
- **Not present.** No `React.lazy()`, no `dynamic import()` in route components.
- All components are eagerly imported.
- The `routeTree.gen.ts` uses static imports for all route files.
- Note: The TanStack Router supports lazy loading, but it's not configured in this project.

### Image Optimization
- **Not present.** No WebP/AVIF conversion. No `<picture>` elements with format fallbacks.
- Images are served directly from Supabase storage at original resolution.
- Only optimization is `loading="lazy"` on gallery `<img>` elements.

### CDN / Asset Hosting
- **Supabase storage** serves as the media CDN (bucket `media`).
- No dedicated CDN layer (CloudFront, Cloudflare Images, etc.) configured.
- Static assets (favicon, built JS/CSS) served from app's own origin via Lovable Cloud/Nitro SSR.
- Google Fonts loaded from `fonts.googleapis.com` with `preconnect` hints.

### Bundle Size Concerns
- Large set of Radix UI primitives installed (~45 components), many potentially unused.
- `recharts` (charting) included — check if used anywhere beyond admin.
- `react-hook-form`, `zod`, `date-fns`, `embla-carousel`, `cmdk`, `input-otp`, `react-day-picker`, `vaul`, `react-resizable-panels` — verify each is actively used.
- No bundle analysis tool configured.

### Caching Strategy
- **No service worker** registered.
- No cache-control headers configured in-app.
- TanStack Router configured with `defaultPreloadStaleTime: 0` (no preload caching).
- React Query uses defaults (no custom staleTime/gcTime set in `usePageContent`).

---

## E. Mobile Responsiveness Strategy

### Layout Approach
- **Mobile-first** — base styles use `px-4/6`, `min-h-screen`, `max-w-md/sm/xl` constraints
- Breakpoints use Tailwind defaults: `sm` (640px), `md` (768px)
- Examples:
  - Gallery grid: `grid-cols-2 sm:grid-cols-3`
  - Contact channels: `grid gap-3 sm:grid-cols-2`
  - Video title: `text-2xl sm:text-3xl`
  - Admin input fields: `grid gap-4 md:grid-cols-3`

### Breakpoint System
- Tailwind v4 default breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- No custom breakpoints defined
- `use-mobile.tsx` uses 768px as mobile detection threshold

### Known Mobile-Specific Issues
- `viewport-fit=cover` is present in root `<meta>` tag in `__root.tsx:63`
- `playsInline` attribute set on all video elements (iOS Safari requirement)
- `dir="rtl"` support via `@custom-variant rtl` and conditional Arrow components
- Safe-area handling not explicitly implemented (no `env(safe-area-inset-*)` in CSS)
- The footer is `fixed bottom-0` which could overlap content on devices with home indicator — no `padding-bottom` safe-area equivalent observed
- No `-webkit-overflow-scrolling: touch` or similar mobile-specific CSS found

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```
- `viewport-fit=cover` is set — correct for full-bleed on notched devices
- No explicit `safe-area-inset-*` padding/margin in CSS yet

---

## F. Constraints & Risks

### Backend Dependencies
- **Hard dependency on Supabase** for all dynamic content:
  - Video URLs
  - Poster/image URLs
  - PDF URLs
  - Gallery images
  - Related videos
  - Page titles/descriptions (per language)
- The app cannot deliver video content without Supabase being available
- Admin panel depends on Supabase for file uploads and content saving
- No fallback/offline mode for media content

### Environment Variables / Config
- `.env` file contains Supabase project credentials (URL, publishable key)
- `ADMIN_PASSCODE` and `ADMIN_SESSION_SECRET` not in `.env` (production env only)
- `SUPABASE_SERVICE_ROLE_KEY` not in `.env`
- No video/CDN URL references in env vars — all dynamic from Supabase DB

### Analytics / Tracking Integration
- **No analytics or tracking** present in the codebase
- No GA, Mixpanel, PostHog, Segment, or custom event tracking
- Only error telemetry is Lovable's own `__lovableEvents`/`__lovableReportRuntimeError` hooks (editor-only, not in production)
- No video interaction events (play, pause, complete, etc.) are tracked

### Legacy / Unused Files & Dead Routes
- `src/routes/README.md` — appears to be a leftover template file
- The `src/lib/admin.functions.ts` file reveals `related_videos` field in the DB schema, but the admin panel UI for it exists — not unused
- Many shadcn/ui components may be unused (e.g., resizable, calendar, command, menubar, navigation-menu, context-menu, toggle-group, hover-card) — would need tree-shaking audit
- `recharts` + `chart.tsx` component — likely unused in current routes

### Lighthouse / PageSpeed Baseline
- **Not measurable** from source alone — no CI pipeline or performance budget configured
- Potential concerns to note:
  - No code splitting → large initial JS bundle
  - Google Fonts render-blocking (even with `preconnect`)
  - Native video controls limit customization/performance
  - No image optimization pipeline
  - No service worker → no offline caching
  - SSR via Nitro may add server response time

---

## Summary of Key Findings

1. **Build fully functional** — Vite + TanStack Start + Supabase stack, tri-lingual, SSR-enabled
2. **Password gate exists** — simple client-side `sessionStorage` check with hardcoded code `EID2026`
3. **Video player is basic** — native controls, no custom UI, no lazy loading, no autoplay
4. **No code splitting** — all components eagerly loaded, no `React.lazy`
5. **No analytics** — no video event tracking
6. **No image optimization** — no WebP/AVIF, no responsive images
7. **Supabase dependency** — all media served from Supabase storage via signed URLs
8. **Mobile-first layout** with `viewport-fit=cover` but no explicit safe-area handling
9. **Performance optimizations absent** — no service worker, no bundle analysis, no CDN layer beyond Supabase storage
