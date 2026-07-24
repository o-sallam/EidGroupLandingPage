import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/intro")({ component: IntroPage });

function IntroPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;
  const Next = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient gold glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(50% 35% at 50% 25%, rgba(200,169,106,0.16), transparent 70%), radial-gradient(40% 30% at 50% 95%, rgba(200,169,106,0.07), transparent 70%)",
        }}
      />

      {/* Top bar */}
      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
        >
          <Prev className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="w-full card-luxe rounded-2xl p-8 animate-fade-up">
          {/* Brand mark */}
          <div className="mb-7 flex flex-col items-center gap-4 text-center">
            <img src="/logo.webp" alt="Eid Group" className="h-16 w-auto" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
              {t("brand.tag")}
            </p>
            {/* Animated gold heading */}
            <h1 className="font-serif text-3xl leading-tight gold-flow-text">
              {t("introPage.title")}
            </h1>
          </div>

          {/* Paragraphs */}
          <div className="space-y-4 text-center">
            <p className="text-[15px] leading-relaxed text-[color:var(--foreground)]">
              {t("introPage.line1")}
            </p>
            <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              {t("introPage.line2")}
            </p>
            <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              {t("introPage.line3")}
            </p>
          </div>

          {/* Continue */}
          <button
            onClick={() => {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                ctx.resume();
              } catch (_) {}
              navigate({ to: "/video/$n", params: { n: "1" } });
            }}
            className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--gold)] px-6 py-3.5 text-sm font-semibold tracking-wide text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110"
          >
            {t("introPage.continue")}
            <Next className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
