"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { UserProfile } from "@/components/auth/user-profile";
import SidebarItem from "@/components/side-item/SideItem";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { useMcpClient } from "@/hooks/use-mcp-client";
import { mcpClient } from "@/services/mcp-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  Home,
  Info,
  Key,
  Menu,
  Send,
  Settings,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mangaIdea, setMangaIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { state } = useMcpClient();
  const { user } = useAuth();
  const { consumeCredits, canAfford, calculateTextGenerationCost } =
    useCredits();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setMangaIdea("");
    setErrorMessage("");
  };

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaIdea.trim()) return;

    // Check if API key exists in localStorage
    const apiKey = localStorage.getItem("api-key");

    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      return;
    }

    // Check if user has enough credits for project creation
    const estimatedTokens = mangaIdea.length * 10; // Rough estimate
    const creditCost = calculateTextGenerationCost(estimatedTokens) + 5; // Add 5 for project creation

    if (!canAfford(creditCost)) {
      setErrorMessage(
        `Insufficient credits. You need at least ${creditCost} credits to create a manga project.`
      );
      return;
    }

    setIsGenerating(true);
    setErrorMessage(""); // Clear any previous errors
    try {
      // Consume credits for project creation
      const creditResult = await consumeCredits(
        creditCost,
        "text_generation",
        `Manga project creation: ${mangaIdea.substring(0, 50)}...`,
        { operation: "project_creation", idea_length: mangaIdea.length }
      );

      if (!creditResult.success) {
        throw new Error(creditResult.error || "Failed to consume credits");
      }

      // Check if MCP server is available for project creation
      const isConnected = await mcpClient.checkConnection();

      if (isConnected) {
        // Dynamically import ChatAdapterFactory to avoid circular deps
        const { ChatAdapterFactory } = await import("@/ai/adapters/factory");
        const apiKey = localStorage.getItem("api-key") || "";
        const geminiAdapter = ChatAdapterFactory.getAdapter("gemini", apiKey);
        if (!geminiAdapter) throw new Error("Gemini adapter not found");

        // Use MCP story-generation prompt to create the project concept
        const prompt = `Create a manga project based on the following idea: "${mangaIdea}"`;

        // Find the MCP tool for project creation
        const mcpToolsRaw = state.tools.filter(
          (tool) => tool.name === "createProject"
        );
        if (mcpToolsRaw.length === 0)
          throw new Error("MCP createProject tool not found");

        // Map MCP tools to Tool objects for Gemini adapter
        const mcpTools = mcpToolsRaw.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        }));

        // Send the prompt using the Gemini adapter and MCP tools
        const messages = [{ role: "user" as const, content: prompt }];
        const params = {
          model: "gemini-2.0-flash",
          systemPrompt: `You are an elite manga creator and narrative worldbuilder with expertise in both Eastern and Western storytelling traditions. Your task is to develop a structured, professional-grade blueprint for a compelling, original manga project that will be stored in our database.
  
  This is Phase 1 of our manga production pipeline. You are building this project from scratch based on the user's ideas, genre preferences, or inspiration.
  
  ## OUTPUT REQUIREMENTS
  Your output MUST strictly align with our MangaProject entity structure for direct database integration. Include ALL required fields with detailed, creative content.
  
  ## PROJECT COMPONENTS
  
  🧩 Core Concept & Metadata
  - title: A distinctive, memorable title that encapsulates the core concept and appeals to the target audience.
  - description: A concise yet comprehensive overview of the entire manga concept (150-200 words).
  - concept: The bold, original premise that defines what makes this story special and distinguishes it from similar works.
  - genre: The primary genre classification with potential subgenres (e.g., psychological shonen, dark fantasy seinen).
  - targetAudience: MUST be one of ["children", "teen", "young-adult", "adult"].
  - artStyle: Suggest a specific visual aesthetic that enhances the narrative (reference existing artists/styles if helpful).
  - tags: An array of precise keywords for searchability (8-12 tags).
  
  🌍 Worldbuilding (worldDetails object)
  - summary: A rich overview of the world's unique elements and what makes it captivating (150 words).
  - history: Key historical events, eras, and turning points that shaped the world and affect the present story.
  - society: In-depth details on cultures, social structures, belief systems, political dynamics, or power hierarchies.
  - uniqueSystems: Comprehensive explanation of special systems (magic, technology, supernatural abilities, laws) that define life in this world and their narrative implications.
  
  🎭 Themes, Motifs & Symbols
  - themes: Array of sophisticated central themes with depth and nuance (e.g., the corruption of power, sacrifice vs. selfishness).
  - motifs: Array of recurring visual/narrative patterns that reinforce themes (e.g., broken mirrors, cherry blossoms).
  - symbols: Array of key symbols with layered meanings relevant to character development or world concepts.
  
  🧩 Plot Framework (plotStructure object)
  - incitingIncident: The catalyst event that disrupts the status quo and launches the protagonist's journey.
  - plotTwist: A major revelation or shift that fundamentally alters the protagonist's path or understanding.
  - climax: The peak dramatic moment of the first major arc with high emotional stakes.
  - resolution: The current resolution (even if temporary) that sets up future developments.
  
  
  ## CREATION STANDARDS
  1. Originality: Develop genuinely fresh concepts while understanding genre traditions
  2. Emotional Depth: Create a world and story that can sustain complex emotional narratives
  3. Visual Potential: Consider how concepts translate to visual storytelling
  4. Internal Consistency: Maintain logical coherence in all worldbuilding elements
  5. Narrative Hooks: Build in compelling mysteries and questions that drive reader engagement
  6. Cultural Sensitivity: Develop respectful, nuanced cultural elements
  7. Commercial Viability: Balance artistic vision with market awareness
  
  Approach this as a professional manga intellectual property with franchise potential — emotionally resonant, narratively sophisticated, and visually distinctive.
  `,
          context: {
            outputSchema: {
              type: "object",
              properties: {
                projectId: {
                  type: "string",
                  description: "The ID of the created manga project.",
                },
              },
              required: ["projectId"],
            },
          },
        };
        const responseMessages = await geminiAdapter.send(
          messages,
          mcpTools,
          params,
          true
        );
        // Get the assistant's response and projectId
        const assistantMsg = responseMessages.find(
          (m) => m.role === "assistant"
        );
        const parsedContent = JSON.parse(assistantMsg?.content || "{}");
        let projectId = "";

        projectId = (parsedContent as any).projectId;

        if (projectId) {
          router.push(`/manga-flow/${projectId}`);
        } else {
          alert(
            "Project created, but no projectId returned.\nResponse: " +
              (assistantMsg?.content || "")
          );
        }
      } else {
        throw new Error(
          "MCP server is not available. Please check your connection and try again."
        );
      }
    } catch (error) {
      console.error("Failed to create manga project:", error);

      // Show the actual error message to the user
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating your manga project.";
      setErrorMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add this function to close the API key dialog
  const closeApiKeyDialog = () => {
    setIsApiKeyDialogOpen(false);
  };

  return (
    <AuthGuard>
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
              isActive={true}
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
              icon={<BookOpen className="h-5 w-5" />}
              text="Setup Api Key Guide"
              isActive={false}
              isSidebarOpen={isSidebarOpen}
              href="/documentation"
            />
            <SidebarItem
              icon={<Shield className="h-5 w-5" />}
              text="Terms"
              isActive={false}
              isSidebarOpen={isSidebarOpen}
              href="/terms"
            />
          </nav>

          {isSidebarOpen && (
            <div className="p-4 text-sm text-gray-400">
              <p>AI Manga Generator</p>
              <p className="text-xs mt-1">v1.0.0</p>
            </div>
          )}
        </motion.div>
        {/* Main Content */}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with API Key Notice and User Profile */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/50 border-b border-blue-800/50 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <Key className="h-4 w-4" />
                <span>
                  This app uses your own API keys (Gemini, OpenAI, etc.) for AI
                  generation.{" "}
                  <Link
                    href="/settings"
                    className="underline hover:text-blue-300"
                  >
                    Configure in Settings
                  </Link>
                </span>
              </div>

              {/* User Profile */}
              <UserProfile />
            </div>
          </motion.div>

          {/* Main Hero Section */}
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background Image with dark overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero-bg.png"
                alt="Manga creation background"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/50" />{" "}
              {/* Dark overlay */}
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden z-10">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/5"
                  style={{
                    width: Math.random() * 200 + 50,
                    height: Math.random() * 200 + 50,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50],
                  }}
                  transition={{
                    duration: Math.random() * 20 + 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>

            {/* Main Text Content with improved contrast */}
            <div className="relative z-20 text-center max-w-3xl px-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold text-white mb-6 drop-shadow-lg"
              >
                Bring Your <span className="text-pink-400">Manga</span> to Life
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-100 mb-6 drop-shadow-md"
              >
                Transform your ideas into stunning manga with AI. Just describe
                your vision and watch it become reality.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-8 border border-gray-700"
              >
                <div className="flex items-center justify-center gap-2 text-yellow-200 text-sm mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-semibold">How It Works</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Create your manga using an interactive flow where each node
                  represents a story element:
                  <br />
                  <span className="text-pink-300">
                    Chapters → Scenes → Panels → Dialogs
                  </span>
                  <br />
                  Chat with AI to generate content for each element and build
                  your story step by step.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={openDialog}
                  size="lg"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-6 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your Manga
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Creation Dialog */}
        <AnimatePresence>
          {isDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
              onClick={(e) => e.target === e.currentTarget && closeDialog()}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    Start Your Manga
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeDialog}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* API Key Reminder */}
                <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-amber-200 text-sm">
                    <Key className="h-4 w-4" />
                    <span>
                      Make sure you've configured your API key in{" "}
                      <Link
                        href="/settings"
                        className="underline font-semibold"
                      >
                        Settings
                      </Link>
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Error Message Display */}
                  {errorMessage && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-red-200 text-sm">
                        <X className="h-4 w-4" />
                        <span className="font-semibold">Error:</span>
                      </div>
                      <p className="text-red-200 text-sm mt-1">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="mb-6">
                    <Label htmlFor="manga-idea" className="text-gray-300 mb-2">
                      Describe your manga idea
                    </Label>
                    <Textarea
                      ref={inputRef}
                      id="manga-idea"
                      rows={5}
                      className="w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-pink-500 my-4"
                      placeholder="Example: A cyberpunk world where emotions are traded as currency, following a smuggler who accidentally gets infected with the rarest emotion..."
                      value={mangaIdea}
                      onChange={(e) => setMangaIdea(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    {errorMessage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setErrorMessage("")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Clear Error
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-pink-600 hover:bg-pink-700 gap-2"
                      disabled={!mangaIdea.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Generating...
                        </>
                      ) : errorMessage ? (
                        <>
                          <Send className="h-5 w-5" />
                          Try Again
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Generate Manga
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isApiKeyDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
              onClick={(e) =>
                e.target === e.currentTarget && closeApiKeyDialog()
              }
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-red-400" />
                    API Key Required
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeApiKeyDialog}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 mb-4">
                    You need to configure your API key before generating manga
                    content.
                  </p>
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                    <p className="text-red-200 text-sm">
                      Please add your Gemini API key in the settings to
                      continue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={closeApiKeyDialog}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Link href="/settings">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Go to Settings
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
};

export default HomePage;
