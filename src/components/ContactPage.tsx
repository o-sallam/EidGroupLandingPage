import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { isUnlocked } from "@/lib/access";
import { PortalShell } from "@/components/PortalShell";
import { Mail, MessageCircle, Facebook, Instagram, Youtube, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import type { ComponentType } from "react";

type ChannelKey = "whatsapp" | "email" | "facebook" | "instagram" | "youtube" | "linkedin";

const CHANNELS: {
  key: ChannelKey;
  href: string;
  Icon: ComponentType<{ className?: string }>;
  handle: string;
}[] = [
  { key: "whatsapp", href: "https://wa.me/", Icon: MessageCircle, handle: "+•••••••••" },
  { key: "email", href: "mailto:info@eidgroup.com", Icon: Mail, handle: "info@eidgroup.com" },
  { key: "facebook", href: "https://m.facebook.com/profile.php?id=61560667386827", Icon: Facebook, handle: "Eid Group" },
  { key: "instagram", href: "https://www.instagram.com/eid_group1/", Icon: Instagram, handle: "@eid_group1" },
  { key: "youtube", href: "https://www.youtube.com/@Eidgroup.1", Icon: Youtube, handle: "@Eidgroup.1" },
  { key: "linkedin", href: "https://www.linkedin.com/", Icon: Linkedin, handle: "Eid Group" },
];

export function ContactPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;

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
          <h1 className="font-serif text-3xl text-[color:var(--foreground)]">{t("contact.title")}</h1>
          <p className="max-w-xl text-sm text-[color:var(--muted-foreground)]">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CHANNELS.map(({ key, href, Icon, handle }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="card-luxe group flex items-center gap-4 rounded-2xl p-5 transition hover:border-[rgba(200,169,106,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(200,169,106,0.25)]"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[rgba(200,169,106,0.25)] bg-[rgba(11,15,20,0.5)] transition group-hover:border-[color:var(--gold)]">
                <Icon className="h-5 w-5 text-[color:var(--gold)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
                  {t(`contact.${key}`)}
                </div>
                <div className="mt-1 truncate text-sm text-[color:var(--foreground)]">{handle}</div>
              </div>
            </a>
          ))}
        </div>

        <div>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,169,106,0.3)] bg-[rgba(23,28,34,0.6)] px-5 py-2.5 text-sm text-[color:var(--foreground)] transition hover:bg-[color:var(--gold-soft)]"
          >
            <Prev className="h-4 w-4" />
            {t("nav.back")}
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}