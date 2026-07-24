import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, videoContent, TOTAL_VIDEOS, VIDEO_URLS, QUESTIONS_DATA, lastAvailableVideo } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { usePageContent } from "@/hooks/usePageContent";
import { VideoStage, type VideoStageHandle } from "@/components/VideoStage";
import { DocumentsGallery } from "@/components/DocumentsGallery";
import { CircularProgressRing } from "@/components/CircularProgressRing";
import {
  HelpCircle,
  Facebook,
  Instagram,
  Youtube,
  X,
  VolumeX,
  Volume2,
  Play,
  Pause,
  FileText,
  ArrowRight,
  ArrowLeft,
  Rewind,
  FastForward,
} from "lucide-react";

export const Route = createFileRoute("/video/$n")({ component: VideoPage });

const SOCIALS = [
  { href: "https://m.facebook.com/profile.php?id=61560667386827", Icon: Facebook, label: "Facebook" },
  { href: "https://www.instagram.com/eid_group1/", Icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@Eidgroup.1", Icon: Youtube, label: "YouTube" },
];

// Double-tap-to-seek increment (seconds). 10s is the conventional step used by
// YouTube / Instagram Reels double-tap seeking — matches user expectations.
const SEEK_STEP = 10;
// Max gap (ms) between two taps to count as a double-tap.
const DOUBLE_TAP_MS = 300;
// How long the up-next thumbnail preview counts down before auto-starting.
const PREVIEW_SECONDS = 3;

function VideoPage() {
  const { n } = Route.useParams();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();
  const num = Math.max(1, Math.min(TOTAL_VIDEOS, parseInt(n, 10) || 1));
  const { row } = usePageContent(`video-${num}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [toast, setToast] = useState("");
  const [modalClosing, setModalClosing] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [tapFeedback, setTapFeedback] = useState<"play" | "pause" | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  // Brief ripple shown on double-tap-to-seek.
  const [seekFlash, setSeekFlash] = useState<{ side: "left" | "right"; id: number } | null>(null);
  // Target video number for the up-next preview transition (null = inactive).
  const [nextPreview, setNextPreview] = useState<number | null>(null);
  const [previewCount, setPreviewCount] = useState(PREVIEW_SECONDS);

  const touchStartX = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wasSwiping = useRef(false);
  const touchHandled = useRef(false);
  const stageRef = useRef<VideoStageHandle>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  // Double-tap bookkeeping.
  const lastTapRef = useRef<{ time: number } | null>(null);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFirst = num === 1;
  const isLast = num === lastAvailableVideo;
  const fallback = videoContent[lang][num - 1];
  const title = row?.titles?.[lang]?.trim() || fallback.title;
  const description = row?.descriptions?.[lang]?.trim() || fallback.description;
  const videoUrl = row?.video_url || VIDEO_URLS[num] || null;
  const imageUrl = row?.image_url || null;
  const overallProgress = ((num - 1) + (progress / 100)) / TOTAL_VIDEOS;
  // Surface taps (toggle / seek) are disabled while any overlay is up.
  const surfaceActive = !showQuestions && !showDocs && !nextPreview && !videoEnded;

  useEffect(() => {
    if (!isUnlocked()) navigate({ to: "/access", replace: true });
  }, [navigate]);

  // Reset all transient state when the video changes.
  useEffect(() => {
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    setShowQuestions(false);
    setModalClosing(false);
    setManuallyPaused(false);
    setShowDocs(false);
    setToast("");
    setVideoEnded(false);
    setNextPreview(null);
    setPreviewCount(PREVIEW_SECONDS);
    setSeekFlash(null);
    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;
    }
    lastTapRef.current = null;
  }, [num]);

  // Clean up any pending single-tap timer on unmount.
  useEffect(() => {
    return () => {
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  // ── Seeking ───────────────────────────────────────────────────────────────
  const doSeek = useCallback((delta: number, side: "left" | "right") => {
    stageRef.current?.seek(delta);
    setSeekFlash({ side, id: Date.now() });
  }, []);

  const togglePlayback = useCallback(() => {
    setManuallyPaused((p) => !p);
    setTapFeedback(isPlaying ? "play" : "pause");
    setTimeout(() => setTapFeedback(null), 600);
  }, [isPlaying]);

  // Unified single/double tap resolver. Single tap toggles playback; a second
  // tap within DOUBLE_TAP_MS seeks (rewind left / skip right).
  const handleSurfaceTap = useCallback(
    (clientX: number, rect: DOMRect) => {
      if (!surfaceActive) return;
      const now = Date.now();
      const relX = clientX - rect.left;
      const isRightHalf = relX > rect.width / 2;
      const last = lastTapRef.current;
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      if (last && now - last.time < DOUBLE_TAP_MS) {
        // Genuine double-tap → seek.
        // Right half of screen = forward in time, left half = backward in time
        // (matches progress bar direction regardless of RTL)
        lastTapRef.current = null;
        doSeek(isRightHalf ? SEEK_STEP : -SEEK_STEP, isRightHalf ? "right" : "left");
        return;
      }
      // Potential single tap — wait to see if a second tap follows.
      lastTapRef.current = { time: now };
      singleTapTimeoutRef.current = setTimeout(() => {
        singleTapTimeoutRef.current = null;
        lastTapRef.current = null;
        togglePlayback();
      }, DOUBLE_TAP_MS);
    },
    [surfaceActive, doSeek, togglePlayback],
  );

  const isInteractiveTarget = (el: HTMLElement | null) =>
    !!el?.closest('button, a, [role="button"], [data-no-tap]');

  // ── Navigation (swipe + buttons) ──────────────────────────────────────────
  const startNextPreview = useCallback(() => {
    if (isLast) return;
    setNextPreview(num + 1);
  }, [num, isLast]);

  const attemptNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        if (isFirst) return;
        navigate({ to: "/video/$n", params: { n: String(num - 1) } });
        return;
      }
      if (isLast) return;
      if (progress < 90 && !videoEnded) {
        showToastMsg(t("questions.blocked"));
        return;
      }
      // End-of-video → show the up-next preview transition before the next clip.
      // Active mid-video skip (swipe) → navigate directly, no preview/modal.
      if (videoEnded) startNextPreview();
      else navigate({ to: "/video/$n", params: { n: String(num + 1) } });
    },
    [progress, num, isFirst, isLast, videoEnded, navigate, t, showToastMsg, startNextPreview],
  );

  // Up-next preview countdown — auto-advance to the next video when it hits 0.
  useEffect(() => {
    if (nextPreview == null) return;
    setPreviewCount(PREVIEW_SECONDS);
    let count = PREVIEW_SECONDS;
    const id = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(id);
        navigate({ to: "/video/$n", params: { n: String(nextPreview) } });
      } else {
        setPreviewCount(count);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [nextPreview, navigate]);

  const closeQuestions = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setShowQuestions(false);
      setModalClosing(false);
    }, 400);
  }, []);

  const handleTimeUpdate = (currentTime: number, dur: number) => {
    if (dur > 0) {
      setProgress((currentTime / dur) * 100);
      setDuration(dur);
    }
  };

  const handlePlay = () => { setIsPlaying(true); setVideoEnded(false); };
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => { setVideoEnded(true); setManuallyPaused(true); setIsPlaying(false); };

  // ── Touch: swipe to navigate, tap to toggle / double-tap to seek ───────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchHandled.current = false;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      wasSwiping.current = true;
      if (dir === "rtl") attemptNavigate(delta > 0 ? "next" : "prev");
      else attemptNavigate(delta > 0 ? "prev" : "next");
      return;
    }
    wasSwiping.current = false;
    if (isInteractiveTarget(e.target as HTMLElement)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    touchHandled.current = true;
    handleSurfaceTap(e.changedTouches[0].clientX, rect);
  };

  // ── Mouse: single/double click (desktop) ──────────────────────────────────
  const handleRootClick = (e: React.MouseEvent) => {
    if (touchHandled.current) { touchHandled.current = false; return; }
    if (wasSwiping.current) { wasSwiping.current = false; return; }
    if (!surfaceActive) return;
    if (isInteractiveTarget(e.target as HTMLElement)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    handleSurfaceTap(e.clientX, rect);
  };

  // ── Scrubber: tap/drag the bottom progress bar to seek ────────────────────
  const scrubToClientX = useCallback(
    (clientX: number) => {
      const el = scrubRef.current;
      const dur = stageRef.current?.getDuration() || duration;
      if (!el || !dur) return;
      const rect = el.getBoundingClientRect();
      // Calculate fraction from left to right (0 = start, 1 = end)
      // This matches the visual progress bar direction regardless of RTL
      const frac = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
      setProgress(frac * 100);
      stageRef.current?.seekTo(frac * dur);
    },
    [duration],
  );

  const questions = QUESTIONS_DATA[num]?.[lang] ?? [];
  const effectivePaused = manuallyPaused || showQuestions || videoEnded;

  return (
    <div
      className="relative h-[100dvh] overflow-hidden bg-black select-none"
      style={{ touchAction: "manipulation" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleRootClick}
    >
      <VideoStage
        ref={stageRef}
        videoUrl={videoUrl}
        posterUrl={imageUrl ?? `/thumbnails/${num}.webp`}
        immersive
        autoPlay
        muted={isMuted}
        paused={effectivePaused}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Scrims */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-black/75 to-transparent" />

      {/* Instagram Stories progress bar — overall sequence progress across all videos */}
      <div className="absolute top-2 left-2 right-2 z-40 flex gap-1">
        {Array.from({ length: TOTAL_VIDEOS }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[color:var(--gold)] transition-all duration-300 ease-out"
              style={{
                width:
                  i < num - 1
                    ? "100%"
                    : i === num - 1
                      ? `${Math.min(progress, 100)}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Circular progress ring — overall completion across all videos */}
      <div className="absolute top-6 right-3 z-45">
        <CircularProgressRing
          percent={overallProgress}
          current={num}
          total={TOTAL_VIDEOS}
        />
      </div>

      {/* Questions button (position/animation always LTR geometry) */}
      <div className="absolute top-6 left-4 z-30">
        <button
          onClick={() => setShowQuestions(true)}
          className="relative flex items-center"
          aria-label="Questions"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(200,169,106,0.4)] bg-black/35 text-[color:var(--gold)] backdrop-blur-md">
            <HelpCircle className="h-5 w-5" />
          </span>
          <span
            className="absolute overflow-hidden whitespace-nowrap left-full ml-2 origin-left"
            style={{ animation: "emerge-icon-ltr 8s ease-in-out infinite" }}
          >
            <span
              dir="auto"
              className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
            >
              {t("questions.prompt")}
            </span>
          </span>
        </button>
      </div>

      {/* Mute/unmute — icon only, below questions */}
      <button
        onClick={() => setIsMuted((m) => !m)}
        className="absolute top-[calc(6px+36px+28px)] left-4 z-30 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/35 text-white/70 backdrop-blur-md transition hover:border-white/30"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {/* Left icon rail: social icons + Documents icon (hidden during end-screen / preview). */}
      {!videoEnded && !nextPreview && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 mt-8 z-30 flex flex-col items-center gap-3">
          {SOCIALS.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
          <button
            onClick={() => setShowDocs(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30"
            aria-label={t("docs.title")}
          >
            <FileText className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* YouTube-style bottom progress bar — interactive scrubber */}
      <div dir="ltr" className="absolute bottom-0 left-0 right-0 z-40" data-no-tap>
        <div
          className="relative flex items-center"
          style={{
            height: 28,
            marginLeft: isPlaying ? 0 : 8,
            marginRight: isPlaying ? 0 : 8,
            marginBottom: isPlaying ? 0 : 4,
          }}
        >
          <div
            ref={scrubRef}
            onPointerDown={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              scrubToClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) scrubToClientX(e.clientX);
            }}
            className="group relative w-full cursor-pointer touch-none"
            style={{
              height: isPlaying ? 2 : 4,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: isPlaying ? 0 : 2,
            }}
          >
            <div
              className="h-full transition-[width] duration-100 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: "var(--gold)",
                borderRadius: isPlaying ? 0 : "0 2px 2px 0",
              }}
            />
            {!isPlaying && (
              <div
                className="absolute top-1/2 transition-all duration-150 ease-out"
                style={{
                  left: `${Math.min(progress, 100)}%`,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "var(--gold)",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 6px rgba(200,169,106,0.5)",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Double-tap-to-seek ripple */}
      {seekFlash && (
        <div className="pointer-events-none absolute inset-0 z-45 flex items-center">
          <div
            key={seekFlash.id}
            className={`absolute top-1/2 -translate-y-1/2 grid h-20 w-20 animate-seek-flash place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm ${
              seekFlash.side === "left" ? "left-[16%]" : "right-[16%]"
            }`}
          >
            <div className="flex flex-col items-center leading-none">
              {seekFlash.side === "left" ? (
                <Rewind className="h-7 w-7" fill="currentColor" />
              ) : (
                <FastForward className="h-7 w-7" fill="currentColor" />
              )}
              <span className="mt-0.5 text-[10px] font-semibold">{SEEK_STEP}s</span>
            </div>
          </div>
        </div>
      )}

      {/* End-screen overlay — darker scrim + center action buttons */}
      {videoEnded && !nextPreview && (
        <div className="absolute inset-0 z-35 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <div className="flex w-64 flex-col gap-3 animate-slide-up">
            <button
              onClick={() => setShowQuestions(true)}
              className="flex items-center justify-center gap-2.5 rounded-full bg-[color:var(--gold)] py-3 text-sm font-semibold text-[color:var(--bg-raw)] shadow-lg transition active:scale-95"
            >
              <HelpCircle className="h-4 w-4" />
              {t("questions.title")}
            </button>
            <button
              onClick={() => setShowDocs(true)}
              className="flex items-center justify-center gap-2.5 rounded-full border border-[rgba(200,169,106,0.4)] bg-white/10 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <FileText className="h-4 w-4" />
              {t("docs.title")}
            </button>
            {!isFirst && (
              <button
                onClick={() => navigate({ to: "/video/$n", params: { n: String(num - 1) } })}
                className="flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("nav.prev")}
              </button>
            )}
            {!isLast && (
              <button
                onClick={() => attemptNavigate("next")}
                className="flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
              >
                <ArrowRight className="h-4 w-4" />
                {t("nav.next")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Up-next thumbnail preview (transition into the next video) */}
      {nextPreview != null && (
        <UpNextPreview
          target={nextPreview}
          count={previewCount}
          title={videoContent[lang][nextPreview - 1]?.title ?? ""}
          onCancel={() => setNextPreview(null)}
          onPlayNow={() => navigate({ to: "/video/$n", params: { n: String(nextPreview) } })}
          t={t}
        />
      )}

      {/* Title + channel-identity block */}
      <div className="absolute bottom-16 left-4 right-4 z-20 rtl:text-right">
        <div dir="ltr" className="mb-2.5 flex items-start justify-end gap-3 pointer-events-none select-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="inline-flex rounded-2xl border-2 border-[rgba(200,169,106,0.5)]"
              style={{ backgroundColor: "#121212", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
            >
              <img src="/logo.webp" alt="" className="h-14 w-auto" />
            </span>
            <span
              className="text-xs font-semibold tracking-wide text-white/90"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4)" }}
            >
              Eid Group
            </span>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {String(num).padStart(2, "0")} — {t("brand.tag")}
        </p>
        <h2
          className="mt-1 font-serif text-xl leading-tight text-white sm:text-2xl"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.4)" }}
        >
          {title}
        </h2>
      </div>

      {/* Tap feedback overlay */}
      {tapFeedback && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <div className="animate-tap-feedback grid h-16 w-16 place-items-center rounded-full bg-black/50 backdrop-blur-sm">
            {tapFeedback === "play" ? (
              <Play className="h-8 w-8 text-white" fill="white" />
            ) : (
              <Pause className="h-8 w-8 text-white" fill="white" />
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
          <div className="animate-shake rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs text-white shadow-2xl backdrop-blur-xl">
            {toast}
          </div>
        </div>
      )}

      {/* Questions glassmorphism modal */}
      {(showQuestions || modalClosing) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className={`absolute inset-0 bg-black/60 transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              modalClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeQuestions}
          />
          <div
            className={`relative max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl sm:rounded-2xl ${
              modalClosing
                ? "translate-y-full opacity-0 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:translate-y-8"
                : "animate-slide-up"
            }`}
          >
            <button
              onClick={closeQuestions}
              className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="mb-5 font-serif text-lg text-[color:var(--gold)]">
              {t("questions.title")}
            </h3>
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((qa, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[rgba(200,169,106,0.15)] bg-black/20 p-4"
                  >
                    <p className="mb-1.5 text-sm font-medium text-[color:var(--gold)]">
                      {qa.q}
                    </p>
                    <p className="text-xs leading-relaxed text-[color:var(--muted-foreground)]">
                      {qa.a}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[color:var(--muted-foreground)]">
                No questions available for this video yet.
              </p>
            )}
            <div className="mt-5 rounded-xl border border-[rgba(200,169,106,0.15)] bg-black/20 p-4">
              <p className="text-xs leading-relaxed text-[color:var(--muted-foreground)]">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents gallery modal */}
      {showDocs && <DocumentsGallery videoNum={num} onClose={() => setShowDocs(false)} />}
    </div>
  );
}

// ── Up-next preview overlay ──────────────────────────────────────────────────
function UpNextPreview({
  target,
  count,
  title,
  onCancel,
  onPlayNow,
  t,
}: {
  target: number;
  count: number;
  title: string;
  onCancel: () => void;
  onPlayNow: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-black">
      <img
        src={`/thumbnails/${target}.webp`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80 backdrop-blur-[2px]" />

      <button
        onClick={onCancel}
        className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition hover:text-white"
        aria-label="Cancel"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-6 text-center animate-preview-in">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
          {t("video.upNext")}
        </p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
          {String(target).padStart(2, "0")} / {TOTAL_VIDEOS}
        </p>
        <h2
          className="max-w-md font-serif text-2xl leading-tight text-white sm:text-3xl"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
        >
          {title}
        </h2>

        <div className="flex flex-col items-center gap-1">
          <span key={count} className="animate-count-pop text-6xl font-semibold text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
            {count}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">
            {t("video.starting")}
          </span>
        </div>

        <button
          onClick={onPlayNow}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110 active:scale-95"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          {t("video.playNow")}
        </button>
      </div>
    </div>
  );
}
