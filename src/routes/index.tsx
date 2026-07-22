import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowRight, ArrowLeft, Lock } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"splash" | "welcome">("splash");

  useEffect(() => {
    const id = setTimeout(() => setPhase("welcome"), 1800);
    return () => clearTimeout(id);
  }, []);

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

      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
          <Lock className="h-3 w-3 text-[color:var(--gold)]" />
          {t("welcome.confidential")}
        </div>
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        {phase === "splash" ? (
          <div className="flex flex-col items-center gap-6 animate-fade-up">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-[rgba(200,169,106,0.4)] shadow-[0_0_60px_rgba(200,169,106,0.25)]">
              <span className="font-serif text-4xl gold-gradient-text">E</span>
            </div>
            <div>
              <div className="font-serif text-2xl tracking-wide text-[color:var(--foreground)]">
                {t("brand.name")}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[color:var(--muted-foreground)]">
                {t("splash.loading")}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-fade-up">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-[rgba(200,169,106,0.5)] shadow-[0_0_80px_rgba(200,169,106,0.3)]">
              <span className="font-serif text-5xl gold-gradient-text">E</span>
            </div>

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
              {t("welcome.cta")}
              <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
