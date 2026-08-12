import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, videoContent, TOTAL_VIDEOS, VIDEO_URLS, lastAvailableVideo, QUESTIONS_DATA } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { markWatched, savePosition, getPosition, isPlayable, WATCH_THRESHOLD } from "@/lib/watchProgress";
import { usePageContent } from "@/hooks/usePageContent";
import { VideoStage, type VideoStageHandle } from "@/components/VideoStage";
import { getVideoDocImages } from "@/lib/docImages";
import { v4ImageUrls, v4VideoUrls } from "@/lib/v4Assets";
import {
  Facebook,
  Instagram,
  Youtube,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  FileText,
  VolumeX,
  Volume2,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Rewind,
  FastForward,
} from "lucide-react";

export const Route = createFileRoute("/video/$n")({ component: VideoPage });

const WHATSAPP_NUMBER = "31644704354";

const SOCIALS = [
  { href: "https://m.facebook.com/profile.php?id=61560667386827", Icon: Facebook, label: "Facebook" },
  { href: "https://www.instagram.com/eid_group1/", Icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@Eidgroup.1", Icon: Youtube, label: "YouTube" },
];

// Double-tap-to-seek increment (seconds). 10s is the conventional step used by
// YouTube / Instagram Reels double-tap seeking — matches user expectations.
const SEEK_STEP = 5;
// Max gap (ms) between two taps to count as a double-tap.
const DOUBLE_TAP_MS = 300;

function VideoPage() {
  const { n } = Route.useParams();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();
  const num = Math.max(1, Math.min(TOTAL_VIDEOS, parseInt(n, 10) || 1));
  const { row } = usePageContent(`video-${num}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [toast, setToast] = useState("");
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [tapFeedback, setTapFeedback] = useState<"play" | "pause" | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loadedDocs, setLoadedDocs] = useState<string[]>([]);
  const [videoDocs, setVideoDocs] = useState<string[]>([]);
  const [docIndex, setDocIndex] = useState<number | null>(null);
  const [videoIndex, setVideoIndex] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<"questions" | "docs" | null>(null);
  // Brief ripple shown on double-tap-to-seek.
  const [seekFlash, setSeekFlash] = useState<{ side: "left" | "right"; id: number } | null>(null);
  const [showQuestionsHint, setShowQuestionsHint] = useState(false);

  const touchStartX = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wasSwiping = useRef(false);
  const touchHandled = useRef(false);
  const stageRef = useRef<VideoStageHandle>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Double-tap bookkeeping.
  const lastTapRef = useRef<{ time: number } | null>(null);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef(0);
  const docLoadedRef = useRef(new Set<string>());

  const isFirst = num === 1;
  const isLast = num === lastAvailableVideo;
  const isLocked = !isPlayable(num);
  const fallback = videoContent[lang][num - 1];
  const title = row?.titles?.[lang]?.trim() || fallback.title;
  const videoUrl = row?.video_url || VIDEO_URLS[num] || null;
  const imageUrl = row?.image_url || null;
  const overallProgress = ((num - 1) + (progress / 100)) / TOTAL_VIDEOS;
  const docCandidates = num === 4 ? v4ImageUrls : getVideoDocImages(num);
  const videoSources = num === 4 ? v4VideoUrls : [];
  const questions = QUESTIONS_DATA[num]?.[lang] ?? [];
  // Surface taps (toggle / seek) are disabled while any overlay is up.
  const surfaceActive = !overlay && !videoEnded && !isLocked;

  useEffect(() => {
    if (!isUnlocked()) navigate({ to: "/access", replace: true });
  }, [navigate]);

  // Reset all transient state when the video changes.
  useEffect(() => {
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    setManuallyPaused(false);
    setIsMuted(false);
    setToast("");
    setVideoEnded(false);
    setSeekFlash(null);
    setLoadedDocs([]);
    setVideoDocs([]);
    setDocIndex(null);
    setVideoIndex(null);
    docLoadedRef.current.clear();
    setOverlay(null);
    setShowQuestionsHint(false);
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
      if (hintRef.current) clearTimeout(hintRef.current);
      const t = stageRef.current?.getCurrentTime();
      if (t != null) savePosition(num, t);
    };
  }, [num]);

  // Populate video docs from static asset list for video 4.
  useEffect(() => { setVideoDocs(videoSources); }, [num]);

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
      if (isLocked) {
        showToastMsg(t("video.mustWatchFirst"));
        return;
      }
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
    [isLocked, surfaceActive, doSeek, togglePlayback, t, showToastMsg],
  );

  const isInteractiveTarget = (el: HTMLElement | null) =>
    !!el?.closest('button, a, [role="button"], [data-no-tap]');

  // ── Navigation (swipe + buttons) ──────────────────────────────────────────
  const attemptNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        if (isFirst) return;
        navigate({ to: "/video/$n", params: { n: String(num - 1) } });
        return;
      }
      if (isLast) return;
      // Free navigation — always allowed, gating is on playback only.
      navigate({ to: "/video/$n", params: { n: String(num + 1) } });
    },
    [num, isFirst, isLast, navigate],
  );

  // Hint cycle: show "Investor Questions" label for 3.5s every 20s.
  // Resets per video (num dependency). Paused while overlay is open.
  useEffect(() => {
    if (overlay) return;
    const id = setInterval(() => {
      setShowQuestionsHint(true);
      clearTimeout(hintRef.current);
      hintRef.current = setTimeout(() => setShowQuestionsHint(false), 3500);
    }, 20000);
    return () => { clearInterval(id); clearTimeout(hintRef.current); };
  }, [overlay, num]);

  const handleTimeUpdate = (currentTime: number, dur: number) => {
    if (dur > 0) {
      const pct = (currentTime / dur) * 100;
      setProgress(pct);
      setDuration(dur);
      if (pct >= WATCH_THRESHOLD) markWatched(num);
      if (Date.now() - lastSaveRef.current > 3000) {
        savePosition(num, currentTime);
        lastSaveRef.current = Date.now();
      }
    }
  };

  const handlePlay = () => { setIsPlaying(true); setVideoEnded(false); };
  const handlePause = () => {
    setIsPlaying(false);
    const t = stageRef.current?.getCurrentTime();
    if (t != null) savePosition(num, t);
  };
  const handleEnded = () => { setVideoEnded(true); setManuallyPaused(true); setIsPlaying(false); markWatched(num); savePosition(num, duration); };

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
      // Mirrors the Replay button: dismiss the completion overlay and resume
      // playback from the scrubbed position.
      setVideoEnded(false);
      setManuallyPaused(false);
    },
    [duration],
  );

  const effectivePaused = manuallyPaused || videoEnded || isLocked;

  return (
    <div
      key={num}
      className="relative h-[100dvh] overflow-hidden bg-black select-none animate-page-entrance"
      style={{ touchAction: "manipulation" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleRootClick}
    >
      <VideoStage
        ref={stageRef}
        videoUrl={videoUrl}
        videoId={num}
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

      {/* PC-only smooth gold edge gradients (mirrors the /intro hero) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[32vw] max-w-[420px] lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(200,169,106,0.9) 0%, rgba(200,169,106,0.45) 32%, rgba(200,169,106,0.14) 62%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[32vw] max-w-[420px] lg:block"
        style={{
          background:
            "linear-gradient(270deg, rgba(200,169,106,0.9) 0%, rgba(200,169,106,0.45) 32%, rgba(200,169,106,0.14) 62%, transparent 100%)",
        }}
      />

      {/* Instagram Stories progress bar — overall sequence progress across all videos */}
      <div className="absolute top-2 left-2 right-2 z-40 flex gap-1">
        {Array.from({ length: TOTAL_VIDEOS }).map((_, i) => {
          const isActive = i === num - 1;
          const fillWidth =
            i < num - 1
              ? "100%"
              : isActive
                ? `${Math.min(progress, 100)}%`
                : "0%";
          return (
            <button
              key={i}
              onClick={() => navigate({ to: "/video/$n", params: { n: String(i + 1) } })}
              className={`h-4 flex-1 overflow-hidden rounded-full bg-white/20 relative cursor-pointer transition active:scale-95 ${isActive ? "ring-1 ring-[color:var(--gold)]" : ""}`}
            >
              <div
                className="h-full rounded-full bg-[color:var(--gold)] transition-all duration-300 ease-out pointer-events-none"
                style={{ width: fillWidth }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mute/unmute + Investor Questions — grouped in the same area */}
      {(!isLocked || !videoEnded) && (
        <div className="absolute top-9 left-4 z-30 flex flex-col items-center gap-3">
          {!isLocked && (
            <button
            onClick={() => setIsMuted((m) => !m)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/35 text-white/70 backdrop-blur-md transition hover:border-white/30"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          )}
          {!videoEnded && (
            <div>
              <button
                onClick={() => setOverlay("questions")}
                aria-label={t("questions.title")}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30 active:scale-90"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              {showQuestionsHint && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 pointer-events-none animate-fade-up ${dir === "rtl" ? "right-full mr-2" : "left-full ml-2"}`}
                >
                  <div className="whitespace-nowrap rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-medium text-white/90 shadow-lg backdrop-blur-md">
                    {t("questions.title")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Left icon rail: social icons + WhatsApp — bottom aligned, slides down on play */}
      {!videoEnded && (
        <div
          className="absolute left-4 z-30 flex flex-col items-center gap-3"
          style={{
            bottom: 72,
            transform: isPlaying ? "translateY(14px)" : "translateY(0)",
            transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
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
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      )}
      {!isLocked && (
      /* YouTube-style bottom progress bar — interactive scrubber */
      <div dir="ltr" className="absolute bottom-0 left-0 right-0 z-40" data-no-tap>
        <div
          className="relative flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ height: isPlaying ? 0 : 28, paddingLeft: isPlaying ? 0 : 8, paddingRight: isPlaying ? 0 : 8 }}
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
            className="group relative w-full cursor-pointer touch-none transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              height: isPlaying ? 4 : 8,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: isPlaying ? 0 : 3,
            }}
          >
            <div
              className="h-full transition-[width] duration-100 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: "var(--gold)",
                borderRadius: isPlaying ? 0 : 3,
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
      )}

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

      {/* End-screen: action buttons + bottom bar */}
      {videoEnded && (
        <div className="absolute inset-0 z-35 flex flex-col bg-black/60 backdrop-blur-[2px]">
          {/* Night-sky stars */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[
              "left-[10%] w-0.5 h-0.5",
              "left-[23%] w-0.5 h-0.5",
              "left-[35%] w-px h-px",
              "left-[48%] w-0.5 h-0.5",
              "left-[60%] w-px h-px",
              "left-[75%] w-0.5 h-0.5",
              "left-[88%] w-px h-px",
              "left-[5%] w-px h-px",
              "left-[18%] w-0.5 h-0.5",
              "left-[30%] w-px h-px",
              "left-[45%] w-0.5 h-0.5",
              "left-[55%] w-px h-px",
              "left-[70%] w-0.5 h-0.5",
              "left-[82%] w-px h-px",
              "left-[92%] w-0.5 h-0.5",
              "left-[8%] w-0.5 h-0.5",
              "left-[22%] w-px h-px",
              "left-[38%] w-0.5 h-0.5",
              "left-[50%] w-px h-px",
              "left-[65%] w-0.5 h-0.5",
              "left-[80%] w-px h-px",
              "left-[15%] w-0.5 h-0.5",
              "left-[42%] w-px h-px",
              "left-[72%] w-0.5 h-0.5",
            ].map((c, i) => (
              <div
                key={i}
                className={`absolute rounded-full bg-white ${c}`}
                style={{
                  top: `${5 + (i * 4) % 95}%`,
                  animation: `drift-up ${20 + (i % 5) * 3}s linear infinite, twinkle ${2.5 + (i % 3) * 0.8}s ease-in-out infinite`,
                  animationDelay: `${i * 1.2}s, ${i * 1.7 + 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Hidden doc preloaders (load in background for when overlay opens) */}
          {docCandidates.map((src) => (
            <img key={src} src={src} alt="" className="hidden"
              onLoad={() => {
                if (!docLoadedRef.current.has(src)) {
                  docLoadedRef.current.add(src);
                  setLoadedDocs((prev) => [...prev, src]);
                }
              }}
            />
          ))}

          <div className="flex flex-col h-full px-6 pb-4 pt-12">
            {/* Top flex spacer — centers the logo + action group vertically
                (paired with the matching spacer above the bottom action bar). */}
            <div className="flex-1" />

            {/* Logo — moved to the top of the end-screen and enlarged; reuses
                the gold-glow-frame animation from the splash/lock screen. */}
            <div className="flex shrink-0 justify-center animate-fade-slide-up mt-4">
              <div className="relative inline-flex">
                <div className="gold-glow-frame" />
                <img
                  src="/logo.webp"
                  alt="Eid Group"
                  className="h-40 w-auto"
                  style={{ marginBottom: -28 }}
                />
              </div>
            </div>

            {/* Unified action group: buttons + social row together, positioned
                lower with breathing room below the logo, animated in as one unit. */}
            <div className="mx-auto mt-8 flex w-[75%] max-w-[240px] flex-col items-center gap-4 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex w-full flex-col items-center gap-3">
                <button onClick={() => setOverlay("questions")}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[color:var(--gold)] py-3.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-lg transition active:scale-95">
                  <HelpCircle className="h-5 w-5" />
                  {t("questions.title")}
                </button>
                <button onClick={() => setOverlay("docs")}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[rgba(200,169,106,0.4)] bg-white/10 py-3.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95">
                  <FileText className="h-5 w-5" />
                  {t("docs.title")}
                </button>
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  {SOCIALS.map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-md transition hover:border-white/30 hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-md transition hover:border-white/30 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Bottom action bar — compact icon row */}
            <div className="shrink-0 flex items-center justify-center gap-6 py-4">
              {!isFirst ? (
                <button onClick={() => navigate({ to: "/video/$n", params: { n: String(num - 1) } })}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30 active:scale-90"
                  aria-label={t("nav.prev")}>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : <div className="h-11 w-11" />}

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-white">{Math.round(overallProgress * 100)}%</span>
                <div className="w-16 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-[color:var(--gold)] transition-all duration-300"
                    style={{ width: `${Math.round(overallProgress * 100)}%` }} />
                </div>
              </div>

              <button onClick={() => { stageRef.current?.seekTo(0); setVideoEnded(false); setManuallyPaused(false); }}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30 active:scale-90"
                aria-label="Replay">
                <RotateCcw className="h-5 w-5" />
              </button>

              {!isLast ? (
                <button onClick={() => navigate({ to: "/video/$n", params: { n: String(num + 1) } })}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:border-white/30 active:scale-90"
                  aria-label={t("nav.next")}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : <div className="h-11 w-11" />}
            </div>
          </div>
        </div>
      )}

      {/* Shared swipeable bottom sheet overlay — renders regardless of videoEnded */}
      {overlay && (
        <ActionSheet
          show={overlay !== null}
          onClose={() => setOverlay(null)}
          title={overlay === "questions" ? t("questions.title") : t("docs.title")}
        >
          {overlay === "questions" ? (
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map((qa, i) => (
                  <div key={i} className="rounded-xl border border-[rgba(200,169,106,0.15)] bg-black/20 p-4">
                    <p className="mb-1.5 text-sm font-medium text-[color:var(--gold)]">{qa.q}</p>
                    <p className="text-xs leading-relaxed text-[color:var(--muted-foreground)]">{qa.a}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[color:var(--muted-foreground)] text-center py-8">
                  No questions available for this video yet.
                </p>
              )}
            </div>
          ) : (
            <div>
              {loadedDocs.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {loadedDocs.map((src, i) => (
                      <button key={src} onClick={() => setDocIndex(i)}
                        className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/30 transition hover:border-[color:var(--gold)] active:scale-95">
                        <img src={src} alt={`${t("docs.title")} ${i + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  {videoDocs.length > 0 && (
                    <div className="mt-2 mb-1">
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--gold)]">
                        {t("video.upNext")}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {videoDocs.map((src, i) => (
                          <button key={src} onClick={() => setVideoIndex(i)}
                            className="group aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/50 transition hover:border-[color:var(--gold)] active:scale-95 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition group-hover:scale-110">
                                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <span className="text-[10px] text-white/80">{t("video.upNext")}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-[color:var(--muted-foreground)] text-center py-8">{t("docs.empty")}</p>
              )}
            </div>
          )}
        </ActionSheet>
      )}

      {/* Fullscreen doc viewer (lightbox) */}
      {docIndex !== null && loadedDocs[docIndex] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85" onClick={() => setDocIndex(null)}>
          <button onClick={() => setDocIndex(null)}
            className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 backdrop-blur-md transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
          {loadedDocs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setDocIndex((prev) => (prev! - 1 + loadedDocs.length) % loadedDocs.length); }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setDocIndex((prev) => (prev! + 1) % loadedDocs.length); }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img src={loadedDocs[docIndex]} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
            {docIndex + 1} / {loadedDocs.length}
          </p>
        </div>
      )}

      {/* Title + logo — bottom anchored, slides down on play */}
      {!videoEnded && (
        <div
          className="absolute left-4 right-4 z-20 rtl:text-right"
          style={{
            bottom: 52,
            transform: isPlaying ? "translateY(14px)" : "translateY(0)",
            transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="flex flex-col gap-1">
            <h2
              className="font-serif text-xl leading-tight text-white sm:text-2xl"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.4)" }}
            >
              {title}
            </h2>
            <div className="flex items-center gap-2.5">
              <div dir="ltr" className="flex items-center gap-2 pointer-events-none select-none">
                <span
                  className="text-xs font-semibold tracking-wide text-white/70"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                >
                  Eid Group
                </span>
                <span className="inline-flex rounded-2xl shrink-0" style={{ backgroundColor: "#121212", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                  <img src="/logo.webp" alt="" className="h-9 w-auto" style={{ display: "block" }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 animate-toast-in" style={{ willChange: "transform" }}>
          <div className="rounded-full border border-white/25 bg-black/45 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl">
            {toast}
          </div>
            </div>
          )}

          {/* Video lightbox */}
          {videoIndex !== null && videoDocs[videoIndex] && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85" onClick={() => setVideoIndex(null)}>
              <button onClick={() => setVideoIndex(null)}
                className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 backdrop-blur-md transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
              {videoDocs.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setVideoIndex((prev) => (prev! - 1 + videoDocs.length) % videoDocs.length); }}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setVideoIndex((prev) => (prev! + 1) % videoDocs.length); }}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <video
                src={videoDocs[videoIndex]}
                className="max-h-[85vh] max-w-[90vw] rounded-xl"
                controls
                autoPlay
                playsInline
                onClick={(e) => e.stopPropagation()}
              />
              <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                {videoIndex + 1} / {videoDocs.length}
              </p>
            </div>
          )}
        </div>
  );
}

// ── Swipeable bottom-sheet overlay ─────────────────────────────────────────────
function ActionSheet({
  show,
  onClose,
  title,
  children,
}: {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragY = useRef(0);
  const [offsetY, setOffsetY] = useState(0);
  const [closing, setClosing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientY < 60) return; // only drag from sheet area
    dragY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - dragY.current;
    if (dy > 0) setOffsetY(dy);
  };

  const handleTouchEnd = () => {
    if (offsetY > 120) {
      setClosing(true);
      setTimeout(onClose, 400);
    } else {
      setOffsetY(0);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${closing ? "opacity-0" : "opacity-100"}`} onClick={handleClose} />
      <div
        ref={sheetRef}
        className={`relative max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl sm:rounded-2xl ${
          closing ? "translate-y-full opacity-0 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:translate-y-8" : "animate-slide-up"
        }`}
        style={!closing && offsetY > 0 ? { transform: `translateY(${offsetY}px)` } : undefined}
      >
        <button onClick={handleClose}
          className="absolute ltr:right-4 rtl:left-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 mb-5">
          <div className="mx-auto h-1 w-8 rounded-full bg-white/30 shrink-0" />
        </div>
        <h3 className="mb-5 font-serif text-lg text-[color:var(--gold)]">{title}</h3>
        {children}
      </div>
    </div>
  );
}
