/**
 * Media URL builder for remote server.
 * Server layout: {baseUrl}/v{N}docs/images/<file> and v{N}docs/videos/<file>
 * To change the layout (e.g., flat or different subfolder names), edit these constants.
 */

// Server configuration - edit these to change the layout in one place
// Vite exposes env vars via import.meta.env with VITE_ prefix
const MEDIA_BASE_URL = "https://egroup.runasp.net/videosdocs";
export const IMAGES_FOLDER = "images";
export const VIDEOS_FOLDER = "videos";

/**
 * Build a full URL for a doc image.
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @param fileName - The image file name (e.g., "1.webp")
 */
export function getDocImageUrl(videoNum: number, fileName: string): string {
  const encodedName = encodeURIComponent(fileName);
  // Remove trailing slash from base, add clean path with no double slashes
  return `${MEDIA_BASE_URL}/v${videoNum}docs/${IMAGES_FOLDER}/${encodedName}`;
}

/**
 * Build a full URL for a doc video.
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @param fileName - The video file name (e.g., "doc-v1.mp4")
 */
export function getDocVideoUrl(videoNum: number, fileName: string): string {
  const encodedName = encodeURIComponent(fileName);
  return `${MEDIA_BASE_URL}/v${videoNum}docs/${VIDEOS_FOLDER}/${encodedName}`;
}