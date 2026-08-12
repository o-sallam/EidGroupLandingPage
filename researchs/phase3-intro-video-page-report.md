# Phase 3 Report — Full-Screen Bilingual Intro Video Page

> **Date:** 2026-08-12
> **Project:** Eid Group — Investment Data Room
> **Commit:** see git log
> **Status:** COMPLETE — all Phase 1 findings confirmed, Phase 2 implemented and browser-verified

---

## 1. What Was Replaced

The `/intro` route — the mobile "7 videos" card page displaying
`introPage.line1` ("أمامكم 7 فيديوهات قصيرة توضح مشروعنا الاستثماري من البداية
حتى النهاية.") — is now a **full-viewport motion-graphics video page** that plays
a single language-aware intro video (`intro-ar.mp4` / `intro-en.mp4`).

The route path `/intro` is **unchanged**, so existing navigation
(`/access` → `/intro` → `/video/1`) works exactly as before. The `introPage.*`
i18n keys are still used by the continue affordance.

## 2. Implementation

### New files
| File | Purpose |
|---|---|
| `src/components/VideoHeroPage.tsx` | Full-screen video "page" component (route content of `/intro`) |
| `src/components/VideoPreloader.tsx` | Invisible `<video preload="auto">` that warms the selected-language video into cache |
| `scripts/verify-intro.mjs` | Playwright QA script (24 assertions, all passing) |

### Modified files
| File | Change |
|---|---|
| `src/lib/i18n.tsx` | Added `INTRO_VIDEO_URLS` + `getIntroVideoUrl(lang)` (ar → ar track, anything else → en track) |
| `src/routes/intro.tsx` | Rewritten to render `<VideoHeroPage />` only |
| `src/routes/__root.tsx` | Mounts `<VideoPreloader />` inside `I18nProvider` so it survives route changes |
| `src/styles.css` | `.video-hero*` (fixed full-viewport, object-fit cover, RTL-safe UI, `-webkit-touch-callout: none`) and `.video-preloader` (1×1px, opacity ~0, not `display:none`) |

### Key behaviors
- **No player chrome**: no `controls`, `playsInline`, `muted`, `autoPlay`, `loop`,
  `disablePictureInPicture`, `controlsList="nodownload noplaybackrate nofullscreen"`,
  `onContextMenu` + `onDragStart` prevented. No `crossOrigin` attribute (origin has
  no CORS headers; adding it would break playback).
- **Language-aware**: `src` derives from `useI18n().lang`; element is `key={src}`
  so a language switch re-sources reactively.
- **Full-bleed**: `position: fixed; inset: 0; width: 100vw; height: 100vh; height: 100dvh`
  with `object-fit: cover` on the video.
- **Preload during first-page splash**: `VideoPreloader` mounts as soon as a
  language is chosen (gated by `isLangChosen()`), starts downloading immediately
  during the `/` splash, and stays mounted across `/access` → `/intro` so the
  download is never cancelled by a route change. Only the selected language is
  preloaded. Uses a `<video>` element, **not** `fetch()` — the RunASP origin
  sends no `Access-Control-Allow-Origin` header (verified with curl).
- **Transition**: reuses the site's existing entrance primitive
  (`animate-page-entrance`, the same 0.45s fade used by `/video/$n`). No exit
  animation exists anywhere on the site (instant route swap), so none was added
  — matching the rest of the site exactly.
- **Navigation affordances**: two tiny brand-styled, non-native buttons fade in
  after 6s (back → `/`, Continue → `/video/1`). These are page navigation
  (the old page had the same two), not video-player controls. **Product decision
  needed** — see Open Questions.

## 3. Phase 1 Findings (confirmed)

1. **Framework**: TanStack Start (React 19, SSR via Nitro) + TanStack Router
   (file-based routes in `src/routes/`) + Vite 8 + Tailwind v4.
2. **Language state**: React Context (`I18nProvider` in `__root.tsx`, `useI18n()`
   → `{ lang, setLang, t, dir }`). `lang ∈ {ar, en, nl}`, chosen on `/lang`.
   ⚠️ `lang` itself is **not persisted** to localStorage (only a "chosen" flag
   is) — a hard reload resets to `ar`. Pre-existing behavior, not changed.
3. **First-page loader**: `/` splash (logo + glow frame, ~2.2s). Preload wired
   at root level so it survives route changes.
4. **"7 videos" section**: the `/intro` route (`src/routes/intro.tsx`). No mockup
   screenshot exists in the repo — the text block was the section.
5. **Transition mechanism**: CSS entrance animations only, per-route; reused
   `animate-page-entrance`.
6. **Asset/CORS**: both URLs return 200, `video/mp4`, `Accept-Ranges: bytes`
   (206 verified), ETag, IIS. **No CORS headers** → `<video>`-element preload
   (CORS-exempt), never `fetch()`.

## 4. Browser Verification (Playwright, headless Chrome)

All 24 assertions passed:
- `/lang` → English → splash → `/access` → `/intro` flow works; route preserved.
- Preloader absent before language choice; mounts with `intro-en.mp4` during
  splash; persists across route change to `/access`.
- Hero video: `src=intro-en.mp4`, autoplay, muted, playsInline, loop, no controls,
  PiP disabled, restricted controlsList, no crossorigin.
- Edge-to-edge 390×844 and 1440×900, `object-fit: cover`, fixed container.
- `readyState=4` early, `paused=false`, monotonic playback, progressive buffering
  (4.2s→19.2s ahead) — preload working.
- Right-click context menu suppressed.
- Arabic: hero + preloader both use `intro-ar.mp4`.
- Continue pill fades in ~6s, centered bottom, navigates to `/video/1`.

## 5. Open Questions (need product decision)

1. **Loop vs handoff**: implemented as **loop** (spec default) + the delayed
   Continue pill. If product wants auto-advance to `/video/1` when the video
   ends instead, remove `loop` and add an `onEnded` → navigate handler.
2. **Audio**: both tracks carry narration (AAC). **Sound now auto-runs** where
   the browser allows it (Chrome — the user already interacted with the domain
   on /lang + /access); Safari/Firefox keep it muted until the first tap
   anywhere on the page (autoplay policy). A discreet mute toggle mirrors the
   /video pages.
3. **Continue/back affordances**: the three pills (back, mute, continue) are
   the only UI. Product can delete them (buttons in `VideoHeroPage`) for a
   100% chrome-free looping page — but then the only way forward is browser
   back / direct URL.
4. **"nl" (Dutch)**: the app supports Dutch; no Dutch video exists, so it falls
   back to the English track. Confirm that's acceptable.
5. **Language persistence**: hard reload resets `lang` to `ar` (pre-existing).
   If English users hard-reload mid-session they'll get the Arabic intro.
   Consider persisting `lang` itself (small fix, out of scope here).

## 6. QA Checklist (from brief)

- [x] No native video controls (Chrome verified; attrs cover Safari/Firefox)
- [x] Edge-to-edge full viewport, no letterboxing (object-fit: cover, 100dvh)
- [x] ar → intro-ar.mp4, en → intro-en.mp4
- [x] Instant playback on arrival (preload during first-page splash, readyState 4)
- [x] Entering uses the same transition primitive as other pages
      (`animate-page-entrance`); exit = instant swap, same as the rest of the site
- [x] Right-click context menu suppressed
- [x] No layout shift (fixed full-viewport, dark background, fade-in)
- [x] Audio auto-runs where the browser permits; otherwise unlocks on first tap

## 7. Follow-up Fixes (2026-08-12)

### Hydration mismatch (fixed)
`VideoPreloader` initially rendered `<video>` on the client but `null` on the
server (the server can't read the client-only `isLangChosen()` flag), producing
"Hydration failed" in dev. Fixed by creating the preloader element
**imperatively** inside a `useEffect` and appending it to `<body>`; the React
component always returns `null`, so server and client markup always agree.

### Audio auto-run (added at product request)
Both `intro-*.mp4` files carry AAC narration. Behavior now:
- Autoplay starts **muted** (mandatory in all browsers).
- As soon as frames are ready, we attempt to lift muting — browsers that
  permit unmuted autoplay after prior domain interaction (Chrome: the user
  tapped through `/lang` and `/access`) get **sound instantly on arrival**.
- Stricter engines (Safari/Firefox) reject the unmute; the video stays muted
  until the **first tap anywhere on the page**, which unlocks sound.
- A discreet mute/unmute toggle (styled like the /video pages) fades in with
  the other controls after 6s; an explicit user mute is respected by the
  auto-unmute handlers.

### Re-verification
`scripts/verify-intro.mjs` extended to 31 assertions — all passing:
arrival state may be muted (until gesture) or unmuted (sound auto-ran); a
gesture always ends unmuted + playing; toggle mutes/unmutes; **zero
hydration-mismatch console errors** across the full flow.
