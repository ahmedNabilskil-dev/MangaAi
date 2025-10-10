import { Award, CheckCircle, Key, Shield, Users, XCircle } from "lucide-react";

export default function LicenseAgreement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            End User License Agreement
          </h1>
          <p className="text-gray-400">Last Updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">License Agreement Overview</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              This End User License Agreement ("EULA") is a legal agreement
              between you and MangaAI for the use of MangaAI desktop application
              software ("Software"). By installing, copying, or using the
              Software, you agree to be bound by the terms of this EULA.
            </p>
          </section>

          {/* Free Trial */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Free Trial Period</h2>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 mb-4">
              <h3 className="text-xl font-semibold mb-3 text-blue-300">
                7-Day Free Trial
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>No payment information required to start trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Activate trial directly within the application</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Full access to all Software features during trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Trial begins immediately upon activation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Only one free trial per device/user</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-300 leading-relaxed">
              After the 7-day trial period ends, you must purchase and activate
              a license to continue using the Software. The application will
              require a valid license key for continued access.
            </p>
          </section>

          {/* License Types */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">License Types</h2>
            </div>

            <div className="space-y-6">
              {/* Monthly License */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-purple-300">
                  Monthly License
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Subscription-based license billed monthly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Auto-renews each month unless canceled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Cancel anytime with no penalty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Price: $15/month</span>
                  </li>
                </ul>
              </div>

              {/* Yearly License */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-purple-300">
                  Yearly License
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Subscription-based license billed annually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Auto-renews each year unless canceled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Save 33% compared to monthly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Price: $120/year</span>
                  </li>
                </ul>
              </div>

              {/* Lifetime License */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-semibold text-purple-300">
                    Lifetime License
                  </h3>
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    BEST VALUE
                  </span>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>One-time payment, no recurring fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Perpetual license that never expires</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>All future updates included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Immediate access after activation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Price: $149 one-time</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Grant of License */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Grant of License</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Subject to your compliance with this EULA and payment of
              applicable fees (after trial period), MangaAI grants you a
              limited, non-exclusive, non-transferable, revocable license to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Install and use the Software on up to 3 devices you own or
                control
              </li>
              <li>
                Create manga, characters, scenes, and other creative content
              </li>
              <li>Use the Software for personal or commercial purposes</li>
              <li>Export and publish content you create with the Software</li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> During the free trial period, you receive
                a temporary evaluation license. Full license rights are granted
                only after purchasing and activating a paid license.
              </p>
            </div>
          </section>

          {/* Installation and Activation */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">
                Installation and Activation
              </h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Free Trial Activation
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              New users can activate a 7-day free trial directly within the
              application. No payment information is required. The trial
              provides full access to all Software features.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              License Key Activation
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              After purchase, you will receive a unique license key via email.
              This key is used to activate the Software after the trial period
              and must be kept confidential.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Device Limit
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may install the Software on up to 3 devices. If you need to
              deactivate a device to activate a new one, you can manage your
              activations by contacting support.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Online Activation
            </h3>
            <p className="text-gray-300 leading-relaxed">
              The Software requires periodic online validation of your license.
              An internet connection is required for trial activation, license
              activation, and periodic verification (typically monthly).
            </p>
          </section>

          {/* Permitted Uses */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Permitted Uses</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              With a valid license (trial or paid), you MAY:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Use the Software to create unlimited manga content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>
                  Publish and sell content you create with the Software
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Use the Software for commercial projects</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Backup your local database files</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Install on multiple devices you own (up to 3)</span>
              </li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Prohibited Uses</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">You may NOT:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Share, transfer, or sell your license key to others</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Attempt to extend or manipulate the free trial period
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Use the Software on more than 3 devices simultaneously
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Reverse engineer, decompile, or disassemble the Software
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Remove or modify copyright notices or license information
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Circumvent or disable license verification mechanisms
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  Use the Software to create illegal or infringing content
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Rent, lease, or lend the Software to third parties</span>
              </li>
            </ul>
          </section>

          {/* API Requirements */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">
                Google Gemini API Requirements
              </h2>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-4">
              <p className="text-yellow-300 font-semibold mb-2">
                Important: API Key Required
              </p>
              <p className="text-gray-300 leading-relaxed">
                The Software requires you to provide your own Google Gemini API
                key. The license fee for MangaAI does not include API usage
                costs. You are solely responsible for:
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Obtaining a Google Gemini API key</li>
              <li>Maintaining an active Google Cloud account</li>
              <li>Paying all Google API usage charges</li>
              <li>Complying with Google's API Terms of Service</li>
              <li>Managing your API usage and costs</li>
              <li>Securing and protecting your API key</li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> API key requirements apply during both
                trial and paid license periods. You must provide your own API
                key to use AI features.
              </p>
            </div>
          </section>

          {/* Ownership */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Intellectual Property</h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              MangaAI Software
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              MangaAI retains all rights, title, and interest in the Software,
              including all intellectual property rights. This license does not
              transfer ownership of the Software to you.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Your Content
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You retain all rights to manga, stories, characters, and other
              creative content you create using the Software. MangaAI claims no
              ownership over your created content.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              AI-Generated Content
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Content generated using Google Gemini API is subject to Google's
              terms. You are responsible for understanding and complying with
              those terms regarding AI-generated content ownership and usage
              rights.
            </p>
          </section>

          {/* License Transfer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">License Transfer</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Licenses are non-transferable except in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Lifetime licenses may be transferred once with written approval
                from MangaAI
              </li>
              <li>
                Subscription licenses (Monthly/Yearly) cannot be transferred
              </li>
              <li>Transfer requests must include proof of original purchase</li>
              <li>
                A $25 transfer fee may apply for lifetime license transfers
              </li>
            </ul>
          </section>

          {/* Updates and Upgrades */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Updates and Upgrades</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Active license holders receive:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Free software updates and bug fixes</li>
              <li>New features as they become available</li>
              <li>Security patches and improvements</li>
              <li>Access to updated documentation</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              Lifetime license holders receive all future updates at no
              additional cost. Subscription holders receive updates while their
              subscription is active. Free trial users receive current version
              features.
            </p>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">License Termination</h2>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Automatic Termination
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Your license will automatically terminate if:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
              <li>You violate any terms of this EULA</li>
              <li>
                Your free trial period expires (unless you purchase a license)
              </li>
              <li>Your subscription payment fails (for Monthly/Yearly)</li>
              <li>You cancel your subscription (access ends at period end)</li>
              <li>You engage in fraudulent activity or license abuse</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Effect of Termination
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Upon termination, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Cease all use of the Software immediately</li>
              <li>Uninstall the Software from all devices</li>
              <li>Delete all copies of the Software</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              Your locally stored content (SQLite database) remains yours, but
              you will no longer be able to use the Software to access or modify
              it.
            </p>
          </section>

          {/* Support */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Technical Support</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Active license holders are entitled to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Email support (when available)</li>
              <li>Facebook page support</li>
              <li>Access to documentation and tutorials (when available)</li>
              <li>Bug reports and feature requests</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Free trial users receive basic functionality support. Priority
              support is provided to paid license holders on a reasonable-effort
              basis. Response times are not guaranteed.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                OR NON-INFRINGEMENT.
              </p>
              <p className="text-gray-300 leading-relaxed">
                MangaAI does not warrant that the Software will be error-free,
                secure, or uninterrupted. You use the Software at your own risk.
                Free trial availability is not guaranteed and may be
                discontinued at any time.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MANGAAI SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, LOSS OF PROFITS, OR
                BUSINESS INTERRUPTION.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our total liability shall not exceed the amount you paid for the
                license in the 12 months preceding the claim. For free trial
                users, liability is limited to $0.
              </p>
            </div>
          </section>

          {/* General Provisions */}
          <section>
            <h2 className="text-2xl font-bold mb-4">General Provisions</h2>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Entire Agreement
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              This EULA constitutes the entire agreement between you and MangaAI
              regarding the Software and supersedes all prior agreements.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Severability
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              If any provision of this EULA is found to be unenforceable, the
              remaining provisions shall remain in full effect.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Amendments
            </h3>
            <p className="text-gray-300 leading-relaxed">
              MangaAI reserves the right to modify this EULA at any time. You
              will be notified of significant changes. Continued use of the
              Software after changes constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For questions about this EULA or license management:
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
            <p className="text-gray-300 leading-relaxed mt-4">
              By installing or using MangaAI, you acknowledge that you have
              read, understood, and agree to be bound by this End User License
              Agreement.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
