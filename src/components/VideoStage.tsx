import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Play } from "lucide-react";

type Props = {
  videoUrl?: string | null;
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

export function VideoStage({ videoUrl, posterUrl, immersive, autoPlay, muted, paused, onPlay, onPause, onEnded, onTimeUpdate }: Props) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    const handleTime = () => {
      if (v.duration && onTimeUpdate) onTimeUpdate(v.currentTime, v.duration);
    };
    v.addEventListener("timeupdate", handleTime);
    return () => {
      v.removeEventListener("timeupdate", handleTime);
    };
  }, [videoUrl, onTimeUpdate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    v.muted = muted ?? true;
  }, [muted, videoUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    if (paused) {
      v.pause();
    } else if (!v.ended) {
      v.play().catch(() => {});
    }
  }, [paused, videoUrl]);

  if (videoUrl) {
    return (
      <video
        ref={videoRef}
        key={videoUrl}
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
        <source src={videoUrl} />
      </video>
    );
  }

  const wrap = immersive
    ? "absolute inset-0 h-full w-full"
    : "relative aspect-[9/16] w-full";

  return (
    <div className={wrap}>
      <div
        className="h-full w-full bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          {!posterUrl && (
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(200,169,106,0.18), transparent 60%), radial-gradient(circle at 80% 90%, rgba(200,169,106,0.08), transparent 70%)",
              }}
            />
          )}
          {posterUrl && <div className="absolute inset-0 bg-black/40" />}
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
}
