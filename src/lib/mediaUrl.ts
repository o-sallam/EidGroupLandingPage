/**
 * Media URL builder for remote server.
 * Server layout: {baseUrl}/v{N}docs/images/{i}.webp and v{N}docs/videos/{i}.mp4
 * where i starts at 1 with no gaps.
 */

// Server configuration - can be overridden via VITE_MEDIA_BASE_URL env var
const MEDIA_BASE_URL = (
  import.meta.env.VITE_MEDIA_BASE_URL ?? "https://egroup.runasp.net/videosdocs"
).replace(/\/+$/, "");
export const IMAGES_FOLDER = "images";
export const VIDEOS_FOLDER = "videos";

/**
 * Build a full URL for a doc image by numeric index.
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @param index - The image index (1, 2, 3, etc.)
 */
export function getDocImageUrl(videoNum: number, index: number): string {
  return `${MEDIA_BASE_URL}/v${videoNum}docs/${IMAGES_FOLDER}/${index}.webp`;
}

/**
 * Build a full URL for a doc video by numeric index.
 * @param videoNum - The video number (1, 2, 3, etc.)
 * @param index - The video index (1, 2, 3, etc.)
 */
export function getDocVideoUrl(videoNum: number, index: number): string {
  return `${MEDIA_BASE_URL}/v${videoNum}docs/${VIDEOS_FOLDER}/${index}.mp4`;
}
