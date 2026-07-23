import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n, markLangChosen, type Lang } from "@/lib/i18n";
import { Check } from "lucide-react";

export const Route = createFileRoute("/lang")({ component: LangSelect });

const OPTIONS: { code: Lang; label: string; glyph: string }[] = [
  { code: "ar", label: "العربية", glyph: "ع" },
  { code: "en", label: "English", glyph: "EN" },
  { code: "nl", label: "Nederlands", glyph: "NL" },
];

const PHRASES = ["اختر اللغة", "Choose your language", "Kies uw taal"];
const DIRS: ("rtl" | "ltr")[] = ["rtl", "ltr", "ltr"];

function LangSelect() {
  const { setLang } = useI18n();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Lang | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (selected) return;
    const interval = setInterval(() => {
      setLeaving(true);
    }, 2800);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
      setLeaving(false);
    }, 700);
    return () => clearTimeout(t);
  }, [leaving]);

  const choose = (code: Lang) => {
    if (selected) return;
    setSelected(code);
    setLang(code);
    markLangChosen();
    setTimeout(() => navigate({ to: "/" }), 650);
  };

  return (
    <div className="relative flex min-h-[100dvh] min-h-[100vh] flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55% 40% at 50% 28%, rgba(200,169,106,0.18), transparent 70%), radial-gradient(45% 30% at 50% 100%, rgba(200,169,106,0.08), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-5 text-center animate-fade-up">
          <img
            src="/logo.webp"
            alt="Eid Group"
            className="h-24 w-auto"
          />

          <div>
            <h1
              className="gold-gradient-text font-['Poppins',sans-serif] text-3xl font-bold tracking-wide"
              style={{
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.8), 0 2px 4px rgba(200,169,106,0.3), 0 4px 8px rgba(200,169,106,0.15)",
              }}
            >
              <span className="shimmer">Eid Group</span>
            </h1>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.5em] text-[color:var(--muted-foreground)]">
              Since 2023
            </p>
          </div>

          <div className="relative h-12 w-full flex items-center justify-center overflow-hidden">
            <p
              dir={DIRS[(phraseIdx + 1) % PHRASES.length]}
              className={`absolute font-serif text-2xl gold-flow-text transition-all duration-700 ease-in-out ${
                leaving
                  ? "opacity-100 translate-y-0 blur-0 [transform:rotateX(0deg)]"
                  : "opacity-0 translate-y-8 blur-sm [transform:rotateX(10deg)]"
              }`}
            >
              {PHRASES[(phraseIdx + 1) % PHRASES.length]}
            </p>
            <p
              dir={DIRS[phraseIdx]}
              className={`font-serif text-2xl gold-flow-text transition-all duration-700 ease-in-out ${
                leaving
                  ? "opacity-0 -translate-y-8 blur-sm [transform:rotateX(-10deg)]"
                  : "opacity-100 translate-y-0 blur-0 [transform:rotateX(0deg)]"
              }`}
            >
              {PHRASES[phraseIdx]}
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {OPTIONS.map((o, i) => {
            const active = selected === o.code;
            return (
              <button
                key={o.code}
                onClick={() => choose(o.code)}
                style={{ animationDelay: `${0.15 + i * 0.12}s` }}
                className={`animate-fade-up group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-lg transition-all duration-300 ${
                  active
                    ? "scale-[1.03] border-[color:var(--gold)] bg-[color:var(--gold-soft)] text-[color:var(--foreground)] shadow-[0_0_45px_rgba(200,169,106,0.45)]"
                    : "border-[rgba(200,169,106,0.2)] bg-[rgba(11,15,20,0.6)] text-[color:var(--foreground)] hover:border-[rgba(200,169,106,0.5)] hover:bg-[rgba(200,169,106,0.08)]"
                }`}
              >
                <span
                  dir={o.code === "ar" ? "rtl" : "ltr"}
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border font-serif text-base transition-colors ${
                    active
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-[color:var(--bg-raw)]"
                      : "border-[rgba(200,169,106,0.35)] bg-[rgba(11,15,20,0.5)] text-[color:var(--gold)]"
                  }`}
                >
                  {o.glyph}
                </span>

                <span dir={o.code === "ar" ? "rtl" : "ltr"} className="flex-1 text-left font-medium tracking-wide rtl:text-right">
                  {o.label}
                </span>

                {active && (
                  <span className="animate-soft-pulse shrink-0 text-[color:var(--gold)]">
                    <Check className="h-5 w-5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
