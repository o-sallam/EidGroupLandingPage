import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ACCESS_CODE, unlock } from "@/lib/access";
import { KeyRound, Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/access")({ component: AccessPage });

function AccessPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      unlock();
      navigate({ to: "/intro" });
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 20%, rgba(200,169,106,0.15), transparent 70%)",
        }}
      />
      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="w-full card-luxe rounded-2xl p-8 animate-fade-up">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-[rgba(200,169,106,0.4)] bg-[rgba(11,15,20,0.5)]">
              <KeyRound className="h-6 w-6 text-[color:var(--gold)]" />
            </div>
            <h1 className="font-serif text-2xl text-[color:var(--foreground)]">{t("access.title")}</h1>
            <p className="text-sm text-[color:var(--muted-foreground)]">{t("access.subtitle")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              placeholder={t("access.placeholder")}
              autoComplete="off"
              autoFocus
              className="w-full rounded-xl border border-[rgba(200,169,106,0.2)] bg-[rgba(11,15,20,0.6)] px-4 py-3.5 text-center font-mono text-lg tracking-[0.5em] text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--gold)] focus:shadow-[0_0_0_3px_rgba(200,169,106,0.15)]"
            />
            {error && (
              <p className="text-center text-sm text-red-400 animate-fade-up">{t("access.error")}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-[color:var(--gold)] px-6 py-3.5 text-sm font-semibold tracking-wide text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110"
            >
              {t("access.submit")}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
            <Lock className="h-3 w-3 text-[color:var(--gold)]" />
            {t("access.locked")}
          </div>
        </div>
      </div>
    </div>
  );
}
