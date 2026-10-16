// Document images and videos are loaded from the remote server.
// Uses src/lib/mediaManifest.ts for counts and mediaUrl.ts for URL building.
// Always returns an array (never null/undefined) - safe for .map() and .length.

import { getDocImageUrls, getDocVideoUrls } from "./mediaManifest";

/**
 * Get doc image URLs for a specific video number.
 * Always returns an array (never null/undefined), even for unknown video numbers.
 * Files are numbered 1.webp, 2.webp, etc. with no gaps.
 *
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @returns Array of full URLs to doc images
 */
export function getVideoDocImages(videoNum: number): string[] {
  return getDocImageUrls(videoNum);
}

/**
 * Get doc video URLs for a specific video number.
 * Always returns an array (never null/undefined), even for unknown video numbers.
 * Files are numbered 1.mp4, 2.mp4, etc. with no gaps.
 *
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @returns Array of full URLs to doc videos
 */
export function getVideoDocVideos(videoNum: number): string[] {
  return getDocVideoUrls(videoNum);
}
