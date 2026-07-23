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
    const t1 = setTimeout(() => setTransition(true), 1400);
    const t2 = setTimeout(() => setPhase("welcome"), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  if (phase === "redirect") return null;

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient gold glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(200,169,106,0.18), transparent 70%), radial-gradient(50% 40% at 50% 100%, rgba(200,169,106,0.08), transparent 70%)",
        }}
      />

      {/* Top bar — confidential badge only */}
      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
          <Lock className="h-3 w-3 text-[color:var(--gold)]" />
          {t("welcome.confidential")}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        {phase === "loading" ? (
          <div className="flex flex-col items-center gap-12">
            <img
              src="/logo.webp"
              alt="Eid Group"
               className={`w-96 h-auto transition-all duration-700 ease-out ${
                 transition ? "scale-[0.55] -translate-y-20 opacity-90" : "scale-100 translate-y-0 opacity-100"
              }`}
            />
            <div className={`transition-all duration-500 ease-out ${
              transition ? "opacity-0 scale-90 blur-sm" : "opacity-100 scale-100 blur-0"
            }`}>
              <div className="pyramid-loader" aria-label="Loading">
                <div className="wrapper">
                  <span className="side side1" />
                  <span className="side side2" />
                  <span className="side side3" />
                  <span className="side side4" />
                  <span className="shadow" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-fade-up">
            <img
              src="/logo.webp"
              alt="Eid Group"
              className="w-48 h-auto"
            />

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
