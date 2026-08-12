import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n, getIntroVideoUrl } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";

// Delay before the (non-native) page-navigation affordances fade in, so the
// opening view is pure, uncluttered full-screen video. Product can remove the
// <button>s below entirely — the video then loops with no UI at all.
const UI_REVEAL_MS = 6000;

/**
 * Full-viewport motion-graphics video page (replaces the old "7 videos" intro
 * card). Plays the language-appropriate track edge-to-edge with no native
 * player chrome: no controls, no scrubber, no PiP, no context menu.
 *
 * Audio: both tracks carry narration (AAC). Autoplay must start muted in every
 * browser, so we begin muted and immediately try to lift muting once frames
 * are ready — browsers that permit unmuted autoplay after a prior domain
 * interaction (e.g. Chrome: the user tapped through /lang and /access) get
 * sound instantly; stricter engines stay muted until the first tap anywhere
 * on the page. A discreet mute toggle mirrors the /video pages.
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
  const [muted, setMuted] = useState(true);
  // True once the user explicitly muted via the toggle — the auto-unmute
  // gesture handler must then stay quiet until they unmute themselves.
  const userMutedRef = useRef(false);
  const src = getIntroVideoUrl(lang);

  // Playback + progressive unmute. Muted autoplay is permitted in every modern
  // browser; the explicit play() calls (plus canplay/loadeddata hooks) cover
  // stricter engines and start playback the instant frames are buffered.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => v.play().catch(() => {});

    const attemptUnmute = () => {
      if (userMutedRef.current) return;
      v.muted = false;
      v.play()
        .then(() => setMuted(false))
        .catch(() => {
          // Sound blocked without a user gesture — revert and keep playing
          // muted until the first tap (unlock listener below).
          v.muted = true;
          setMuted(true);
          tryPlay();
        });
    };

    const onLoaded = () => {
      tryPlay();
      attemptUnmute();
    };

    tryPlay();
    v.addEventListener("canplay", tryPlay);
    v.addEventListener("loadeddata", onLoaded);
    return () => {
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("loadeddata", onLoaded);
    };
  }, [src]);

  // First user gesture anywhere on the page lifts muting (all browsers allow
  // play-with-sound inside a gesture). Respects an explicit user mute.
  useEffect(() => {
    const unlock = () => {
      if (userMutedRef.current) return;
      const v = videoRef.current;
      if (!v) return;
      v.muted = false;
      setMuted(false);
      v.play().catch(() => {});
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Fade the page-level navigation in late; leave the initial view clean.
  useEffect(() => {
    const id = setTimeout(() => setUiVisible(true), UI_REVEAL_MS);
    return () => clearTimeout(id);
  }, []);

  const goNext = () => navigate({ to: "/video/$n", params: { n: "1" } });
  const goBack = () => navigate({ to: "/" });

  const toggleMute = () => {
    const v = videoRef.current;
    const next = !muted;
    userMutedRef.current = next; // true = user wants it muted
    setMuted(next);
    if (v) {
      v.muted = next;
      if (!next) v.play().catch(() => {}); // click = user gesture, sound allowed
    }
  };

  const Next = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="video-hero animate-page-entrance" dir={dir}>
      <video
        key={src}
        ref={videoRef}
        src={src}
        autoPlay
        muted={muted}
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
          Delete these buttons if product wants a pure looping backdrop. */}
      <div className={`video-hero-ui ${uiVisible ? "video-hero-ui-visible" : ""}`}>
        <button type="button" onClick={goBack} aria-label="Back" className="video-hero-back">
          <Prev className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="video-hero-mute"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={goNext} className="video-hero-continue">
          {t("introPage.continue")}
          <Next className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
