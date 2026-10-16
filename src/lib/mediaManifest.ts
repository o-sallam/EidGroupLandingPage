/**
 * Static manifest of document files available on the remote server.
 *
 * To add a file: upload it to the server folder (e.g., v2docs/images/),
 * then add its file name to the appropriate array below.
 *
 * Server layout: {baseUrl}/v{N}docs/images/<file> and v{N}docs/videos/<file>
 *
 * IMPORTANT: Never return null/undefined. All arrays must be empty arrays []
 * for video numbers that don't have files yet. Consumers expect arrays.
 */

import { getDocImageUrl, getDocVideoUrl } from "./mediaUrl";

export interface VideoDocManifest {
  images: string[]; // File names only (e.g., ["1.webp", "2.webp"])
  videos: string[]; // File names only (e.g., ["doc-v1.mp4"])
}

/**
 * Static manifest keyed by video number.
 * - v1docs: has images 1-5.webp
 * - v2docs: videos doc-v1.mp4
 * - v3docs: no docs yet (empty)
 * - v4docs: has images 1-4.webp, videos doc-v1.mp4, doc-v2.mp4, doc-v3.mp4
 * - v5docs: no docs yet (empty)
 */
export const MEDIA_MANIFEST: Record<number, VideoDocManifest> = {
  1: {
    images: ["1.webp", "2.webp", "3.webp", "4.webp", "5.webp"],
    videos: [],
  },
  2: {
    images: [],
    videos: ["doc-v1.mp4"],
  },
  3: {
    images: [],
    videos: [],
  },
  4: {
    images: ["1.webp", "2.webp", "3.webp", "4.webp"],
    videos: ["doc-v1.mp4", "doc-v2.mp4", "doc-v3.mp4"],
  },
  5: {
    images: [],
    videos: [],
  },
};

/**
 * Get doc image URLs for a specific video number.
 * Always returns an array (never null/undefined).
 * Sorts numerically by extracting the number from the filename.
 */
export function getDocImageUrls(videoNum: number): string[] {
  const manifest = MEDIA_MANIFEST[videoNum];
  if (!manifest || !manifest.images || manifest.images.length === 0) {
    return [];
  }

  return [...manifest.images]
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/(\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    })
    .map((fileName) => getDocImageUrl(videoNum, fileName));
}

/**
 * Get doc video URLs for a specific video number.
 * Always returns an array (never null/undefined).
 * Sorts alphabetically to maintain consistent order.
 */
export function getDocVideoUrls(videoNum: number): string[] {
  const manifest = MEDIA_MANIFEST[videoNum];
  if (!manifest || !manifest.videos || manifest.videos.length === 0) {
    return [];
  }

  return [...manifest.videos].sort().map((fileName) => getDocVideoUrl(videoNum, fileName));
}
