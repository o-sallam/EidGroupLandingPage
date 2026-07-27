// Document images are served from public/videosdocs/v{n}docs/
// Uses Vite's import.meta.glob to build a build-time manifest of files that
// actually exist — mirrors the pattern already used for video 4 in v4Assets.ts.
// This produces zero runtime 404s (previously probed 1..50.webp per video).

const modules = import.meta.glob('/public/videosdocs/v*docs/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function getVideoDocImages(videoNum: number): string[] {
  const prefix = `/public/videosdocs/v${videoNum}docs/`;
  return Object.entries(modules)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/(\d+)\.webp$/)?.[1] ?? '0', 10);
      const numB = parseInt(b.match(/(\d+)\.webp$/)?.[1] ?? '0', 10);
      return numA - numB;
    })
    .map(([, url]) => url);
}
