"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Cloud,
  ExternalLink,
  Globe,
  Key,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

// Language content
const content = {
  en: {
    title: "Getting Started",
    subtitle:
      "Follow these simple steps to set up your Manga AI application. You'll need a VPN connection and two API keys to unlock the full power of AI-generated manga creation. Each step includes visual screenshots to guide you.",
    importantSetup: "Important Setup Required",
    importantSetupDesc:
      "Before you can start creating amazing manga content, you need to complete all three setup steps below. Make sure to connect your VPN to America first, as this is required for Gemini AI image generation. Both API services offer free tiers that are perfect for getting started. Follow the visual guides carefully!",
    whatYouNeed: "What You'll Need",
    stepByStep: "Step-by-Step Visual Guide",
    securityNotice: "Security Notice",
    visualGuideTitle: "Visual Guide Instructions",
    visualGuideDesc:
      "Each step includes a placeholder for screenshots that will help users visually follow the process. Replace the placeholder areas with actual screenshots of:",
    visualGuideItems: [
      "• VPN connection interface and American server selection",
      "• IP verification websites showing US location",
      "• Google AI Studio interface and project creation",
      "• ImgBB website navigation (About → API)",
      "• API key generation screens",
      "• Settings pages in your manga app",
    ],
    readyTitle: "Ready to Create Amazing Manga?",
    readyDesc:
      "Once you've completed all three steps above (VPN connection, Gemini API, and ImgBB setup) and followed the visual guides, head to the Settings page to enter your API keys. Remember to keep your VPN connected to America when using image generation features!",
    goToSettings: "Go to Settings",
    startCreating: "Start Creating",
    screenshotNotFound: "📸 Screenshot not found",
    step: "Step",
    steps: [
      {
        id: 1,
        title: "Get Your Gemini AI API Key",
        description:
          "Access Google's powerful Gemini AI for manga text and image generation",
        requirements: [
          "Free Google account",
          "Create a new project/app first",
          "Generate API key for the project",
        ],
        instructions: [
          {
            step: "Visit Google AI Studio",
            action: "Go to https://aistudio.google.com/",
            detail: "Sign in with your Google account",
          },
          {
            step: "Create New Project/App",
            action: "Click 'New Project' or 'Create App'",
            detail:
              "You must create a project/application before generating an API key",
          },
          {
            step: "Generate API Key",
            action:
              "After creating the project, click 'Get API Key' → 'Create API Key'",
            detail:
              "Choose 'Create API key in new project' or select your existing project",
          },
          {
            step: "Copy Your Key",
            action: "Copy the generated API key",
            detail: "Keep this key secure - you'll need it in settings",
          },
          {
            step: "Add to Manga AI",
            action:
              "Go to Settings → Enter API key in both Text generation tabs",
            detail: "The key works for both text and image generation",
          },
        ],
        linkText: "Get Gemini API Key",
        warning:
          "Keep your API key private and never share it publicly. Remember to create a project first!",
      },
      {
        id: 2,
        title: "Setup ImgBB Image Storage",
        description:
          "Store and manage your generated manga images with ImgBB's free service",
        requirements: [
          "Free ImgBB account",
          "Navigate to About → API section",
          "Generate API key for uploads",
        ],
        instructions: [
          {
            step: "Create ImgBB Account",
            action: "Visit https://imgbb.com/ and sign up",
            detail: "Use email or social media login to create your account",
          },
          {
            step: "Navigate to About Section",
            action: "Click on 'About' in the main navigation menu",
            detail: "Look for the About link in the top navigation or footer",
          },
          {
            step: "Access API Section",
            action: "In the About page, find and click on 'API'",
            detail:
              "This will take you to the API documentation and key generation page",
          },
          {
            step: "Generate API Key",
            action: "Click 'Get API Key' and generate your key",
            detail:
              "You may need to verify your account before generating the key",
          },
          {
            step: "Configure in App",
            action: "Add ImgBB API key to your app settings",
            detail: "This enables automatic image uploading and storage",
          },
        ],
        linkText: "Get ImgBB Account",
        warning:
          "Free accounts have upload limits - check ImgBB's terms for details. Remember to go through About → API!",
      },
      {
        id: 3,
        title: "Enable VPN Connection to America",
        description:
          "Required for Gemini AI image generation - must connect through American servers",
        requirements: [
          "VPN service chrome extension",
          "American server location",
          "Stable internet connection",
        ],
        instructions: [
          {
            step: "Search for VPN Extension",
            action: "Open Google and search for 'VPN extension for Chrome'",
            detail:
              "Use keywords like 'best free VPN extension for Chrome' for better results",
          },
          {
            step: "Download the Extension",
            action: "Click 'Add to Chrome' to install the extension",
            detail: "Confirm the installation in the popup that appears",
          },
          {
            step: "Choose American Server",
            action: "Open the extension and select a US-based server",
            detail:
              "Pick a server from major cities like New York or Los Angeles for better speed",
          },
          {
            step: "Enable the VPN",
            action: "Click the connect or enable button in the extension",
            detail: "Wait for the connection to be established before browsing",
          },
        ],
        linkText: "Check Your IP Location",
        warning:
          "Keep VPN connected while using image generation features. Free VPNs may not work reliably.",
      },
    ],
  },
  ar: {
    title: "البدء في الاستخدام",
    subtitle:
      "اتبع هذه الخطوات البسيطة لإعداد تطبيق المانجا بالذكاء الاصطناعي. ستحتاج إلى اتصال شبكة افتراضية خاصة ومفتاحين للواجهة البرمجية لفتح القوة الكاملة لإنشاء المانجا بالذكاء الاصطناعي. كل خطوة تتضمن لقطات شاشة مرئية لإرشادك.",
    importantSetup: "إعداد مهم مطلوب",
    importantSetupDesc:
      "قبل أن تتمكن من البدء في إنشاء محتوى مانجا مذهل، تحتاج إلى إكمال جميع خطوات الإعداد الثلاث أدناه. تأكد من توصيل الشبكة الافتراضية الخاصة بك بأمريكا أولاً، حيث أن هذا مطلوب لتوليد الصور بالذكاء الاصطناعي جيميني. كلا خدمتي الواجهة البرمجية تقدمان مستويات مجانية مثالية للبدء. اتبع الأدلة المرئية بعناية!",
    whatYouNeed: "ما ستحتاجه",
    stepByStep: "دليل مرئي خطوة بخطوة",
    securityNotice: "إشعار أمني",
    visualGuideTitle: "تعليمات الدليل المرئي",
    visualGuideDesc:
      "كل خطوة تتضمن مكاناً مخصصاً للقطات الشاشة التي ستساعد المستخدمين على اتباع العملية بصرياً. استبدل المناطق المخصصة بلقطات شاشة فعلية لـ:",
    visualGuideItems: [
      "• واجهة اتصال الشبكة الافتراضية الخاصة واختيار الخادم الأمريكي",
      "• مواقع التحقق من عنوان الإنترنت التي تظهر الموقع الأمريكي",
      "• واجهة استديو جوجل للذكاء الاصطناعي وإنشاء المشروع",
      "• التنقل في موقع إيمج بي بي (حول ← واجهة برمجية)",
      "• شاشات توليد مفتاح الواجهة البرمجية",
      "• صفحات الإعدادات في تطبيق المانجا الخاص بك",
    ],
    readyTitle: "هل أنت مستعد لإنشاء مانجا مذهلة؟",
    readyDesc:
      "بمجرد إكمال جميع الخطوات الثلاث أعلاه (اتصال الشبكة الافتراضية الخاصة، واجهة جيميني البرمجية، وإعداد إيمج بي بي) واتباع الأدلة المرئية، توجه إلى صفحة الإعدادات لإدخال مفاتيح الواجهة البرمجية. تذكر أن تحافظ على اتصال الشبكة الافتراضية الخاصة بأمريكا عند استخدام ميزات توليد الصور!",
    goToSettings: "الذهاب إلى الإعدادات",
    startCreating: "بدء الإنشاء",
    screenshotNotFound: "📸 لم يتم العثور على لقطة الشاشة",
    step: "الخطوة",
    steps: [
      {
        id: 1,
        title: "احصل على مفتاح واجهة جيميني البرمجية للذكاء الاصطناعي",
        description:
          "اختر ذكاء جيميني الاصطناعي القوي من جوجل لتوليد نصوص وصور المانجا",
        requirements: [
          "حساب جوجل مجاني",
          "إنشاء مشروع/تطبيق جديد أولاً",
          "توليد مفتاح الواجهة البرمجية للمشروع",
        ],
        instructions: [
          {
            step: "زيارة استديو جوجل للذكاء الاصطناعي",
            action: "اذهب إلى https://aistudio.google.com/",
            detail: "سجل الدخول بحساب جوجل الخاص بك",
          },
          {
            step: "إنشاء مشروع/تطبيق جديد",
            action: "انقر على 'مشروع جديد' أو 'إنشاء تطبيق'",
            detail:
              "يجب عليك إنشاء مشروع/تطبيق قبل توليد مفتاح الواجهة البرمجية",
          },
          {
            step: "توليد مفتاح الواجهة البرمجية",
            action:
              "بعد إنشاء المشروع، انقر على 'الحصول على مفتاح الواجهة البرمجية' ← 'إنشاء مفتاح الواجهة البرمجية'",
            detail:
              "اختر 'إنشاء مفتاح واجهة برمجية في مشروع جديد' أو حدد مشروعك الحالي",
          },
          {
            step: "نسخ مفتاحك",
            action: "انسخ مفتاح الواجهة البرمجية المُولد",
            detail: "احتفظ بهذا المفتاح آمناً - ستحتاجه في الإعدادات",
          },
          {
            step: "إضافة إلى مانجا الذكاء الاصطناعي",
            action:
              "اذهب إلى الإعدادات ← أدخل مفتاح الواجهة البرمجية في كلا تبويبي توليد النص",
            detail: "المفتاح يعمل لكل من توليد النص والصورة",
          },
        ],
        linkText: "احصل على مفتاح واجهة جيميني البرمجية",
        warning:
          "احتفظ بمفتاح الواجهة البرمجية خاصاً ولا تشاركه علناً أبداً. تذكر إنشاء مشروع أولاً!",
      },
      {
        id: 2,
        title: "إعداد تخزين صور إيمج بي بي",
        description:
          "احفظ وأدر صور المانجا المولدة باستخدام خدمة إيمج بي بي المجانية",
        requirements: [
          "حساب إيمج بي بي مجاني",
          "التنقل إلى قسم حول ← الواجهة البرمجية",
          "توليد مفتاح الواجهة البرمجية للتحميلات",
        ],
        instructions: [
          {
            step: "إنشاء حساب إيمج بي بي",
            action: "زر https://imgbb.com/ وسجل",
            detail:
              "استخدم البريد الإلكتروني أو تسجيل الدخول عبر وسائل التواصل الاجتماعي لإنشاء حسابك",
          },
          {
            step: "التنقل إلى قسم حول",
            action: "انقر على 'حول' في قائمة التنقل الرئيسية",
            detail: "ابحث عن رابط حول في التنقل العلوي أو التذييل",
          },
          {
            step: "الوصول إلى قسم الواجهة البرمجية",
            action: "في صفحة حول، اعثر على 'الواجهة البرمجية' وانقر عليها",
            detail: "هذا سيأخذك إلى وثائق الواجهة البرمجية وصفحة توليد المفتاح",
          },
          {
            step: "توليد مفتاح الواجهة البرمجية",
            action: "انقر على 'الحصول على مفتاح الواجهة البرمجية' وولد مفتاحك",
            detail: "قد تحتاج إلى التحقق من حسابك قبل توليد المفتاح",
          },
          {
            step: "التكوين في التطبيق",
            action: "أضف مفتاح واجهة إيمج بي بي البرمجية إلى إعدادات تطبيقك",
            detail: "هذا يمكن التحميل والتخزين التلقائي للصور",
          },
        ],
        linkText: "احصل على حساب إيمج بي بي",
        warning:
          "الحسابات المجانية لها حدود تحميل - تحقق من شروط إيمج بي بي للتفاصيل. تذكر الذهاب عبر حول ← الواجهة البرمجية!",
      },
      {
        id: 3,
        title: "تمكين اتصال الشبكة الافتراضية الخاصة بأمريكا",
        description:
          "مطلوب لتوليد صور الذكاء الاصطناعي جيميني - يجب الاتصال عبر الخوادم الأمريكية",
        requirements: [
          "إضافة خدمة الشبكة الافتراضية الخاصة لكروم",
          "موقع خادم أمريكي",
          "اتصال إنترنت مستقر",
        ],
        instructions: [
          {
            step: "البحث عن إضافة الشبكة الافتراضية الخاصة",
            action: "افتح جوجل وابحث عن 'إضافة الشبكة الافتراضية الخاصة لكروم'",
            detail:
              "استخدم كلمات مفتاحية مثل 'أفضل إضافة شبكة افتراضية خاصة مجانية لكروم' لنتائج أفضل",
          },
          {
            step: "تنزيل الإضافة",
            action: "انقر على 'إضافة إلى كروم' لتثبيت الإضافة",
            detail: "أكد التثبيت في النافذة المنبثقة التي تظهر",
          },
          {
            step: "اختيار خادم أمريكي",
            action: "افتح الإضافة واختر خادماً مقره الولايات المتحدة",
            detail:
              "اختر خادماً من مدن رئيسية مثل نيويورك أو لوس أنجلس للحصول على سرعة أفضل",
          },
          {
            step: "تمكين الشبكة الافتراضية الخاصة",
            action: "انقر على زر الاتصال أو التمكين في الإضافة",
            detail: "انتظر حتى يتم تأسيس الاتصال قبل التصفح",
          },
        ],
        linkText: "تحقق من موقع عنوان الإنترنت الخاص بك",
        warning:
          "احتفظ بالشبكة الافتراضية الخاصة متصلة أثناء استخدام ميزات توليد الصور. الشبكات الافتراضية الخاصة المجانية قد لا تعمل بموثوقية.",
      },
    ],
  },
};

const ScreenshotImage = ({
  filename,
  stepTitle,
  isRTL,
}: {
  filename: string;
  stepTitle: string;
  isRTL: boolean;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="mt-4 p-2 bg-gray-800/50 rounded-lg border border-gray-600">
      <div className="relative">
        {imageError ? (
          <div className="flex items-center justify-center h-48 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-medium">{stepTitle}</p>
              <p className="text-gray-500 text-xs mt-1">Image: {filename}</p>
              <p className="text-red-400 text-xs mt-2">
                {isRTL
                  ? "📸 لقطة الشاشة غير موجودة"
                  : "📸 Screenshot not found"}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={filename}
              alt={`Screenshot for ${stepTitle}`}
              className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg border border-gray-600 group-hover:border-gray-400 transition-colors"
              onError={handleImageError}
              style={{ display: imageError ? "none" : "block" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 text-xs text-white/80 bg-black/30 px-2 py-1 rounded pointer-events-none">
              {stepTitle}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LanguageToggle = ({
  language,
  onLanguageChange,
}: {
  language: "ar" | "en";
  onLanguageChange: any;
}) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-full p-2">
        <Globe className="h-4 w-4 text-gray-400" />
        <button
          onClick={() => onLanguageChange("en")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            language === "en"
              ? "bg-purple-600 text-white"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => onLanguageChange("ar")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            language === "ar"
              ? "bg-purple-600 text-white"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          ع
        </button>
      </div>
    </div>
  );
};

const DocumentationPage = () => {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const isRTL = language === "ar";
  const t = content[language];

  // In a real application, you would use localStorage here
  // For Claude.ai artifacts, we'll just use state
  const handleLanguageChange = (newLanguage: "ar" | "en") => {
    setLanguage(newLanguage);
    // In real app: localStorage.setItem('manga-app-language', newLanguage);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <LanguageToggle
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width: Math.random() * 150 + 30,
              height: Math.random() * 150 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`flex items-center justify-center gap-3 mb-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <BookOpen className="h-12 w-12 text-pink-400" />
            <h1 className="text-5xl font-bold text-white">{t.title}</h1>
            <Sparkles className="h-12 w-12 text-purple-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Alert Card */}
        <div className="mb-8">
          <div className="bg-amber-900/40 border border-amber-600 backdrop-blur-lg rounded-lg p-6">
            <div
              className={`flex items-start gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <AlertCircle className="h-6 w-6 text-amber-400 mt-1 flex-shrink-0" />
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-lg font-semibold text-amber-200 mb-2">
                  {t.importantSetup}
                </h3>
                <p className="text-amber-100">{t.importantSetupDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {t.steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-6">
                <div
                  className={`flex items-center justify-between ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="bg-gray-800 p-3 rounded-full">
                      {step.id === 1 && (
                        <Key className="h-6 w-6 text-blue-400" />
                      )}
                      {step.id === 2 && (
                        <Cloud className="h-6 w-6 text-green-400" />
                      )}
                      {step.id === 3 && (
                        <Settings className="h-6 w-6 text-orange-400" />
                      )}
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2
                        className={`text-2xl text-white flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        {t.step} {step.id}: {step.title}
                      </h2>
                      <p className="text-gray-300 mt-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-600">
                    {step.id}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Requirements */}
                <div className="mb-6">
                  <h4
                    className={`text-lg font-semibold text-white mb-3 flex items-center gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    {t.whatYouNeed}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {step.requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span
                          className={`text-gray-200 text-sm ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {req}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h4
                    className={`text-lg font-semibold text-white mb-4 flex items-center gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Settings className="h-5 w-5 text-blue-400" />
                    {t.stepByStep}
                  </h4>
                  <div className="space-y-6">
                    {step.instructions.map((instruction, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div
                          className={`flex items-start gap-4 mb-4 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div
                            className={`flex-1 ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            <h5 className="font-semibold text-white mb-1">
                              {instruction.step}
                            </h5>
                            <p className="text-purple-300 font-medium mb-1">
                              {instruction.action}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {instruction.detail}
                            </p>
                          </div>
                          <ArrowRight
                            className={`h-5 w-5 text-gray-500 mt-2 ${
                              isRTL ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        <ScreenshotImage
                          filename={`/images/screenshot/${
                            step.id === 1
                              ? "gemini"
                              : step.id === 2
                              ? "image"
                              : "vpn"
                          }-${idx + 1}.png`}
                          stepTitle={instruction.step}
                          isRTL={isRTL}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <div
                    className={`flex items-start gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h5 className="font-semibold text-red-200 mb-1">
                        {t.securityNotice}
                      </h5>
                      <p className="text-red-300 text-sm">{step.warning}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() =>
                      window.open(
                        step.id === 1
                          ? "https://aistudio.google.com/"
                          : step.id === 2
                          ? "https://imgbb.com/"
                          : "https://whatismyipaddress.com/",
                        "_blank"
                      )
                    }
                    className={`bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all group flex items-center gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {step.linkText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Screenshot Guide */}
        <div className="mt-8 mb-12">
          <div className="bg-blue-900/40 border border-blue-600 backdrop-blur-lg rounded-lg p-6">
            <div
              className={`flex items-start gap-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <BookOpen className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-lg font-semibold text-blue-200 mb-2">
                  {t.visualGuideTitle}
                </h3>
                <p className="text-blue-100 mb-3">{t.visualGuideDesc}</p>
                <ul
                  className={`text-blue-100 text-sm space-y-1 ${
                    isRTL ? "mr-4" : "ml-4"
                  }`}
                >
                  {t.visualGuideItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Final Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-600 backdrop-blur-lg rounded-lg p-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              {t.readyTitle}
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              {t.readyDesc}
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center ${
                isRTL ? "sm:flex-row-reverse" : ""
              }`}
            >
              <button
                onClick={() => window.open("/settings", "_self")}
                className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 justify-center ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Settings className="h-5 w-5" />
                {t.goToSettings}
              </button>
              <button
                onClick={() => window.open("/", "_self")}
                className={`border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-6 px-8 rounded-full transition-all flex items-center gap-2 justify-center ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Sparkles className="h-5 w-5" />
                {t.startCreating}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
