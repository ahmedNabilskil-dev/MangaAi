"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Cloud,
  ExternalLink,
  Key,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "Get Your Gemini AI API Key",
    icon: <Key className="h-6 w-6 text-blue-400" />,
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
        screenshot: "/images/screenshot/gemini-1.png",
      },
      {
        step: "Create New Project/App",
        action: "Click 'New Project' or 'Create App'",
        detail:
          "You must create a project/application before generating an API key",
        screenshot: "/images/screenshot/gemini-2.png",
      },
      {
        step: "Generate API Key",
        action:
          "After creating the project, click 'Get API Key' → 'Create API Key'",
        detail:
          "Choose 'Create API key in new project' or select your existing project",
        screenshot: "/images/screenshot/gemini-3.png",
      },
      {
        step: "Copy Your Key",
        action: "Copy the generated API key",
        detail: "Keep this key secure - you'll need it in settings",
        screenshot: "/images/screenshot/gemini-4.png",
      },
      {
        step: "Add to Manga AI",
        action:
          "Go to Settings → Enter API key in both Text and Image generation tabs",
        detail: "The key works for both text and image generation",
        screenshot: "/images/screenshot/gemini-5.png",
      },
    ],
    link: "https://aistudio.google.com/",
    linkText: "Get Gemini API Key",
    warning:
      "Keep your API key private and never share it publicly. Remember to create a project first!",
  },
  {
    id: 2,
    title: "Setup ImgBB Image Storage",
    icon: <Cloud className="h-6 w-6 text-green-400" />,
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
        screenshot: "/images/screenshot/image-1.png",
      },
      {
        step: "Navigate to About Section",
        action: "Click on 'About' in the main navigation menu",
        detail: "Look for the About link in the top navigation or footer",
        screenshot: "/images/screenshot/image-2.png",
      },
      {
        step: "Access API Section",
        action: "In the About page, find and click on 'API'",
        detail:
          "This will take you to the API documentation and key generation page",
        screenshot: "/images/screenshot/image-2.png",
      },
      {
        step: "Generate API Key",
        action: "Click 'Get API Key' and generate your key",
        detail: "You may need to verify your account before generating the key",
        screenshot: "/images/screenshot/image-3.png",
      },
      {
        step: "Configure in App",
        action: "Add ImgBB API key to your app settings",
        detail: "This enables automatic image uploading and storage",
        screenshot: "/images/screenshot/gemini-5.png",
      },
    ],
    link: "https://imgbb.com/",
    linkText: "Get ImgBB Account",
    warning:
      "Free accounts have upload limits - check ImgBB's terms for details. Remember to go through About → API!",
  },
  {
    id: 3,
    title: "Enable VPN Connection to America",
    icon: <Settings className="h-6 w-6 text-orange-400" />,
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
        screenshot: "/images/screenshot/vpn-1.png",
      },
      {
        step: "Download the Extension",
        action: "Click 'Add to Chrome' to install the extension",
        detail: "Confirm the installation in the popup that appears",
        screenshot: "/images/screenshot/vpn-2.png",
      },
      {
        step: "Choose American Server",
        action: "Open the extension and select a US-based server",
        detail:
          "Pick a server from major cities like New York or Los Angeles for better speed",
        screenshot: "/images/screenshot/vpn-4.png",
      },
      {
        step: "Enable the VPN",
        action: "Click the connect or enable button in the extension",
        detail: "Wait for the connection to be established before browsing",
        screenshot: "/images/screenshot/vpn-5.png",
      },
    ],
    link: "https://whatismyipaddress.com/",
    linkText: "Check Your IP Location",
    warning:
      "Keep VPN connected while using image generation features. Free VPNs may not work reliably.",
  },
];

const ScreenshotImage = ({
  filename,
  stepTitle,
}: {
  filename: string;
  stepTitle: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className="mt-4 p-2 bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="relative">
          {imageError ? (
            <div className="flex items-center justify-center h-48 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-medium">{stepTitle}</p>
                <p className="text-gray-500 text-xs mt-1">Image: {filename}</p>
                <p className="text-red-400 text-xs mt-2">
                  📸 Screenshot not found
                </p>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <img
                src={`${filename}`}
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
    </>
  );
};

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 150 + 30,
              height: Math.random() * 150 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 80 - 40],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-pink-400" />
            <h1 className="text-5xl font-bold text-white">Getting Started</h1>
            <Sparkles className="h-12 w-12 text-purple-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Follow these simple steps to set up your Manga AI application.
            You'll need a VPN connection and two API keys to unlock the full
            power of AI-generated manga creation. Each step includes visual
            screenshots to guide you.
          </p>
        </motion.div>

        {/* Alert Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-amber-900/40 border-amber-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-200 mb-2">
                    Important Setup Required
                  </h3>
                  <p className="text-amber-100">
                    Before you can start creating amazing manga content, you
                    need to complete all three setup steps below. Make sure to
                    connect your VPN to America first, as this is required for
                    Gemini AI image generation. Both API services offer free
                    tiers that are perfect for getting started. Follow the
                    visual guides carefully!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
            >
              <Card className="bg-gray-900/80 backdrop-blur-lg border-gray-700 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-800 p-3 rounded-full">
                        {step.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white flex items-center gap-2">
                          Step {step.id}: {step.title}
                        </CardTitle>
                        <p className="text-gray-300 mt-1">{step.description}</p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-600">
                      {step.id}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Requirements */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      What You'll Need
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {step.requirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg"
                        >
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-400" />
                      Step-by-Step Visual Guide
                    </h4>
                    <div className="space-y-6">
                      {step.instructions.map((instruction, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.2 + idx * 0.1 }}
                          className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
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
                            <ArrowRight className="h-5 w-5 text-gray-500 mt-2" />
                          </div>

                          <ScreenshotImage
                            filename={instruction.screenshot}
                            stepTitle={instruction.step}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-red-200 mb-1">
                          Security Notice
                        </h5>
                        <p className="text-red-300 text-sm">{step.warning}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => window.open(step.link, "_blank")}
                      size="lg"
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all group"
                    >
                      <ExternalLink className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      {step.linkText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Screenshot Guide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 mb-12"
        >
          <Card className="bg-blue-900/40 border-blue-600 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <BookOpen className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-200 mb-2">
                    Visual Guide Instructions
                  </h3>
                  <p className="text-blue-100 mb-3">
                    Each step includes a placeholder for screenshots that will
                    help users visually follow the process. Replace the
                    placeholder areas with actual screenshots of:
                  </p>
                  <ul className="text-blue-100 text-sm space-y-1 ml-4">
                    <li>
                      • VPN connection interface and American server selection
                    </li>
                    <li>• IP verification websites showing US location</li>
                    <li>• Google AI Studio interface and project creation</li>
                    <li>• ImgBB website navigation (About → API)</li>
                    <li>• API key generation screens</li>
                    <li>• Settings pages in your manga app</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Final Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border-green-600 backdrop-blur-lg">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Create Amazing Manga?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Once you've completed all three steps above (VPN connection,
                Gemini API, and ImgBB setup) and followed the visual guides,
                head to the Settings page to enter your API keys. Remember to
                keep your VPN connected to America when using image generation
                features!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/settings">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Go to Settings
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-6 px-8 rounded-full transition-all"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentationPage;
