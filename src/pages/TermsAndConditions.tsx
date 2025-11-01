import {
  AlertTriangle,
  ArrowLeft,
  Copyright,
  CreditCard,
  FileText,
  Scale,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(236, 72, 153, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const Section = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="group relative mb-12">
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-gradient-to-br from-black/80 to-gray-900/80 border-4 border-pink-500/50 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center border-2 border-white shadow-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            {title}
          </h2>
        </div>
        <div className="text-gray-300 space-y-4 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(236, 72, 153, 0.15), transparent 40%)`,
        }}
      />

      {/* Header */}
      <header className="border-b border-pink-900/30 backdrop-blur-lg bg-black/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-3 text-pink-400 hover:text-pink-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
              <span className="font-bold">Back to Universe</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
              <span className="text-pink-400 font-bold text-sm">KEMTOON</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(236, 72, 153, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(236, 72, 153, 0.3) 2px, transparent 2px)
            `,
            backgroundSize: "50px 50px",
            transform: `perspective(500px) rotateX(60deg) translateY(${
              scrollY * 0.3
            }px)`,
            transformOrigin: "center top",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-60 animate-pulse" />
              <Scale className="relative w-32 h-32 text-pink-400 mx-auto" />
            </div>

            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 blur-xl opacity-75" />
              <div className="relative bg-black border-4 border-white px-12 py-6 transform -skew-x-6 shadow-2xl">
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 tracking-wider">
                  TERMS & CONDITIONS
                </h1>
              </div>
            </div>

            <div className="relative max-w-3xl mx-auto mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-pink-600/30 rounded-2xl blur-xl" />
              <div className="relative bg-white text-black p-8 rounded-2xl border-4 border-pink-500 shadow-2xl">
                <p className="text-xl font-bold italic">
                  "By entering the Kemtoon Universe, you accept these sacred
                  rules — the <span className="text-pink-600">laws</span> that
                  govern creativity and{" "}
                  <span className="text-purple-600">AI</span>
                  ."
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-pink-400 text-sm">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              <span className="font-semibold">
                Effective Date: January 1, 2025
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Section icon={FileText} title="1. Acceptance of Terms">
              <p>
                Welcome to <strong className="text-pink-400">Kemtoon</strong>{" "}
                (kemtoon.com) — an AI-powered manga creation ecosystem. These
                Terms and Conditions ("Terms") govern your access to and use of
                the Kemtoon ecosystem, including <strong>Kemtoon Studio</strong>{" "}
                (studio.kemtoon.com), Kemtoon Social (future), and Kemtoon Game
                (future) (collectively, the "Services").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by
                these Terms. If you do not agree to these Terms, you may not use
                the Services. We reserve the right to modify these Terms at any
                time, and continued use after changes constitutes acceptance.
              </p>
            </Section>

            <Section icon={Users} title="2. User Accounts">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                2.1 Account Creation
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You must create an account to use Kemtoon Studio. You must
                  provide accurate, complete, and current information.
                </li>
                <li>
                  By creating an account, you confirm that you meet the minimum
                  age requirements of the authentication provider you use (e.g.,
                  Google). Kemtoon relies on third-party authentication services
                  and is not responsible for age verification.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials and for all activities under your
                  account.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                2.2 Account Security
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You must notify us immediately of any unauthorized access or
                  security breach.
                </li>
                <li>
                  We reserve the right to suspend or terminate accounts that
                  violate these Terms or engage in abusive behavior.
                </li>
              </ul>
            </Section>

            <Section icon={CreditCard} title="3. Use of Services">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                3.1 Permitted Use
              </h3>
              <p>
                Kemtoon provides AI-powered tools for creating manga,
                characters, scenes, and stories. You may use the Services for
                lawful purposes only.
              </p>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                3.2 Prohibited Use
              </h3>
              <p>You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Use the Services for illegal, harmful, or abusive purposes
                  (including harassment, hate speech, or violence).
                </li>
                <li>
                  Generate content that violates intellectual property rights,
                  privacy laws, or defamation laws.
                </li>
                <li>
                  Create content depicting explicit sexual content, child
                  exploitation, or other prohibited material.
                </li>
                <li>
                  Reverse-engineer, decompile, or attempt to extract the source
                  code of our platform.
                </li>
                <li>
                  Overload, hack, or disrupt the Services or interfere with
                  other users.
                </li>
                <li>
                  Use automated scripts, bots, or scrapers without permission.
                </li>
                <li>Share or resell access to your account or API key.</li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                3.3 Gemini API Key & AI Services
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You are responsible for providing your own Google Gemini API
                  key to use AI-powered manga generation features.
                </li>
                <li>
                  Your Gemini API key is stored encrypted in our Supabase
                  database and is used solely to connect to Google Gemini on
                  your behalf.
                </li>
                <li>
                  You must comply with Google's Gemini terms of service and API
                  usage policies.
                </li>
                <li>
                  We are not responsible for API usage costs, rate limits, or
                  service outages from Google Gemini.
                </li>
              </ul>
            </Section>

            <Section icon={Copyright} title="4. Intellectual Property">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                4.1 Your Content
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Ownership:</strong> You retain ownership of the
                  content you create using Kemtoon (manga, characters, stories,
                  etc.).
                </li>
                <li>
                  <strong>License to Us:</strong> By using the Services, you
                  grant Kemtoon a non-exclusive, worldwide, royalty-free license
                  to store, display, and process your content for the purpose of
                  providing the Services.
                </li>
                <li>
                  <strong>Public Content:</strong> If you publish content on
                  Kemtoon Social (future feature), you grant other users the
                  right to view and interact with your content.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                4.2 Kemtoon's Intellectual Property
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  The Kemtoon platform, logo, branding, and code are owned by
                  Ahmed Nabil and protected by intellectual property laws.
                </li>
                <li>
                  You may not copy, modify, distribute, or create derivative
                  works from our platform without permission.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                4.3 AI-Generated Content
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Content generated by Google Gemini AI is subject to Google's
                  terms of service and usage policies.
                </li>
                <li>
                  You are responsible for ensuring that AI-generated content
                  does not violate copyright, trademark, or other rights.
                </li>
                <li>
                  Kemtoon does not claim ownership of AI-generated content but
                  may display it as examples in marketing materials (with your
                  consent).
                </li>
              </ul>
            </Section>

            <Section icon={CreditCard} title="5. Gemini API & AI Usage">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                5.1 Your Gemini API Key
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Kemtoon Studio allows you to use your own Google Gemini API
                  key to generate AI-powered manga content.
                </li>
                <li>
                  You are responsible for obtaining and maintaining your Gemini
                  API key and for any costs associated with its usage through
                  Google's platform.
                </li>
                <li>
                  Your Gemini API key is stored encrypted in our secure
                  database. We never share, sell, or use your API key for any
                  purpose other than making requests to Gemini on your behalf.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                5.2 Service Usage
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Kemtoon is currently free to use. You only pay for the Gemini
                  AI usage you consume through your own API key.
                </li>
                <li>
                  We may introduce premium features, subscriptions, or
                  credit-based systems in the future. Users will be notified of
                  any changes to pricing or service terms.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                5.3 Fair Use
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You agree to use Kemtoon services responsibly and not to abuse
                  or overload our infrastructure.
                </li>
                <li>
                  We reserve the right to implement rate limits or usage quotas
                  to ensure fair access for all users.
                </li>
              </ul>
            </Section>

            <Section icon={AlertTriangle} title="6. Disclaimers & Limitations">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                6.1 Service Availability
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Kemtoon is provided "as is" and "as available." We do not
                  guarantee uninterrupted, error-free, or secure access.
                </li>
                <li>
                  We may suspend or discontinue features, perform maintenance,
                  or update the platform at any time.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                6.2 AI Content Accuracy
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  AI-generated content is created by third-party models and may
                  contain inaccuracies, biases, or unexpected results.
                </li>
                <li>
                  You are responsible for reviewing and editing AI-generated
                  content before publishing or using it.
                </li>
                <li>
                  Kemtoon is not liable for errors, offensive content, or
                  copyright issues arising from AI outputs.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                6.3 Third-Party Services
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Kemtoon integrates with Google Gemini AI service. We are not
                  responsible for Gemini's performance, downtime, or policy
                  changes.
                </li>
                <li>
                  Your use of Google Gemini is subject to Google's terms and
                  conditions.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                6.4 Limitation of Liability
              </h3>
              <p>
                To the maximum extent permitted by law, Kemtoon and its founder,
                Ahmed Nabil, shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Indirect, incidental, consequential, or punitive damages (loss
                  of profits, data, or business opportunities).
                </li>
                <li>
                  Damages resulting from unauthorized access, data breaches, or
                  system failures.
                </li>
                <li>
                  Content created or published by users (you are solely
                  responsible for your content).
                </li>
              </ul>
              <p className="mt-4">
                <strong>
                  Our total liability for any claim shall not exceed the amount
                  you paid to Kemtoon in the last 12 months.
                </strong>
              </p>
            </Section>

            <Section icon={Scale} title="7. Termination">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                7.1 By You
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You may delete your account at any time from your account
                  settings.
                </li>
                <li>
                  Upon deletion, your personal data will be removed, but some
                  data may be retained for legal or operational purposes (e.g.,
                  transaction logs, content reports).
                </li>
              </ul>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                7.2 By Kemtoon
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  We may suspend or terminate your account if you violate these
                  Terms, engage in abusive behavior, or misuse our services.
                </li>
                <li>
                  We reserve the right to terminate accounts at our discretion,
                  with or without notice.
                </li>
              </ul>
            </Section>

            <Section icon={FileText} title="8. Privacy & Data Protection">
              <p>
                Your use of Kemtoon is also governed by our{" "}
                <Link
                  to="/privacy-policy"
                  className="text-pink-400 hover:text-pink-300 font-semibold underline"
                >
                  Privacy Policy
                </Link>
                , which explains how we collect, use, and protect your personal
                information.
              </p>
              <p className="mt-4">Key points:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Your Gemini API key is stored encrypted in our Supabase
                  database.
                </li>
                <li>We do not sell your personal data.</li>
                <li>
                  You have rights to access, correct, or delete your data.
                </li>
              </ul>
            </Section>

            <Section icon={Scale} title="9. Dispute Resolution">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                9.1 Governing Law
              </h3>
              <p>
                These Terms are governed by the laws of Egypt (or your
                applicable jurisdiction). Any disputes arising from these Terms
                shall be resolved in the courts of Egypt.
              </p>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                9.2 Arbitration
              </h3>
              <p>
                For disputes under $10,000 USD, you agree to resolve disputes
                through binding arbitration rather than in court. Arbitration
                shall be conducted in accordance with international arbitration
                rules.
              </p>
            </Section>

            <Section icon={FileText} title="10. Modifications to Terms">
              <p>
                We may update these Terms from time to time. Changes will be
                posted on this page with an updated "Effective Date." Major
                changes will be communicated via email or in-app notification.
              </p>
              <p className="mt-4">
                Continued use of Kemtoon after changes constitutes acceptance of
                the updated Terms. If you do not agree with the changes, you
                must stop using the Services and delete your account.
              </p>
            </Section>

            <Section icon={AlertTriangle} title="11. General Provisions">
              <h3 className="text-xl font-bold text-pink-400 mb-3">
                11.1 Entire Agreement
              </h3>
              <p>
                These Terms, together with our Privacy Policy, constitute the
                entire agreement between you and Kemtoon.
              </p>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                11.2 Severability
              </h3>
              <p>
                If any provision of these Terms is found to be invalid or
                unenforceable, the remaining provisions will remain in full
                force.
              </p>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                11.3 Waiver
              </h3>
              <p>
                Our failure to enforce any right or provision of these Terms
                does not constitute a waiver of that right.
              </p>

              <h3 className="text-xl font-bold text-pink-400 mb-3 mt-6">
                11.4 Assignment
              </h3>
              <p>
                You may not transfer or assign your account or rights under
                these Terms. Kemtoon may assign these Terms in connection with a
                merger, acquisition, or sale of assets.
              </p>
            </Section>

            <Section icon={Users} title="12. Contact Us">
              <p>
                If you have questions, concerns, or disputes regarding these
                Terms, please contact us:
              </p>
              <div className="mt-4 p-6 bg-pink-900/30 border-2 border-pink-500 rounded-lg">
                <p className="font-bold text-pink-400 mb-2">Kemtoon Support</p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:contact@kemtoon.com"
                    className="text-pink-300 hover:text-pink-200"
                  >
                    contact@kemtoon.com
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://kemtoon.com"
                    className="text-pink-300 hover:text-pink-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    kemtoon.com
                  </a>
                </p>
                <p>
                  <strong>Studio:</strong>{" "}
                  <a
                    href="https://studio.kemtoon.com"
                    className="text-pink-300 hover:text-pink-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    studio.kemtoon.com
                  </a>
                </p>
                <p>
                  <strong>Facebook:</strong>{" "}
                  <a
                    href="https://www.facebook.com/kemetoon"
                    className="text-pink-300 hover:text-pink-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @kemetoon
                  </a>
                </p>
                <p>
                  <strong>Founder:</strong> Ahmed Nabil
                </p>
              </div>
            </Section>

            {/* Bottom Navigation */}
            <div className="mt-16 p-8 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-4 border-pink-500/50 rounded-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <Link
                  to="/privacy-policy"
                  className="group relative inline-block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-white shadow-xl">
                    Read Privacy Policy →
                  </div>
                </Link>

                <Link
                  to="/"
                  className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                >
                  ← Back to Universe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-pink-900/30 py-8 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-pink-500/50 text-sm">
              © 2025 Kemtoon Ecosystem. All rights reserved.
            </p>
            <p className="text-pink-600/30 text-xs mt-2">
              "Where ancient wisdom meets AI creativity"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
