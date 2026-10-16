// Document images and videos are loaded from the remote server.
// Uses src/lib/mediaManifest.ts for counts and mediaUrl.ts for URL building.
// Always returns an array (never null/undefined) - safe for .map() and .length.

import { getDocImageUrls, getDocVideoUrls, DOC_COUNTS } from "./mediaManifest";
import docTitlesData from "./docTitles.json";

type DocTitlesConfig = Record<string, { videos: Record<string, string[]> }>;
const docTitles = docTitlesData as DocTitlesConfig;

// DEV-ONLY: Validate that title counts match DOC_COUNTS for each language
if (import.meta.env.DEV) {
  const languages = ["ar", "en", "nl"];
  Object.entries(DOC_COUNTS).forEach(([num, counts]) => {
    const videoNum = parseInt(num, 10);
    if (counts.videos > 0) {
      languages.forEach((lang) => {
        const titleList = docTitles[num]?.videos?.[lang] || [];
        if (titleList.length !== counts.videos) {
          console.warn(
            `[docTitles] Mismatch for video ${videoNum} (${lang}): DOC_COUNTS has ${counts.videos} videos but titles has ${titleList.length}`,
          );
        }
      });
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
 * Get the title for a specific doc video in the requested language.
 * Index is 1-based, matching getDocVideoUrl(videoNum, index).
 * Falls back to Arabic if the requested language is missing.
 *
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @param index - The video index (1, 2, 3, etc.) - 1-based
 * @param lang - The language code (ar, en, nl, etc.)
 * @returns The title string, or undefined if not available
 */
export function getDocVideoTitle(
  videoNum: number,
  index: number,
  lang: string,
): string | undefined {
  const videoEntry = docTitles[String(videoNum)]?.videos;
  if (!videoEntry) {
    return undefined;
  }

  // Try requested language first
  let titleList = videoEntry[lang];
  // Fall back to Arabic if requested language not found
  if (!titleList || titleList.length === 0) {
    titleList = videoEntry["ar"];
  }
  // Still nothing? Give up
  if (!titleList || titleList.length === 0) {
    return undefined;
  }

  const title = titleList[index - 1]; // Convert 1-based to 0-based
  return title && title.trim() ? title : undefined;
}
