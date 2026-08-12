import { useEffect } from "react";
import { useI18n, isLangChosen, getIntroVideoUrl } from "@/lib/i18n";

/**
 * Invisible full-video preloader for the /intro hero video.
 *
 * Mounted at the app root (inside I18nProvider) so it survives route changes:
 * the download begins while the first page's splash/loader is showing and keeps
 * buffering through the welcome screen and /access, so by the time the user
 * reaches /intro the video starts instantly from the HTTP cache — no spinner.
 *
 * Implementation notes:
 * - The <video> element is created imperatively inside an effect and appended
 *   to <body>; this component always renders null. Rendering it in the React
 *   tree would break hydration: the server cannot know whether a language was
 *   chosen (localStorage is client-only), so server and client would disagree
 *   on whether the element exists.
 * - Uses a real <video preload="auto"> element instead of fetch(): the RunASP
 *   origin sends no CORS headers (a fetch() would be blocked), while media
 *   elements are exempt from CORS and buffer into the browser cache.
 * - Never hidden with `display:none` (some engines skip loading); it sits
 *   off-screen at 1×1px with opacity ~0.
 * - Only the currently-selected language is preloaded — never both.
 */
export function VideoPreloader() {
  const { lang } = useI18n();
  const src = getIntroVideoUrl(lang);
  // Re-read on every render so the flag flip (language chosen on /lang, or a
  // later LanguageSwitcher change) re-triggers the effect via `active`.
  const active = typeof window !== "undefined" && isLangChosen();

  useEffect(() => {
    if (!active) return;
    const v = document.createElement("video");
    v.src = src;
    v.preload = "auto";
    v.muted = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    v.tabIndex = -1;
    v.className = "video-preloader";
    document.body.appendChild(v);
    // Force the download to actually begin (covers engines that defer media
    // loading for off-screen elements).
    v.load();
    return () => v.remove();
  }, [active, src]);

  return null;
}
