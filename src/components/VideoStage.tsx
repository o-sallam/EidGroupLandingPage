import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Play } from "lucide-react";

type Props = {
  videoUrl?: string | null;
  videoId?: string | number;
  posterUrl?: string | null;
  immersive?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  paused?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
};

export type VideoStageHandle = {
  seek: (delta: number) => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};

export const VideoStage = forwardRef<VideoStageHandle, Props>(function VideoStage(
  { videoUrl, videoId, posterUrl, immersive, autoPlay, muted, paused, onPlay, onPause, onEnded, onTimeUpdate }: Props,
  ref,
) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  // URL captured at the moment playback starts. Stable across late-arriving
  // videoUrl prop changes (e.g. async Supabase row resolving) so the <video>
  // is never re-sourced mid-playback. Cleared only when the video identity changes.
  const lockedUrlRef = useRef<string | null>(null);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  const handlePlayClick = useCallback(() => {
    if (!videoUrl) return;
    // Capture the URL at the moment playback starts so a late-arriving
    // videoUrl prop change (e.g. async Supabase row) can't re-source the
    // <video> mid-playback. See lockedUrlRef + the render branches below.
    lockedUrlRef.current = videoUrl;
    setHasStarted(true);
  }, [videoUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handleTime = () => {
      if (v.duration && onTimeUpdate) onTimeUpdate(v.currentTime, v.duration);
    };
    v.addEventListener("timeupdate", handleTime);
    return () => {
      v.removeEventListener("timeupdate", handleTime);
    };
  }, [videoId, onTimeUpdate, hasStarted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted ?? true;
  }, [muted, videoId, hasStarted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) {
      v.pause();
    } else if (!v.ended) {
      v.play().catch(() => {});
    }
  }, [paused, videoId, hasStarted]);

  // Reset hasStarted + clear the locked URL only when the video identity
  // changes — NOT when the videoUrl prop merely changes value mid-playback.
  useEffect(() => {
    setHasStarted(false);
    lockedUrlRef.current = null;
  }, [videoId]);

  useEffect(() => {
    if (!posterUrl) { setThumbLoaded(false); return; }
    let alive = true;
    setThumbLoaded(false);
    fetch(posterUrl, { method: "HEAD" })
      .then((r) => { if (alive) setThumbLoaded(r.ok); })
      .catch(() => { if (alive) setThumbLoaded(false); });
    return () => { alive = false; };
  }, [posterUrl]);

  useImperativeHandle(
    ref,
    () => ({
      seek: (delta: number) => {
        const v = videoRef.current;
        if (!v || !isFinite(v.duration) || v.duration <= 0) return;
        v.currentTime = Math.max(0, Math.min(v.currentTime + delta, v.duration));
      },
      seekTo: (time: number) => {
        const v = videoRef.current;
        if (!v || !isFinite(v.duration) || v.duration <= 0) return;
        v.currentTime = Math.max(0, Math.min(time, v.duration));
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      getDuration: () => videoRef.current?.duration ?? 0,
    }),
    [],
  );

  // ── Play button overlay (pre-play state) ─────────────────────────────────
  if (videoUrl && !hasStarted) {
    const wrap = immersive
      ? "absolute inset-0 h-full w-full"
      : "relative aspect-[9/16] w-full";
    const DEFAULT_THUMB = "/default-thumbnail.webp";
    const displayUrl = posterUrl ?? DEFAULT_THUMB;

    return (
      <div className={wrap}>
          <div className="absolute inset-0 h-full w-full overflow-hidden cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePlayClick(); }}>
          <img
            src={displayUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="40" fill="none" stroke="rgba(200,169,106,0.35)" strokeWidth="2" className="origin-center animate-ripple" />
                <circle cx="56" cy="56" r="40" fill="none" stroke="rgba(200,169,106,0.35)" strokeWidth="2" className="origin-center animate-ripple-delayed" />
              </svg>
              <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full border-2 border-[rgba(200,169,106,0.6)] bg-[rgba(11,15,20,0.7)] backdrop-blur transition active:scale-90">
                <Play className="h-8 w-8 text-[color:var(--gold)]" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Video element (hasStarted) ──────────────────────────────────────────
  if (lockedUrlRef.current) {
    return (
      <video
        ref={videoRef}
        key={lockedUrlRef.current}
        className={
          immersive
            ? "absolute inset-0 h-full w-full object-cover"
            : "aspect-[9/16] w-full object-cover"
        }
        controls={false}
        playsInline
        autoPlay={autoPlay}
        muted={muted ?? true}
        preload={autoPlay ? "auto" : "none"}
        poster={posterUrl ?? undefined}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      >
        <source src={lockedUrlRef.current} />
      </video>
    );
  }

  // ── Coming-soon fallback (no videoUrl) ──────────────────────────────────
  const wrap = immersive
    ? "absolute inset-0 h-full w-full"
    : "relative aspect-[9/16] w-full";

  const DEFAULT_THUMB = "/default-thumbnail.webp";
  const displayUrl = posterUrl && thumbLoaded ? posterUrl : DEFAULT_THUMB;

  return (
    <div className={wrap}>
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <img
          src={displayUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          {!posterUrl && (
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(200,169,106,0.18), transparent 60%), radial-gradient(circle at 80% 90%, rgba(200,169,106,0.08), transparent 70%)",
              }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-[rgba(200,169,106,0.5)] bg-[rgba(11,15,20,0.6)] backdrop-blur animate-soft-pulse">
              <Play className="h-6 w-6 text-[color:var(--gold)]" fill="currentColor" />
            </div>
            <div className="space-y-1 px-6">
              <p className="font-serif text-lg text-[color:var(--foreground)]">{t("video.comingSoon")}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
                {t("video.arabicNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
