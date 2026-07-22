import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en" | "nl";

type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = {
  ar: {
    "brand.name": "مجموعة عيد",
    "brand.tag": "غرفة بيانات الاستثمار",
    "splash.loading": "جارٍ التحضير…",
    "welcome.title": "عرض استثماري خاص",
    "welcome.subtitle": "ملف سرّي مُعدّ حصريًا للبنوك وشركات الاستثمار والمستثمرين الخاصين.",
    "welcome.cta": "ابدأ العرض",
    "welcome.confidential": "سرّي — للاطلاع فقط",
    "access.title": "رمز الدخول",
    "access.subtitle": "أدخل رمز الدخول المُقدَّم لكم للاستمرار.",
    "access.placeholder": "••••••••",
    "access.submit": "دخول",
    "access.error": "رمز الدخول غير صحيح",
    "access.locked": "بيئة آمنة — دخول محدود",
    "nav.back": "السابق",
    "nav.next": "التالي",
    "nav.finish": "متابعة إلى المستندات",
    "video.progress": "الفيديو {n} من {total}",
    "video.comingSoon": "سيتم إضافة الفيديو قريبًا",
    "video.arabicNote": "الفيديو باللغة العربية",
    "section.gallery": "معرض الصور",
    "section.docs": "المستندات",
    "section.related": "مقاطع ذات صلة",
    "section.notes": "ملاحظات",
    "docs.title": "المستندات الرسمية",
    "docs.subtitle": "الوثائق التنظيمية والمالية للاطلاع.",
    "docs.empty": "سيتم إتاحة المستندات قريبًا.",
    "docs.download": "تنزيل",
    "contact.title": "تواصل معنا",
    "contact.subtitle": "فريق العلاقات مع المستثمرين متاح للردّ على استفساراتكم.",
    "contact.email": "البريد الإلكتروني",
    "contact.whatsapp": "واتساب",
    "contact.facebook": "فيسبوك",
    "contact.instagram": "إنستغرام",
    "contact.youtube": "يوتيوب",
    "contact.linkedin": "لينكدإن",
    "footer.rights": "© مجموعة عيد — جميع الحقوق محفوظة",
    "lang.label": "اللغة",
  },
  en: {
    "brand.name": "Eid Group",
    "brand.tag": "Investment Data Room",
    "splash.loading": "Preparing your session…",
    "welcome.title": "Private Investment Presentation",
    "welcome.subtitle": "A confidential dossier prepared exclusively for banks, investment firms and private investors.",
    "welcome.cta": "Enter Presentation",
    "welcome.confidential": "Confidential — Authorized Access Only",
    "access.title": "Access Code",
    "access.subtitle": "Enter the access code provided to you to continue.",
    "access.placeholder": "••••••••",
    "access.submit": "Enter",
    "access.error": "Invalid Access Code",
    "access.locked": "Secure environment — restricted access",
    "nav.back": "Back",
    "nav.next": "Next",
    "nav.finish": "Continue to Documents",
    "video.progress": "Video {n} of {total}",
    "video.comingSoon": "Video will be added soon",
    "video.arabicNote": "Video in Arabic",
    "section.gallery": "Image gallery",
    "section.docs": "Documents",
    "section.related": "Related videos",
    "section.notes": "Notes",
    "docs.title": "Official Documents",
    "docs.subtitle": "Regulatory and financial documents for your review.",
    "docs.empty": "Documents will be available soon.",
    "docs.download": "Download",
    "contact.title": "Contact",
    "contact.subtitle": "Our investor relations team is available to answer your questions.",
    "contact.email": "Email",
    "contact.whatsapp": "WhatsApp",
    "contact.facebook": "Facebook",
    "contact.instagram": "Instagram",
    "contact.youtube": "YouTube",
    "contact.linkedin": "LinkedIn",
    "footer.rights": "© Eid Group — All rights reserved",
    "lang.label": "Language",
  },
  nl: {
    "brand.name": "Eid Group",
    "brand.tag": "Investerings-datakamer",
    "splash.loading": "Sessie voorbereiden…",
    "welcome.title": "Vertrouwelijke investeringspresentatie",
    "welcome.subtitle": "Een vertrouwelijk dossier, exclusief samengesteld voor banken, investeringsmaatschappijen en particuliere investeerders.",
    "welcome.cta": "Presentatie openen",
    "welcome.confidential": "Vertrouwelijk — Alleen toegestane toegang",
    "access.title": "Toegangscode",
    "access.subtitle": "Voer de aan u verstrekte toegangscode in om verder te gaan.",
    "access.placeholder": "••••••••",
    "access.submit": "Openen",
    "access.error": "Ongeldige toegangscode",
    "access.locked": "Beveiligde omgeving — beperkte toegang",
    "nav.back": "Vorige",
    "nav.next": "Volgende",
    "nav.finish": "Doorgaan naar documenten",
    "video.progress": "Video {n} van {total}",
    "video.comingSoon": "Video wordt binnenkort toegevoegd",
    "video.arabicNote": "Video in het Arabisch",
    "section.gallery": "Afbeeldingengalerij",
    "section.docs": "Documenten",
    "section.related": "Gerelateerde video's",
    "section.notes": "Notities",
    "docs.title": "Officiële documenten",
    "docs.subtitle": "Regelgevings- en financiële documenten ter beoordeling.",
    "docs.empty": "Documenten zijn binnenkort beschikbaar.",
    "docs.download": "Downloaden",
    "contact.title": "Contact",
    "contact.subtitle": "Ons investor relations-team beantwoordt graag uw vragen.",
    "contact.email": "E-mail",
    "contact.whatsapp": "WhatsApp",
    "contact.facebook": "Facebook",
    "contact.instagram": "Instagram",
    "contact.youtube": "YouTube",
    "contact.linkedin": "LinkedIn",
    "footer.rights": "© Eid Group — Alle rechten voorbehouden",
    "lang.label": "Taal",
  },
};

// Video-specific content per language
export const videoContent: Record<Lang, Array<{ title: string; description: string }>> = {
  ar: [
    { title: "نظرة عامة على مجموعة عيد", description: "تعريف بالمجموعة، رسالتها، ورؤيتها الاستثمارية على المدى البعيد." },
    { title: "قصة الشركة والقيادة", description: "المؤسسون، فريق الإدارة، والإنجازات التي شكّلت المجموعة." },
    { title: "قطاعات الأعمال الرئيسية", description: "استعراض لأبرز القطاعات التي تعمل فيها المجموعة ومحرّكات النمو." },
    { title: "الأداء المالي والمؤشرات", description: "ملخّص للأداء المالي التاريخي والمؤشرات التشغيلية الأساسية." },
    { title: "المشاريع الحالية", description: "مراجعة للمشاريع النشطة الحالية ومراحل تنفيذها." },
    { title: "خطة النمو المستقبلية", description: "خارطة الطريق للنمو خلال السنوات الخمس القادمة." },
    { title: "فرصة الاستثمار", description: "هيكل الفرصة، الشروط الأولية، والعائد المتوقّع للمستثمرين." },
  ],
  en: [
    { title: "Eid Group at a Glance", description: "Introduction to the group, its mission, and long-term investment vision." },
    { title: "Company Story & Leadership", description: "Founders, executive team, and the milestones that shaped the group." },
    { title: "Core Business Verticals", description: "An overview of the key sectors the group operates in and its growth drivers." },
    { title: "Financial Performance & KPIs", description: "Summary of historical financial performance and core operating metrics." },
    { title: "Current Projects", description: "Review of active projects and their stages of execution." },
    { title: "Future Growth Plan", description: "The five-year roadmap for growth and expansion." },
    { title: "The Investment Opportunity", description: "Deal structure, indicative terms, and expected returns for investors." },
  ],
  nl: [
    { title: "Eid Group in het kort", description: "Introductie van de groep, haar missie en investeringsvisie op lange termijn." },
    { title: "Bedrijfsverhaal & leiderschap", description: "Oprichters, directie en de mijlpalen die de groep hebben gevormd." },
    { title: "Kernactiviteiten", description: "Overzicht van de belangrijkste sectoren en groeidrijvers van de groep." },
    { title: "Financiële prestaties & KPI's", description: "Samenvatting van historische prestaties en kern-KPI's." },
    { title: "Huidige projecten", description: "Overzicht van lopende projecten en hun uitvoeringsfase." },
    { title: "Toekomstig groeiplan", description: "De vijfjarige routekaart voor groei en expansie." },
    { title: "De investeringskans", description: "Dealstructuur, indicatieve voorwaarden en verwacht rendement." },
  ],
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("eid_lang")) as Lang | null;
    if (saved && (saved === "ar" || saved === "en" || saved === "nl")) setLangState(saved);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("eid_lang", l); } catch {}
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = dicts[lang][key] ?? dicts.en[key] ?? key;
    if (vars) for (const k of Object.keys(vars)) str = str.replace(`{${k}}`, String(vars[k]));
    return str;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}

export const TOTAL_VIDEOS = 7;

// Hardcoded fallback video URLs (RunASP-hosted)
export const VIDEO_URLS: Record<number, string | null> = {
  1: "https://egroup.runasp.net/videos/v1.mp4",
  2: "https://egroup.runasp.net/videos/v2.mp4",
  3: "https://egroup.runasp.net/videos/v3.mp4",
  4: "https://egroup.runasp.net/videos/v4.mp4",
  5: null,
  6: null,
  7: null,
};
