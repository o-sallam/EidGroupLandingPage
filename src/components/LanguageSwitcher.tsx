import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-[rgba(200,169,106,0.25)] bg-[rgba(23,28,34,0.7)] p-1 backdrop-blur-md ${className}`}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            className={`min-w-10 rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all ${
              active
                ? "bg-[color:var(--gold)] text-[color:var(--bg-raw)] shadow-[0_0_20px_rgba(200,169,106,0.35)]"
                : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
