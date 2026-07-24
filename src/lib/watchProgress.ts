const WATCHED_KEY_PREFIX = "eid_watched_";
export const WATCH_THRESHOLD = 90;

export function markWatched(num: number): void {
  try { localStorage.setItem(`${WATCHED_KEY_PREFIX}${num}`, "1"); } catch {}
}

export function isWatched(num: number): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(`${WATCHED_KEY_PREFIX}${num}`) === "1"; } catch { return false; }
}

export function isPlayable(num: number): boolean {
  if (num === 1) return true;
  for (let i = 1; i < num; i++) {
    if (!isWatched(i)) return false;
  }
  return true;
}
