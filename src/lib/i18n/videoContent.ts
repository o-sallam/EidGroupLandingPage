import type { Lang, VideoMeta } from "./types";

export const videoContent: Record<Lang, VideoMeta[]> = {
  ar: [
    { title: "من هم عيد جروب؟", description: "تعريف بالمجموعة، رسالتها، ورؤيتها الاستثمارية على المدى البعيد." },
    { title: "لماذا نرى فرصة في سوريا؟", description: "المؤسسون، فريق الإدارة، والإنجازات التي شكّلت المجموعة." },
    { title: "كيف نحدد الفرص الاستثمارية؟", description: "استعراض لأبرز القطاعات التي تعمل فيها المجموعة ومحرّكات النمو." },
    { title: "الخبرة التي ستحوّل الفكرة إلى مشروع ناجح", description: "ملخّص للأداء المالي التاريخي والمؤشرات التشغيلية الأساسية." },
    { title: "فرصة الاستثمار", description: "هيكل الفرصة، الشروط الأولية، والعائد المتوقّع للمستثمرين." },
  ],
  en: [
    { title: "Welcome to Eid Group", description: "Introduction to the group, its mission, and long-term investment vision." },
    { title: "Why Do We See an Opportunity in Syria?", description: "Founders, executive team, and the milestones that shaped the group." },
    { title: "How Do We Identify Investment Opportunities?", description: "An overview of the key sectors the group operates in and its growth drivers." },
    { title: "The Expertise That Will Turn an Idea Into a Successful Venture", description: "Summary of historical financial performance and core operating metrics." },
    { title: "The Investment Opportunity", description: "Deal structure, indicative terms, and expected returns for investors." },
  ],
  nl: [
    { title: "Welkom bij Eid Group", description: "Introductie van de groep, haar missie en investeringsvisie op lange termijn." },
    { title: "Waarom zien wij een kans in Syrië?", description: "Oprichters, directie en de mijlpalen die de groep hebben gevormd." },
    { title: "Hoe bepalen wij investeringskansen?", description: "Overzicht van de belangrijkste sectoren en groeidrijvers van de groep." },
    { title: "De expertise die een idee verandert in een succesvol bedrijf", description: "Samenvatting van historische prestaties en kern-KPI's." },
    { title: "De investeringskans", description: "Dealstructuur, indicatieve voorwaarden en verwacht rendement." },
  ],
};