import {
  AlertCircle,
  CheckCircle,
  FileText,
  Scale,
  XCircle,
} from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-400">Last Updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Agreement to Terms</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              By downloading, installing, or using MangaAI desktop application
              ("the Software"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, do not use the
              Software.
            </p>
          </section>

          {/* Free Trial */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Free Trial Period</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              New users are eligible for a 7-day free trial:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>No payment information required to start the trial</li>
              <li>Full access to all Software features during trial period</li>
              <li>
                You can activate the trial directly within the application
              </li>
              <li>Trial begins immediately upon activation</li>
              <li>Only one free trial per device/user is permitted</li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> After the 7-day trial period ends, you
                must purchase a license to continue using the Software. The
                application will require a valid license key for continued
                access.
              </p>
            </div>
          </section>

          {/* License Grant */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">License Grant</h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Monthly License
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Grants you a non-exclusive, non-transferable license to use the
              Software for as long as your monthly subscription is active. Your
              license will automatically renew unless canceled.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Yearly License
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Grants you a non-exclusive, non-transferable license to use the
              Software for one year from the date of purchase. Your license will
              automatically renew unless canceled before the renewal date.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Lifetime License
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Grants you a perpetual, non-exclusive, non-transferable license to
              use the Software. This license does not expire but may be
              terminated if you violate these Terms.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> All licenses are for individual use only.
                Each license permits installation on up to 3 devices owned by
                the licensee. License keys are required for activation after the
                trial period.
              </p>
            </div>
          </section>

          {/* Usage Requirements */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Usage Requirements</h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Google Gemini API Key Required
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              To use AI features in MangaAI, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Provide your own Google Gemini API key</li>
              <li>Maintain an active Google Cloud account</li>
              <li>Be responsible for all API usage costs</li>
              <li>Comply with Google's Gemini API Terms of Service</li>
            </ul>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Important:</strong> MangaAI license fees are separate
                from Google Gemini API costs. You are solely responsible for
                managing and paying for your API usage with Google.
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300 mt-6">
              System Requirements
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You are responsible for ensuring your computer meets the minimum
              system requirements to run the Software.
            </p>
          </section>

          {/* Restrictions */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Restrictions</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">You may NOT:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Share, sell, rent, or distribute your license key to others
              </li>
              <li>Attempt to extend or manipulate the free trial period</li>
              <li>Reverse engineer, decompile, or disassemble the Software</li>
              <li>
                Remove or modify any copyright notices or license information
              </li>
              <li>
                Use the Software for illegal purposes or to create illegal
                content
              </li>
              <li>
                Use the Software to create content that violates third-party
                rights
              </li>
              <li>Circumvent or attempt to circumvent license validation</li>
              <li>Share your API key or allow others to use your license</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">
                Content Ownership and Rights
              </h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Your Content
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You retain all rights to the manga, characters, stories, and other
              creative content you create using MangaAI. You are free to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
              <li>Publish your manga commercially or non-commercially</li>
              <li>Sell, distribute, or license your created content</li>
              <li>Use your content for any legal purpose</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              AI-Generated Content
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Content generated using Google Gemini API is subject to Google's
              terms. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Ensuring you have rights to use AI-generated images</li>
              <li>Complying with Google's AI usage policies</li>
              <li>
                Verifying you can legally use generated content for your
                purposes
              </li>
            </ul>
          </section>

          {/* Subscription Management */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">License Management</h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Activation Required
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              After the 7-day free trial, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
              <li>Purchase a license (Monthly, Yearly, or Lifetime)</li>
              <li>Enter your license key in the application</li>
              <li>Activate the license to continue using the Software</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Cancellation (Monthly/Yearly)
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may cancel your monthly or yearly subscription at any time:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
              <li>
                Cancellation takes effect at the end of the current billing
                period
              </li>
              <li>
                You will continue to have access until the end of the paid
                period
              </li>
              <li>No partial refunds for mid-cycle cancellations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Price Changes
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to change subscription prices. You will be
              notified at least 30 days before any price change affects your
              subscription. Lifetime licenses are not subject to price changes.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Disclaimer of Warranties</h2>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
                WE DO NOT WARRANT THAT:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>The Software will be error-free or uninterrupted</li>
                <li>Defects will be corrected</li>
                <li>The Software is compatible with all systems</li>
                <li>Google Gemini API will always be available</li>
                <li>
                  Your content will be preserved (always backup your data)
                </li>
                <li>Free trial will be available indefinitely</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Limitation of Liability</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                We are not liable for any indirect, incidental, or consequential
                damages
              </li>
              <li>
                Our total liability shall not exceed the amount you paid for the
                license
              </li>
              <li>
                We are not responsible for data loss (backup your work
                regularly)
              </li>
              <li>We are not liable for Google API costs or availability</li>
              <li>
                We are not responsible for content you create or how you use it
              </li>
              <li>We are not liable for free trial availability or duration</li>
            </ul>
          </section>

          {/* Updates and Support */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Updates and Support</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Active license holders receive:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Software updates and bug fixes</li>
              <li>Basic technical support</li>
              <li>Access to documentation (when available)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Free trial users receive basic functionality but may have limited
              access to support services. We reserve the right to discontinue
              features or support for older versions at any time.
            </p>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Termination</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may terminate your license or trial access if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse or circumvent license/trial validation</li>
              <li>Use the Software for illegal purposes</li>
              <li>Attempt to manipulate or extend the trial period</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Upon termination, you must cease all use of the Software and
              delete all copies. Trial access automatically terminates after 7
              days.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may modify these Terms at any time. We will notify you of
              significant changes via email or in-app notification. Your
              continued use of the Software after changes constitutes acceptance
              of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms are governed by the laws of your jurisdiction. Any
              disputes will be resolved in accordance with applicable local
              laws.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>
                Facebook:{" "}
                <a
                  href="https://facebook.com/mangaaiapp"
                  className="text-purple-400 hover:text-purple-300"
                >
                  facebook.com/mangaaiapp
                </a>
              </li>
              <li>Email: support@mangaai.app (if available)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
