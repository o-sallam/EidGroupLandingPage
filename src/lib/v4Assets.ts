// Dynamic asset discovery for video 4 using Vite's import.meta.glob
// Files live in public/videosdocs/v4docs/ — adding/removing files there and
// rebuilding automatically updates the gallery without code changes.

// We match from project root (/public/...) since that's where files are.
// Vite processes these as asset imports and returns the public URL.
const imageModules = import.meta.glob('/public/videosdocs/v4docs/*.{webp,jpg,png,jpeg,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const videoModules = import.meta.glob('/public/videosdocs/v4docs/*.{mp4,webm,ogg,mov}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const v4ImageUrls: string[] = Object.values(imageModules).sort();
export const v4VideoUrls: string[] = Object.values(videoModules).sort();

export function isVideo4AssetsAvailable(): boolean {
  return v4ImageUrls.length > 0 || v4VideoUrls.length > 0;
}
