"use client";

import { Message } from "@/ai/adapters/type";
import { ProcessMangaRequestFlow } from "@/ai/flows/planner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Eye,
  FileText,
  Image,
  Layers,
  Send,
  Settings,
  Upload,
  User,
  Wand2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import AssetDetailPanel from "./asset-detail-panel";
import { GeneratedAssetsPanel } from "./generated-assets-panel";
import {
  EnhancedProjectStructurePanel,
  EnhancedTemplateLibraryPanel,
} from "./styled-side-panels";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Asset {
  id: string;
  type: "character" | "panel" | "scene" | "other";
  name: string;
  url: string;
  timestamp: string;
  chapterId?: string;
  chapterTitle?: string;
  sceneId?: string;
  sceneTitle?: string;
  panelOrder?: number;
}

interface SidePanelTab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{
    projectId: string;
    onComponentSelect?: (componentId: string, type: string) => void;
    selectedEntity?: { id: string; type: string } | null;
    onEntitySelect?: (entity: { id: string; type: string } | null) => void;
    onAssetSelect?: (asset: Asset) => void;
  }>;
}

interface ChatMessage extends Message {
  type?: "text" | "image" | "component-created" | "component-updated";
  metadata?: {
    componentType?: "character" | "scene" | "chapter" | "panel";
    componentId?: string;
    action?: "created" | "updated" | "deleted";
  };
}

// ============================================================================
// MAIN CHAT LAYOUT COMPONENT
// ============================================================================

export default function NewMangaChatLayout() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [sidePanel, setSidePanel] = useState({
    isOpen: true,
    activeTab: "structure",
    width: 420,
  });
  const [assetDetailPanel, setAssetDetailPanel] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({
    isOpen: false,
    asset: null,
  });
  const [manualPanelDialog, setManualPanelDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handlers
  const handleAssetSelect = useCallback((asset: Asset) => {
    setAssetDetailPanel({
      isOpen: true,
      asset,
    });
  }, []);

  const handleAssetDetailClose = useCallback(() => {
    setAssetDetailPanel({
      isOpen: false,
      asset: null,
    });
  }, []);

  const handleNavigateToSource = useCallback(
    (type: string, id: string) => {
      // Navigate to the source component in the structure panel
      setSidePanel((prev) => ({
        ...prev,
        activeTab: "structure",
      }));

      setSelectedEntity({
        id,
        type,
      });

      // Close asset detail panel
      handleAssetDetailClose();

      toast({
        title: "Navigation",
        description: `Navigated to ${type}`,
      });
    },
    [toast, handleAssetDetailClose]
  );

  // Side panel tabs configuration
  const sidePanelTabs: SidePanelTab[] = [
    {
      id: "structure",
      name: "Structure",
      icon: FileText,
      component: EnhancedProjectStructurePanel,
    },
    {
      id: "templates",
      name: "Templates",
      icon: Layers,
      component: EnhancedTemplateLibraryPanel,
    },
    {
      id: "assets",
      name: "Assets",
      icon: Image,
      component: GeneratedAssetsPanel,
    },
  ]; // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load saved messages
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat-messages-${projectId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    } else {
      // Add welcome message if no saved messages
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Welcome to your Manga AI Assistant! 🎨

I'm here to help you create amazing manga content. Here's what I can do:

**🔍 Explore Your Project**
- Click on any character, chapter, or template in the side panel
- Use the **👁️ eye icon** to view detailed information about any element
- Browse your template library for outfits, locations, poses, and effects

**💬 Chat with Me**
- Ask me to create new characters, scenes, or chapters
- Request specific manga panels or story elements
- Get suggestions for improving your manga

**🎭 Try These Commands:**
- "Create a new character named Alex"
- "Design a school scene for chapter 1"
- "Show me action pose templates"
- "Generate a dramatic panel"

Click the **👁️ icons** in the side panels to see detailed views of your project elements!`,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages([welcomeMessage]);
    }
  }, [projectId]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        `chat-messages-${projectId}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, projectId]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const textToSend = input.trim();
      if (!textToSend || isLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: textToSend,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Call AI flow
        const response = await ProcessMangaRequestFlow({
          userInput: textToSend,
          projectId,
          prevChats: messages,
        });

        // Add AI response
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message || "I processed your request.",
          timestamp: new Date().toISOString(),
          type: "text",
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (response.type === "error") {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, projectId, toast]
  );

  // Handle entity selection (for editing)
  const handleEntitySelect = useCallback(
    (entity: { id: string; type: string } | null) => {
      setSelectedEntity(entity);
      // Note: We don't add any chat messages when selecting entities
      // The selection is shown in the top bar instead
    },
    []
  );

  // Handle textarea auto-resize
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    },
    []
  );

  // Handle component selection from side panel
  const handleComponentSelect = useCallback(
    (componentId: string, type: string) => {
      // Add a system message showing what was selected
      const selectionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🎯 **Selected ${type}:** ${componentId}\n\nI can see you're interested in this ${type}. What would you like to do with it? I can help you:\n- Modify its properties\n- Create variations\n- Use it in a new scene\n- Generate related content\n\nJust let me know what you'd like to do!`,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setMessages((prev) => [...prev, selectionMessage]);
    },
    []
  );

  // Handle Enter key (with Shift+Enter for new line)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [handleSubmit]
  );

  return (
    <div className="h-screen w-screen flex bg-white dark:bg-gray-900 overflow-hidden">
      {/* Side Panel */}
      <AnimatePresence>
        {sidePanel.isOpen && (
          <motion.div
            initial={{ x: -sidePanel.width, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -sidePanel.width, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
            style={{ width: sidePanel.width }}
          >
            {/* Side Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Manga Studio
              </h2>
              <button
                onClick={() =>
                  setSidePanel((prev) => ({ ...prev, isOpen: false }))
                }
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side Panel Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {sidePanelTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setSidePanel((prev) => ({ ...prev, activeTab: tab.id }))
                  }
                  className={cn(
                    "flex-1 py-3 px-2 text-xs font-medium transition-colors flex flex-col items-center gap-1",
                    sidePanel.activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Side Panel Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {sidePanelTabs.map((tab) => {
                if (tab.id === sidePanel.activeTab) {
                  const Component = tab.component;
                  return (
                    <Component
                      key={tab.id}
                      projectId={projectId}
                      onComponentSelect={handleComponentSelect}
                      selectedEntity={selectedEntity}
                      onEntitySelect={handleEntitySelect}
                      onAssetSelect={handleAssetSelect}
                    />
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {!sidePanel.isOpen && (
              <button
                onClick={() =>
                  setSidePanel((prev) => ({ ...prev, isOpen: true }))
                }
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FileText className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Manga Assistant
              </h1>
              {selectedEntity && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm">
                  <Settings className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Selected:{" "}
                    {selectedEntity.type.charAt(0).toUpperCase() +
                      selectedEntity.type.slice(1)}
                  </span>
                  <button
                    onClick={() => handleEntitySelect(null)}
                    className="p-0.5 hover:bg-blue-500/20 rounded-full transition-colors"
                    title="Clear selection"
                  >
                    <X className="w-3 h-3 text-blue-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualPanelDialog(true)}
              className="border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span className="font-medium">Generate Panel Manually</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Welcome to Manga AI Studio
              </h3>
              <div className="text-gray-600 dark:text-gray-400 max-w-md mx-auto space-y-2">
                <p>
                  Start creating your manga by describing what you want to
                  build.
                </p>
                <p className="text-sm">
                  💡 <strong>Pro tip:</strong> Click the{" "}
                  <Eye className="w-4 h-4 inline text-blue-500" /> eye icons in
                  the side panel to view detailed information about any element!
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-2xl rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                )}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Actions */}
        {messages.length > 0 && !isLoading && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {/* Contextual Actions based on selection */}
              {selectedEntity ? (
                <>
                  {selectedEntity.type === "character" && (
                    <>
                      <button
                        onClick={() =>
                          setInput("Generate image for this character")
                        }
                        className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-500/30 transition-colors"
                      >
                        🎨 Generate Image
                      </button>
                      <button
                        onClick={() =>
                          setInput(
                            "Modify this character's appearance and personality"
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                      >
                        ✏️ Edit Character
                      </button>
                    </>
                  )}
                  {selectedEntity.type === "chapter" && (
                    <>
                      <button
                        onClick={() =>
                          setInput("Create new scene for this chapter")
                        }
                        className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-500/30 transition-colors"
                      >
                        ➕ Add Scene
                      </button>
                      <button
                        onClick={() =>
                          setInput(
                            "Create all remaining scenes for this chapter"
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                      >
                        📝 Create All Scenes
                      </button>
                    </>
                  )}
                  {selectedEntity.type === "scene" && (
                    <>
                      <button
                        onClick={() =>
                          setInput("Create panels for this scene with dialogs")
                        }
                        className="px-3 py-1.5 text-xs bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-500/30 transition-colors"
                      >
                        🎬 Create Panels
                      </button>
                      <button
                        onClick={() =>
                          setInput(
                            "Generate images for all panels in this scene"
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-500/30 transition-colors"
                      >
                        🖼️ Generate Scene Images
                      </button>
                    </>
                  )}
                  {(selectedEntity.type === "outfit" ||
                    selectedEntity.type === "location" ||
                    selectedEntity.type === "pose" ||
                    selectedEntity.type === "effect") && (
                    <>
                      <button
                        onClick={() =>
                          setInput(
                            `Apply this ${selectedEntity.type} template to characters or scenes`
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-500/30 transition-colors"
                      >
                        🔧 Apply Template
                      </button>
                      <button
                        onClick={() =>
                          setInput(
                            `Modify this ${selectedEntity.type} template`
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                      >
                        ✏️ Edit Template
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* General Actions when nothing is selected */}
                  <button
                    onClick={() =>
                      setInput("Create a new character for this story")
                    }
                    className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30 transition-colors"
                  >
                    ✨ Create Character
                  </button>
                  <button
                    onClick={() => setInput("Add a new chapter to the story")}
                    className="px-3 py-1.5 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-500/30 transition-colors"
                  >
                    📖 New Chapter
                  </button>
                  <button
                    onClick={() =>
                      setInput("Show me the story timeline and structure")
                    }
                    className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-500/10 dark:hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-500/30 transition-colors"
                  >
                    📊 Story Overview
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Manual Panel Generator Dialog */}
      <ManualPanelGenerator
        isOpen={manualPanelDialog}
        onClose={() => setManualPanelDialog(false)}
        projectId={projectId}
      />

      {/* Asset Detail Panel */}
      <AssetDetailPanel
        asset={assetDetailPanel.asset}
        isOpen={assetDetailPanel.isOpen}
        onClose={handleAssetDetailClose}
        onNavigateToSource={handleNavigateToSource}
      />
    </div>
  );
}

// ============================================================================
// MANUAL PANEL GENERATOR COMPONENT
// ============================================================================

interface ManualPanelGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

function ManualPanelGenerator({
  isOpen,
  onClose,
  projectId,
}: ManualPanelGeneratorProps) {
  const [step, setStep] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedScene, setSelectedScene] = useState("");
  const [panelOrder, setPanelOrder] = useState(1);
  const [maxPanelOrder, setMaxPanelOrder] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Panel settings
  const [panelSettings, setPanelSettings] = useState({
    description: "",
    artStyle: "modern, clean anime style",
    background: "",
    lighting: "soft, diffused lighting",
    cameraAngle: "medium shot",
    selectedCharacters: [] as string[],
    characterInteraction: "",
    dialogue: "",
    qualityKeywords: [] as string[],
  });

  // Mock data - replace with actual data from your project
  const mockChapters = [
    { id: "ch1", title: "Chapter 1: The Beginning", sceneCount: 5 },
    { id: "ch2", title: "Chapter 2: New Friends", sceneCount: 4 },
    { id: "ch3", title: "Chapter 3: School Festival", sceneCount: 6 },
  ];

  const mockScenes = {
    ch1: [
      { id: "sc1", title: "Scene 1: Morning Routine", panelCount: 3 },
      { id: "sc2", title: "Scene 2: School Entrance", panelCount: 4 },
      { id: "sc3", title: "Scene 3: First Class", panelCount: 5 },
      { id: "sc4", title: "Scene 4: Lunch Break", panelCount: 2 },
      { id: "sc5", title: "Scene 5: Going Home", panelCount: 3 },
    ],
    ch2: [
      { id: "sc6", title: "Scene 1: New Student", panelCount: 4 },
      { id: "sc7", title: "Scene 2: Introductions", panelCount: 3 },
      { id: "sc8", title: "Scene 3: Classroom", panelCount: 5 },
      { id: "sc9", title: "Scene 4: After School", panelCount: 2 },
    ],
    ch3: [
      { id: "sc10", title: "Scene 1: Festival Preparation", panelCount: 6 },
      { id: "sc11", title: "Scene 2: Setting Up", panelCount: 4 },
      { id: "sc12", title: "Scene 3: Festival Day", panelCount: 8 },
      { id: "sc13", title: "Scene 4: Competition", panelCount: 5 },
      { id: "sc14", title: "Scene 5: Evening", panelCount: 3 },
      { id: "sc15", title: "Scene 6: Fireworks", panelCount: 4 },
    ],
  };

  const mockCharacters = [
    { id: "char1", name: "Akira Yamamoto", description: "Main protagonist" },
    { id: "char2", name: "Yuki Tanaka", description: "Best friend" },
    { id: "char3", name: "Sensei Watanabe", description: "Homeroom teacher" },
    { id: "char4", name: "Hana Sato", description: "Class president" },
    { id: "char5", name: "Ryuu Kimura", description: "Rival character" },
  ];

  const mockLocations = [
    {
      id: "loc1",
      name: "School Rooftop",
      description: "Peaceful rooftop with city view",
    },
    {
      id: "loc2",
      name: "Classroom 2-A",
      description: "Standard high school classroom",
    },
    { id: "loc3", name: "School Cafeteria", description: "Busy lunch area" },
    {
      id: "loc4",
      name: "Cherry Blossom Park",
      description: "Beautiful park with sakura trees",
    },
    {
      id: "loc5",
      name: "Festival Grounds",
      description: "School festival area with stalls",
    },
  ];

  const artStyles = [
    { value: "modern, clean anime style", label: "Modern Anime" },
    { value: "soft, pastel anime illustration", label: "Pastel Anime" },
    { value: "dynamic shonen anime style", label: "Dynamic Shonen" },
    { value: "detailed fantasy anime", label: "Fantasy Anime" },
    { value: "chibi style", label: "Chibi Style" },
  ];

  const lightingOptions = [
    { value: "soft, diffused lighting", label: "Soft Diffused" },
    { value: "bright, natural sunlight", label: "Bright Sunlight" },
    { value: "warm, indoor lighting", label: "Warm Indoor" },
    { value: "dramatic backlighting", label: "Dramatic Backlighting" },
    { value: "evening golden hour", label: "Golden Hour" },
    { value: "moonlight", label: "Moonlight" },
  ];

  const cameraAngles = [
    { value: "medium shot", label: "Medium Shot" },
    { value: "close-up portrait", label: "Close-up Portrait" },
    { value: "full body shot", label: "Full Body Shot" },
    { value: "low angle looking up", label: "Low Angle Hero" },
    { value: "bird's eye view from above", label: "Bird's Eye View" },
  ];

  const qualityKeywords = [
    "high-resolution",
    "8k",
    "detailed",
    "intricate details",
    "masterpiece",
    "best quality",
    "cinematic lighting",
    "photorealistic",
    "ultra-detailed",
    "studio quality",
    "professional artwork",
    "vibrant colors",
    "sharp focus",
  ];

  // Update max panel order when scene changes
  useEffect(() => {
    if (selectedChapter && selectedScene) {
      const scenes =
        mockScenes[selectedChapter as keyof typeof mockScenes] || [];
      const scene = scenes.find((s) => s.id === selectedScene);
      if (scene) {
        const newMaxOrder = scene.panelCount + 1;
        setMaxPanelOrder(newMaxOrder);
        setPanelOrder(newMaxOrder); // Default to adding at the end
      }
    }
  }, [selectedChapter, selectedScene]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCharacterToggle = (characterId: string) => {
    setPanelSettings((prev) => ({
      ...prev,
      selectedCharacters: prev.selectedCharacters.includes(characterId)
        ? prev.selectedCharacters.filter((id) => id !== characterId)
        : [...prev.selectedCharacters, characterId],
    }));
  };

  const handleQualityKeywordToggle = (keyword: string) => {
    setPanelSettings((prev) => ({
      ...prev,
      qualityKeywords: prev.qualityKeywords.includes(keyword)
        ? prev.qualityKeywords.filter((k) => k !== keyword)
        : [...prev.qualityKeywords, keyword],
    }));
  };

  const generatePanel = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Generating panel:", {
        chapter: selectedChapter,
        scene: selectedScene,
        order: panelOrder,
        settings: panelSettings,
      });
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedChapter("");
    setSelectedScene("");
    setPanelOrder(1);
    setPanelSettings({
      description: "",
      artStyle: "modern, clean anime style",
      background: "",
      lighting: "soft, diffused lighting",
      cameraAngle: "medium shot",
      selectedCharacters: [],
      characterInteraction: "",
      dialogue: "",
      qualityKeywords: [],
    });
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const currentScenes = selectedChapter
    ? mockScenes[selectedChapter as keyof typeof mockScenes] || []
    : [];
  const canProceed = {
    step1: selectedChapter && selectedScene,
    step2: panelOrder > 0,
    step3: panelSettings.description.trim().length > 0,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Generate Panel Manually</span>
              <DialogDescription className="mt-1">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Select Location"
                  : step === 2
                  ? "Set Panel Order"
                  : "Configure Panel Details"}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Chapter and Scene Selection */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Choose Chapter and Scene
                </h2>
                <p className="text-gray-600">
                  Select where you want to add your new panel
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Chapter
                  </Label>
                  <Select
                    value={selectedChapter}
                    onValueChange={setSelectedChapter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockChapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{chapter.title}</span>
                            <Badge variant="secondary" className="ml-2">
                              {chapter.sceneCount} scenes
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Scene
                  </Label>
                  <Select
                    value={selectedScene}
                    onValueChange={setSelectedScene}
                    disabled={!selectedChapter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a scene" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentScenes.map((scene) => (
                        <SelectItem key={scene.id} value={scene.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{scene.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {scene.panelCount} panels
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedChapter && selectedScene && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Selected:</span>
                    </div>
                    <p className="text-blue-600 mt-1">
                      {
                        mockChapters.find((c) => c.id === selectedChapter)
                          ?.title
                      }{" "}
                      →{" "}
                      {currentScenes.find((s) => s.id === selectedScene)?.title}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Panel Order */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Set Panel Order
                </h2>
                <p className="text-gray-600">
                  Choose where to insert the new panel in the scene
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Label className="text-sm font-medium mb-3 block">
                  Panel Position
                </Label>
                <Select
                  value={panelOrder.toString()}
                  onValueChange={(value) => setPanelOrder(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxPanelOrder }, (_, i) => i + 1).map(
                      (order) => (
                        <SelectItem key={order} value={order.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>Position {order}</span>
                            {order === maxPanelOrder && (
                              <Badge variant="secondary" className="ml-2">
                                Last
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Current scene has {maxPanelOrder - 1} panels. Adding at
                  position {panelOrder}.
                </p>
              </div>

              <Card className="bg-green-50 border-green-200 max-w-md mx-auto">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Panel Order:</span>
                  </div>
                  <p className="text-green-600 mt-1">
                    Panel will be inserted at position {panelOrder} of{" "}
                    {maxPanelOrder}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Panel Configuration */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Configure Panel Details
                </h2>
                <p className="text-gray-600">
                  Set up the visual and narrative elements
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Panel Description *
                    </Label>
                    <Textarea
                      placeholder="Describe what happens in this panel..."
                      value={panelSettings.description}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Characters */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Characters
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {mockCharacters.map((character) => (
                        <button
                          key={character.id}
                          onClick={() => handleCharacterToggle(character.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            panelSettings.selectedCharacters.includes(
                              character.id
                            )
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {character.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {character.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location/Background */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Background Location
                    </Label>
                    <Select
                      value={panelSettings.background}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          background: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockLocations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-xs text-gray-500">
                                {location.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Art Style */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Art Style
                    </Label>
                    <Select
                      value={panelSettings.artStyle}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          artStyle: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {artStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lighting */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Lighting
                    </Label>
                    <Select
                      value={panelSettings.lighting}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          lighting: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lightingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Camera Angle */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Camera Angle
                    </Label>
                    <Select
                      value={panelSettings.cameraAngle}
                      onValueChange={(value) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          cameraAngle: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cameraAngles.map((angle) => (
                          <SelectItem key={angle.value} value={angle.value}>
                            {angle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dialogue */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Dialogue (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add any dialogue or speech bubbles..."
                      value={panelSettings.dialogue}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          dialogue: e.target.value,
                        }))
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Quality Keywords */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Quality Enhancers (Optional)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {qualityKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant={
                        panelSettings.qualityKeywords.includes(keyword)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleQualityKeywordToggle(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">Step {step} of 3</div>
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceed.step1) ||
                  (step === 2 && !canProceed.step2)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={generatePanel}
                disabled={!canProceed.step3 || isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[120px]"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generate Panel
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
