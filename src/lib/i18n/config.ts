import type { Lang } from "./types";

export const TOTAL_VIDEOS = 5;

// Tracks whether the user has chosen a language on the first-run Language screen.
const LANG_CHOSEN_KEY = "eid_lang_chosen";
export const isLangChosen = (): boolean => {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(LANG_CHOSEN_KEY) === "1"; } catch { return false; }
};
export const markLangChosen = (): void => {
  try { localStorage.setItem(LANG_CHOSEN_KEY, "1"); } catch {}
};

// Hardcoded fallback video URLs (RunASP-hosted)
export const VIDEO_URLS: Record<number, string | null> = {
  1: "https://egroup.runasp.net/videos/v1.mp4",
  2: "https://egroup.runasp.net/videos/v2.mp4",
  3: "https://egroup.runasp.net/videos/v3.mp4",
  4: "https://egroup.runasp.net/videos/v4.mp4",
  5: "https://egroup.runasp.net/videos/v5.mp4",
};

// Last video index with a non-null URL — determines end-of-sequence behavior
export const lastAvailableVideo = Math.max(
  ...Object.entries(VIDEO_URLS)
    .filter(([, url]) => url !== null)
    .map(([key]) => Number(key)),
  1
);

// Full-screen intro motion-graphics video, one track per language.
// Only ar/en have dedicated tracks — "nl" (Dutch) falls back to English.
// RunASP origin sends no CORS headers, so these are consumed via <video>
// elements (media elements are CORS-exempt), never via fetch().
export const INTRO_VIDEO_URLS: Record<"ar" | "en", string> = {
  ar: "https://egroup.runasp.net/videos/intro-ar.webm",
  en: "https://egroup.runasp.net/videos/intro-en.webm",
};

export const getIntroVideoUrl = (lang: Lang): string =>
  INTRO_VIDEO_URLS[lang === "ar" ? "ar" : "en"];