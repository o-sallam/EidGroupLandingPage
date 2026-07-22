export const ACCESS_CODE = "EID2026";
const KEY = "eid_access_ok";

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function unlock() {
  try { sessionStorage.setItem(KEY, "1"); } catch {}
}
export function lock() {
  try { sessionStorage.removeItem(KEY); } catch {}
}
