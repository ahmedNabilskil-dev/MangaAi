import { ArrowLeft, Database, Eye, Key, Lock, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
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
      <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-gradient-to-br from-black/80 to-gray-900/80 border-4 border-violet-500/50 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center border-2 border-white shadow-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
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
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
        }}
      />

      {/* Header */}
      <header className="border-b border-violet-900/30 backdrop-blur-lg bg-black/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-3 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
              <span className="font-bold">Back to Universe</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-violet-400 font-bold text-sm">KEMTOON</span>
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
              linear-gradient(rgba(139, 92, 246, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 2px, transparent 2px)
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
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 opacity-60 animate-pulse" />
              <Shield className="relative w-32 h-32 text-violet-400 mx-auto" />
            </div>

            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 blur-xl opacity-75" />
              <div className="relative bg-black border-4 border-white px-12 py-6 transform -skew-x-6 shadow-2xl">
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 tracking-wider">
                  PRIVACY POLICY
                </h1>
              </div>
            </div>

            <div className="relative max-w-3xl mx-auto mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-violet-600/30 rounded-2xl blur-xl" />
              <div className="relative bg-white text-black p-8 rounded-2xl border-4 border-violet-500 shadow-2xl">
                <p className="text-xl font-bold italic">
                  "In the Kemtoon Universe, your{" "}
                  <span className="text-violet-600">privacy</span> and{" "}
                  <span className="text-purple-600">security</span> are sacred —
                  like the ancient vaults of Kemet."
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-violet-400 text-sm">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
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
            <Section icon={Eye} title="1. Introduction">
              <p>
                Welcome to <strong className="text-violet-400">Kemtoon</strong>{" "}
                (kemtoon.com), an AI-powered manga creation ecosystem operated
                by Ahmed Nabil ("we", "us", or "our"). This Privacy Policy
                explains how we collect, use, disclose, and protect your
                personal information when you use our services, including{" "}
                <strong>Kemtoon Studio</strong> (studio.kemtoon.com) and other
                related Kemtoon ecosystem applications.
              </p>
              <p>
                By using any Kemtoon services, you agree to the collection and
                use of information in accordance with this policy. We are
                committed to protecting your privacy and ensuring your data is
                handled with the highest level of security.
              </p>
            </Section>

            <Section icon={Database} title="2. Information We Collect">
              <h3 className="text-xl font-bold text-violet-400 mb-3">
                2.1 Information You Provide
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Account Information:</strong> Name, email address,
                  phone, username, and password when you create an account.
                </li>
                <li>
                  <strong>Profile Data:</strong> Optional profile picture, bio,
                  and preferences.
                </li>
                <li>
                  <strong>API Keys:</strong> Your Gemini API key or other AI
                  service keys that you provide for manga generation (stored
                  encrypted in our Supabase database). We never share or use
                  your API keys for any purpose other than making requests on
                  your behalf.
                </li>
                <li>
                  <strong>Content:</strong> Manga projects, chapters, scenes,
                  panels, characters, dialogues, and other creative content you
                  create.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-violet-400 mb-3 mt-6">
                2.2 Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Usage Data:</strong> IP address, browser type, device
                  information, pages visited, time spent, and interactions with
                  the platform.
                </li>
                <li>
                  <strong>Cookies:</strong> We use cookies and similar tracking
                  technologies to enhance your experience and analyze platform
                  usage.
                </li>
                <li>
                  <strong>Analytics:</strong> Platform performance, feature
                  usage, and error logs to improve our services.
                </li>
              </ul>
            </Section>

            <Section icon={Key} title="3. How We Use Your Information">
              <p>
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Service Delivery:</strong> To provide, maintain, and
                  improve Kemtoon Studio functionality, including AI manga
                  generation.
                </li>
                <li>
                  <strong>Personalization:</strong> To customize your experience
                  based on preferences and usage patterns.
                </li>
                <li>
                  <strong>Communication:</strong> To send updates, newsletters,
                  promotional content, and respond to inquiries (you can opt out
                  anytime).
                </li>
                <li>
                  <strong>Security:</strong> To detect, prevent, and address
                  fraud, abuse, and security issues.
                </li>
                <li>
                  <strong>AI Processing:</strong> Your API keys are used
                  securely to connect to third-party AI services (Gemini, GPT,
                  etc.) for content generation.
                </li>
                <li>
                  <strong>Analytics:</strong> To understand user behavior and
                  improve platform features.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with legal
                  obligations and enforce our Terms & Conditions.
                </li>
              </ul>
            </Section>

            <Section icon={Lock} title="4. How We Protect Your Data">
              <h3 className="text-xl font-bold text-violet-400 mb-3">
                4.1 Encryption & Security
              </h3>
              <p>
                We take data security seriously. Your information is protected
                using industry-standard measures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>API Key Encryption:</strong> All API keys (Gemini,
                  GPT, etc.) are encrypted at rest in our Supabase PostgreSQL
                  database using AES-256 encryption.
                </li>
                <li>
                  <strong>Secure Transmission:</strong> Data transmitted between
                  your device and our servers is encrypted using TLS/SSL.
                </li>
                <li>
                  <strong>Access Controls:</strong> Only authorized personnel
                  have access to sensitive data, and access is logged.
                </li>
                <li>
                  <strong>Regular Audits:</strong> We perform security audits
                  and updates to protect against vulnerabilities.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-violet-400 mb-3 mt-6">
                4.2 Third-Party Services
              </h3>
              <p>
                We use trusted third-party services that have their own security
                measures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Supabase:</strong> For database hosting and
                  authentication (compliant with GDPR, SOC 2).
                </li>
                <li>
                  <strong>AI Providers:</strong> Your API keys are used to make
                  requests to Google Gemini, OpenAI, and other AI services. We
                  do not share your keys with anyone else.
                </li>
              </ul>
            </Section>

            <Section icon={Database} title="5. Data Sharing & Disclosure">
              <p>
                We do <strong className="text-violet-400">not sell</strong> your
                personal information. We may share your data only in the
                following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>With Your Consent:</strong> When you explicitly
                  authorize us to share information.
                </li>
                <li>
                  <strong>Service Providers:</strong> Third-party vendors who
                  help operate our platform (hosting, analytics, payment
                  processing) — they are bound by confidentiality agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law,
                  court order, or government request.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger,
                  acquisition, or asset sale, your data may be transferred (you
                  will be notified).
                </li>
                <li>
                  <strong>Public Content:</strong> Content you choose to publish
                  on Kemtoon Social (future feature) will be publicly visible.
                </li>
              </ul>
            </Section>

            <Section icon={Shield} title="6. Your Rights & Choices">
              <p>
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data
                  we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate
                  information.
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account
                  and associated data (some data may be retained for legal
                  purposes).
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing emails
                  via the link in each email.
                </li>
                <li>
                  <strong>Data Portability:</strong> Request your data in a
                  machine-readable format.
                </li>
                <li>
                  <strong>Object to Processing:</strong> Object to certain uses
                  of your data (e.g., marketing).
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:privacy@kemtoon.com"
                  className="text-violet-400 hover:text-violet-300 font-semibold"
                >
                  privacy@kemtoon.com
                </a>
                .
              </p>
            </Section>

            <Section icon={Eye} title="7. Cookies & Tracking">
              <p>
                Kemtoon uses cookies and similar technologies to improve your
                experience. Cookies are small text files stored on your device.
              </p>
              <h3 className="text-xl font-bold text-violet-400 mb-3 mt-4">
                Types of Cookies We Use:
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> Required for the platform
                  to function (login, security).
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand usage
                  patterns and improve features.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences.
                </li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings, but
                disabling certain cookies may affect platform functionality.
              </p>
            </Section>

            <Section icon={Lock} title="8. Children's Privacy">
              <p>
                Kemtoon is not intended for children under the age of 13. We do
                not knowingly collect personal information from children. If we
                discover that a child under 13 has provided personal
                information, we will delete it immediately. If you believe a
                child has provided us with personal data, please contact us at{" "}
                <a
                  href="mailto:privacy@kemtoon.com"
                  className="text-violet-400 hover:text-violet-300 font-semibold"
                >
                  privacy@kemtoon.com
                </a>
                .
              </p>
            </Section>

            <Section icon={Database} title="9. International Data Transfers">
              <p>
                Your information may be transferred to and processed in
                countries outside your country of residence. We ensure
                appropriate safeguards are in place to protect your data in
                accordance with this Privacy Policy and applicable laws (e.g.,
                GDPR for EU users).
              </p>
            </Section>

            <Section icon={Shield} title="10. Data Retention">
              <p>
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy. When you delete your account, we will delete or
                anonymize your data, except where retention is required by law.
              </p>
            </Section>

            <Section icon={Eye} title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated "Effective Date." We
                encourage you to review this policy periodically. Continued use
                of Kemtoon after changes constitutes acceptance of the updated
                policy.
              </p>
            </Section>

            <Section icon={Key} title="12. Contact Us">
              <p>
                If you have questions, concerns, or requests regarding this
                Privacy Policy or your personal data, please contact us:
              </p>
              <div className="mt-4 p-6 bg-violet-900/30 border-2 border-violet-500 rounded-lg">
                <p className="font-bold text-violet-400 mb-2">
                  Kemtoon Support
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:privacy@kemtoon.com"
                    className="text-violet-300 hover:text-violet-200"
                  >
                    privacy@kemtoon.com
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://kemtoon.com"
                    className="text-violet-300 hover:text-violet-200"
                  >
                    kemtoon.com
                  </a>
                </p>
                <p>
                  <strong>Studio:</strong>{" "}
                  <a
                    href="https://studio.kemtoon.com"
                    className="text-violet-300 hover:text-violet-200"
                  >
                    studio.kemtoon.com
                  </a>
                </p>
                <p>
                  <strong>Founder:</strong> Ahmed Nabil
                </p>
              </div>
            </Section>

            {/* Bottom Navigation */}
            <div className="mt-16 p-8 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-4 border-violet-500/50 rounded-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <Link
                  to="/terms-and-conditions"
                  className="group relative inline-block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-white shadow-xl">
                    Read Terms & Conditions →
                  </div>
                </Link>

                <Link
                  to="/"
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  ← Back to Universe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-violet-900/30 py-8 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-violet-500/50 text-sm">
              © 2025 Kemtoon Ecosystem. All rights reserved.
            </p>
            <p className="text-violet-600/30 text-xs mt-2">
              "Where ancient wisdom meets AI creativity"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
