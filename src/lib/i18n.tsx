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
    "introPage.title": "مرحبًا بكم",
    "introPage.line1": "أمامكم 7 فيديوهات قصيرة توضح مشروعنا الاستثماري من البداية حتى النهاية.",
    "introPage.line2": "ولأن بعض التفاصيل يصعب شرحها داخل الفيديو، أضفنا في كل صفحة وثائق وصورًا وإجابات عن أبرز الأسئلة المتوقعة.",
    "introPage.line3": "نتمنى أن يمنحكم هذا العرض صورة واضحة وشاملة عن المشروع.",
    "introPage.continue": "متابعة",
    "access.title": "رمز الدخول",
    "access.subtitle": "أدخل رمز الدخول المُقدَّم لكم للاستمرار.",
    "access.placeholder": "••••••••",
    "access.submit": "دخول",
    "access.error": "رمز الدخول غير صحيح",
    "access.locked": "بيئة آمنة — دخول محدود",
    "nav.back": "السابق",
    "nav.next": "التالي",
    "nav.prev": "الفيديو السابق",
    "nav.finish": "متابعة إلى المستندات",
    "video.progress": "الفيديو {n} من {total}",
    "video.comingSoon": "سيتم إضافة الفيديو قريبًا",
    "video.arabicNote": "الفيديو باللغة العربية",
    "video.upNext": "الفيديو التالي",
    "video.starting": "يبدأ خلال",
    "video.playNow": "تشغيل الآن",
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
    "questions.title": "أسئلة المستثمر",
    "questions.prompt": "أسئلة قد تدور في ذهنك",
    "questions.confirm": "هل أنت متأكد أنك تريد الانتقال إلى الفيديو التالي؟",
    "questions.confirmYes": "نعم",
    "questions.confirmNo": "لا",
    "questions.blocked": "شاهد المزيد من هذا الفيديو للمتابعة",
  },
  en: {
    "brand.name": "Eid Group",
    "brand.tag": "Investment Data Room",
    "splash.loading": "Preparing your session…",
    "welcome.title": "Private Investment Presentation",
    "welcome.subtitle": "A confidential dossier prepared exclusively for banks, investment firms and private investors.",
    "welcome.cta": "Enter Presentation",
    "welcome.confidential": "Confidential — Authorized Access Only",
    "introPage.title": "Welcome",
    "introPage.line1": "Ahead of you are 7 short videos that walk you through our investment project from start to finish.",
    "introPage.line2": "Since some details are difficult to explain within the videos alone, we've included documents, images, and answers to the most anticipated questions on every page.",
    "introPage.line3": "We hope this presentation gives you a clear and comprehensive picture of the project.",
    "introPage.continue": "Continue",
    "access.title": "Access Code",
    "access.subtitle": "Enter the access code provided to you to continue.",
    "access.placeholder": "••••••••",
    "access.submit": "Enter",
    "access.error": "Invalid Access Code",
    "access.locked": "Secure environment — restricted access",
    "nav.back": "Back",
    "nav.next": "Next",
    "nav.prev": "Previous Video",
    "nav.finish": "Continue to Documents",
    "video.progress": "Video {n} of {total}",
    "video.comingSoon": "Video will be added soon",
    "video.arabicNote": "Video in Arabic",
    "video.upNext": "Up next",
    "video.starting": "Starting in",
    "video.playNow": "Play now",
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
    "questions.title": "Investor Questions",
    "questions.prompt": "Questions you may have",
    "questions.confirm": "Are you sure you want to move to the next video?",
    "questions.confirmYes": "Yes",
    "questions.confirmNo": "No",
    "questions.blocked": "Watch more of this video to continue",
  },
  nl: {
    "brand.name": "Eid Group",
    "brand.tag": "Investerings-datakamer",
    "splash.loading": "Sessie voorbereiden…",
    "welcome.title": "Vertrouwelijke investeringspresentatie",
    "welcome.subtitle": "Een vertrouwelijk dossier, exclusief samengesteld voor banken, investeringsmaatschappijen en particuliere investeerders.",
    "welcome.cta": "Presentatie openen",
    "welcome.confidential": "Vertrouwelijk — Alleen toegestane toegang",
    "introPage.title": "Welkom",
    "introPage.line1": "Voor u liggen 7 korte video's die ons investeringsproject van begin tot eind toelichten.",
    "introPage.line2": "Omdat sommige details moeilijk uit te leggen zijn in de video's alleen, hebben we op elke pagina documenten, afbeeldingen en antwoorden op de meest verwachte vragen toegevoegd.",
    "introPage.line3": "We hopen dat deze presentatie u een duidelijk en volledig beeld van het project geeft.",
    "introPage.continue": "Doorgaan",
    "access.title": "Toegangscode",
    "access.subtitle": "Voer de aan u verstrekte toegangscode in om verder te gaan.",
    "access.placeholder": "••••••••",
    "access.submit": "Openen",
    "access.error": "Ongeldige toegangscode",
    "access.locked": "Beveiligde omgeving — beperkte toegang",
    "nav.back": "Vorige",
    "nav.next": "Volgende",
    "nav.prev": "Vorige video",
    "nav.finish": "Doorgaan naar documenten",
    "video.progress": "Video {n} van {total}",
    "video.comingSoon": "Video wordt binnenkort toegevoegd",
    "video.arabicNote": "Video in het Arabisch",
    "video.upNext": "Straks",
    "video.starting": "Begint over",
    "video.playNow": "Nu afspelen",
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
    "questions.title": "Investeerdersvragen",
    "questions.prompt": "Vragen die u misschien heeft",
    "questions.confirm": "Weet u zeker dat u naar de volgende video wilt gaan?",
    "questions.confirmYes": "Ja",
    "questions.confirmNo": "Nee",
    "questions.blocked": "Bekijk meer van deze video om door te gaan",
  },
};

// Video-specific content per language
export const videoContent: Record<Lang, Array<{ title: string; description: string }>> = {
  ar: [
    { title: "مرحبًا بكم في مجموعة عيد", description: "تعريف بالمجموعة، رسالتها، ورؤيتها الاستثمارية على المدى البعيد." },
    { title: "لماذا نرى فرصة في سوريا؟", description: "المؤسسون، فريق الإدارة، والإنجازات التي شكّلت المجموعة." },
    { title: "كيف نحدد الفرص الاستثمارية؟", description: "استعراض لأبرز القطاعات التي تعمل فيها المجموعة ومحرّكات النمو." },
    { title: "الخبرة التي ستحوّل الفكرة إلى مشروع ناجح", description: "ملخّص للأداء المالي التاريخي والمؤشرات التشغيلية الأساسية." },
    { title: "المشاريع الحالية", description: "مراجعة للمشاريع النشطة الحالية ومراحل تنفيذها." },
    { title: "خطة النمو المستقبلية", description: "خارطة الطريق للنمو خلال السنوات الخمس القادمة." },
    { title: "فرصة الاستثمار", description: "هيكل الفرصة، الشروط الأولية، والعائد المتوقّع للمستثمرين." },
  ],
  en: [
    { title: "Welcome to Eid Group", description: "Introduction to the group, its mission, and long-term investment vision." },
    { title: "Why Do We See an Opportunity in Syria?", description: "Founders, executive team, and the milestones that shaped the group." },
    { title: "How Do We Identify Investment Opportunities?", description: "An overview of the key sectors the group operates in and its growth drivers." },
    { title: "The Expertise That Will Turn an Idea Into a Successful Venture", description: "Summary of historical financial performance and core operating metrics." },
    { title: "Current Projects", description: "Review of active projects and their stages of execution." },
    { title: "Future Growth Plan", description: "The five-year roadmap for growth and expansion." },
    { title: "The Investment Opportunity", description: "Deal structure, indicative terms, and expected returns for investors." },
  ],
  nl: [
    { title: "Welkom bij Eid Group", description: "Introductie van de groep, haar missie en investeringsvisie op lange termijn." },
    { title: "Waarom zien wij een kans in Syrië?", description: "Oprichters, directie en de mijlpalen die de groep hebben gevormd." },
    { title: "Hoe bepalen wij investeringskansen?", description: "Overzicht van de belangrijkste sectoren en groeidrijvers van de groep." },
    { title: "De expertise die een idee verandert in een succesvol bedrijf", description: "Samenvatting van historische prestaties en kern-KPI's." },
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
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
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

// Tracks whether the user has chosen a language on the first-run Language screen.
const LANG_CHOSEN_KEY = "eid_lang_chosen";
export function isLangChosen(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(LANG_CHOSEN_KEY) === "1"; } catch { return false; }
}
export function markLangChosen() {
  try { localStorage.setItem(LANG_CHOSEN_KEY, "1"); } catch {}
}

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

// Last video index with a non-null URL — determines end-of-sequence behavior
export const lastAvailableVideo = Math.max(
  ...Object.entries(VIDEO_URLS)
    .filter(([, url]) => url !== null)
    .map(([key]) => Number(key)),
  1
);

export type QAPair = { q: string; a: string };
export const QUESTIONS_DATA: Record<string, Record<Lang, QAPair[]>> = {
  "1": {
    ar: [
      { q: "ما هو رأس المال المطلوب؟", a: "نبحث عن شريك يساهم برأس مال قدره 150,000 دولار للمشروع، بالإضافة إلى 10,000 دولار لتأسيس وإدارة مرحلة إطلاق المشروع." },
      { q: "لماذا أستثمر مع عيد جروب؟", a: "لأننا نجمع بين الخبرة في التسويق العقاري، وشبكة العلاقات، والشركاء التنفيذيين، مع خطة واضحة لإدارة المشروع." },
      { q: "ماذا سأتعرف عليه في الفيديوهات القادمة؟", a: "ستتعرف على السوق، والفريق، وخطة الاستثمار، وآلية العمل، والضمانات، وكيفية تحقيق العائد المتوقع." },
    ],
    en: [
      { q: "What is the required capital?", a: "We are looking for a partner to contribute $150,000 in capital for the project, plus $10,000 for establishing and managing the project launch phase." },
      { q: "Why invest with Eid Group?", a: "Because we combine expertise in real estate marketing, a network of relationships, and execution partners, with a clear project management plan." },
      { q: "What will I learn in the upcoming videos?", a: "You will learn about the market, the team, the investment plan, the working mechanism, the guarantees, and how to achieve the expected return." },
    ],
    nl: [
      { q: "Wat is het benodigde kapitaal?", a: "We zoeken een partner die $150.000 aan kapitaal bijdraagt voor het project, plus $10.000 voor de oprichting en het beheer van de startfase van het project." },
      { q: "Waarom investeren in Eid Group?", a: "Omdat we expertise in vastgoedmarketing, een netwerk van relaties en uitvoeringspartners combineren met een duidelijk projectmanagementplan." },
      { q: "Wat zal ik leren in de komende video's?", a: "U leert over de markt, het team, het investeringsplan, de werkwijze, de garanties en hoe u het verwachte rendement kunt behalen." },
    ],
  },
  "2": {
    ar: [
      { q: "لماذا تعتبرون أن الوقت الحالي مناسب للاستثمار؟", a: "لأن السوق يشهد تغيرات وفرصًا جديدة، مع زيادة اهتمام المستثمرين والسوريين المقيمين في الخارج." },
      { q: "لماذا اخترتم القطاع العقاري؟", a: "لأنه من أكثر القطاعات التي يمكن فيها إضافة قيمة حقيقية للعقار وتحقيق عائد من خلال التطوير وليس فقط انتظار ارتفاع الأسعار." },
      { q: "هل تعتمد الخطة على توقعات فقط؟", a: "لا، بل على متابعة يومية للسوق، وتحليل الفرص، وشبكة علاقات ميدانية." },
    ],
    en: [
      { q: "Why do you believe now is the right time to invest?", a: "Because the market is experiencing changes and new opportunities, with increasing interest from investors and Syrians residing abroad." },
      { q: "Why did you choose the real estate sector?", a: "Because it is one of the sectors where real value can be added to a property and returns achieved through development, not just waiting for price increases." },
      { q: "Does the plan rely solely on predictions?", a: "No, it is based on daily market monitoring, opportunity analysis, and a field relationship network." },
    ],
    nl: [
      { q: "Waarom denkt u dat dit het juiste moment is om te investeren?", a: "Omdat de markt veranderingen en nieuwe kansen doormaakt, met toenemende interesse van investeerders en Syriërs in het buitenland." },
      { q: "Waarom heeft u voor de vastgoedsector gekozen?", a: "Omdat het een van de sectoren is waar echte waarde aan een pand kan worden toegevoegd en rendement kan worden behaald via ontwikkeling, niet alleen door te wachten op prijsstijgingen." },
      { q: "Is het plan alleen gebaseerd op voorspellingen?", a: "Nee, het is gebaseerd op dagelijkse marktmonitoring, kansanalyse en een netwerk van veldrelaties." },
    ],
  },
  "3": {
    ar: [
      { q: "من أين تحصلون على الفرص العقارية؟", a: "من خلال شبكة المكاتب العقارية، وعلاقاتنا المباشرة، والعملاء، والعقارات التي لا تُعرض في السوق بشكل علني." },
      { q: "لماذا تعتقدون أنكم تصلون إلى فرص أفضل؟", a: "لأننا موجودون في السوق بشكل يومي، ولدينا شبكة واسعة من العلاقات والخبرة في تقييم الفرص." },
      { q: "هل ستختارون أي أرض؟", a: "لا، نختار فقط الفرص التي تحقق معاييرنا من حيث السعر، والموقع، وإمكانية التطوير وسهولة إعادة البيع." },
    ],
    en: [
      { q: "Where do you source real estate opportunities?", a: "Through our network of real estate offices, direct relationships, clients, and properties not publicly listed on the market." },
      { q: "Why do you believe you have access to better opportunities?", a: "Because we are active in the market daily, with a broad network of relationships and experience in evaluating opportunities." },
      { q: "Will you choose any piece of land?", a: "No, we select only opportunities that meet our criteria in terms of price, location, development potential, and ease of resale." },
    ],
    nl: [
      { q: "Waar haalt u de vastgoedkansen vandaan?", a: "Via ons netwerk van vastgoedkantoren, directe relaties, klanten en panden die niet openlijk op de markt worden aangeboden." },
      { q: "Waarom denkt u dat u toegang heeft tot betere kansen?", a: "Omdat we dagelijks actief zijn op de markt, met een breed netwerk van relaties en ervaring in het beoordelen van kansen." },
      { q: "Kiest u elk willekeurig stuk grond?", a: "Nee, we selecteren alleen kansen die voldoen aan onze criteria op het gebied van prijs, locatie, ontwikkelingspotentieel en gemak van doorverkoop." },
    ],
  },
  "4": {
    ar: [
      { q: "من سيشرف على تنفيذ المشروع؟", a: "سيتم التنفيذ بالتعاون بين عيد جروب، وعبد المجيد عيد، والمهندس حسان تكريتي، وشركة إعماركم." },
      { q: "ما دور شركة إعماركم؟", a: "تنفيذ أعمال التطوير الميدانية، والاستفادة من خبرتها ووجودها في المنطقة المستهدفة." },
      { q: "هل لدى الفريق خبرة سابقة؟", a: "نعم، توجد مشاريع منفذة سابقًا يمكن الاطلاع على صورها وأعمالها ضمن التطبيق." },
    ],
    en: [
      { q: "Who will oversee the project execution?", a: "Execution will be carried out in collaboration between Eid Group, Abdul Majeed Eid, Engineer Hassan Tekereti, and Emaarkom Company." },
      { q: "What is Emaarkom's role?", a: "Executing field development work, leveraging their expertise and presence in the target area." },
      { q: "Does the team have prior experience?", a: "Yes, there are previously executed projects whose photos and work can be viewed within the application." },
    ],
    nl: [
      { q: "Wie houdt toezicht op de uitvoering van het project?", a: "De uitvoering gebeurt in samenwerking tussen Eid Group, Abdul Majeed Eid, ingenieur Hassan Tekereti en Emaarkom Company." },
      { q: "Wat is de rol van Emaarkom?", a: "Het uitvoeren van veldontwikkelingswerkzaamheden, gebruikmakend van hun expertise en aanwezigheid in het doelgebied." },
      { q: "Heeft het team eerdere ervaring?", a: "Ja, er zijn eerder uitgevoerde projecten waarvan foto's en werk binnen de applicatie kunnen worden bekeken." },
    ],
  },
  "5": {
    ar: [
      { q: "لماذا اخترتم تطوير الأراضي بدل بناء فيلا؟", a: "لأنه يمنح مرونة أكبر، وسرعة في إعادة البيع، ويقلل من المخاطر مقارنة بالبناء الكامل." },
      { q: "ما هو المشروع المستهدف؟", a: "شراء أرض بمساحة تقارب ثلاثة دونمات، ثم فرزها إلى ثلاث قطع مستقلة وتطويرها لتصبح جاهزة للبيع أو للبناء." },
      { q: "هل يمكن تغيير الخطة؟", a: "نعم، ولكن فقط إذا ظهرت فرصة أفضل، وبعد عرضها على المستثمر والحصول على موافقته." },
    ],
    en: [
      { q: "Why did you choose land development instead of building a villa?", a: "Because it offers greater flexibility, faster resale, and reduces risks compared to full construction." },
      { q: "What is the target project?", a: "Purchasing a plot of approximately three donums, then dividing it into three independent plots and developing them to be ready for sale or construction." },
      { q: "Can the plan be changed?", a: "Yes, but only if a better opportunity arises, and after presenting it to the investor and obtaining their approval." },
    ],
    nl: [
      { q: "Waarom heeft u gekozen voor landontwikkeling in plaats van het bouwen van een villa?", a: "Omdat het meer flexibiliteit, snellere doorverkoop en minder risico's biedt in vergelijking met volledige bouw." },
      { q: "Wat is het doelproject?", a: "Het kopen van een stuk grond van ongeveer drie dönüm, het splitsen in drie onafhankelijke percelen en het ontwikkelen ervan zodat ze klaar zijn voor verkoop of bouw." },
      { q: "Kan het plan worden gewijzigd?", a: "Ja, maar alleen als zich een betere kans voordoet en nadat deze aan de investeerder is voorgelegd en diens goedkeuring is verkregen." },
    ],
  },
  "6": {
    ar: [
      { q: "ما نسبة الربح المستهدفة؟", a: "نستهدف عائدًا لا يقل عن 25%، مع التركيز على تحقيق أفضل توازن بين الربحية وإدارة المخاطر." },
      { q: "كيف تتم إضافة القيمة إلى الأرض؟", a: "من خلال فرزها، وتسويرها، وحفر بئر مياه، وتجهيزها لتصبح أكثر جاذبية للمشترين." },
      { q: "متى يبدأ التسويق؟", a: "يبدأ منذ المراحل الأولى للمشروع عبر شبكة المكاتب العقارية، والعملاء، ومنصاتنا الرقمية، بهدف تقليل مدة الاستثمار." },
    ],
    en: [
      { q: "What is the target profit percentage?", a: "We target a return of no less than 25%, focusing on achieving the best balance between profitability and risk management." },
      { q: "How is value added to the land?", a: "Through subdivision, fencing, digging a water well, and preparing it to become more attractive to buyers." },
      { q: "When does marketing begin?", a: "It begins from the early stages of the project through the network of real estate offices, clients, and our digital platforms, aiming to reduce the investment duration." },
    ],
    nl: [
      { q: "Wat is het beoogde winstpercentage?", a: "We streven naar een rendement van minimaal 25%, met focus op de beste balans tussen winstgevendheid en risicobeheer." },
      { q: "Hoe wordt waarde aan het land toegevoegd?", a: "Door het te splitsen, te omheinen, een waterput te graven en het voor te bereiden om aantrekkelijker te worden voor kopers." },
      { q: "Wanneer begint de marketing?", a: "Het begint vanaf de vroege stadia van het project via het netwerk van vastgoedkantoren, klanten en onze digitale platforms, met als doel de investeringsduur te verkorten." },
    ],
  },
  // DRAFT — Video 7 content: placeholder awaiting client review/approval before going live
  // Suggested title: "الضمانات وحماية المستثمر" (Guarantees & Investor Protection)
  "7": {
    ar: [
      { q: "ما الضمانات المقدمة للمستثمر؟", a: "يتم توثيق الاستثمار بعقد واضح يحدد حصة الشريك في الأرض ونسبة العائد المتفق عليها، مع إتاحة متابعة دورية لمراحل المشروع أولاً بأول." },
      { q: "ماذا يحدث إذا تأخر البيع عن الفترة المتوقعة؟", a: "تتم مراجعة الخطة بشكل دوري مع المستثمر، مع خيارات واضحة للتعامل مع أي تأخير دون التأثير على أصل حقوقه في المشروع." },
      { q: "كيف يمكن للمستثمر التأكد من سير العمل؟", a: "من خلال تقارير دورية ومتابعة مباشرة مع فريق عيد جروب، إضافة إلى إمكانية زيارة الأرض أو الاطلاع على مستنداتها عند الحاجة." },
    ],
    en: [
      { q: "What guarantees are provided to the investor?", a: "The investment is documented in a clear contract specifying the partner's share in the land and the agreed return rate, with periodic follow-up on project stages as they happen." },
      { q: "What happens if the sale is delayed beyond the expected period?", a: "The plan is reviewed periodically with the investor, with clear options to handle any delay without affecting their principal rights in the project." },
      { q: "How can the investor verify the progress of work?", a: "Through periodic reports and direct follow-up with the Eid Group team, in addition to the possibility of visiting the land or reviewing its documents when needed." },
    ],
    nl: [
      { q: "Welke garanties worden aan de investeerder geboden?", a: "De investering wordt vastgelegd in een duidelijke overeenkomst die het aandeel van de partner in het land en het overeengekomen rendementspercentage specificeert, met periodieke opvolging van de projectfasen." },
      { q: "Wat gebeurt er als de verkoop langer duurt dan verwacht?", a: "Het plan wordt periodiek met de investeerder herzien, met duidelijke opties om eventuele vertraging aan te pakken zonder hun hoofdsom in het project te beïnvloeden." },
      { q: "Hoe kan de investeerder de voortgang van het werk verifiëren?", a: "Via periodieke rapporten en directe opvolging met het Eid Group-team, plus de mogelijkheid om het land te bezoeken of documenten in te zien wanneer nodig." },
    ],
  },
};
