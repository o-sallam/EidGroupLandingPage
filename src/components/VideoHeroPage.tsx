import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n, getIntroVideoUrl } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";

// Countdown starts at 30 and counts down to 1 based on video playback time.
const INTRO_COUNTDOWN_START = 30;
// Light fade-to-black before auto-advancing to /video/1 once the video ends
// (or when the user taps Continue / Back).
const EXIT_FADE_MS = 600;

/**
 * Full-viewport motion-graphics video page (replaces the old "7 videos" intro
 * card). Plays the language-appropriate track edge-to-edge with no native
 * player chrome: no controls, no scrubber, no PiP, no context menu.
 *
 * When the video finishes it auto-advances to /video/1 after a brief
 * fade-to-black (the Continue pill lets the user skip ahead earlier).
 *
 * Audio: both tracks carry narration (AAC). Autoplay must start muted in every
 * browser, so we begin muted and immediately try to lift muting once frames
 * are ready — browsers that permit unmuted autoplay after a prior domain
 * interaction (e.g. Chrome: the user tapped through /lang) get sound instantly;
 * stricter engines stay muted until the first tap anywhere on the page. A
 * discreet mute toggle mirrors the /video pages.
 *
 * The video is pre-warmed during the first page's splash via VideoPreloader,
 * so the entrance fade reveals an already-buffered, already-playing video.
 */
export function VideoHeroPage() {
  const { lang, dir, t } = useI18n();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(true);
  const [leaving, setLeaving] = useState(false);
  // True once the user explicitly muted via the toggle — the auto-unmute
  // gesture handler must then stay quiet until they unmute themselves.
  const userMutedRef = useRef(false);
  // Guards against double navigation (ended + Continue tap racing).
  const navigatingRef = useRef(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True when the intro video has ended (Continue button should appear).
  const [videoEnded, setVideoEnded] = useState(false);
  // Countdown number (30 → 1) synced with video playback.
  const [countdown, setCountdown] = useState(INTRO_COUNTDOWN_START);
  // Streaming recovery bookkeeping: reload the source (max RECOVERY_ATTEMPTS)
  // when the stream stalls with no data progress for RECOVERY_MS.
  const RECOVERY_MS = 4500;
  const RECOVERY_ATTEMPTS = 2;
  const stallRef = useRef<{ lastProgress: number; stalledSince: number; attempts: number }>({
    lastProgress: 0,
    stalledSince: 0,
    attempts: 0,
  });
  const src = getIntroVideoUrl(lang);
  // WebM (AV1) is the small, primary stream; the MP4 (H.264) twin is listed
  // second as a codec fallback for devices that can't decode AV1 (Safari etc.).
  const streamSources = [
    { src, type: "video/webm" },
    { src: src.replace(/\.webm$/, ".mp4"), type: "video/mp4" },
  ];

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

  // Stream watchdog — recovers a stream that has gone silent. The origin
  // (RunASP) rejects HTTP range requests, so some engines stream the whole
  // file with a plain 200; if the connection stalls with no data progress,
  // reload the source and resume instead of freezing on a "cut" frame.
  useEffect(() => {
    stallRef.current = { lastProgress: 0, stalledSince: 0, attempts: 0 };
    const id = window.setInterval(() => {
      const v = videoRef.current;
      if (!v || v.ended || v.paused || v.error || v.readyState < 2) return;
      const now = Date.now();
      const t = v.currentTime;
      const progressed = t > stallRef.current.lastProgress;
      if (progressed) {
        stallRef.current.lastProgress = t;
        stallRef.current.stalledSince = 0;
        return;
      }
      if (!stallRef.current.stalledSince) stallRef.current.stalledSince = now;
      if (now - stallRef.current.stalledSince > RECOVERY_MS) {
        if (stallRef.current.attempts >= RECOVERY_ATTEMPTS) return;
        stallRef.current.attempts += 1;
        stallRef.current.stalledSince = 0;
        setBuffering(true);
        v.load();
        v.play().catch(() => {});
      }
    }, 1500);
    return () => window.clearInterval(id);
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

  // Handle video time updates to sync the countdown display.
  // The countdown pauses when the video pauses and stays in sync.
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || v.ended) return;
    const currentTime = v.currentTime;
    // Formula: displayed = clamp(30 - Math.floor(currentTime), 1, 30)
    const value = Math.max(1, Math.min(INTRO_COUNTDOWN_START, INTRO_COUNTDOWN_START - Math.floor(currentTime)));
    setCountdown(value);
  };

  // Handle video end — show Continue button and clear countdown.
  const handleVideoEnded = () => {
    setVideoEnded(true);
    setCountdown(1); // Ensure it's at minimum when video ends
  };

  // Clear any pending exit-fade timer on unmount.
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // Fade to black, then navigate — used when the video ends and by the
  // Continue / Back buttons, so leaving feels like a page transition.
  const leaveWithFade = (go: () => void) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setLeaving(true);
    fadeTimerRef.current = setTimeout(go, EXIT_FADE_MS);
  };

  const goNext = () => leaveWithFade(() => navigate({ to: "/video/$n", params: { n: "1" } }));
  const goBack = () => leaveWithFade(() => navigate({ to: "/" }));

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
    <div
      className={`video-hero animate-page-entrance ${leaving ? "video-hero-leaving" : ""}`}
      dir={dir}
    >
      <video
        key={src}
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onWaiting={() => setBuffering(true)}
        onStalled={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onCanPlayThrough={() => setBuffering(false)}
        onError={() => setFailed(true)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      >
        {/* Primary stream is the small WebM (AV1); MP4 (H.264) twin acts as a
            codec fallback for engines that can't decode AV1. */}
        {streamSources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Buffering indicator — shown while the stream is fetching, so a slow
          network never looks like a frozen/cut video. */}
      {buffering && !failed && (
        <div className="video-hero-buffering" aria-hidden="true">
          <span className="video-hero-buffering-spinner" />
          <span className="video-hero-buffering-text">Loading…</span>
        </div>
      )}

      {/* Graceful fallback if the (large) video fails to load — keeps the page
          navigable instead of showing a dead black screen. */}
      {failed && (
        <div className="video-hero-fallback">
          <img src="/logo.webp" alt="Eid Group" className="h-24 w-auto opacity-80" />
          <p className="text-xs text-[color:var(--muted-foreground)]">{t("video.comingSoon")}</p>
        </div>
      )}

      {/* Page-level navigation — Back and Mute buttons. Continue button appears
          only when the video has ended. */}
      <div className={`video-hero-ui ${videoEnded ? "video-hero-ui-visible" : ""}`}>
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

      {/* Countdown display: shows 30→1 while video plays, hides when video ends. */}
      {!videoEnded && (
        <div
          className="video-hero-countdown"
          aria-hidden="true"
        >
          <span key={countdown} className="video-hero-countdown-number">
            {countdown}
          </span>
        </div>
      )}

      {/* Fade-to-black exit overlay — covers the video + UI on the way out */}
      <div className="video-hero-fade" aria-hidden="true" />
    </div>
  );
}
