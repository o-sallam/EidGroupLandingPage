// Document images are loaded from the remote server.
// Uses src/lib/mediaManifest.ts for the file list and mediaUrl.ts for URL building.
// Always returns an array (never null/undefined) - safe for .map() and .length.

import { getDocImageUrls } from "./mediaManifest";

/**
 * Get doc image URLs for a specific video number.
 * Always returns an array (never null/undefined), even for unknown video numbers.
 * Sorts numerically by extracting the number from filenames.
 *
 * 
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @returns Array of full URLs to doc images
 */
export function getVideoDocImages(videoNum: number): string[] {
  // getDocImageUrls already handles empty manifest entries safely
  return getDocImageUrls(videoNum);
}
