"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Send, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const HomePage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mangaIdea, setMangaIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const { loadCredits } = useCreditStore();

  const openDialog = () => {
    setIsDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setMangaIdea("");
    setErrorMessage("");
  };

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaIdea.trim()) return;

    setIsGenerating(true);
    setErrorMessage(""); // Clear any previous errors
    try {
      // Send only the manga idea - backend will generate structured project data
      const response = await apiRequest.post<{
        success: boolean;
        data: { _id: string };
      }>("/manga/projects", {
        mangaIdea: mangaIdea.trim(),
      });

      // Refresh credits to show updated balance
      await loadCredits();

      if (response.data?._id) {
        // Navigate to the project's manga flow interface
        router.push(`/manga-flow/${response.data._id}`);
      } else {
        throw new Error("Project creation failed - no project ID returned");
      }
    } catch (error: any) {
      console.error("Failed to create manga project:", error);

      // Show the actual error message to the user using toast
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred while creating your manga project.";

      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AuthGuard>
      <div className="main-content bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Main Hero Section */}
        <div className="flex items-center justify-center main-content p-8 relative overflow-hidden">
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
                Chat with AI to generate content for each element and build your
                story step by step.
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
                className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-700"
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
                    <p className="text-gray-400 text-xs mt-2">
                      ✨ Our AI will automatically generate characters, plot
                      structure, world details, and more based on your idea!
                    </p>
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
                          Generating with AI...
                        </>
                      ) : errorMessage ? (
                        <>
                          <Send className="h-5 w-5" />
                          Try Again
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
};

export default HomePage;
