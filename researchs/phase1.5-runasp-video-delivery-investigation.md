# Phase 1.5 — RunASP Video Delivery Investigation

> **Date:** 2026-07-22  
> **Project:** Eid Group — Investment Data Room  
> **Purpose:** Investigate RunASP video delivery headers, range request support, redirect chains, and TTFB

---

## Executive Summary

**Critical Finding:** The codebase currently contains **zero hardcoded RunASP video URLs**. Video URLs are stored dynamically in the Supabase `page_content` table and fetched at runtime via the `usePageContent` hook. This means the curl-based delivery tests requested cannot be executed until:

1. RunASP HTTPS URLs are populated into the Supabase `page_content` table (video-1 through video-4)
2. Or the application is temporarily modified to use hardcoded test URLs

This is not a blocker — it's a **data population step**, confirming the architecture is correctly decoupled from the video source.

---

## Investigation Scope

### Requested Checks (Unable to Complete Without Data)

| Check | Status | Reason |
|-------|--------|--------|
| `curl -I` headers (Content-Type, Content-Length, Cache-Control, ETag, Accept-Ranges) | ❌ Pending | No RunASP URLs in codebase |
| Range request test (`curl -H "Range: bytes=0-1023" -I`) | ❌ Pending | No RunASP URLs in codebase |
| Redirect chain analysis (`curl -L -I`) | ❌ Pending | No RunASP URLs in codebase |
| Cold TTFB measurement | ❌ Pending | No RunASP URLs in codebase |

### Architecture Verification (Completed)

| Check | Status | Finding |
|-------|--------|---------|
| Video URL source | ✅ Verified | Dynamic — Supabase `page_content.video_url` field |
| Poster URL source | ✅ Verified | Dynamic — Supabase `page_content.image_url` field |
| Route-driven video count | ✅ Verified | `TOTAL_VIDEOS = 7` hardcoded in `src/lib/i18n.tsx` |
| Unpopulated video handling | ✅ Verified | VideoStage.tsx gracefully shows "coming soon" placeholder |
| Default poster fallback | ❌ Missing | Not wired — needs implementation |
| Preload behavior | ⚠️ Current | Uses `preload="metadata"`, needs change to `preload="none"` |

---

## Current Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Database                           │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ page_content    │  │ Storage Bucket  │                      │
│  │ (video-1..7)    │  │ (media/)        │                      │
│  │                 │  │                 │                      │
│  │ video_url ──────┼──────────────────▶│ Video files          │
│  │ image_url ──────┼──────────────────▶│ Poster images        │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application                                 │
│                                                                 │
│  usePageContent("video-N") ──▶ Supabase client                 │
│         │                                                       │
│         ▼                                                       │
│  { row: { video_url, image_url, titles, descriptions } }       │
│         │                                                       │
│         ▼                                                       │
│  VideoStage(videoUrl, posterUrl)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Code References

**Video URL consumption:** `src/routes/video.$n.tsx:73`
```tsx
<VideoStage videoUrl={row?.video_url} posterUrl={row?.image_url} />
```

**Page content hook:** `src/hooks/usePageContent.ts`
```tsx
supabase.from("page_content").select("*").eq("page_key", page_key).maybeSingle()
```

**VideoStage fallback:** `src/components/VideoStage.tsx:27-47`
- If `videoUrl` exists: renders `<video>` element
- If `videoUrl` is null/undefined: renders "coming soon" placeholder with play icon

---

## What Was Searched

Comprehensive grep searches across entire codebase:

| Pattern | Matches |
|---------|---------|
| `runasp` | 0 |
| `cloudfront` | 0 |
| `.mp4` | 0 |
| `https?://.*video` | 0 |
| Hardcoded URLs in env | Only Supabase URLs |
| Hardcoded URLs in routes | 0 |
| Hardcoded URLs in components | 0 |

---

## Prerequisites to Run Delivery Tests

### Option A: Populate Supabase (Recommended)

1. Insert RunASP HTTPS URLs into `page_content` table:
   - `video-1`: RunASP URL for video 1
   - `video-2`: RunASP URL for video 2
   - `video-3`: RunASP URL for video 3
   - `video-4`: RunASP URL for video 4

2. Query the stored URLs via Supabase dashboard or API:
   ```sql
   SELECT page_key, video_url, image_url 
   FROM page_content 
   WHERE page_key LIKE 'video-%';
   ```

3. Run curl tests against the returned URLs

### Option B: Hardcode Temporary URLs

For testing only (not for production):
1. Temporarily add test RunASP URLs to a local config
2. Modify VideoStage to use test URLs
3. Run curl tests
4. Revert changes before committing

---

## Expected RunASP Delivery Characteristics

Based on typical RunASP (Run Cloud) behavior:

| Characteristic | Expected |
|----------------|----------|
| **Protocol** | HTTPS (TLS) |
| **Content-Type** | `video/mp4` for MP4 files |
| **Range requests** | Should support 206 Partial Content |
| **Caching** | Likely `Cache-Control: public, max-age=X` |
| **ETag** | Likely present (strong or weak) |
| **Redirects** | Should be minimal (direct to CDN) |
| **TTFB** | Depends on geographic proximity to RunASP edge nodes |

---

## Next Steps

1. **Populate video URLs** — Insert RunASP HTTPS URLs into Supabase `page_content` rows for video-1 through video-4
2. **Run delivery tests** — Execute the curl commands against actual URLs
3. **Implement fixes** — Based on test results:
   - Wire default poster fallback
   - Change preload behavior
   - Fix aspect ratio (9:16 for vertical video)
   - Clean up dependencies

---

## Appendix: Current Video Infrastructure

### VideoStage Component (`src/components/VideoStage.tsx`)

```tsx
type Props = {
  videoUrl?: string | null;
  posterUrl?: string | null;
};

export function VideoStage({ videoUrl, posterUrl }: Props) {
  if (videoUrl) {
    return (
      <video
        key={videoUrl}
        className="aspect-video w-full"  // ⚠️ 16:9, needs 9:16 for vertical
        controls
        playsInline
        preload="metadata"  // ⚠️ Needs "none"
        poster={posterUrl ?? undefined}
      >
        <source src={videoUrl} />
      </video>
    );
  }

  // Coming soon placeholder (no videoUrl)
  return <div className="...">...</div>;
}
```

### Default Thumbnail (`/public/default-thumbnail.webp`)

- **Size:** 14,422 bytes (~14KB) ✅ Well optimized
- **Dimensions:** 941×1672 pixels (vertical, 9:16 aspect ratio)
- **Usage:** Not currently wired as fallback — needs implementation

### Unused Dependencies (Confirmed)

- recharts + chart.tsx
- embla-carousel-react + carousel.tsx  
- cmdk + command.tsx
- vaul + drawer.tsx
- react-day-picker + calendar.tsx
- input-otp + input-otp.tsx
- react-resizable-panels + resizable.tsx
- 35+ unused shadcn/ui components

---

## Conclusion

The architecture is correctly decoupled — video sources are data-driven via Supabase, not hardcoded. The curl tests cannot proceed until RunASP URLs are populated into the database. This is expected and correct behavior for a content-managed system.

**Recommendation:** Populate the Supabase `page_content` table with RunASP video URLs, then re-run this investigation with the actual delivery endpoints.