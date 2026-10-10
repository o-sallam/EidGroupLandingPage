import type { Lang, QAPair } from "./types";

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
      { q: "ليش عم تدوروا على مستثمر؟", a: "لأنو عندنا فريق وخبرة وشبكة، وعندنا القدرة على تقييم وتنفيذ وتسويق الفرص، لكننا بحاجة لرأس مال يسمح لنا نتحرك بسرعة ونقتنص الفرص المناسبة بوقتها." },
      { q: "شو دور عيد جروب بالشراكة؟", a: "دورنا يبدأ من البحث عن الفرصة، وتقييمها والتفاوض عليها، ويمتد للتطوير والتسويق وإدارة التفاصيل اللوجستية للمشروع." },
      { q: "شو المقصود بالشراكة بنسبة 25% من الأرباح؟", a: "المقصود إنو عيد جروب يشارك بنسبة 25% من الأرباح المحققة من المشروع، بينما تعود النسبة المتبقية للمستثمر، وفق الاتفاق والعقد المبرم بين الطرفين." },
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
      { q: "شو هي الـ10 آلاف دولار؟", a: "هي هاند شيك وبداية جدية للشراكة، بتسمح لنا نبدأ البحث والدراسة والتفاوض، ونخصص وقت وفريق لخدمة المستثمر لمدة سنة." },
      { q: "هل الـ10 آلاف دولار هي جزء من رأس مال المشروع؟", a: "لا، هي مرحلة مستقلة عن رأس مال المشروع. رأس مال أول مشروع مشترك مستهدف بحد أدنى 150 ألف دولار." },
      { q: "ليش ما عندكم مشروع وتكاليفه جاهزة من البداية؟", a: "لأننا ما بدنا نحدد مشروع بشكل مسبق ونحاول نشتريه بأي سعر. بدنا نكون جاهزين أولاً، ولما تظهر الفرصة المناسبة ندرسها ونفاوض عليها ونقرر إذا كانت تستحق الاستثمار." },
      { q: "بأي مناطق رح نركز على شراء الأراضي؟", a: "حالياً في منطقتين مستهدفين بشكل أساسي: دروشا والزبداني.\n\nدروشا لأنها منطقة فيها فلل ومزارع وطلب على هالنوع من الأراضي، والزبداني لما تتميز فيه من طبيعة وإطلالات وموقع سياحي.\n\nوطبعاً شبكتنا العقارية بتسمح لنا نوصل لفرص بمناطق مختلفة، وما رح نقيّد حالنا بمنطقة واحدة إذا ظهرت فرصة أفضل." },
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
      { q: "شو المقصود بـ\"تسليم الأراضي على المفتاح\"؟", a: "المقصود شراء أرض بمواصفات مناسبة، وبعدها تطويرها وتجهيزها بشكل يجعلها منتج أوضح وأكثر جاذبية للمشتري، بدل ما نبيعها كأرض خام." },
      { q: "شو أول مشروع مستهدف؟", a: "هدفنا المبدئي تطوير أرض بمساحة حوالي 3 دونم، وتقسيمها إلى 3 قطع تقريباً، وتجهيزها بالمواصفات المناسبة حسب موقع الأرض وإمكانية تطويرها." },
      { q: "كيف رح نستخدم الـ150 ألف دولار؟", a: "الـ150 ألف دولار هي رأس المال المستهدف لأول مشروع، ورح نستخدمها لشراء الأرض وتطويرها وتجهيزها وتسويقها.\n\nوسعر الأرض المستهدف تقريباً بين 110 و120 ألف دولار، لكن السعر النهائي بيتحدد حسب الفرصة اللي رح نختارها والتفاوض عليها." },
      { q: "شو هي تكاليف تطوير وتجهيز الأرض؟", a: "التكلفة التقديرية للتطوير والتجهيز هي حوالي 11 ألف دولار لكل قطعة بمساحة تقارب 1000 متر.\n\nوهالمبلغ بيشمل أعمال التجهيز الأساسية، مثل تسوير الأرض بشكل كامل وحفر بئر ماء، بالإضافة لباقي التفاصيل اللازمة لتجهيز الأرض.\n\nوطبعاً كل المصاريف رح تكون موثقة بفواتير ومستندات." },
      { q: "كيف رح يتم تنفيذ التسوير وحفر البئر؟", a: "التسوير رح يبدأ من خلال مهندس إنشائي لتحديد طريقة التنفيذ والمواصفات، وبعدها بيكون في مهندس مشرف ومتعهد لمتابعة التنفيذ، بهدف الوصول لجودة عالية جداً.\n\nأما حفر البئر، فبيتم من خلال البلدية والمختصين بهذا العمل، وبعد التأكد من إمكانية الحفر بالموقع وتنفيذ الإجراءات المطلوبة." },
      { q: "قديش بتحتاج عملية التطوير؟", a: "المدة المستهدفة لتنفيذ أعمال التطوير والتجهيز هي حوالي 29 يوم." },
      { q: "إمتى رح تبدأوا بيع الأراضي؟", a: "التسويق رح يبدأ من اليوم الأول، وما رح ننتظر انتهاء التطوير.\n\nرح نعرض الأراضي من خلال شبكتنا اللي بتضم أكثر من 40 مكتب عقاري، بالإضافة لعملائنا وزبائننا الحاليين، ومن خلال الفيديوهات والإعلانات على السوشيال ميديا ومواقعنا." },
      { q: "شو العائد المتوقع من المشروع؟", a: "بحسب دراستنا الأولية للفرص والأسعار، هدفنا تحقيق عائد يتراوح بين 25% ويقارب 40%.\n\nوطبعاً هالنسبة تقديرية وليست ضماناً، لأنها بتعتمد على سعر الشراء، تكلفة التطوير، سعر البيع، وسرعة التسويق." },
      { q: "من وين رح يجي الربح؟", a: "الربح مو مبني فقط على ارتفاع سعر الأرض مع الوقت.\n\nهدفنا نشتري بالسعر المناسب، ونضيف قيمة حقيقية من خلال التقسيم والتجهيز والتطوير والتسويق، وبعدها نبيع المنتج بسعر مناسب للسوق." },
      { q: "هل عندكم أراضي حالياً ممكن نشتري منها؟", a: "إي، حالياً عنا عدد كبير من الأراضي اللي صورناها ودرسناها، ومساحاتها بتبدأ من حوالي 500 متر وبتوصل لحوالي 120 ألف متر.\n\nلكن هالأراضي مو بالضرورة تكون هي الأرض اللي رح نشتريها بالمشروع، لأن ممكن تنباع أو يتغير سعرها أو تظهر فرصة أفضل." },
      { q: "إذا عندكم أراضي حالياً، ليش ما بتحددوا أرض من هلا؟", a: "لأن هدفنا مو نبيع المستثمر أرض موجودة عندنا.\n\nهدفنا نشتري أفضل فرصة متاحة وقت اتخاذ القرار.\n\nالأراضي الموجودة حالياً بتعطينا قاعدة معلومات حقيقية عن الأسعار والمناطق والمواصفات، لكن القرار النهائي بيكون بعد توفر رأس المال ودراسة الفرصة المناسبة." },
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
      { q: "كيف بيقدر المستثمر يتأكد من وضع العقار قبل الشراء؟", a: "المستثمر إله الحق يختار محاميه، ومحاميه بيقدر يدقق بالأوراق ويتواصل مع محامينا ومحامي صاحب العقار قبل إتمام أي عملية." },
      { q: "مين بيكون مالك العقار؟", a: "ملكية العقار بتكون باسم المستثمر أو بالاسم اللي يحدده هو ومحاميه، والدفع بيتم عند نقل الملكية وفق الاتفاق." },
      { q: "كيف رح يعرف المستثمر وين عم تروح مصرياته؟", a: "كل المصاريف الأساسية" },
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
};