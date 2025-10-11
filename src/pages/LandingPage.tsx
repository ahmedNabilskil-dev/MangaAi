import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import {
  Apple,
  ArrowRight,
  Book,
  Check,
  Database,
  Download,
  Facebook,
  FileText,
  Frame,
  Globe,
  Key,
  Layers,
  MapPin,
  MessageSquare,
  Monitor,
  Play,
  Shield,
  Shirt,
  Sparkles,
  Star,
  Users,
  Youtube,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  paddlePriceId: string | null;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

type Language = "en" | "ar";

// Translation content
const translations = {
  en: {
    nav: {
      features: "Features",
      pricing: "Pricing",
      reviews: "Reviews",
      download: "Download",
      contact: "Contact",
    },
    hero: {
      tagline: "AI-Powered Manga Creation Studio",
      title1: "Create Epic",
      title2: "Manga Stories",
      title3: "with AI Chat",
      description:
        "The first desktop app that lets you create complete manga stories through conversation. Design characters, build scenes, generate panels with speech bubbles - all powered by AI.",
      windows: "Windows (.exe)",
      macos: "macOS (.dmg)",
      watchDemo: "Watch Demo",
    },
    features: {
      title1: "Everything You Need",
      title2: "to Create Manga",
      description:
        "From story conception to final webtoon panels, MangaAI handles every aspect of manga creation",
      aiChat: "AI Chat Interface",
      aiChatDesc:
        "Create your entire manga through natural conversation. Describe characters, scenes, and dialogue - our AI understands your vision.",
      chapterManagement: "Chapter Management",
      chapterManagementDesc:
        "Organize your story with intelligent chapter and scene structuring. Build complex narratives with seamless flow.",
      panelGeneration: "Panel Generation",
      panelGenerationDesc:
        "Generate professional webtoon panels with perfect composition, speech bubbles, and visual storytelling elements.",
      characterDesigner: "Character Designer",
      characterDesignerDesc:
        "Create consistent characters with unique personalities, expressions, and designs that stay true throughout your story.",
      outfitCreator: "Outfit Creator",
      outfitCreatorDesc:
        "Design custom outfits and accessories for your characters. Mix and match styles to create unique looks.",
      locationBuilder: "Location Builder",
      locationBuilderDesc:
        "Craft immersive backgrounds and locations. From fantasy realms to modern cities, create the perfect setting.",
      sqliteStorage: "Local SQLite Storage",
      sqliteStorageDesc:
        "All your work is stored securely on your device with SQLite database. No cloud dependency, complete privacy.",
      geminiIntegration: "Gemini API Integration",
      geminiIntegrationDesc:
        "Powered by Google's Gemini AI. Simply provide your API key and unlock unlimited creative possibilities.",
      private: "100% Private",
      privateDesc: "Your stories stay on your device with local SQLite storage",
      fast: "Lightning Fast",
      fastDesc: "Generate complete panels with dialogue in seconds",
      apiKey: "Your API Key",
      apiKeyDesc: "Use your own Gemini API key - full control and transparency",
    },
    pricing: {
      title: "One App, Simple Pricing",
      description:
        "Download the app once, use your own Gemini API key, and create unlimited manga",
      monthly: "Monthly",
      yearly: "Yearly",
      lifetime: "Lifetime",
      save: "Save 40%",
      bestDeal: "Best Value",
      guarantee: "7 -day Free Trial", // UPDATED LINE
      cancel: "Cancel anytime",
      noFees: "No hidden fees",
      monthlyLicense: "Monthly License",
      monthlyDesc: "Flexible month-to-month access",
      yearlyLicense: "Yearly License",
      yearlyDesc: "Best value for committed creators",
      lifetimeLicense: "Lifetime License",
      lifetimeDesc: "Pay once, use forever",
    },
    testimonials: {
      title: "Loved by Creators",
      description:
        "Join thousands of manga artists who are revolutionizing their creative process",
    },
    download: {
      available: "Available Now",
      title: "Download MangaAI Desktop",
      description:
        "Get the latest version with automatic updates. Available for Windows and macOS.",
      windows: "Download for Windows",
      macos: "Download for macOS",
      tutorials: "Tutorials (Coming Soon)",
    },
    howItWorks: {
      title: "How It Works",
      description: "Create professional manga in three simple steps",
      step1: {
        title: "Chat & Describe",
        description:
          "Simply chat with the AI to describe your characters, scenes, and story. No complex interfaces - just natural conversation.",
      },
      step2: {
        title: "AI Generates",
        description:
          "Watch as the AI creates your characters, designs scenes, and builds complete manga panels with professional speech bubbles.",
      },
      step3: {
        title: "Export & Share",
        description:
          "Export your completed manga as high-resolution webtoon panels ready for publishing on any platform.",
      },
    },
    cta: {
      title: "Ready to Create Your Manga Masterpiece?",
      description:
        "Join thousands of creators who are already building amazing stories with MangaAI's revolutionary chat-based interface.",
      download: "Download Free Trial",
      viewPricing: "View Pricing Plans",
      freeTrial: "Free 7-day trial",
      noCard: "No credit card required",
      cancelAnytime: "Cancel anytime",
    },
    footer: {
      product: "Product",
      support: "Support",
      documentation: "Documentation (Coming Soon)",
      community: "Community (Coming Soon)",
      contact: "Contact Us",
      rights: "© 2024 MangaAI. All rights reserved.",
    },
  },
  ar: {
    nav: {
      features: "الميزات",
      pricing: "الأسعار",
      reviews: "التقييمات",
      download: "تحميل",
      contact: "اتصل بنا",
    },
    hero: {
      tagline: "استوديو إنشاء المانغا المدعوم بالذكاء الاصطناعي",
      title1: "أنشئ قصص",
      title2: "مانغا ملحمية",
      title3: "باستخدام الدردشة بالذكاء الاصطناعي",
      description:
        "أول تطبيق سطح مكتب يتيح لك إنشاء قصص مانغا كاملة من خلال المحادثة. صمم الشخصيات، ابني المشاهد، أنشئ لوحات بفقاعات الكلام - كل ذلك مدعوم بالذكاء الاصطناعي.",
      windows: "ويندوز (.exe)",
      macos: "ماك (.dmg)",
      watchDemo: "شاهد العرض",
    },
    features: {
      title1: "كل ما تحتاجه",
      title2: "لإنشاء المانغا",
      description:
        "من بداية القصة إلى لوحات الويب تون النهائية، MangaAI يتعامل مع كل جانب من إنشاء المانغا",
      aiChat: "واجهة الدردشة بالذكاء الاصطناعي",
      aiChatDesc:
        "أنشئ مانغاك الكاملة من خلال المحادثة الطبيعية. صف الشخصيات والمشاهد والحوار - ذكائنا الاصطناعي يفهم رؤيتك.",
      chapterManagement: "إدارة الفصول",
      chapterManagementDesc:
        "نظم قصتك مع هيكلة ذكية للفصول والمشاهد. ابني سرداً معقداً بتدفق سلس.",
      panelGeneration: "إنشاء اللوحات",
      panelGenerationDesc:
        "أنشئ لوحات ويب تون احترافية بتكوين مثالي، فقاعات كلام، وعناصر سرد بصري متقنة.",
      characterDesigner: "مصمم الشخصيات",
      characterDesignerDesc:
        "أنشئ شخصيات متسقة بشخصيات فريدة، تعبيرات، وتصاميم تبقى صحيحة طوال قصتك.",
      outfitCreator: "مصمم الملابس",
      outfitCreatorDesc:
        "صمم ملابس وإكسسوارات مخصصة لشخصياتك. اخلط وطابق الأنماط لإنشاء مظهر فريد.",
      locationBuilder: "باني المواقع",
      locationBuilderDesc:
        "اصنع خلفيات غامرة ومواقع. من عوالم خيالية إلى مدن حديثة، أنشئ الإعداد المثالي.",
      sqliteStorage: "تخزين SQLite محلي",
      sqliteStorageDesc:
        "يتم تخزين جميع عملك بأمان على جهازك مع قاعدة بيانات SQLite. لا تبعية للسحابة، خصوصية كاملة.",
      geminiIntegration: "دمج Gemini API",
      geminiIntegrationDesc:
        "مدعوم بذكاء Gemini الاصطناعي من جوجل. ما عليك سوى تقديم مفتاح API الخاص بك وافتح إمكانيات إبداعية غير محدودة.",
      private: "100% خاص",
      privateDesc: "تبقى قصصك على جهازك مع تخزين SQLite محلي",
      fast: "سريع جداً",
      fastDesc: "أنشئ لوحات كاملة مع حوار في ثوانٍ",
      apiKey: "مفتاح API الخاص بك",
      apiKeyDesc: "استخدم مفتاح Gemini API الخاص بك - تحكم كامل وشفافية",
    },
    pricing: {
      title: "تطبيق واحد، سعر بسيط",
      description:
        "حمّل التطبيق مرة واحدة، استخدم مفتاح Gemini API الخاص بك، وأنشئ مانجا غير محدودة",
      monthly: "شهري",
      yearly: "سنوي",
      lifetime: "مدى الحياة",
      save: "وفر 40%",
      bestDeal: "أفضل قيمة",
      guarantee: "تجربة مجانية 7 أيام", // UPDATED LINE
      cancel: "ألغ في أي وقت",
      noFees: "لا توجد رسوم خفية",
      trial: "تجربة مجانية 7 أيام", // ADD THIS LINE
      monthlyLicense: "ترخيص شهري",
      monthlyDesc: "وصول مرن شهر بشهر",
      yearlyLicense: "ترخيص سنوي",
      yearlyDesc: "أفضل قيمة للمبدعين الملتزمين",
      lifetimeLicense: "ترخيص مدى الحياة",
      lifetimeDesc: "ادفع مرة واحدة، استخدم للأبد",
    },
    testimonials: {
      title: "محبوب من المبدعين",
      description:
        "انضم إلى آلاف فنانين المانغا الذين يحدثون ثورة في عملية الإبداع الخاصة بهم",
    },
    download: {
      available: "متاح الآن",
      title: "حمّل MangaAI لسطح المكتب",
      description:
        "احصل على أحدث نسخة مع تحديثات تلقائية. متاح للويندوز والماك.",
      windows: "تحميل للويندوز",
      macos: "تحميل للماك",
      tutorials: "الدروس (قريباً)",
    },
    howItWorks: {
      title: "كيف يعمل",
      description: "أنشئ مانغا احترافية في ثلاث خطوات بسيطة",
      step1: {
        title: "دردش وصف",
        description:
          "ما عليك سوى الدردشة مع الذكاء الاصطناعي لوصف شخصياتك ومشاهدك وقصتك. لا توجد واجهات معقدة - فقط محادثة طبيعية.",
      },
      step2: {
        title: "الذكاء الاصطناعي ينشئ",
        description:
          "شاهد بينما ينشئ الذكاء الاصطناعي شخصياتك، ويصمم المشاهد، ويبني لوحات مانغا كاملة بفقاعات كلام احترافية.",
      },
      step3: {
        title: "صدّر وشارك",
        description:
          "قم بتصدير مانغاك المكتملة كلوحات ويب تون عالية الدقة جاهزة للنشر على أي منصة.",
      },
    },
    cta: {
      title: "مستعد لإنشاء تحفتك من المانغا؟",
      description:
        "انضم إلى آلاف المبدعين الذين يبنون بالفعل قصصاً مذهلة باستخدام واجهة الدردشة الثورية لـ MangaAI.",
      download: "حمّل النسخة التجريبية المجانية",
      viewPricing: "عرض خطط الأسعار",
      freeTrial: "تجربة مجانية 7 يوم",
      noCard: "لا حاجة لبطاقة ائتمان",
      cancelAnytime: "ألغ في أي وقت",
    },
    footer: {
      product: "المنتج",
      support: "الدعم",
      documentation: "الوثائق (قريباً)",
      community: "المجتمع (قريباً)",
      contact: "اتصل بنا",
      rights: "© 2024 MangaAI. جميع الحقوق محفوظة.",
    },
  },
};

const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly" | "lifetime">(
    "monthly"
  );
  const [paddleInstance, setPaddleInstance] = useState<Paddle | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language] = useState<Language>("en");

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const paddle = await initializePaddle({
          environment: "production",
          token: "live_7ba0f58524641e5d2bcf16edb49",
        });
        setPaddleInstance(paddle);
      } catch (error) {
        console.error("Failed to initialize Paddle:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const isRTL = language === "ar";

  const openPaddleCheckout = useCallback(
    (priceId: string): void => {
      if (!paddleInstance) {
        alert(
          language === "en"
            ? "Payment system is still loading, please try again in a moment."
            : "نظام الدفع لا يزال قيد التحميل، يرجى المحاولة مرة أخرى بعد قليل."
        );
        return;
      }
      paddleInstance.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { source: "website" },
      });
    },
    [paddleInstance, language]
  );

  const t = translations[language];

  const features: Feature[] = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: t.features.aiChat,
      description: t.features.aiChatDesc,
    },
    {
      icon: <Book className="w-8 h-8" />,
      title: t.features.chapterManagement,
      description: t.features.chapterManagementDesc,
    },
    {
      icon: <Frame className="w-8 h-8" />,
      title: t.features.panelGeneration,
      description: t.features.panelGenerationDesc,
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t.features.characterDesigner,
      description: t.features.characterDesignerDesc,
    },
    {
      icon: <Shirt className="w-8 h-8" />,
      title: t.features.outfitCreator,
      description: t.features.outfitCreatorDesc,
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: t.features.locationBuilder,
      description: t.features.locationBuilderDesc,
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: t.features.sqliteStorage,
      description: t.features.sqliteStorageDesc,
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: t.features.geminiIntegration,
      description: t.features.geminiIntegrationDesc,
    },
  ];

  const testimonials: Testimonial[] = [];

  const pricingPlans: Record<"monthly" | "yearly" | "lifetime", PricingPlan[]> =
    {
      monthly: [
        {
          name: language === "en" ? "Monthly License" : "ترخيص شهري",
          price: "5",
          period: language === "en" ? "month" : "شهر",
          description:
            language === "en"
              ? "Flexible month-to-month access"
              : "وصول مرن شهر بشهر",
          features: [
            language === "en"
              ? "Full desktop application access"
              : "وصول كامل لتطبيق سطح المكتب",
            language === "en"
              ? "AI-powered manga creation tools"
              : "أدوات إنشاء المانجا بالذكاء الاصطناعي",
            language === "en"
              ? "Create chapters, scenes & panels"
              : "إنشاء فصول ومشاهد ولوحات",
            language === "en"
              ? "Generate characters & outfits"
              : "إنشاء شخصيات وملابس",
            language === "en"
              ? "Build locations & backgrounds"
              : "بناء مواقع وخلفيات",
            language === "en"
              ? "Webtoon-style layouts"
              : "تخطيطات بنمط الويبتون",
            language === "en" ? "Speech bubble dialogs" : "فقاعات حوار",
            language === "en" ? "Local SQLite storage" : "تخزين SQLite محلي",
            language === "en"
              ? "Works with your Gemini API key"
              : "يعمل مع مفتاح Gemini API الخاص بك",
            language === "en" ? "Cancel anytime" : "إلغاء في أي وقت",
          ],
          cta:
            language === "en"
              ? "Get Monthly License"
              : "احصل على الترخيص الشهري",
          popular: false,
          paddlePriceId: "pri_01k76n58vtw58nzyzj3dh7md1t", // Replace with your actual monthly price ID
        },
      ],
      yearly: [
        {
          name: language === "en" ? "Yearly License" : "ترخيص سنوي",
          price: "36",
          period: language === "en" ? "year" : "سنة",
          originalPrice: "60",
          description:
            language === "en"
              ? "Best value for serious creators"
              : "أفضل قيمة للمبدعين الجادين",
          features: [
            language === "en"
              ? "Full desktop application access"
              : "وصول كامل لتطبيق سطح المكتب",
            language === "en"
              ? "AI-powered manga creation tools"
              : "أدوات إنشاء المانجا بالذكاء الاصطناعي",
            language === "en"
              ? "Create chapters, scenes & panels"
              : "إنشاء فصول ومشاهد ولوحات",
            language === "en"
              ? "Generate characters & outfits"
              : "إنشاء شخصيات وملابس",
            language === "en"
              ? "Build locations & backgrounds"
              : "بناء مواقع وخلفيات",
            language === "en"
              ? "Webtoon-style layouts"
              : "تخطيطات بنمط الويبتون",
            language === "en" ? "Speech bubble dialogs" : "فقاعات حوار",
            language === "en" ? "Local SQLite storage" : "تخزين SQLite محلي",
            language === "en"
              ? "Works with your Gemini API key"
              : "يعمل مع مفتاح Gemini API الخاص بك",
            language === "en" ? "Save $24 per year" : "وفر 24$ سنوياً",
          ],
          cta:
            language === "en"
              ? "Get Yearly License"
              : "احصل على الترخيص السنوي",
          popular: false,
          paddlePriceId: "pri_01k76na5awhbh7epxs3tf5vqyr", // Replace with your actual yearly price ID
        },
      ],
      lifetime: [
        {
          name: language === "en" ? "Lifetime License" : "ترخيص مدى الحياة",
          price: "60",
          period: language === "en" ? "one-time" : "مرة واحدة",
          description:
            language === "en"
              ? "Pay once, use forever"
              : "ادفع مرة واحدة، استخدم للأبد",
          features: [
            language === "en"
              ? "Full desktop application access"
              : "وصول كامل لتطبيق سطح المكتب",
            language === "en"
              ? "AI-powered manga creation tools"
              : "أدوات إنشاء المانجا بالذكاء الاصطناعي",
            language === "en"
              ? "Create chapters, scenes & panels"
              : "إنشاء فصول ومشاهد ولوحات",
            language === "en"
              ? "Generate characters & outfits"
              : "إنشاء شخصيات وملابس",
            language === "en"
              ? "Build locations & backgrounds"
              : "بناء مواقع وخلفيات",
            language === "en"
              ? "Webtoon-style layouts"
              : "تخطيطات بنمط الويبتون",
            language === "en" ? "Speech bubble dialogs" : "فقاعات حوار",
            language === "en" ? "Local SQLite storage" : "تخزين SQLite محلي",
            language === "en"
              ? "Works with your Gemini API key"
              : "يعمل مع مفتاح Gemini API الخاص بك",
            language === "en"
              ? "All future updates included"
              : "جميع التحديثات المستقبلية مضمنة",
            language === "en"
              ? "One-time payment, no recurring fees"
              : "دفعة واحدة، بدون رسوم متكررة",
          ],
          cta:
            language === "en"
              ? "Get Lifetime License"
              : "احصل على الترخيص مدى الحياة",
          popular: true,
          paddlePriceId: "pri_01k76nmc3fkax0287xsgsh1m52", // Replace with your actual lifetime price ID
        },
      ],
    };

  const downloadLinks = {
    windows:
      "https://github.com/ahmedNabilskil-dev/MangaAI-Desktop-Release/releases/download/1.0.0/MangaAI-1.0.0-win.exe",
    mac: "https://github.com/ahmedNabilskil-dev/MangaAI-Desktop-Release/releases/download/1.0.0/MangaAI.Desktop-0.2.0-mac.dmg",
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-slate-900/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center py-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center space-x-3 ${
                isRTL ? "space-x-reverse" : ""
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  MangaAI
                </span>
                <div className="text-xs text-gray-400">
                  {language === "en" ? "Desktop Edition" : "إصدار سطح المكتب"}
                </div>
              </div>
            </div>

            <div
              className={`hidden md:flex space-x-8 ${
                isRTL ? "space-x-reverse" : ""
              }`}
            >
              <a
                href="#features"
                className="hover:text-purple-400 transition-all duration-300 flex items-center space-x-1"
              >
                <span>{t.nav.features}</span>
              </a>
              <a
                href="#pricing"
                className="hover:text-purple-400 transition-all duration-300 flex items-center space-x-1"
              >
                <span>{t.nav.pricing}</span>
              </a>
              <a
                href="#download"
                className="hover:text-purple-400 transition-all duration-300 flex items-center space-x-1"
              >
                <span>{t.nav.download}</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61577187896774"
                className="hover:text-blue-400 transition-all duration-300 flex items-center space-x-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-4 h-4" />
                <span>{t.nav.contact}</span>
              </a>
            </div>

            <div
              className={`flex items-center space-x-4 ${
                isRTL ? "space-x-reverse" : ""
              }`}
            >
              <a
                href={downloadLinks.windows}
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{t.nav.download}</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Compact Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">
                {t.hero.tagline}
              </span>
            </div>

            {/* Compact Hero Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                {t.hero.title1}{" "}
              </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t.hero.title2}
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl">
                {t.hero.title3}
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t.hero.description}
            </p>

            {/* Compact CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
              <a
                href={downloadLinks.windows}
                className="group bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Monitor className="w-5 h-5" />
                <span>{t.hero.windows}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={downloadLinks.mac}
                className="group bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Apple className="w-5 h-5" />
                <span>{t.hero.macos}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <button className="group border-2 border-white/20 hover:border-purple-400 px-6 py-3 rounded-xl font-semibold backdrop-blur-sm hover:bg-white/5 transition-all duration-300 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>{t.hero.watchDemo}</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">100% Private</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Local Storage</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Key className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Your API Key</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="relative inline-block overflow-visible text-5xl md:text-7xl font-bold mb-8 leading-none pb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t.features.title1}
              <span className="block text-4xl md:text-5xl leading-none pb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t.features.title2}
              </span>
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t.features.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-gradient-to-b hover:from-white/10 hover:to-white/5 hover:border-purple-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className="text-purple-400 mb-6 group-hover:text-pink-400 transition-colors duration-300 group-hover:scale-110 transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-3xl p-12 border border-white/10 backdrop-blur-xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">{t.features.private}</h3>
                <p className="text-gray-300">{t.features.privateDesc}</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">{t.features.fast}</h3>
                <p className="text-gray-300">{t.features.fastDesc}</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">{t.features.apiKey}</h3>
                <p className="text-gray-300">{t.features.apiKeyDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold border border-purple-500/30">
                {language === "en" ? "Choose Your Plan" : "اختر خطتك"}
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {t.pricing.title}
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              {t.pricing.description}
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-16">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10 inline-flex">
                {(["monthly", "yearly", "lifetime"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {activeTab === tab && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"></div>
                    )}
                    <span className="relative flex items-center gap-2">
                      {t.pricing[tab]}
                      {tab === "yearly" && (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                          {t.pricing.save}
                        </span>
                      )}
                      {tab === "lifetime" && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-0.5 rounded-md text-xs font-bold">
                          {t.pricing.bestDeal}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {pricingPlans[activeTab].map((plan, index) => (
              <div
                key={index}
                className={`relative group ${
                  plan.popular ? "md:scale-110 z-10" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Star className="w-4 h-4 fill-current" />
                      {language === "en" ? "Most Popular" : "الأكثر شعبية"}
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full bg-gradient-to-b backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 ${
                    plan.popular
                      ? "from-white/10 to-white/5 border-purple-500 shadow-2xl shadow-purple-500/25"
                      : "from-white/5 to-white/[0.02] border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
                  }`}
                >
                  {/* Price Section */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
                      {plan.description}
                    </p>

                    <div className="mb-2">
                      {plan.originalPrice && (
                        <div className="text-gray-500 line-through text-lg mb-1">
                          ${plan.originalPrice}
                        </div>
                      )}
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                          ${plan.price}
                        </span>
                        <span className="text-gray-400 text-lg">
                          /{plan.period}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-gray-300 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() =>
                      plan.paddlePriceId
                        ? openPaddleCheckout(plan.paddlePriceId)
                        : null
                    }
                    disabled={isLoading}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/50 text-white"
                        : "border-2 border-white/20 hover:border-purple-400 hover:bg-white/10 text-white"
                    }`}
                  >
                    {isLoading ? (
                      <span>
                        {language === "en" ? "Loading..." : "جاري التحميل..."}
                      </span>
                    ) : (
                      <>
                        <span>{plan.cta}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div
                className={`flex flex-wrap items-center justify-center gap-6 text-sm ${
                  isRTL ? "space-x-reverse" : ""
                }`}
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>{t.pricing.guarantee}</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400" />
                  <span>{t.pricing.cancel}</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Key className="w-5 h-5 text-pink-400" />
                  <span>{t.pricing.noFees}</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span>
                    {language === "en"
                      ? "You control API costs"
                      : "أنت تتحكم في تكاليف API"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section
          id="testimonials"
          className="py-10 px-4 sm:px-6 lg:px-8 relative"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t.testimonials.title}
              </h2>
              <p className="text-xl text-gray-300">
                {t.testimonials.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-gradient-to-b hover:from-white/15 hover:to-white/5 hover:border-purple-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-gray-200 mb-8 leading-relaxed italic text-lg">
                    "{testimonial.content}"
                  </p>

                  <div
                    className={`flex items-center space-x-4 ${
                      isRTL ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <div className="font-bold text-white text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-purple-400 text-sm font-medium">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Download Section */}
      <section id="download" className="py-10 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl p-12 backdrop-blur-xl text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Download className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t.download.available}
                </span>
              </div>
              <h2 className="inline-block overflow-visible leading-none pb-2 text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t.download.title}
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                {t.download.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <a
                href={downloadLinks.windows}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center space-x-3"
              >
                <Monitor className="w-8 h-8" />
                <div className={isRTL ? "text-right" : "text-left"}>
                  <div>{t.download.windows}</div>
                  <div className="text-sm opacity-75">MangaAI-Setup.exe</div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={downloadLinks.mac}
                className="group bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-slate-500/25 flex items-center justify-center space-x-3"
              >
                <Apple className="w-8 h-8" />
                <div className={isRTL ? "text-right" : "text-left"}>
                  <div>{t.download.macos}</div>
                  <div className="text-sm opacity-75">MangaAI.dmg</div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="https://youtube.com/@mangaai"
                className="group border-2 border-white/20 hover:border-red-400 px-6 py-3 rounded-xl font-semibold backdrop-blur-sm hover:bg-white/5 transition-all duration-300 flex items-center space-x-2 opacity-50 cursor-not-allowed"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    language === "en"
                      ? "YouTube tutorials coming soon! Follow us on Facebook for updates."
                      : "دروس اليوتيوب قريباً! تابعنا على الفيسبوك للتحديثات."
                  );
                }}
              >
                <Youtube className="w-5 h-5" />
                <span>{t.download.tutorials}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>
                  {language === "en" ? "SQLite Storage" : "تخزين SQLite"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Key className="w-4 h-4 text-pink-400" />
                <span>{language === "en" ? "Gemini API" : "Gemini API"}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>{language === "en" ? "100% Private" : "100% خاص"}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>
                  {language === "en" ? "Real-time AI" : "ذكاء اصطناعي فوري"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="inline-block overflow-visible leading-none pb-2 text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t.howItWorks.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-purple-500/25">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t.howItWorks.step1.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.howItWorks.step1.description}
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-cyan-500/25">
                  <Layers className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t.howItWorks.step2.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.howItWorks.step2.description}
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-green-500/25">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t.howItWorks.step3.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div
            className={`grid md:grid-cols-4 gap-8 mb-8 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <div className="col-span-2">
              <div
                className={`flex items-center space-x-3 mb-4 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MangaAI
                  </span>
                  <div className="text-xs text-gray-400">
                    {language === "en" ? "Desktop Edition" : "إصدار سطح المكتب"}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                {language === "en"
                  ? "The first AI-powered desktop application for creating complete manga stories through natural conversation. Transform your ideas into professional webtoon panels instantly."
                  : "أول تطبيق سطح مكتب مدعوم بالذكاء الاصطناعي لإنشاء قصص مانغا كاملة من خلال المحادثة الطبيعية. حول أفكارك إلى لوحات ويب تون احترافية على الفور."}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">
                {t.footer.product}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    {t.nav.features}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    {t.nav.pricing}
                  </a>
                </li>
                <li>
                  <a
                    href="#download"
                    className="hover:text-white transition-colors"
                  >
                    {t.nav.download}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">
                {t.footer.support}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <span className="opacity-50 cursor-not-allowed">
                    {t.footer.documentation}
                  </span>
                </li>
                <li>
                  <span className="opacity-50 cursor-not-allowed">
                    {t.download.tutorials}
                  </span>
                </li>
                <li>
                  <span className="opacity-50 cursor-not-allowed">
                    {t.footer.community}
                  </span>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=61577187896774"
                    className="hover:text-white transition-colors flex items-center space-x-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>{t.footer.contact}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 ${
              isRTL ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex space-x-8 text-gray-400 mb-4 md:mb-0 ${
                isRTL ? "space-x-reverse" : ""
              }`}
            >
              <Link
                to="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                {language === "en" ? "Privacy Policy" : "سياسة الخصوصية"}
              </Link>
              <Link
                to="/terms-of-service"
                className="hover:text-white transition-colors"
              >
                {language === "en" ? "Terms of Service" : "شروط الخدمة"}
              </Link>
              <Link
                to="/license"
                className="hover:text-white transition-colors"
              >
                {language === "en" ? "License" : "الترخيص"}
              </Link>
            </div>

            <div
              className={`flex items-center space-x-4 ${
                isRTL ? "space-x-reverse" : ""
              }`}
            >
              <a
                href="https://www.facebook.com/profile.php?id=61577187896774"
                className="p-2 hover:bg-blue-600/20 rounded-lg transition-all duration-300 group"
                target="_blank"
                rel="noopener noreferrer"
                title={t.footer.contact}
              >
                <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-400 transition-colors group-hover:scale-110" />
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">{t.footer.rights}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

declare global {
  interface Window {
    Paddle?: Paddle;
  }
}

export default LandingPage;
