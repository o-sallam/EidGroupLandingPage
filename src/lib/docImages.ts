// Document images and videos are loaded from the remote server.
// Uses src/lib/mediaManifest.ts for counts and mediaUrl.ts for URL building.
// Always returns an array (never null/undefined) - safe for .map() and .length.

import { getDocImageUrls, getDocVideoUrls, DOC_COUNTS } from "./mediaManifest";
import docTitlesData from "./docTitles.json";

type DocTitlesConfig = Record<string, { videos: string[] }>;
const docTitles = docTitlesData as DocTitlesConfig;

// DEV-ONLY: Validate that title counts match DOC_COUNTS
if (import.meta.env.DEV) {
  Object.entries(DOC_COUNTS).forEach(([num, counts]) => {
    const videoNum = parseInt(num, 10);
    const titleList = docTitles[num]?.videos || [];
    if (counts.videos > 0 && titleList.length !== counts.videos) {
      console.warn(
        `[docTitles] Mismatch for video ${videoNum}: DOC_COUNTS has ${counts.videos} videos but titles has ${titleList.length}`,
      );
    }
  });
}

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

/**
 * Get the title for a specific doc video.
 * Index is 1-based, matching getDocVideoUrl(videoNum, index).
 *
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @param index - The video index (1, 2, 3, etc.) - 1-based
 * @returns The title string, or undefined if not available
 */
export function getDocVideoTitle(videoNum: number, index: number): string | undefined {
  const titleList = docTitles[String(videoNum)]?.videos;
  if (!titleList || titleList.length === 0) {
    return undefined;
  }
  const title = titleList[index - 1]; // Convert 1-based to 0-based
  return title && title.trim() ? title : undefined;
}
