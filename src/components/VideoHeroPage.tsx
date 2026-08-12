import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n, getIntroVideoUrl } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Delay before the (non-native) page-navigation affordances fade in, so the
// opening view is pure, uncluttered full-screen video. Product can remove the
// two <button>s below entirely — the video then loops with no UI at all.
const UI_REVEAL_MS = 6000;

/**
 * Full-viewport motion-graphics video page (replaces the old "7 videos" intro
 * card). Plays the language-appropriate track edge-to-edge with no native
 * player chrome: no controls, no scrubber, no volume, no PiP, no context menu.
 *
 * The video is pre-warmed during the first page's splash via VideoPreloader,
 * so the entrance fade reveals an already-buffered, already-playing video.
 */
export function VideoHeroPage() {
  const { lang, dir, t } = useI18n();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uiVisible, setUiVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getIntroVideoUrl(lang);

  // Muted autoplay is permitted in every modern browser; the explicit play()
  // calls (plus canplay/loadeddata hooks) cover stricter engines and start
  // playback the instant frames are buffered — no user gesture required.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    v.addEventListener("loadeddata", tryPlay);
    return () => {
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("loadeddata", tryPlay);
    };
  }, [src]);

  // Fade the page-level navigation in late; leave the initial view clean.
  useEffect(() => {
    const id = setTimeout(() => setUiVisible(true), UI_REVEAL_MS);
    return () => clearTimeout(id);
  }, []);

  const goNext = () => navigate({ to: "/video/$n", params: { n: "1" } });
  const goBack = () => navigate({ to: "/" });

  const Next = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="video-hero animate-page-entrance" dir={dir}>
      <video
        key={src}
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        loop
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onError={() => setFailed(true)}
      />

      {/* Graceful fallback if the (large) video fails to load — keeps the page
          navigable instead of showing a dead black screen. */}
      {failed && (
        <div className="video-hero-fallback">
          <img src="/logo.webp" alt="Eid Group" className="h-24 w-auto opacity-80" />
          <p className="text-xs text-[color:var(--muted-foreground)]">{t("video.comingSoon")}</p>
        </div>
      )}

      {/* Page-level navigation — NOT player chrome. Deliberately minimal and
          brand-styled; fades in after the video has been on screen a while.
          Delete both buttons if product wants a pure looping backdrop. */}
      <div className={`video-hero-ui ${uiVisible ? "video-hero-ui-visible" : ""}`}>
        <button type="button" onClick={goBack} aria-label="Back" className="video-hero-back">
          <Prev className="h-4 w-4" />
        </button>
        <button type="button" onClick={goNext} className="video-hero-continue">
          {t("introPage.continue")}
          <Next className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
