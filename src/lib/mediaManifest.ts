/**
 * Static manifest of document files available on the remote server.
 *
 * To add a file: upload it as the next number (images: N.webp, videos: N.mp4)
 * in the server folder, then raise the count here. Unknown video numbers have no docs.
 *
 * Server layout: {baseUrl}/v{N}docs/images/{i}.webp and {baseUrl}/v{N}docs/videos/{i}.mp4
 * where i starts at 1 with no gaps.
 */

import { getDocImageUrl, getDocVideoUrl } from "./mediaUrl";

/**
 * Document counts per video number.
 * Defines how many image and video files exist on the server for each video.
 */
const DOC_COUNTS: Record<number, { images: number; videos: number }> = {
  1: { images: 5, videos: 3 },
  2: { images: 0, videos: 5 },
  3: { images: 2, videos: 0 },
  4: { images: 0, videos: 2 },
  5: { images: 4, videos: 2 },
};

/**
 * Get doc image URLs for a specific video number.
 * Always returns an array (never null/undefined).
 * Returns empty array for unknown video numbers.
 */
export function getDocImageUrls(videoNum: number): string[] {
  const counts = DOC_COUNTS[videoNum];
  if (!counts || counts.images === 0) {
    return [];
  }

  return Array.from({ length: counts.images }, (_, i) => getDocImageUrl(videoNum, i + 1));
}

/**
 * Get doc video URLs for a specific video number.
 * Always returns an array (never null/undefined).
 * Returns empty array for unknown video numbers.
 */
export function getDocVideoUrls(videoNum: number): string[] {
  const counts = DOC_COUNTS[videoNum];
  if (!counts || counts.videos === 0) {
    return [];
  }

  return Array.from({ length: counts.videos }, (_, i) => getDocVideoUrl(videoNum, i + 1));
}
