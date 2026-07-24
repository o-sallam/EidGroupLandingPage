const STORAGE_KEY = "eid_watch_data";
export const WATCH_THRESHOLD = 90;

function readAll(): Record<number, { w: number; p: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<number, { w: number; p: number }>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function markWatched(num: number): void {
  const data = readAll();
  if (!data[num]) data[num] = { w: 0, p: 0 };
  data[num].w = 1;
  writeAll(data);
}

export function isWatched(num: number): boolean {
  const data = readAll();
  return data[num]?.w === 1;
}

export function savePosition(num: number, position: number): void {
  const data = readAll();
  if (!data[num]) data[num] = { w: 0, p: 0 };
  data[num].p = position;
  writeAll(data);
}

export function getPosition(num: number): number {
  const data = readAll();
  return data[num]?.p ?? 0;
}

export function isPlayable(num: number): boolean {
  if (num === 1) return true;
  if (isWatched(num)) return true;
  if (isWatched(num - 1)) return true;
  return false;
}
