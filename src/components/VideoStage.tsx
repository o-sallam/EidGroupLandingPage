import { useI18n } from "@/lib/i18n";
import { Play } from "lucide-react";

type Props = {
  videoUrl?: string | null;
  posterUrl?: string | null;
};

export function VideoStage({ videoUrl, posterUrl }: Props) {
  const { t } = useI18n();

  if (videoUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(200,169,106,0.15)] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <video
          key={videoUrl}
          className="aspect-[9/16] w-full object-cover"
          controls
          playsInline
          preload="none"
          poster={posterUrl ?? undefined}
        >
          <source src={videoUrl} />
        </video>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(200,169,106,0.15)] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
      <div
        className="aspect-[9/16] w-full bg-cover bg-center"
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
