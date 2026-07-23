import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n, isLangChosen } from "@/lib/i18n";
import { ArrowRight, ArrowLeft, Lock } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"redirect" | "loading" | "welcome">("redirect");
  const [transition, setTransition] = useState(false);

  useEffect(() => {
    if (!isLangChosen()) {
      navigate({ to: "/lang", replace: true });
      return;
    }
    setPhase("loading");
    const t1 = setTimeout(() => setTransition(true), 2200);
    const t2 = setTimeout(() => setPhase("welcome"), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  if (phase === "redirect") return null;

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(200,169,106,0.18), transparent 70%), radial-gradient(50% 40% at 50% 100%, rgba(200,169,106,0.08), transparent 70%)",
        }}
      />

      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
          <Lock className="h-3 w-3 text-[color:var(--gold)]" />
          {t("welcome.confidential")}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        {/* ─── Shared branding block (never unmounts) ─── */}
        <div
          className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${
            transition
              ? "scale-[0.45] -translate-y-6"
              : "scale-100 translate-y-0"
          }`}
        >
          {/* Logo + gold glow frame */}
          <div className="relative inline-flex">
            {phase !== "welcome" && (
              <div
                className={`gold-glow-frame transition-all duration-500 ease-out ${
                  transition
                    ? "opacity-0 scale-90 blur-sm"
                    : "opacity-100 scale-100 blur-0"
                }`}
              />
            )}
            <img
              src="/logo.webp"
              alt="Eid Group"
              className="h-64 w-auto"
            />
          </div>

          {/* Branding text */}
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-500 ease-out ${
              phase === "welcome"
                ? "opacity-0"
                : transition
                  ? "opacity-60"
                  : "opacity-100"
            }`}
          >
            <h1
              className="gold-gradient-text font-['Poppins',sans-serif] text-5xl font-bold tracking-wider sm:text-6xl"
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(200,169,106,0.12)) drop-shadow(0 0 60px rgba(200,169,106,0.05))",
              }}
            >
              <span
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(200,169,106,0.05) 35%, rgba(200,169,106,0.09) 50%, rgba(200,169,106,0.05) 65%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  animation: "eid-ambient-shimmer 8s ease-in-out infinite",
                }}
              >
                Eid Group
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[color:var(--muted-foreground)]">
              Since 2023
            </p>
          </div>
        </div>

        {/* ─── Welcome content — only in DOM once transition begins,
              so the branding block sits alone at center during loading ─── */}
        {(transition || phase === "welcome") && (
          <div
            className={`flex flex-col items-center gap-8 mt-8 ${
              phase === "welcome"
                ? "animate-fade-up"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
                {t("brand.tag")}
              </p>
              <h1 className="font-serif text-3xl leading-tight text-[color:var(--foreground)] sm:text-4xl">
                {t("welcome.title")}
              </h1>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                {t("welcome.subtitle")}
              </p>
            </div>

            <button
              onClick={() => navigate({ to: "/access" })}
              className="group inline-flex items-center gap-3 rounded-full bg-[color:var(--gold)] px-8 py-3.5 text-sm font-semibold tracking-wide text-[color:var(--bg-raw)] shadow-[0_10px_40px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110"
            >
              <Arrow className="h-4 w-4 transition-all duration-700 rtl:cta-arrow-anim-rtl ltr:cta-arrow-anim" />
              {t("welcome.cta")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
