// Deployment-stamped storage purge.
//
// __APP_VERSION__ is injected at build time (see vite.config.ts) and is unique
// per deployment — on Vercel it's the git commit SHA of the push. On every new
// deployment the version differs, so we wipe the client's localStorage once and
// re-stamp it. Repeat visitors get a clean slate per release; nothing clears
// between visits to the same deployment.
const VERSION_KEY = "eid:storage-version";

export const APP_VERSION: string = __APP_VERSION__;

export function purgeStaleStorage(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(VERSION_KEY) !== APP_VERSION) {
      window.localStorage.clear();
      window.localStorage.setItem(VERSION_KEY, APP_VERSION);
    }
  } catch {
    // Storage unavailable (private browsing / blocked) — nothing to purge.
  }
}

// Runs on the client, at module load, before React hydrates; a no-op on the
// server where there is no window.
purgeStaleStorage();