"use client";

import { SidebarItem } from "@/app/page";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  CheckCircle,
  Eye,
  Home,
  Key,
  Menu,
  Settings,
  Shield,
  Sparkles,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TermsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 240 : 80 }}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-gray-900/80 backdrop-blur-md flex flex-col border-r border-gray-700"
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              Manga AI
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
            text="Home"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/"
          />
          <SidebarItem
            icon={<BookMarked className="h-5 w-5" />}
            text="Projects"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/projects"
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            text="Settings"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/settings"
          />
          <SidebarItem
            icon={<Shield className="h-5 w-5" />}
            text="Terms"
            isActive={true}
            isSidebarOpen={isSidebarOpen}
            href="/terms"
          />
        </nav>

        {isSidebarOpen && (
          <div className="p-4 text-sm text-gray-400">
            <p>AI Manga Generator</p>
            <p className="text-xs mt-1 flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              v1.0.0-beta
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-pink-400" />
              Terms and Conditions
              <span className="bg-orange-600 text-orange-100 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <TestTube className="h-3 w-3" />
                BETA
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Last updated: {new Date().toLocaleDateString()}
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
                  <h3 className="font-semibold">Beta Version Notice</h3>
                </div>
                <div className="text-orange-100 text-sm space-y-2">
                  <p>
                    This application is currently in <strong>BETA</strong>{" "}
                    development phase. This means:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Features may change or be removed without notice</li>
                    <li>You may encounter bugs or unexpected behavior</li>
                    <li>Data format may change between versions</li>
                    <li>Some features may be incomplete or experimental</li>
                  </ul>
                  <p>
                    <strong>Use at your own risk.</strong> We recommend backing
                    up your work frequently and not relying on this version for
                    critical projects.
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-200 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-semibold">Important Notice</h3>
                </div>
                <p className="text-amber-100 text-sm">
                  This application uses your own API keys for AI model access.
                  We do not store or have access to your API keys or the content
                  generated using them.
                </p>
              </div>

              {/* API Key Usage */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="h-6 w-6 text-pink-400" />
                  API Key Usage
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>Your API Keys:</strong> You are responsible for
                    providing and managing your own API keys (such as Google
                    Gemini, OpenAI, Anthropic, etc.). These keys are stored
                    locally in your browser and are never transmitted to our
                    servers.
                  </p>
                  <p>
                    <strong>Costs:</strong> All API usage costs are your
                    responsibility. You will be billed directly by the
                    respective AI service providers based on your usage.
                  </p>
                  <p>
                    <strong>Security:</strong> Keep your API keys secure. Do not
                    share them with others. We recommend regularly rotating your
                    API keys for security.
                  </p>
                </div>
              </section>

              {/* How the App Works */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-pink-400" />
                  How the Application Works
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    This application provides an interactive flow-based
                    interface for creating manga stories using AI assistance:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Node-Based Creation:</strong> Each element of your
                      manga (chapters, scenes, panels, dialogs) is represented
                      as a node in an interactive flow
                    </li>
                    <li>
                      <strong>AI Chat Integration:</strong> Use the chat
                      interface to discuss and generate content for each story
                      element
                    </li>
                    <li>
                      <strong>Structured Output:</strong> AI responses are
                      converted into structured JSON and then into visual nodes
                      in your manga flow
                    </li>
                    <li>
                      <strong>Local Processing:</strong> All generation happens
                      client-side using your API keys
                    </li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      <strong>Beta Note:</strong> Some features are still in
                      development and may not work as expected. New features are
                      being added regularly.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-pink-400" />
                  Data Privacy
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>Local Storage:</strong> Your manga projects, API
                    keys, and chat history are stored locally in your browser
                    using localStorage.
                  </p>
                  <p>
                    <strong>No Server Storage:</strong> We do not store any of
                    your content, API keys, or personal data on our servers.
                  </p>
                  <p>
                    <strong>Third-Party Services:</strong> When you use AI
                    features, your prompts are sent directly to the respective
                    AI service providers using your API keys.
                  </p>
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-200 text-sm">
                      <strong>Beta Warning:</strong> Data structures may change
                      between versions. Always backup your projects before
                      updating the application.
                    </p>
                  </div>
                </div>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-pink-400" />
                  User Responsibilities
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>By using this beta application, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Understand this is a beta version with potential
                      instabilities
                    </li>
                    <li>
                      Provide valid API keys for AI services you wish to use
                    </li>
                    <li>
                      Monitor and manage your API usage and associated costs
                    </li>
                    <li>
                      Use the application in compliance with all applicable laws
                      and regulations
                    </li>
                    <li>
                      Respect the terms of service of the AI providers whose
                      APIs you use
                    </li>
                    <li>
                      Not create content that is illegal, harmful, or violates
                      intellectual property rights
                    </li>
                    <li>
                      Regularly back up your projects as they are stored locally
                      and data format may change
                    </li>
                    <li>
                      Report bugs and provide feedback to help improve the
                      application
                    </li>
                  </ul>
                </div>
              </section>

              {/* Limitations and Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-pink-400" />
                  Limitations and Disclaimers
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>Beta Software:</strong> This is beta software.
                    Functionality may be incomplete, unstable, or subject to
                    change.
                  </p>
                  <p>
                    <strong>Service Availability:</strong> We cannot guarantee
                    uninterrupted access to third-party AI services or the
                    application itself.
                  </p>
                  <p>
                    <strong>Content Quality:</strong> The quality of generated
                    content depends on the AI models you use and your prompts.
                    We do not guarantee any specific quality or accuracy.
                  </p>
                  <p>
                    <strong>Data Loss:</strong> Since data is stored locally and
                    this is beta software, there is increased risk of data loss.
                    Always maintain external backups of important work.
                  </p>
                  <p>
                    <strong>AI Generated Content:</strong> All AI-generated
                    content should be reviewed and verified before use. We are
                    not responsible for the accuracy, appropriateness, or
                    originality of AI-generated content.
                  </p>
                  <p>
                    <strong>Breaking Changes:</strong> Updates may introduce
                    breaking changes that could affect your saved projects or
                    require data migration.
                  </p>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Intellectual Property
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    <strong>Your Content:</strong> You retain all rights to the
                    manga content you create using this application.
                  </p>
                  <p>
                    <strong>AI-Generated Content:</strong> The ownership and
                    copyright status of AI-generated content may vary depending
                    on your jurisdiction and the AI service provider. Please
                    consult with legal counsel if you plan to commercialize
                    AI-generated content.
                  </p>
                  <p>
                    <strong>Application Code:</strong> The source code of this
                    application remains the property of its developers.
                  </p>
                </div>
              </section>

              {/* Beta Testing and Feedback */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TestTube className="h-6 w-6 text-pink-400" />
                  Beta Testing and Feedback
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    As a beta user, your feedback is valuable in improving the
                    application:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Report bugs and issues through our feedback channels
                    </li>
                    <li>Suggest new features or improvements</li>
                    <li>Share your user experience and workflow challenges</li>
                  </ul>
                  <p>
                    Beta testing participation is voluntary and at your own
                    risk.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Changes to Terms
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    We may update these terms frequently during the beta phase.
                    Continued use of the application constitutes acceptance of
                    any changes. We recommend checking these terms regularly for
                    updates.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Contact
                </h2>
                <div className="text-gray-300">
                  <p>
                    If you have any questions about these terms, encounter bugs,
                    or want to provide beta feedback, please contact us through
                    our support channels.
                  </p>
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
              Return to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
