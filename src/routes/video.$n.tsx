import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, videoContent, TOTAL_VIDEOS, VIDEO_URLS, QUESTIONS_DATA } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { usePageContent } from "@/hooks/usePageContent";
import { VideoStage } from "@/components/VideoStage";
import {
  HelpCircle,
  Facebook,
  Instagram,
  Youtube,
  X,
  VolumeX,
  Volume2,
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
  const num = Math.max(1, Math.min(TOTAL_VIDEOS, parseInt(n, 10) || 1));
  const { row } = usePageContent(`video-${num}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNav, setPendingNav] = useState<"prev" | "next" | null>(null);
  const [toast, setToast] = useState("");

  const touchStartX = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const isFirst = num === 1;
  const isLast = num === TOTAL_VIDEOS;
  const fallback = videoContent[lang][num - 1];
  const title = row?.titles?.[lang]?.trim() || fallback.title;
  const description = row?.descriptions?.[lang]?.trim() || fallback.description;
  const videoUrl = row?.video_url || VIDEO_URLS[num] || null;
  const imageUrl = row?.image_url || null;

  useEffect(() => {
    if (!isUnlocked()) navigate({ to: "/access", replace: true });
  }, [navigate]);

  useEffect(() => {
    setProgress(0);
    setIsPlaying(false);
    setShowQuestions(false);
    setShowConfirm(false);
    setPendingNav(null);
    setToast("");
  }, [num]);

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const attemptNavigate = useCallback((direction: "prev" | "next") => {
    if (direction === "prev") {
      if (isFirst) return;
      navigate({ to: "/video/$n", params: { n: String(num - 1) } });
      return;
    }
    if (isLast) {
      navigate({ to: "/documents" });
      return;
    }
    if (progress < 90) {
      showToastMsg(t("questions.blocked"));
      return;
    }
    setPendingNav("next");
    setShowConfirm(true);
  }, [progress, num, isFirst, isLast, navigate, t, showToastMsg]);

  const confirmNav = () => {
    setShowConfirm(false);
    if (pendingNav === "next") {
      navigate({ to: "/video/$n", params: { n: String(num + 1) } });
    }
    setPendingNav(null);
  };

  const cancelNav = () => {
    setShowConfirm(false);
    setPendingNav(null);
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (duration > 0) setProgress((currentTime / duration) * 100);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (dir === "rtl") attemptNavigate(delta > 0 ? "next" : "prev");
      else attemptNavigate(delta > 0 ? "prev" : "next");
    }
  };

  const questions = QUESTIONS_DATA[num]?.[lang] ?? [];

  return (
    <div
      className="relative h-[100dvh] overflow-hidden bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <VideoStage
        videoUrl={videoUrl}
        posterUrl={imageUrl ?? (videoUrl ? "/default-thumbnail.webp" : undefined)}
        immersive
        autoPlay
        muted={isMuted}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Scrims */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-black/75 to-transparent" />

      {/* Instagram Stories progress bar */}
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

      {/* Social bar above brand + title */}
      <div
        className={`absolute left-1/2 z-30 -translate-x-1/2 transition-all duration-500 ${
          isPlaying
            ? "pointer-events-none invisible translate-y-2 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        style={{ bottom: "calc(36px + 13rem)" }}
      >
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

      {/* Title + channel-identity block */}
      <div className="absolute bottom-36 left-4 right-4 z-20 rtl:text-right">
        <div dir="ltr" className="flex justify-end items-center gap-3 mb-2.5 pointer-events-none select-none">
          <span
            className="text-sm font-semibold tracking-wide text-white/90"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4)" }}
          >
            {t("brand.name")}
          </span>
          <span
            className="inline-flex rounded-xl border-2 border-[rgba(200,169,106,0.5)] bg-white"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
          >
            <img src="/logo.webp" alt="" className="h-14 w-auto" />
          </span>
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

      {/* Tap zones */}
      {!isFirst && (
        <div
          className="absolute bottom-0 left-0 top-0 z-20 w-1/4 cursor-pointer"
          onClick={() => attemptNavigate("prev")}
        />
      )}
      {!isLast && (
        <div
          className="absolute bottom-0 right-0 top-0 z-20 w-1/4 cursor-pointer"
          onClick={() => attemptNavigate("next")}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
          <div className="animate-shake rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs text-white shadow-2xl backdrop-blur-xl">
            {toast}
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={cancelNav} />
          <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.95)] p-6 shadow-2xl backdrop-blur-xl">
            <p className="mb-6 text-center text-sm text-[color:var(--foreground)]">
              {t("questions.confirm")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmNav}
                className="flex-1 rounded-full bg-[color:var(--gold)] py-2.5 text-sm font-semibold text-[color:var(--bg-raw)]"
              >
                {t("questions.confirmYes")}
              </button>
              <button
                onClick={cancelNav}
                className="flex-1 rounded-full border border-[rgba(200,169,106,0.3)] py-2.5 text-sm text-[color:var(--foreground)]"
              >
                {t("questions.confirmNo")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions glassmorphism modal */}
      {showQuestions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowQuestions(false)}
          />
          <div className="relative max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl sm:rounded-2xl">
            <button
              onClick={() => setShowQuestions(false)}
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="mb-5 font-serif text-lg text-[color:var(--gold)]">
              Questions & Answers
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
    </div>
  );
}
