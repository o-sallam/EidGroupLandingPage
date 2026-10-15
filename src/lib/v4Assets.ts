// Static asset manifest for video 4, loaded from remote server.
// Uses src/lib/mediaManifest.ts for the file list and mediaUrl.ts for URL building.

import { getDocImageUrls, getDocVideoUrls, MEDIA_MANIFEST } from "./mediaManifest";

const VIDEO_4_NUMBER = 4;

// Build URLs from manifest - always returns arrays (never null/undefined)
export const v4ImageUrls: string[] = getDocImageUrls(VIDEO_4_NUMBER);
export const v4VideoUrls: string[] = getDocVideoUrls(VIDEO_4_NUMBER);

/**
 * Check if video 4 has any doc assets available.
 * Useful for conditionally rendering the docs gallery section.
 */
export function isVideo4AssetsAvailable(): boolean {
  const manifest = MEDIA_MANIFEST[VIDEO_4_NUMBER];
  const hasImages = manifest && manifest.images && manifest.images.length > 0;
  const hasVideos = manifest && manifest.videos && manifest.videos.length > 0;
  return hasImages || hasVideos;
}
