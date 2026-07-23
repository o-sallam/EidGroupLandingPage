import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useI18n, videoContent, TOTAL_VIDEOS, VIDEO_URLS } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { usePageContent } from "@/hooks/usePageContent";
import { VideoStage } from "@/components/VideoStage";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Images,
  FileDown,
  Film,
  HelpCircle,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

export const Route = createFileRoute("/video/$n")({ component: VideoPage });

const SOCIALS = [
  { href: "https://m.facebook.com/profile.php?id=61560667386827", Icon: Facebook, label: "Facebook" },
  { href: "https://www.instagram.com/eid_group1/", Icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@Eidgroup.1", Icon: Youtube, label: "YouTube" },
];

function VideoPage() {
  const { n } = Route.useParams();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();
  const detailsRef = useRef<HTMLDivElement>(null);

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

  const goDetails = () => detailsRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="bg-background">
      {/* ───────── Immersive full-screen video viewport ───────── */}
      <section className="relative h-[100dvh] min-h-[100vh] w-full overflow-hidden bg-black">
        <VideoStage
          videoUrl={videoUrl}
          posterUrl={imageUrl ?? (videoUrl ? "/default-thumbnail.webp" : undefined)}
          immersive
        />

        {/* Legibility scrims (non-interactive so they never block video taps) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-black/75 to-transparent" />

        {/* Top-left: info icon + periodic "Questions" prompt */}
        <button
          onClick={goDetails}
          aria-label={t("questions.prompt")}
          className="absolute top-4 left-4 z-30 flex max-w-[60%] items-center gap-2 text-left rtl:text-right"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(200,169,106,0.4)] bg-black/35 text-[color:var(--gold)] backdrop-blur-md transition group-hover:border-[color:var(--gold)]">
            <HelpCircle className="h-5 w-5" />
          </span>
          <span className="questions-prompt rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            {t("questions.prompt")}
          </span>
        </button>

        {/* Top-right: brand logo overlay */}
        <Link
          to="/portal"
          aria-label={t("brand.name")}
          className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.35)] bg-black/35 px-3 py-1.5 backdrop-blur-md transition hover:border-[color:var(--gold)]"
        >
          <img src="/logo.webp" alt={t("brand.name")} className="h-7 w-auto" />
          <span className="text-xs font-semibold tracking-wide text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {t("brand.name")}
          </span>
        </Link>

        {/* Top-center: subtle pagination dots (desktop only to avoid crowding on mobile) */}
        <div className="absolute top-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1.5 sm:flex">
          {Array.from({ length: TOTAL_VIDEOS }).map((_, i) => {
            const active = i + 1 === num;
            const done = i + 1 < num;
            return (
              <Link
                key={i}
                to="/video/$n"
                params={{ n: String(i + 1) }}
                aria-label={`Video ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${active ? "w-6 bg-[color:var(--gold)]" : done ? "w-3 bg-[color:var(--gold)]/60" : "w-3 bg-white/25"}`}
              />
            );
          })}
        </div>

        {/* Bottom-inner: video title (YouTube Shorts / Stories style) */}
        <div className="absolute bottom-36 left-4 right-4 z-20 rtl:text-right">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {String(num).padStart(2, "0")} — {t("brand.tag")}
          </p>
          <h2 className="mt-1 font-serif text-xl leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-2xl">
            {title}
          </h2>
        </div>

        {/* Floating social bar — above the bottom edge, clears native video controls */}
        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border border-[rgba(200,169,106,0.3)] bg-black/45 px-4 py-2.5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full text-white/90 transition hover:bg-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Scrollable details (below the fold) ───────── */}
      <div ref={detailsRef} className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="card-luxe rounded-2xl p-5">
          <p className="text-[15px] leading-relaxed text-[color:var(--muted-foreground)] whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {gallery.length > 0 && (
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <Images className="h-3.5 w-3.5" /> {t("section.gallery")}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((g, i) => (
                <a key={i} href={g.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border border-[rgba(200,169,106,0.15)] bg-black">
                  <img src={g.url} alt="" loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                </a>
              ))}
            </div>
          </section>
        )}

        {pdfs.length > 0 && (
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <FileText className="h-3.5 w-3.5" /> {t("section.docs")}
            </h3>
            <div className="space-y-2">
              {pdfs.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="card-luxe flex items-center justify-between gap-3 rounded-xl p-4 hover:border-[rgba(200,169,106,0.4)]">
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
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <Film className="h-3.5 w-3.5" /> {t("section.related")}
            </h3>
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

        {/* progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
            <span>{t("video.progress", { n: num, total: TOTAL_VIDEOS })}</span>
            <span className="text-[color:var(--gold)]">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#9C7E43] via-[#C8A96A] to-[#E8CB8A] transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* prev / next */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {isFirst ? (
            <Link to="/portal" className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--gold-soft)]">
              <Prev className="h-4 w-4" /> {t("nav.back")}
            </Link>
          ) : (
            <Link to="/video/$n" params={{ n: String(num - 1) }} className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--gold-soft)]">
              <Prev className="h-4 w-4" /> {t("nav.back")}
            </Link>
          )}
          {isLast ? (
            <Link to="/documents" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110">
              <FileText className="h-4 w-4" /> {t("nav.finish")}
            </Link>
          ) : (
            <Link to="/video/$n" params={{ n: String(num + 1) }} className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110">
              {t("nav.next")} <Next className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* mobile pagination dots */}
        <div className="flex items-center justify-center gap-2 pt-4 sm:hidden">
          {Array.from({ length: TOTAL_VIDEOS }).map((_, i) => {
            const active = i + 1 === num;
            const done = i + 1 < num;
            return (
              <Link key={i} to="/video/$n" params={{ n: String(i + 1) }} aria-label={`Video ${i + 1}`} className={`h-1.5 rounded-full transition-all ${active ? "w-8 bg-[color:var(--gold)]" : done ? "w-4 bg-[color:var(--gold)]/50" : "w-4 bg-white/10"}`} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
