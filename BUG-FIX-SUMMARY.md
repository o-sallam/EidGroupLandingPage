# Bug Fix: Documents UI Images Not Showing on /video/1

## ROOT CAUSE
**File:** `src/routes/video.$n.tsx`  
**Lines:** 579-597 (originally inside videoEnded block starting at line 537)

The doc image preloader elements were **conditionally rendered only when `videoEnded === true`**:

```tsx
{videoEnded && (
  <div className="...">
    {/* Hidden doc preloaders ... */}
    {docCandidates.map((src) => (
      <img ... onLoad={() => { /* populate loadedDocs state */ }} />
    ))}
  </div>
)}
```

This meant:
- Images only started loading AFTER the video ended
- If a user opened the Documents overlay before the video finished, `loadedDocs` state was empty
- The overlay showed "No documents" even though video 1 has 5 valid images

## VERIFICATION
1. ✅ Confirmed DOC_COUNTS[1] = { images: 5, videos: 0 } in `src/lib/mediaManifest.ts`
2. ✅ Verified all 5 URLs return HTTP 200 with Content-Type: image/webp:
   - https://egroup.runasp.net/videosdocs/v1docs/images/1.webp
   - https://egroup.runasp.net/videosdocs/v1docs/images/2.webp
   - https://egroup.runasp.net/videosdocs/v1docs/images/3.webp
   - https://egroup.runasp.net/videosdocs/v1docs/images/4.webp
   - https://egroup.runasp.net/videosdocs/v1docs/images/5.webp
3. ✅ Server is working correctly (not a server issue)

## FIX APPLIED
Moved the hidden doc preloaders **outside** the `videoEnded` conditional block so they render immediately when the video page loads:

**Before:**
```tsx
{videoEnded && (
  <div>
    {/* preloaders here */}
  </div>
)}
```

**After:**
```tsx
{videoEnded && (
  <div>...</div>
)}

{/* Hidden doc preloaders — always present */}
{docCandidates.map((src) => (
  <img ... />
))}
```

Now images start loading immediately when the page loads, regardless of video playback state.

## TESTS PASSED
- ✅ Video 1: 5 image preloaders present before video end
- ✅ Video 2: 0 image preloaders (has 3 videos instead)
- ✅ Video 3: 0 image preloaders (has 2 videos instead)
- ✅ Video 6: 0 preloaders (empty state)
- ✅ Lint passed
- ✅ Production build succeeded

## COMMIT
```
fix: doc images now load regardless of video end state

1 file changed, 20 insertions(+), 20 deletions(-)
```
