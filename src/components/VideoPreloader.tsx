import { useEffect, useRef } from "react";
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
 * - Uses a real <video preload="auto"> element instead of fetch(): the RunASP
 *   origin sends no CORS headers (a fetch() would be blocked), while media
 *   elements are exempt from CORS and buffer into the browser cache.
 * - Never hidden with `display:none` (some engines skip loading); it sits
 *   off-screen at 1×1px with opacity ~0.
 * - Only the currently-selected language is preloaded — never both.
 */
export function VideoPreloader() {
  const { lang } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = getIntroVideoUrl(lang);
  const active = typeof window !== "undefined" && isLangChosen();

  useEffect(() => {
    if (!active) return;
    const v = videoRef.current;
    if (!v) return;
    // Force the download to actually begin (covers engines that defer media
    // loading for off-screen elements).
    v.preload = "auto";
    v.load();
  }, [active, src]);

  if (!active) return null;

  return (
    <video
      key={src}
      ref={videoRef}
      src={src}
      preload="auto"
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
      className="video-preloader"
    />
  );
}
