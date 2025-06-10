"use client";

import SidebarItem from "@/components/side-item/SideItem";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  BookOpen,
  CheckCircle,
  Eye,
  Home,
  Key,
  Languages,
  Menu,
  Settings,
  Shield,
  Sparkles,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TermsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("manga-ai-language") as
      | "en"
      | "ar";
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("manga-ai-language", newLanguage);
  };

  const isRTL = language === "ar";

  // Translations object
  const t = {
    en: {
      appName: "Manga AI",
      home: "Home",
      projects: "Projects",
      settings: "Settings",
      documentation: "Documentation",
      terms: "Terms",
      version: "v1.0.0-beta",
      appDescription: "AI Manga Generator",
      backToHome: "Back to Home",
      termsTitle: "Terms and Conditions",
      beta: "BETA",
      lastUpdated: "Last updated:",
      returnToHome: "Return to Home",

      // Beta Version Notice
      betaNoticeTitle: "Beta Version Notice",
      betaNoticeContent:
        "This application is currently in BETA development phase. This means:",
      betaNoticeItems: [
        "Features may change or be removed without notice",
        "You may encounter bugs or unexpected behavior",
        "Data format may change between versions",
        "Some features may be incomplete or experimental",
      ],
      betaRisk:
        "Use at your own risk. We recommend backing up your work frequently and not relying on this version for critical projects.",

      // Important Notice
      importantNoticeTitle: "Important Notice",
      importantNoticeContent:
        "This application uses your own API keys for AI model access. We do not store or have access to your API keys or the content generated using them.",

      // API Key Usage
      apiKeyTitle: "API Key Usage",
      apiKeyYours:
        "Your API Keys: You are responsible for providing and managing your own API keys (such as Google Gemini, OpenAI, Anthropic, etc.). These keys are stored locally in your browser and are never transmitted to our servers.",
      apiKeyCosts:
        "Costs: All API usage costs are your responsibility. You will be billed directly by the respective AI service providers based on your usage.",
      apiKeySecurity:
        "Security: Keep your API keys secure. Do not share them with others. We recommend regularly rotating your API keys for security.",

      // How the App Works
      appWorksTitle: "How the Application Works",
      appWorksIntro:
        "This application provides an interactive flow-based interface for creating manga stories using AI assistance:",
      appWorksItems: [
        "Node-Based Creation: Each element of your manga (chapters, scenes, panels, dialogs) is represented as a node in an interactive flow",
        "AI Chat Integration: Use the chat interface to discuss and generate content for each story element",
        "Structured Output: AI responses are converted into structured JSON and then into visual nodes in your manga flow",
        "Local Processing: All generation happens client-side using your API keys",
      ],
      appWorksBetaNote:
        "Beta Note: Some features are still in development and may not work as expected. New features are being added regularly.",

      // Data Privacy
      dataPrivacyTitle: "Data Privacy",
      localStorage:
        "Local Storage: Your manga projects, API keys, and chat history are stored locally in your browser using localStorage.",
      noServerStorage:
        "No Server Storage: We do not store any of your content, API keys, or personal data on our servers.",
      thirdPartyServices:
        "Third-Party Services: When you use AI features, your prompts are sent directly to the respective AI service providers using your API keys.",
      betaWarning:
        "Beta Warning: Data structures may change between versions. Always backup your projects before updating the application.",

      // User Responsibilities
      userResponsibilitiesTitle: "User Responsibilities",
      userResponsibilitiesIntro:
        "By using this beta application, you agree to:",
      userResponsibilitiesItems: [
        "Understand this is a beta version with potential instabilities",
        "Provide valid API keys for AI services you wish to use",
        "Monitor and manage your API usage and associated costs",
        "Use the application in compliance with all applicable laws and regulations",
        "Respect the terms of service of the AI providers whose APIs you use",
        "Not create content that is illegal, harmful, or violates intellectual property rights",
        "Regularly back up your projects as they are stored locally and data format may change",
        "Report bugs and provide feedback to help improve the application",
      ],

      // Limitations
      limitationsTitle: "Limitations and Disclaimers",
      betaSoftware:
        "Beta Software: This is beta software. Functionality may be incomplete, unstable, or subject to change.",
      serviceAvailability:
        "Service Availability: We cannot guarantee uninterrupted access to third-party AI services or the application itself.",
      contentQuality:
        "Content Quality: The quality of generated content depends on the AI models you use and your prompts. We do not guarantee any specific quality or accuracy.",
      dataLoss:
        "Data Loss: Since data is stored locally and this is beta software, there is increased risk of data loss. Always maintain external backups of important work.",
      aiGeneratedContent:
        "AI Generated Content: All AI-generated content should be reviewed and verified before use. We are not responsible for the accuracy, appropriateness, or originality of AI-generated content.",
      breakingChanges:
        "Breaking Changes: Updates may introduce breaking changes that could affect your saved projects or require data migration.",

      // Intellectual Property
      intellectualPropertyTitle: "Intellectual Property",
      yourContent:
        "Your Content: You retain all rights to the manga content you create using this application.",
      aiContent:
        "AI-Generated Content: The ownership and copyright status of AI-generated content may vary depending on your jurisdiction and the AI service provider. Please consult with legal counsel if you plan to commercialize AI-generated content.",
      appCode:
        "Application Code: The source code of this application remains the property of its developers.",

      // Beta Testing
      betaTestingTitle: "Beta Testing and Feedback",
      betaTestingIntro:
        "As a beta user, your feedback is valuable in improving the application:",
      betaTestingItems: [
        "Report bugs and issues through our feedback channels",
        "Suggest new features or improvements",
        "Share your user experience and workflow challenges",
      ],
      betaTestingNote:
        "Beta testing participation is voluntary and at your own risk.",

      // Changes to Terms
      changesTitle: "Changes to Terms",
      changesContent:
        "We may update these terms frequently during the beta phase. Continued use of the application constitutes acceptance of any changes. We recommend checking these terms regularly for updates.",

      // Contact
      contactTitle: "Contact",
      contactContent:
        "If you have any questions about these terms, encounter bugs, or want to provide beta feedback, please contact us through our support channels.",
    },
    ar: {
      appName: "Manga Ai",
      home: "الرئيسية",
      projects: "المشاريع",
      settings: "الإعدادات",
      documentation: "التوثيق",
      terms: "الشروط",
      version: "الإصدار 1.0.0-تجريبي",
      appDescription: "مولد المانجا بالذكاء الاصطناعي",
      backToHome: "العودة للرئيسية",
      termsTitle: "الشروط والأحكام",
      beta: "تجريبي",
      lastUpdated: "آخر تحديث:",
      returnToHome: "العودة للرئيسية",

      // Beta Version Notice
      betaNoticeTitle: "إشعار الإصدار التجريبي",
      betaNoticeContent:
        "هذا التطبيق حالياً في مرحلة التطوير التجريبية. هذا يعني:",
      betaNoticeItems: [
        "قد تتغير الميزات أو تُزال دون إشعار مسبق",
        "قد تواجه أخطاء أو سلوك غير متوقع",
        "قد يتغير تنسيق البيانات بين الإصدارات",
        "بعض الميزات قد تكون غير مكتملة أو تجريبية",
      ],
      betaRisk:
        "استخدم على مسؤوليتك الخاصة. نوصي بعمل نسخ احتياطية من عملك بانتظام وعدم الاعتماد على هذا الإصدار للمشاريع الحرجة.",

      // Important Notice
      importantNoticeTitle: "إشعار مهم",
      importantNoticeContent:
        "يستخدم هذا التطبيق مفاتيح API الخاصة بك للوصول إلى نماذج الذكاء الاصطناعي. نحن لا نخزن أو نصل إلى مفاتيح API الخاصة بك أو المحتوى المُنتج باستخدامها.",

      // API Key Usage
      apiKeyTitle: "استخدام مفاتيح API",
      apiKeyYours:
        "مفاتيح API الخاصة بك: أنت مسؤول عن توفير وإدارة مفاتيح API الخاصة بك (مثل Google Gemini، OpenAI، Anthropic، إلخ). تُخزن هذه المفاتيح محلياً في متصفحك ولا تُرسل أبداً إلى خوادمنا.",
      apiKeyCosts:
        "التكاليف: جميع تكاليف استخدام API على مسؤوليتك. ستُفوتر مباشرة من مزودي خدمة الذكاء الاصطناعي المعنيين بناءً على استخدامك.",
      apiKeySecurity:
        "الأمان: حافظ على أمان مفاتيح API الخاصة بك. لا تشاركها مع الآخرين. نوصي بتدوير مفاتيح API الخاصة بك بانتظام للأمان.",

      // How the App Works
      appWorksTitle: "كيفية عمل التطبيق",
      appWorksIntro:
        "يوفر هذا التطبيق واجهة تفاعلية قائمة على التدفق لإنشاء قصص المانجا باستخدام مساعدة الذكاء الاصطناعي:",
      appWorksItems: [
        "الإنشاء القائم على العقد: كل عنصر من عناصر المانجا الخاصة بك (الفصول، المشاهد، اللوحات، الحوارات) يُمثل كعقدة في تدفق تفاعلي",
        "تكامل الدردشة مع الذكاء الاصطناعي: استخدم واجهة الدردشة لمناقشة وإنتاج محتوى لكل عنصر من عناصر القصة",
        "الإخراج المنظم: تُحول استجابات الذكاء الاصطناعي إلى JSON منظم ثم إلى عقد مرئية في تدفق المانجا الخاص بك",
        "المعالجة المحلية: تحدث جميع عمليات الإنتاج على جانب العميل باستخدام مفاتيح API الخاصة بك",
      ],
      appWorksBetaNote:
        "ملاحظة تجريبية: بعض الميزات لا تزال قيد التطوير وقد لا تعمل كما هو متوقع. يتم إضافة ميزات جديدة بانتظام.",

      // Data Privacy
      dataPrivacyTitle: "خصوصية البيانات",
      localStorage:
        "التخزين المحلي: مشاريع المانجا ومفاتيح API وسجل الدردشة الخاصة بك تُخزن محلياً في متصفحك باستخدام localStorage.",
      noServerStorage:
        "لا يوجد تخزين على الخادم: نحن لا نخزن أي من محتواك أو مفاتيح API أو البيانات الشخصية على خوادمنا.",
      thirdPartyServices:
        "خدمات الطرف الثالث: عند استخدام ميزات الذكاء الاصطناعي، تُرسل مطالباتك مباشرة إلى مزودي خدمة الذكاء الاصطناعي المعنيين باستخدام مفاتيح API الخاصة بك.",
      betaWarning:
        "تحذير تجريبي: قد تتغير هياكل البيانات بين الإصدارات. احتفظ دائماً بنسخة احتياطية من مشاريعك قبل تحديث التطبيق.",

      // User Responsibilities
      userResponsibilitiesTitle: "مسؤوليات المستخدم",
      userResponsibilitiesIntro:
        "باستخدام هذا التطبيق التجريبي، أنت توافق على:",
      userResponsibilitiesItems: [
        "فهم أن هذا إصدار تجريبي مع احتمالية عدم الاستقرار",
        "توفير مفاتيح API صالحة لخدمات الذكاء الاصطناعي التي ترغب في استخدامها",
        "مراقبة وإدارة استخدام API والتكاليف المرتبطة بها",
        "استخدام التطبيق وفقاً لجميع القوانين واللوائح المعمول بها",
        "احترام شروط خدمة مزودي الذكاء الاصطناعي الذين تستخدم واجهات برمجة التطبيقات الخاصة بهم",
        "عدم إنشاء محتوى غير قانوني أو ضار أو ينتهك حقوق الملكية الفكرية",
        "عمل نسخ احتياطية منتظمة لمشاريعك لأنها تُخزن محلياً وقد يتغير تنسيق البيانات",
        "الإبلاغ عن الأخطاء وتقديم التعليقات لتحسين التطبيق",
      ],

      // Limitations
      limitationsTitle: "القيود وإخلاء المسؤولية",
      betaSoftware:
        "برنامج تجريبي: هذا برنامج تجريبي. قد تكون الوظائف غير مكتملة أو غير مستقرة أو قابلة للتغيير.",
      serviceAvailability:
        "توفر الخدمة: لا يمكننا ضمان الوصول المتواصل لخدمات الذكاء الاصطناعي أو التطبيق نفسه.",
      contentQuality:
        "جودة المحتوى: تعتمد جودة المحتوى المُنتج على نماذج الذكاء الاصطناعي التي تستخدمها ومطالباتك. نحن لا نضمن أي جودة أو دقة محددة.",
      dataLoss:
        "فقدان البيانات: نظراً لأن البيانات تُخزن محلياً وهذا برنامج تجريبي، هناك خطر متزايد لفقدان البيانات. احتفظ دائماً بنسخ احتياطية خارجية للأعمال المهمة.",
      aiGeneratedContent:
        "المحتوى المُنتج بالذكاء الاصطناعي: يجب مراجعة والتحقق من جميع المحتوى المُنتج بالذكاء الاصطناعي قبل الاستخدام. نحن لسنا مسؤولين عن دقة أو ملاءمة أو أصالة المحتوى المُنتج بالذكاء الاصطناعي.",
      breakingChanges:
        "التغييرات الجذرية: قد تدخل التحديثات تغييرات جذرية قد تؤثر على مشاريعك المحفوظة أو تتطلب ترحيل البيانات.",

      // Intellectual Property
      intellectualPropertyTitle: "الملكية الفكرية",
      yourContent:
        "محتواك: تحتفظ بجميع الحقوق لمحتوى المانجا الذي تنشئه باستخدام هذا التطبيق.",
      aiContent:
        "المحتوى المُنتج بالذكاء الاصطناعي: قد تختلف ملكية ووضع حقوق الطبع والنشر للمحتوى المُنتج بالذكاء الاصطناعي حسب ولايتك القضائية ومزود خدمة الذكاء الاصطناعي. استشر مستشاراً قانونياً إذا كنت تخطط لتسويق المحتوى المُنتج بالذكاء الاصطناعي تجارياً.",
      appCode: "كود التطبيق: يبقى الكود المصدري لهذا التطبيق ملكاً لمطوريه.",

      // Beta Testing
      betaTestingTitle: "الاختبار التجريبي والتعليقات",
      betaTestingIntro: "كمستخدم تجريبي، تعليقاتك قيمة في تحسين التطبيق:",
      betaTestingItems: [
        "الإبلاغ عن الأخطاء والمشاكل من خلال قنوات التعليقات الخاصة بنا",
        "اقتراح ميزات جديدة أو تحسينات",
        "مشاركة تجربة المستخدم وتحديات سير العمل",
      ],
      betaTestingNote:
        "المشاركة في الاختبار التجريبي طوعية وعلى مسؤوليتك الخاصة.",

      // Changes to Terms
      changesTitle: "تغييرات الشروط",
      changesContent:
        "قد نحدث هذه الشروط بشكل متكرر خلال المرحلة التجريبية. الاستمرار في استخدام التطبيق يعني قبول أي تغييرات. نوصي بمراجعة هذه الشروط بانتظام للتحديثات.",

      // Contact
      contactTitle: "اتصل بنا",
      contactContent:
        "إذا كان لديك أي أسئلة حول هذه الشروط، أو واجهت أخطاء، أو ترغب في تقديم تعليقات تجريبية، يرجى الاتصال بنا من خلال قنوات الدعم الخاصة بنا.",
    },
  };

  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 240 : 80 }}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`h-full bg-gray-900/80 backdrop-blur-md flex flex-col border-gray-700 ${
          isRTL ? "border-l" : "border-r"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              {t[language].appName}
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 mt-6">
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            text={t[language].home}
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/"
          />
          <SidebarItem
            icon={<BookMarked className="h-5 w-5" />}
            text={t[language].projects}
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/projects"
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            text={t[language].settings}
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/settings"
          />
          <SidebarItem
            icon={<BookOpen className="h-5 w-5" />}
            text={t[language].documentation}
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/documentation"
          />
          <SidebarItem
            icon={<Shield className="h-5 w-5" />}
            text={t[language].terms}
            isActive={true}
            isSidebarOpen={isSidebarOpen}
            href="/terms"
          />
        </nav>

        {isSidebarOpen && (
          <div className="p-4 text-sm text-gray-400">
            <p>{t[language].appDescription}</p>
            <p className="text-xs mt-1 flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              {t[language].version}
            </p>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                {t[language].backToHome}
              </Link>

              {/* Language Switcher */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 flex items-center gap-2"
              >
                <Languages className="h-4 w-4" />
                {language === "en" ? "العربية" : "English"}
              </Button>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-pink-400" />
              {t[language].termsTitle}
              <span className="bg-orange-600 text-orange-100 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <TestTube className="h-3 w-3" />
                {t[language].beta}
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              {t[language].lastUpdated}{" "}
              {new Date().toLocaleDateString(
                language === "ar" ? "ar-EG" : "en-US"
              )}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden"
          >
            <div className="p-8 space-y-8">
              {/* Beta Version Notice */}
              <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-200 mb-2">
                  <TestTube className="h-5 w-5" />
                  <h3 className="font-semibold">
                    {t[language].betaNoticeTitle}
                  </h3>
                </div>
                <div className="text-orange-100 text-sm space-y-2">
                  <p>{t[language].betaNoticeContent}</p>
                  <ul
                    className={`list-disc space-y-1 ${isRTL ? "pr-5" : "pl-5"}`}
                  >
                    {t[language].betaNoticeItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    <strong>{t[language].betaRisk}</strong>
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-200 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold">
                    {t[language].importantNoticeTitle}
                  </h3>
                </div>
                <p className="text-amber-100 text-sm">
                  {t[language].importantNoticeContent}
                </p>
              </div>

              {/* API Key Usage */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="h-6 w-6 text-pink-400" />
                  {t[language].apiKeyTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>{t[language].apiKeyYours}</strong>
                  </p>
                  <p>
                    <strong>{t[language].apiKeyCosts}</strong>
                  </p>
                  <p>
                    <strong>{t[language].apiKeySecurity}</strong>
                  </p>
                </div>
              </section>

              {/* How the App Works */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-pink-400" />
                  {t[language].appWorksTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>{t[language].appWorksIntro}</p>
                  <ul
                    className={`list-disc space-y-2 ${isRTL ? "pr-6" : "pl-6"}`}
                  >
                    {t[language].appWorksItems.map((item, index) => (
                      <li key={index}>
                        <strong>{item}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      <strong>{t[language].appWorksBetaNote}</strong>
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-pink-400" />
                  {t[language].dataPrivacyTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>{t[language].localStorage}</strong>
                  </p>
                  <p>
                    <strong>{t[language].noServerStorage}</strong>
                  </p>
                  <p>
                    <strong>{t[language].thirdPartyServices}</strong>
                  </p>
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-200 text-sm">
                      <strong>{t[language].betaWarning}</strong>
                    </p>
                  </div>
                </div>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-pink-400" />
                  {t[language].userResponsibilitiesTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>{t[language].userResponsibilitiesIntro}</p>
                  <ul
                    className={`list-disc space-y-2 ${isRTL ? "pr-6" : "pl-6"}`}
                  >
                    {t[language].userResponsibilitiesItems.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              </section>

              {/* Limitations and Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-pink-400" />
                  {t[language].limitationsTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>{t[language].betaSoftware}</strong>
                  </p>
                  <p>
                    <strong>{t[language].serviceAvailability}</strong>
                  </p>
                  <p>
                    <strong>{t[language].contentQuality}</strong>
                  </p>
                  <p>
                    <strong>{t[language].dataLoss}</strong>
                  </p>
                  <p>
                    <strong>{t[language].aiGeneratedContent}</strong>
                  </p>
                  <p>
                    <strong>{t[language].breakingChanges}</strong>
                  </p>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t[language].intellectualPropertyTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>{t[language].yourContent}</strong>
                  </p>
                  <p>
                    <strong>{t[language].aiContent}</strong>
                  </p>
                  <p>
                    <strong>{t[language].appCode}</strong>
                  </p>
                </div>
              </section>

              {/* Beta Testing and Feedback */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TestTube className="h-6 w-6 text-pink-400" />
                  {t[language].betaTestingTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>{t[language].betaTestingIntro}</p>
                  <ul
                    className={`list-disc space-y-2 ${isRTL ? "pr-6" : "pl-6"}`}
                  >
                    {t[language].betaTestingItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <p>{t[language].betaTestingNote}</p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t[language].changesTitle}
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>{t[language].changesContent}</p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t[language].contactTitle}
                </h2>
                <div className="text-gray-300">
                  <p>{t[language].contactContent}</p>
                </div>
              </section>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              {t[language].returnToHome}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
