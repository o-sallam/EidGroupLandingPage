# Project Investigation Report

**Project:** Eid Group Investment Data Room  
**Date:** 2026-10-09  
**Investigator:** Kiro CLI Agent

---

## 1. Project Overview

### Basic Information

- **Project Name:** `tanstack_start_ts` (Eid Group Investment Data Room based on branding)
- **Purpose:** Confidential investment presentation for banks, investment firms, and private investors. Contains video-based content explaining an investment opportunity in Syrian real estate.

### Tech Stack

| Category     | Technology                          | Version                                        |
| ------------ | ----------------------------------- | ---------------------------------------------- |
| UI Framework | React                               | 19.2.0                                         |
| Language     | TypeScript                          | 5.8.3                                          |
| Router       | TanStack Router + TanStack Start    | 1.170.16 / 1.168.26                            |
| Bundler      | Vite                                | 8.0.16 (via @lovable.dev/vite-tanstack-config) |
| CSS          | Tailwind CSS                        | 4.2.1                                          |
| Backend/Auth | Supabase                            | ^2.110.7                                       |
| Icons        | Lucide React                        | 0.575.0                                        |
| Forms        | React Hook Form + Zod               | 7.71.2 / 3.24.2                                |
| Animation    | tw-animate-css                      | 1.3.4                                          |
| Video Player | Native HTML5 `<video>` (no library) | N/A                                            |

### NPM Scripts

```json
{
  "dev": "vite dev",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

### Configuration Files

- `vite.config.ts` - Vite configuration via Lovable preset
- `tsconfig.json` - TypeScript with strict mode, paths `@/*` → `./src/*`
- `.prettierrc` - Prettier config (100 char width, trailing commas)
- `eslint.config.js` - ESLint (via Lovable)

### Environment

- Uses `.env` with Vite's `VITE_*` prefix for client-side env vars
- Supabase configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 2. Folder Structure

```
src/
├── components/
│   ├── AdminPage.tsx          # Admin panel for content management
│   ├── CircularProgressRing.tsx  # Progress indicator component
│   ├── ContactPage.tsx        # Contact information page
│   ├── DocumentsPage.tsx      # PDF documents listing
│   ├── DocumentsGallery.tsx   # Image gallery for video docs
│   ├── LanguageSwitcher.tsx   # In-app language toggle
│   ├── PortalShell.tsx        # Shared layout wrapper (header/footer)
│   ├── PyramidLoader.tsx      # Loading spinner
│   ├── VideoHeroPage.tsx      # Full-screen intro video
│   ├── VideoPreloader.tsx     # Preloads intro video
│   └── VideoStage.tsx         # Core video player component
├── hooks/
│   ├── use-mobile.tsx         # Mobile breakpoint detection (768px)
│   └── usePageContent.ts      # Fetches page content from Supabase
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client (singleton)
│       ├── client.server.ts   # Server-side Supabase
│       ├── auth-attacher.ts   # Auth middleware
│       ├── auth-middleware.ts # Auth helpers
│       └── types.ts           # Database types
├── lib/
│   ├── access.ts              # Access code validation (code: "EID2026")
│   ├── admin.functions.ts     # Server-side admin operations
│   ├── docImages.ts           # Dynamically discovers doc images via glob
│   ├── error-capture.ts       # Error handling
│   ├── error-page.ts          # Error page component
│   ├── i18n.tsx               # Internationalization (ar/en/nl) + VIDEO DATA
│   ├── localStorageVersion.ts # Storage purge on deployment
│   ├── loveable-error-reporting.ts
│   ├── utils.ts               # cn() utility (clsx + twMerge)
│   ├── v4Assets.ts            # Video 4 docs discovery via glob
│   └── watchProgress.ts       # Video watch tracking
├── routes/                    # TanStack Router file-based routes
│   ├── __root.tsx             # Root route with I18nProvider
│   ├── index.tsx              # Landing page (/)
│   ├── lang.tsx               # Language selection (/lang)
│   ├── access.tsx             # Access code entry (/access)
│   ├── intro.tsx              # Intro video (/intro)
│   ├── video.$n.tsx           # Dynamic video pages (/video/1-7)
│   ├── documents.tsx          # Documents (/documents)
│   ├── contact.tsx            # Contact (/contact)
│   ├── admin.tsx              # Admin panel (/admin)
│   └── portal.tsx             # Redirect to /video/1
├── router.tsx                 # Router factory with QueryClient
├── routeTree.gen.ts           # Generated route tree
├── server.ts                  # SSR entry
├── start.ts                   # SSR startup
├── styles.css                 # All styles (Tailwind + custom)
└── vite-env.d.ts              # Vite type definitions
```

### Public Assets

```
public/
├── logo.webp                  # Brand logo
├── default-thumbnail.webp     # Fallback video thumbnail
├── thumbnails/                # Video poster images (1.webp - 7.webp)
├── videosdocs/
│   ├── v1docs/                # Video 1 document images (1-5.webp)
│   └── v4docs/                # Video 4 documents + videos
│       ├── 1.webp - 4.webp    # Document images
│       └── doc-v1.mp4 to doc-v3.mp4  # Additional videos
```

---

## 3. Routing & Pages

### Router Setup

- **Library:** TanStack Router (file-based routing)
- **Route Definition:** TanStack Router automatically generates routes from files in `src/routes/`
- **Route Tree:** Generated in `src/routeTree.gen.ts`

### All Routes

| Path         | Component     | File            | Purpose                      |
| ------------ | ------------- | --------------- | ---------------------------- |
| `/`          | Landing       | `index.tsx`     | Welcome splash → access code |
| `/lang`      | LangSelect    | `lang.tsx`      | Language picker (ar/en/nl)   |
| `/access`    | AccessPage    | `access.tsx`    | Access code entry            |
| `/intro`     | VideoHeroPage | `intro.tsx`     | Full-screen intro video      |
| `/video/$n`  | VideoPage     | `video.$n.tsx`  | Video player (n = 1-7)       |
| `/documents` | DocumentsPage | `documents.tsx` | PDF downloads                |
| `/contact`   | ContactPage   | `contact.tsx`   | Contact channels             |
| `/admin`     | AdminPage     | `admin.tsx`     | Content management           |
| `/portal`    | Redirect      | `portal.tsx`    | → /video/1                   |

### Route Definitions (from routeTree.gen.ts)

```typescript
const VideoNRoute = VideoNRouteImport.update({
  id: "/video/$n",
  path: "/video/$n",
  getParentRoute: () => rootRouteImport,
} as any);
```

### Shared Layout

- **PortalShell component** wraps: `/documents`, `/contact`, `/admin`
- Video pages (`/video/$n`) have no shared layout wrapper - each is self-contained with its own chrome
- Root layout provides: `QueryClientProvider`, `I18nProvider`, `VideoPreloader`

---

## 4. Video Pages (Deep Dive)

### Video Pages Overview

The project contains 7 main videos presenting an investment opportunity. Video pages are the core of the application.

### Video Data Sources

#### Source 1: Hardcoded in `src/lib/i18n.tsx`

**Video URLs:**

```typescript
export const VIDEO_URLS: Record<number, string | null> = {
  1: "https://egroup.runasp.net/videos/v1.mp4",
  2: "https://egroup.runasp.net/videos/v2.mp4",
  3: "https://egroup.runasp.net/videos/v3.mp4",
  4: "https://egroup.runasp.net/videos/v4.mp4",
  5: "https://egroup.runasp.net/videos/v5.mp4",
  6: "https://egroup.runasp.net/videos/v6.mp4",
  7: "https://egroup.runasp.net/videos/v7.mp4",
};
```

**Video Titles & Descriptions (per language):**

```typescript
export const videoContent: Record<Lang, Array<{ title: string; description: string }>> = {
  ar: [
    { title: "من هم عيد جروب؟", description: "..." }, // Video 1
    { title: "لماذا نرى فرصة في سوريا؟", description: "..." }, // Video 2
    { title: "كيف نحدد الفرص الاستثمارية؟", description: "..." }, // Video 3
    { title: "الخبرة التي ستحوّل الفكرة...", description: "..." }, // Video 4
    { title: "المشاريع الحالية", description: "..." }, // Video 5
    { title: "خطة النمو المستقبلية", description: "..." }, // Video 6
    { title: "فرصة الاستثمار", description: "..." }, // Video 7
  ],
  // en and nl have similar structure
};
```

**Sample Video Titles (English):**

1. "Welcome to Eid Group"
2. "Why Do We See an Opportunity in Syria?"
3. "How Do We Identify Investment Opportunities?"
4. "The Expertise That Will Turn an Idea Into a Successful Venture"
5. "Current Projects"
6. "Future Growth Plan"
7. "The Investment Opportunity"

#### Source 2: Supabase via `usePageContent` hook

The `usePageContent(page_key)` hook in `src/hooks/usePageContent.ts` fetches dynamic content from Supabase:

```typescript
// Page keys: "video-1", "video-2", ..., "video-7"
supabase.from("page_content").select("*").eq("page_key", page_key);
```

This can override:

- `titles` (per language)
- `descriptions` (per language)
- `image_url` (poster/thumbnail)
- `video_url` (alternative video source)
- `gallery` (array of image URLs)
- `pdfs` (array of {url, name})
- `related_videos` (array of {url, title})

The video page code merges fallback hardcoded data with Supabase data:

```typescript
const fallback = videoContent[lang][num - 1];
const title = row?.titles?.[lang]?.trim() || fallback.title;
const videoUrl = row?.video_url || VIDEO_URLS[num] || null;
```

#### Source 3: Static Assets (Documents/Thumbnails)

- **Thumbnails:** `/thumbnails/{n}.webp` (1-7)
- **Video 4 Documents:** `src/lib/v4Assets.ts` uses `import.meta.glob` to discover:
  - Images: `public/videosdocs/v4docs/*.webp`
  - Videos: `public/videosdocs/v4docs/*.{mp4,webm,ogg,mov}`
- **Other Video Docs:** `src/lib/docImages.ts` discovers via:
  - `import.meta.glob('/public/videosdocs/v*docs/*.webp')`

### Video Order Enforcement

**Key constants in `src/lib/i18n.tsx`:**

```typescript
export const TOTAL_VIDEOS = 7;
export const lastAvailableVideo = Math.max(
  ...Object.entries(VIDEO_URLS)
    .filter(([, url]) => url !== null)
    .map(([key]) => Number(key)),
  1,
); // = 7
```

**Progressive unlock logic in `src/lib/watchProgress.ts`:**

```typescript
export function isPlayable(num: number): boolean {
  if (num === 1) return true; // First video always accessible
  if (isWatched(num)) return true; // Already watched = unlocked
  if (isWatched(num - 1)) return true; // Previous video watched = unlocked
  return false;
}
```

Where `isWatched(num)` checks localStorage for `{w: 1}` flag, set when watch progress exceeds `WATCH_THRESHOLD = 90%`.

**Mechanism:**

1. User navigates to `/video/$n` via URL parameter
2. Route param `n` is parsed and clamped to 1-7
3. `isPlayable(num)` determines if video is locked
4. If locked, shows toast "You must watch the previous videos first" and blocks playback
5. Video pages can be navigated freely, but playback is gated

### Video Player Component

**Component:** `src/components/VideoStage.tsx`

```typescript
type Props = {
  videoUrl?: string | null;
  videoId?: string | number;
  posterUrl?: string | null;
  immersive?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  paused?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
};
```

**Implementation:**

- Uses native HTML5 `<video>` element (no wrapper library)
- Wraps in `forwardRef` to expose imperative controls:
  - `seek(delta)` - seek relative
  - `seekTo(time)` - seek to absolute position
  - `getCurrentTime()` / `getDuration()`
- Handles video source locking to prevent mid-playback URL changes
- Has play button overlay with ripple animation for pre-play state
- "Coming soon" fallback when no videoUrl provided

### Video Page Features

The main video page (`src/routes/video.$n.tsx`) implements:

**Playback Controls:**

- Single tap: toggle play/pause
- Double tap (within 300ms): seek ±5 seconds
- Swipe left/right: navigate between videos (respects RTL)
- Bottom progress bar: scrubber for seeking

**UI Elements:**

- Instagram Stories-style progress bars at top (all 7 videos)
- Overall sequence progress indicator
- Mute/unmute button
- "Investor Questions" button → bottom sheet with Q&A
- "Documents" button → image gallery lightbox
- Social links (Facebook, Instagram, YouTube, WhatsApp)
- Video-ended screen with replay, next, previous buttons

**Data Flow Diagram:**

```
/video/$n Route
    ↓ (parses n param)
useI18n() → lang, t(), dir
    ↓
usePageContent(`video-${num}`) → row (Supabase)
    ↓ (merges with fallbacks)
videoUrl, title, posterUrl
    ↓
VideoStage component
    ↓ (onTimeUpdate callback)
markWatched(num) / savePosition(num)
    ↓ (persists to localStorage)
isPlayable(nextNum) → unlock logic
```

### Video Assets Location

| Type         | Location                                              | Format                   |
| ------------ | ----------------------------------------------------- | ------------------------ |
| Main Videos  | `https://egroup.runasp.net/videos/v{1-7}.mp4`         | MP4 (H.264)              |
| Intro Video  | `https://egroup.runasp.net/videos/intro-{ar,en}.webm` | WebM (AV1), fallback MP4 |
| Thumbnails   | `public/thumbnails/{1-7}.webp`                        | WebP                     |
| Video 4 Docs | `public/videosdocs/v4docs/`                           | WebP + MP4               |
| Other Docs   | `public/videosdocs/v{1,2,3,5,6,7}docs/`               | WebP                     |

---

## 5. Components

### Reusable Components

| Component            | File                       | Props                                                                                                    | Usage                                 |
| -------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| VideoStage           | `VideoStage.tsx`           | videoUrl, videoId, posterUrl, immersive, autoPlay, muted, paused, onPlay, onPause, onEnded, onTimeUpdate | Main video player                     |
| VideoHeroPage        | `VideoHeroPage.tsx`        | (none)                                                                                                   | Full-screen intro video               |
| VideoPreloader       | `VideoPreloader.tsx`       | (none)                                                                                                   | Preloads intro video during splash    |
| PortalShell          | `PortalShell.tsx`          | children                                                                                                 | Layout wrapper for docs/contact/admin |
| DocumentsGallery     | `DocumentsGallery.tsx`     | videoNum, onClose                                                                                        | Image gallery lightbox                |
| LanguageSwitcher     | `LanguageSwitcher.tsx`     | className                                                                                                | In-app language toggle                |
| CircularProgressRing | `CircularProgressRing.tsx` | percent, current, total, hidePercent                                                                     | Progress indicator                    |
| PyramidLoader        | `PyramidLoader.tsx`        | (none)                                                                                                   | Loading spinner                       |

### Custom Hooks

| Hook           | File                      | Purpose                                           |
| -------------- | ------------------------- | ------------------------------------------------- |
| usePageContent | `hooks/usePageContent.ts` | Fetches dynamic content from Supabase by page_key |
| useIsMobile    | `hooks/use-mobile.tsx`    | Returns true if viewport < 768px                  |

### Utility Functions (src/lib/)

| File                     | Functions                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `i18n.tsx`               | I18nProvider, useI18n, isLangChosen, markLangChosen, TOTAL_VIDEOS, VIDEO_URLS, videoContent, QUESTIONS_DATA, getIntroVideoUrl |
| `access.ts`              | isUnlocked, unlock, lock, ACCESS_CODE                                                                                         |
| `watchProgress.ts`       | markWatched, isWatched, savePosition, getPosition, isPlayable, WATCH_THRESHOLD                                                |
| `utils.ts`               | cn() - clsx + tailwind-merge                                                                                                  |
| `docImages.ts`           | getVideoDocImages(videoNum)                                                                                                   |
| `v4Assets.ts`            | v4ImageUrls, v4VideoUrls, isVideo4AssetsAvailable                                                                             |
| `localStorageVersion.ts` | purgeStaleStorage, APP_VERSION                                                                                                |

---

## 6. State Management & Data Flow

### State Approaches Used

| Type               | Implementation               | Storage               |
| ------------------ | ---------------------------- | --------------------- |
| **Server State**   | TanStack Query (React Query) | Via Supabase          |
| **UI State**       | React useState/useRef        | In-memory             |
| **Auth State**     | sessionStorage               | `eid_access_ok`       |
| **Language**       | React Context + localStorage | `eid_lang_chosen`     |
| **Watch Progress** | localStorage                 | `eid_watch_data`      |
| **App Version**    | localStorage                 | `eid:storage-version` |

### Persistence Details

**Access Control:**

```typescript
// sessionStorage - cleared on browser close
const KEY = "eid_access_ok";
export function isUnlocked(): boolean { ... }
export function unlock(): void { sessionStorage.setItem(KEY, "1"); }
```

**Watch Progress:**

```typescript
// localStorage - persists across sessions
const STORAGE_KEY = "eid_watch_data";
// Format: { 1: { w: 1, p: 45.2 }, 2: { w: 0, p: 12.5 }, ... }
// w = watched (0/1), p = position in seconds
```

**Language:**

```typescript
// localStorage
const LANG_CHOSEN_KEY = "eid_lang_chosen";
// Values: "1" = chosen, null = not chosen
```

**Deployment Version:**

```typescript
// Clears ALL localStorage on new deployment
const VERSION_KEY = "eid:storage-version";
// APP_VERSION = git commit SHA (injected at build time)
```

### No Redux/Zustand

The project uses local React state + TanStack Query for server state. No external state management library.

---

## 7. Styling & Design System

### CSS Approach

- **Tailwind CSS 4** with `@import "tailwindcss"` and `@theme inline`
- **Single CSS file:** `src/styles.css` (~500 lines)
- **Custom properties** for theming (CSS variables)
- **Custom animations** using `@utility` (Tailwind 4 pattern)

### Design Tokens

```css
:root {
  /* Luxurious dark palette */
  --background: oklch(0.16 0.012 240); /* #0B0F14 */
  --foreground: oklch(0.97 0 0); /* #F5F5F5 */
  --card: oklch(0.21 0.014 240); /* #171C22 */
  --gold: #c8a96a;
  --gold-soft: rgba(200, 169, 106, 0.15);
  --bg-raw: #0b0f14;
  --border: oklch(0.28 0.012 240);
  --muted-foreground: oklch(0.71 0.008 260); /* #A3A8AE */
}
```

### Font Stack

```css
--font-sans: "Tajawal", "Inter", "Cairo", ui-sans-serif, system-ui, sans-serif;
--font-serif: "Tajawal", "Playfair Display", "Cairo", ui-serif, Georgia, serif;
--font-arabic: "Tajawal", "Cairo", "Inter", sans-serif;
```

Google Fonts loaded in root route:

- Playfair Display (serif headings)
- Inter (sans-serif)
- Cairo (Arabic)
- Tajawal (Arabic)
- Poppins (brand text)

### Responsive Approach

- Tailwind utility classes (`sm:`, `md:`, `lg:`)
- Custom breakpoint: `useIsMobile()` hook at 768px
- CSS media queries for video player layout
- RTL support via `dir="rtl"` and `[dir="rtl"]` selectors

### i18n / Multi-language

- **Languages:** Arabic (ar), English (en), Dutch (nl)
- **Implementation:** React Context (`I18nProvider`)
- **RTL:** Full support for Arabic (dir="rtl" on html element)
- **Dictionary:** All UI text in `dicts` object in `i18n.tsx`

### Custom Animations (in styles.css)

- `animate-fade-up` - Page entrance
- `animate-slide-up` - Modal/sheet
- `animate-tap-feedback` - Tap overlay
- `animate-seek-flash` - Double-tap seek
- `gold-glow-frame` - Logo glow effect
- `video-hero-*` - Intro video UI
- `animate-ripple` - Play button ripple
- `animate-twinkle` - Star effects

---

## 8. Code Conventions & Quality

### Naming Conventions

- **Components:** PascalCase (`VideoStage.tsx`, `PortalShell.tsx`)
- **Hooks:** camelCase with `use` prefix (`usePageContent`, `useIsMobile`)
- **Utils/lib:** camelCase (`access.ts`, `watchProgress.ts`)
- **Routes:** kebab-case files (`video.$n.tsx`, `contact.tsx`)

### TypeScript Usage

- Strict mode enabled in tsconfig
- Type annotations on component props
- Return type annotations on hooks
- Database types imported from Supabase

### File Organization

- TanStack Router file-based routing in `src/routes/`
- Components in `src/components/`
- Business logic in `src/lib/`
- Data fetching hooks in `src/hooks/`
- Integrations in `src/integrations/`

### Linting/Formatting

- ESLint via Lovable preset (React hooks, react-refresh, prettier)
- Prettier: 100 char width, trailing commas, semicolons

### Tests

**No test framework found** - No Jest, Vitest, or Playwright test files.

### Code Quality Observations

- No TODO/FIXME comments in codebase
- Good separation of concerns (hooks, lib, components)
- Error boundaries at root route
- Type safety throughout

---

## 9. Observations

### Fragility Points

1. **Hardcoded Video Data** - VIDEO_URLS, videoContent, and QUESTIONS_DATA are all hardcoded in a single file (`i18n.tsx`). Changing video order requires editing multiple arrays in sync.

2. **Sequential Unlock Logic** - The `isPlayable()` function in watchProgress.ts enforces strict sequential watching. If a user clears localStorage, they must restart from video 1.

3. **90% Watch Threshold** - Progress threshold is hardcoded. If videos are shortened, threshold may be unreachable.

4. **Magic Numbers** - Several hardcoded values:
   - `DOUBLE_TAP_MS = 300`
   - `SEEK_STEP = 5`
   - `WATCH_THRESHOLD = 90`
   - `RECOVERY_MS = 4500`, `RECOVERY_ATTEMPTS = 2`

5. **No API Layer** - Direct Supabase calls in components/hooks. No abstraction for content fetching.

6. **Admin Security** - Admin passcode appears hardcoded in admin.functions.ts (not reviewed in detail).

### Files to Edit for Common Changes

**Change video order (add/remove/reorder videos):**

- `src/lib/i18n.tsx` - VIDEO_URLS, videoContent, QUESTIONS_DATA, TOTAL_VIDEOS
- `src/lib/watchProgress.ts` - isPlayable() sequential logic
- `src/routes/video.$n.tsx` - any hardcoded references (e.g., num === 4 for v4Assets)
- `public/thumbnails/` - add/remove thumbnail files
- `public/videosdocs/` - add/remove doc files

**Add a new video (8+):**

- All above + update lastAvailableVideo logic if needed

**Change video page layout/design:**

- `src/routes/video.$n.tsx` - main page UI
- `src/components/VideoStage.tsx` - player styling
- `src/styles.css` - custom animations, video-hero-*

**Change player behavior (autoplay, controls, etc.):**

- `src/components/VideoStage.tsx` - VideoStage component
- `src/routes/video.$n.tsx` - playback event handlers

**Add new page:**

- Create `src/routes/new-page.tsx` - TanStack Router file-based
- Optionally use PortalShell wrapper

---

## 10. Open Questions

1. **Video Hosting:** Where is the video hosting (RunASP)? Is there a CDN or backup?

2. **Supabase Schema:** The exact database schema for `page_content` table is not defined in the codebase. Need to verify column names/types.

3. **Admin Authentication:** How is admin passcode secured? Is it in environment variables or hardcoded?

4. **Analytics:** Is there any analytics or tracking implementation?

5. **SEO:** The meta tags show `noindex, nofollow`. Is this intentional for a private data room?

6. **Offline Support:** Is there a PWA or offline caching strategy?

7. **Backup Videos:** VIDEO_URLS all point to same domain. Is there redundancy?

---

_Report generated by Kiro CLI Agent_
