// Document images are served from public/videosdocs/v{n}docs/
// Generates candidate numbered filenames (1.webp through 50.webp).
// The gallery component handles 404s gracefully — only successfully loaded images show.

const MAX_CANDIDATES = 50;

export function getVideoDocImages(videoNum: number): string[] {
  const out: string[] = [];
  const base = `/videosdocs/v${videoNum}docs/`;
  for (let i = 1; i <= MAX_CANDIDATES; i++) {
    out.push(`${base}${i}.webp`);
  }
  return out;
}
