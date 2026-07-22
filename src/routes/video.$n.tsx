import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useI18n, videoContent, TOTAL_VIDEOS, VIDEO_URLS } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { PortalShell } from "@/components/PortalShell";
import { VideoStage } from "@/components/VideoStage";
import { usePageContent } from "@/hooks/usePageContent";
import { ArrowLeft, ArrowRight, FileText, Images, FileDown, Film } from "lucide-react";

export const Route = createFileRoute("/video/$n")({ component: VideoPage });

function VideoPage() {
  const { n } = Route.useParams();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();

  const num = Math.max(1, Math.min(TOTAL_VIDEOS, parseInt(n, 10) || 1));
  const { row } = usePageContent(`video-${num}`);

  useEffect(() => {
    if (!isUnlocked()) navigate({ to: "/access", replace: true });
  }, [navigate]);

  useEffect(() => { window.scrollTo(0, 0); }, [num]);

  const fallback = videoContent[lang][num - 1];
  const title = row?.titles?.[lang]?.trim() || fallback.title;
  const description = row?.descriptions?.[lang]?.trim() || fallback.description;
  const videoUrl = row?.video_url || VIDEO_URLS[num] || null;
  const imageUrl = row?.image_url || null;

  const isLast = num === TOTAL_VIDEOS;
  const isFirst = num === 1;

  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;
  const Next = dir === "rtl" ? ArrowLeft : ArrowRight;

  const progressPct = (num / TOTAL_VIDEOS) * 100;
  const gallery = row?.gallery ?? [];
  const pdfs = row?.pdfs ?? [];
  const related = row?.related_videos ?? [];

  return (
    <PortalShell>
      <div key={num} className="animate-fade-up space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
            <span>{t("video.progress", { n: num, total: TOTAL_VIDEOS })}</span>
            <span className="text-[color:var(--gold)]">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9C7E43] via-[#C8A96A] to-[#E8CB8A] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            {String(num).padStart(2, "0")} — {t("brand.tag")}
          </p>
          <h1 className="font-serif text-2xl leading-tight text-[color:var(--foreground)] sm:text-3xl">
            {title}
          </h1>
        </div>

        <VideoStage 
          videoUrl={videoUrl} 
          posterUrl={imageUrl ?? (videoUrl ? "/default-thumbnail.webp" : undefined)} 
        />

        <div className="card-luxe rounded-2xl p-5">
          <p className="text-[15px] leading-relaxed text-[color:var(--muted-foreground)] whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {gallery.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <Images className="h-3.5 w-3.5" /> {t("section.gallery")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((g, i) => (
                <a
                  key={i}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-xl border border-[rgba(200,169,106,0.15)] bg-black"
                >
                  <img
                    src={g.url}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full object-cover transition group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {pdfs.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <FileText className="h-3.5 w-3.5" /> {t("section.docs")}
            </h2>
            <div className="space-y-2">
              {pdfs.map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-luxe flex items-center justify-between gap-3 rounded-xl p-4 hover:border-[rgba(200,169,106,0.4)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[color:var(--gold)]" />
                    <span className="truncate text-sm text-[color:var(--foreground)]">{p.name || "PDF"}</span>
                  </div>
                  <FileDown className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </a>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <Film className="h-3.5 w-3.5" /> {t("section.related")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r, i) => (
                <div key={i} className="card-luxe rounded-xl p-3">
                  <div className="overflow-hidden rounded-lg bg-black">
                    <video className="aspect-[9/16] w-full object-cover" controls playsInline preload="none">
                      <source src={r.url} />
                    </video>
                  </div>
                  {r.title && <p className="mt-2 text-sm text-[color:var(--foreground)]">{r.title}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {isFirst ? (
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--gold-soft)]"
            >
              <Prev className="h-4 w-4" />
              {t("nav.back")}
            </Link>
          ) : (
            <Link
              to="/video/$n"
              params={{ n: String(num - 1) }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--gold-soft)]"
            >
              <Prev className="h-4 w-4" />
              {t("nav.back")}
            </Link>
          )}

          {isLast ? (
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110"
            >
              <FileText className="h-4 w-4" />
              {t("nav.finish")}
            </Link>
          ) : (
            <Link
              to="/video/$n"
              params={{ n: String(num + 1) }}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110"
            >
              {t("nav.next")}
              <Next className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: TOTAL_VIDEOS }).map((_, i) => {
            const active = i + 1 === num;
            const done = i + 1 < num;
            return (
              <Link
                key={i}
                to="/video/$n"
                params={{ n: String(i + 1) }}
                aria-label={`Video ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  active ? "w-8 bg-[color:var(--gold)]" : done ? "w-4 bg-[color:var(--gold)]/50" : "w-4 bg-white/10"
                }`}
              />
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
