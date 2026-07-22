import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ShieldCheck, Facebook, Instagram, Youtube } from "lucide-react";
import type { ReactNode } from "react";

const SOCIALS = [
  { href: "https://m.facebook.com/profile.php?id=61560667386827", Icon: Facebook, label: "Facebook" },
  { href: "https://www.instagram.com/eid_group1/", Icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@Eidgroup.1", Icon: Youtube, label: "YouTube" },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-[rgba(200,169,106,0.12)] bg-[rgba(11,15,20,0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/portal" className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(200,169,106,0.35)] bg-[color:var(--card-raw)]">
              <span className="font-serif text-lg text-[color:var(--gold)]">E</span>
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold tracking-wide text-[color:var(--foreground)]">
                {t("brand.name")}
              </div>
              <div className="truncate text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                {t("brand.tag")}
              </div>
            </div>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-32">{children}</main>

      {/* Fixed social footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(200,169,106,0.15)] bg-[rgba(11,15,20,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--muted-foreground)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--gold)]" />
            <span className="hidden sm:inline">{t("footer.rights")}</span>
          </div>
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] text-[color:var(--gold)] transition hover:border-[color:var(--gold)] hover:bg-[color:var(--gold-soft)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
