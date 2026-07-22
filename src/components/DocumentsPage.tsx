import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { PortalShell } from "@/components/PortalShell";
import { usePageContent } from "@/hooks/usePageContent";
import { FileText, ArrowRight, ArrowLeft, Mail, FileDown } from "lucide-react";

export function DocumentsPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;
  const { row } = usePageContent("documents");
  const pdfs = row?.pdfs ?? [];

  useEffect(() => {
    if (!isUnlocked()) navigate({ to: "/access", replace: true });
  }, [navigate]);

  return (
    <PortalShell>
      <div className="animate-fade-up space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            {t("brand.tag")}
          </p>
          <h1 className="font-serif text-3xl text-[color:var(--foreground)]">{t("docs.title")}</h1>
          <p className="max-w-xl text-sm text-[color:var(--muted-foreground)]">{t("docs.subtitle")}</p>
        </div>

        {pdfs.length > 0 ? (
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
        ) : (
          <div className="card-luxe flex flex-col items-center gap-4 rounded-2xl p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-[rgba(200,169,106,0.35)] bg-[rgba(11,15,20,0.5)]">
              <FileText className="h-6 w-6 text-[color:var(--gold)]" />
            </div>
            <p className="text-sm text-[color:var(--muted-foreground)]">{t("docs.empty")}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Link
            to="/video/$n"
            params={{ n: "7" }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--gold-soft)]"
          >
            <Prev className="h-4 w-4" />
            {t("nav.back")}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-semibold text-[color:var(--bg-raw)] shadow-[0_10px_30px_-10px_rgba(200,169,106,0.6)] transition hover:brightness-110"
          >
            <Mail className="h-4 w-4" />
            {t("contact.title")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}