"use client";

import { Message } from "@/ai/adapters/type";
import {
  LocationTemplateGenerationPrompt,
  OutfitTemplateGenerationPrompt,
} from "@/ai/flows/generation-flows";
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
import {
  getChapters,
  getProject,
  getScenes,
  listCharacters,
} from "@/services/data-service";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Image,
  Layers,
  MapPin,
  Palette,
  Send,
  Settings,
  Shirt,
  Upload,
  User,
  Users,
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

  // Handle template creation
  const handleTemplateCreate = useCallback(
    async (type: "outfits" | "locations") => {
      try {
        setIsLoading(true);

        // Add a system message indicating template generation
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `🎨 **Creating ${
            type === "outfits" ? "Outfit" : "Location"
          } Templates**\n\nI'm generating new ${type} templates based on your project context. This may take a moment...`,
          timestamp: new Date().toISOString(),
          type: "text",
        };

        setMessages((prev) => [...prev, systemMessage]);

        // Load current project data
        const currentProjectData = await getProject(projectId);

        if (type === "outfits") {
          const result = await OutfitTemplateGenerationPrompt({
            userInput: `Create new outfit templates for the manga project based on the existing characters and story context.`,
            projectContext: currentProjectData,
            existingCharacters: currentProjectData?.characters || [],
            existingOutfitTemplates: currentProjectData?.outfitTemplates || [],
            existingLocationTemplates:
              currentProjectData?.locationTemplates || [],
          });

          // Add success message
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ **Outfit Templates Created Successfully!**\n\nI've generated new outfit templates for your project. You can find them in the Templates panel. These templates are designed to work with your existing characters and story context.`,
            timestamp: new Date().toISOString(),
            type: "text",
          };
          setMessages((prev) => [...prev, successMessage]);
        } else if (type === "locations") {
          const result = await LocationTemplateGenerationPrompt({
            userInput: `Create new location templates for the manga project based on the existing story context and settings.`,
            projectContext: currentProjectData,
            existingLocationTemplates:
              currentProjectData?.locationTemplates || [],
          });

          // Add success message
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ **Location Templates Created Successfully!**\n\nI've generated new location templates for your project. You can find them in the Templates panel. These locations complement your story's settings and atmosphere.`,
            timestamp: new Date().toISOString(),
            type: "text",
          };
          setMessages((prev) => [...prev, successMessage]);
        }
      } catch (error) {
        console.error("Template creation error:", error);
        toast({
          title: "Template Creation Failed",
          description: `Failed to create ${type} templates. Please try again.`,
          variant: "destructive",
        });

        // Add error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ **Template Creation Failed**\n\nI encountered an error while creating ${type} templates. Please try again or let me know if you need assistance.`,
          timestamp: new Date().toISOString(),
          type: "text",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, toast, setIsLoading, setMessages]
  );

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
                  const commonProps = {
                    key: tab.id,
                    projectId,
                    onComponentSelect: handleComponentSelect,
                    selectedEntity,
                    onEntitySelect: handleEntitySelect,
                    onAssetSelect: handleAssetSelect,
                  };

                  // Handle templates panel specifically
                  if (tab.id === "templates") {
                    return (
                      <EnhancedTemplateLibraryPanel
                        {...commonProps}
                        onTemplateCreate={handleTemplateCreate}
                      />
                    );
                  }

                  // Handle other panels
                  const Component = tab.component;
                  return <Component {...commonProps} />;
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
  const [projectData, setProjectData] = useState<any>(null);

  // Panel settings with enhanced visual structure
  const [panelSettings, setPanelSettings] = useState({
    description: "",
    artStyle: "modern, clean anime style",
    lighting: "soft, diffused lighting",
    cameraAngle: "medium shot",
    location: "",
    characters: [] as {
      id: string;
      name: string;
      pose: string;
      expression: string;
      outfit: string;
      customPose?: string;
      customExpression?: string;
      customOutfit?: string;
    }[],
    dialogue: "",
    qualityKeywords: [] as string[],
    customArtStyle: "",
    customLighting: "",
    customCameraAngle: "",
    customLocation: "",
  });

  // Enhanced predefined options with visual appeal
  const predefinedOptions = {
    artStyles: [
      {
        label: "Modern Anime",
        value: "modern, clean anime style",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "Clean, contemporary anime aesthetic",
      },
      {
        label: "Pastel Anime",
        value: "soft, pastel anime illustration",
        image:
          "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop",
        description: "Soft, dreamy pastel colors",
      },
      {
        label: "Dynamic Shonen",
        value: "dynamic shonen anime style",
        image:
          "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
        description: "Action-packed, energetic style",
      },
      {
        label: "Detailed Fantasy",
        value: "detailed fantasy anime",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        description: "Intricate fantasy elements",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own art style",
      },
    ],
    locations: [
      {
        label: "School Classroom",
        value: "bright school classroom with desks and blackboard",
        image:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop",
        description: "Traditional learning environment",
      },
      {
        label: "Library",
        value: "quiet library with tall bookshelves",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Peaceful study space",
      },
      {
        label: "Shopping District",
        value: "busy shopping district with neon signs",
        image:
          "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400&h=300&fit=crop",
        description: "Vibrant commercial area",
      },
      {
        label: "Beach Sunset",
        value: "peaceful beach at sunset",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
        description: "Romantic coastal scene",
      },
      {
        label: "Mountain Path",
        value: "winding mountain hiking trail",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        description: "Adventure outdoor setting",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own location",
      },
    ],
    lighting: [
      {
        label: "Soft Diffused",
        value: "soft, diffused lighting",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Gentle, even illumination",
      },
      {
        label: "Golden Hour",
        value: "evening golden hour",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Warm sunset glow",
      },
      {
        label: "Dramatic Backlighting",
        value: "dramatic backlighting",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Striking silhouette effect",
      },
      {
        label: "Bright Sunlight",
        value: "bright, natural sunlight",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        description: "Vibrant natural light",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own lighting",
      },
    ],
    cameraAngles: [
      {
        label: "Medium Shot",
        value: "medium shot",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Balanced character framing",
      },
      {
        label: "Close-up Portrait",
        value: "close-up portrait",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Intimate facial focus",
      },
      {
        label: "Full Body Shot",
        value: "full body shot",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Complete character view",
      },
      {
        label: "Bird's Eye View",
        value: "bird's eye view from above",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
        description: "Top-down perspective",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own camera angle",
      },
    ],
    poses: [
      {
        label: "Confident Stance",
        value: "confident standing pose",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Strong, assertive posture",
      },
      {
        label: "Graceful Sitting",
        value: "sitting gracefully",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Elegant seated position",
      },
      {
        label: "Dynamic Action",
        value: "dynamic action pose",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Energetic movement",
      },
      {
        label: "Shy & Bashful",
        value: "shy, bashful posture",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616c2e7e9ae?w=400&h=300&fit=crop",
        description: "Timid, endearing stance",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own pose",
      },
    ],
    expressions: [
      {
        label: "Serene Smile",
        value: "soft, serene smile",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Peaceful, gentle expression",
      },
      {
        label: "Determined Gaze",
        value: "determined, focused gaze",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Strong, resolute look",
      },
      {
        label: "Playful Wink",
        value: "playful wink",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Mischievous, fun expression",
      },
      {
        label: "Surprised Wonder",
        value: "wide-eyed surprise",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        description: "Amazed, curious look",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own expression",
      },
    ],
    outfits: [
      {
        label: "School Uniform",
        value: "crisp school uniform",
        image:
          "https://images.unsplash.com/photo-1594736797933-d0f1bb155a63?w=400&h=300&fit=crop",
        description: "Classic student attire",
      },
      {
        label: "Casual Wear",
        value: "casual modern clothing",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        description: "Everyday comfortable outfit",
      },
      {
        label: "Formal Dress",
        value: "elegant formal dress",
        image:
          "https://images.unsplash.com/photo-1594736797933-d0f1bb155a63?w=400&h=300&fit=crop",
        description: "Sophisticated formal wear",
      },
      {
        label: "Traditional Kimono",
        value: "traditional Japanese kimono",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        description: "Beautiful traditional garment",
      },
      {
        label: "Other",
        value: "custom",
        image: null,
        description: "Define your own outfit",
      },
    ],
    qualityKeywords: [
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
    ],
  };

  // Load actual project data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Load project, chapters, and characters separately since there's no single function
        const [project, chapters, characters] = await Promise.all([
          getProject(projectId),
          getChapters(projectId),
          listCharacters(projectId),
        ]);

        // Load scenes for each chapter
        const chaptersWithScenes = await Promise.all(
          (chapters || []).map(async (chapter: any) => {
            const scenes = await getScenes(chapter.id);
            return { ...chapter, scenes: scenes || [] };
          })
        );

        // Create a combined structure with the data we have
        const projectWithRelations = {
          ...project,
          chapters: chaptersWithScenes,
          characters: characters || [],
        };

        setProjectData(projectWithRelations);
      } catch (error) {
        console.error("Failed to load project data:", error);
      }
    };

    if (projectId && isOpen) {
      loadProjectData();
    }
  }, [projectId, isOpen]);

  // Update max panel order when scene changes
  useEffect(() => {
    if (selectedChapter && selectedScene && projectData) {
      const chapter = projectData.chapters?.find(
        (c: any) => c.id === selectedChapter
      );
      const scene = chapter?.scenes?.find((s: any) => s.id === selectedScene);
      if (scene) {
        const newMaxOrder = (scene.panels?.length || 0) + 1;
        setMaxPanelOrder(newMaxOrder);
        setPanelOrder(newMaxOrder); // Default to adding at the end
      }
    }
  }, [selectedChapter, selectedScene, projectData]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCharacterToggle = (characterId: string) => {
    const character = projectData?.characters?.find(
      (c: any) => c.id === characterId
    );
    if (!character) return;

    const isSelected = panelSettings.characters.some(
      (c) => c.id === characterId
    );

    if (isSelected) {
      // Remove character
      setPanelSettings((prev) => ({
        ...prev,
        characters: prev.characters.filter((c) => c.id !== characterId),
      }));
    } else {
      // Add character with default settings
      setPanelSettings((prev) => ({
        ...prev,
        characters: [
          ...prev.characters,
          {
            id: characterId,
            name: character.name,
            pose: "confident standing pose",
            expression: "soft, serene smile",
            outfit: character.defaultOutfitId || "crisp school uniform",
          },
        ],
      }));
    }
  };

  const updateCharacterSetting = (
    characterId: string,
    field: string,
    value: string
  ) => {
    setPanelSettings((prev) => ({
      ...prev,
      characters: prev.characters.map((char) =>
        char.id === characterId ? { ...char, [field]: value } : char
      ),
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
      // Structure data according to Panel interface
      const panelData = {
        order: panelOrder,
        panelContext: {
          action: panelSettings.description,
          characterPoses: panelSettings.characters.map((char) => ({
            characterName: char.name,
            characterId: char.id,
            pose: char.customPose || char.pose,
            expression: char.customExpression || char.expression,
            outfitId: char.customOutfit || char.outfit, // This should be the actual outfit ID
          })),
          cameraAngle:
            panelSettings.customCameraAngle || panelSettings.cameraAngle,
          locationId: panelSettings.customLocation || panelSettings.location, // This should be the actual location ID
          lighting: panelSettings.customLighting || panelSettings.lighting,
          effects: [], // Could be derived from qualityKeywords or other settings
        },
        sceneId: selectedScene,
        isAiGenerated: true,
        // Other fields would be set by the actual creation function
      };

      // Actual panel generation logic here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Generating panel with structure:", panelData);
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
      lighting: "soft, diffused lighting",
      cameraAngle: "medium shot",
      location: "",
      characters: [],
      dialogue: "",
      qualityKeywords: [],
      customArtStyle: "",
      customLighting: "",
      customCameraAngle: "",
      customLocation: "",
    });
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const currentScenes =
    selectedChapter && projectData
      ? projectData.chapters?.find((c: any) => c.id === selectedChapter)
          ?.scenes || []
      : [];

  const canProceed = {
    step1: selectedChapter && selectedScene,
    step2: panelOrder > 0,
    step3: panelSettings.description.trim().length > 0,
  };

  // Character configuration panel component
  const CharacterConfigPanel = ({
    character,
    onUpdate,
    predefinedOptions,
  }: any) => {
    return (
      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
        <h5 className="font-medium text-white mb-3">{character.name}</h5>
        <div className="space-y-3">
          <VisualSelector
            title="Pose"
            options={predefinedOptions.poses}
            selectedValue={character.pose}
            onSelect={(value: string) => onUpdate(character.id, "pose", value)}
            customValue={character.customPose}
            onCustomChange={(value: string) =>
              onUpdate(character.id, "customPose", value)
            }
            icon={<Users className="w-4 h-4" />}
          />
          <VisualSelector
            title="Expression"
            options={predefinedOptions.expressions}
            selectedValue={character.expression}
            onSelect={(value: string) =>
              onUpdate(character.id, "expression", value)
            }
            customValue={character.customExpression}
            onCustomChange={(value: string) =>
              onUpdate(character.id, "customExpression", value)
            }
            icon={<Eye className="w-4 h-4" />}
          />
          <VisualSelector
            title="Outfit"
            options={predefinedOptions.outfits}
            selectedValue={character.outfit}
            onSelect={(value: string) =>
              onUpdate(character.id, "outfit", value)
            }
            customValue={character.customOutfit}
            onCustomChange={(value: string) =>
              onUpdate(character.id, "customOutfit", value)
            }
            icon={<Shirt className="w-4 h-4" />}
          />
        </div>
      </div>
    );
  };

  // Visual selector component for enhanced UI
  const VisualSelector = ({
    title,
    options,
    selectedValue,
    onSelect,
    customValue,
    onCustomChange,
    icon,
  }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCustom, setShowCustom] = useState(selectedValue === "custom");

    return (
      <div className="space-y-3">
        <button
          className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-xl shadow-sm border border-gray-600 hover:border-purple-400 transition-all hover:shadow-md"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-800 to-blue-800 text-purple-400">
              {icon}
            </div>
            <span className="font-medium text-white">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedValue && selectedValue !== "custom" && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300"
              >
                {options.find((o: any) => o.value === selectedValue)?.label}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-200">
            {options.map((option: any) => (
              <div
                key={option.value}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  selectedValue === option.value
                    ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900 rounded-xl"
                    : "hover:ring-1 hover:ring-purple-400 ring-offset-gray-900 rounded-xl"
                }`}
                onClick={() => {
                  onSelect(option.value);
                  if (option.value === "custom") {
                    setShowCustom(true);
                  } else {
                    setShowCustom(false);
                  }
                }}
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 aspect-square">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                      <Wand2 className="w-6 h-6 text-purple-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {selectedValue === option.value && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {option.label}
                    </h3>
                    <p className="text-xs text-white/90 line-clamp-2">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCustom && onCustomChange && (
          <div className="mt-3 p-4 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-600">
            <Textarea
              className="w-full bg-gray-700 border-purple-400 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              placeholder={`Describe your custom ${title.toLowerCase()}...`}
              value={customValue || ""}
              onChange={(e) => onCustomChange(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col bg-gray-900 dark:bg-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-6 flex-shrink-0">
          <DialogTitle className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Generate Panel Manually
              </span>
              <DialogDescription className="mt-1 text-gray-400">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Select Location"
                  : step === 2
                  ? "Set Panel Order"
                  : "Configure Panel Details"}
              </DialogDescription>
            </div>
          </DialogTitle>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= step
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded-full transition-all ${
                      i < step ? "bg-purple-600" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Step 1: Chapter and Scene Selection */}
          {step === 1 && (
            <div className="p-6 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose Chapter and Scene
                </h2>
                <p className="text-gray-400">
                  Select where you want to add your new panel
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all bg-gray-800">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Chapter
                    </Label>
                    <Select
                      value={selectedChapter}
                      onValueChange={setSelectedChapter}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-600 bg-gray-700 text-white">
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {projectData?.chapters?.map((chapter: any) => (
                          <SelectItem
                            key={chapter.id}
                            value={chapter.id}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">
                                {chapter.title}
                              </span>
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-gray-600 text-gray-200"
                              >
                                {chapter.scenes?.length || 0} scenes
                              </Badge>
                            </div>
                          </SelectItem>
                        )) || (
                          <SelectItem
                            value="no-chapters"
                            disabled
                            className="text-gray-400"
                          >
                            No chapters available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all bg-gray-800">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Image className="w-5 h-5 text-purple-400" />
                      Scene
                    </Label>
                    <Select
                      value={selectedScene}
                      onValueChange={setSelectedScene}
                      disabled={!selectedChapter}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-600 bg-gray-700 text-white">
                        <SelectValue placeholder="Select a scene" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {currentScenes.map((scene: any) => (
                          <SelectItem
                            key={scene.id}
                            value={scene.id}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{scene.title}</span>
                              <Badge
                                variant="outline"
                                className="ml-2 border-gray-500 text-gray-300"
                              >
                                {scene.panels?.length || 0} panels
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                        {currentScenes.length === 0 && selectedChapter && (
                          <SelectItem
                            value="no-scenes"
                            disabled
                            className="text-gray-400"
                          >
                            No scenes available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {selectedChapter && selectedScene && (
                <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-600 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-blue-300 mb-2">
                      <FileText className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        Selected Location
                      </span>
                    </div>
                    <p className="text-blue-200 text-lg">
                      {
                        projectData?.chapters?.find(
                          (c: any) => c.id === selectedChapter
                        )?.title
                      }{" "}
                      →{" "}
                      {
                        currentScenes.find((s: any) => s.id === selectedScene)
                          ?.title
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Panel Order */}
          {step === 2 && (
            <div className="p-6 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Set Panel Order
                </h2>
                <p className="text-gray-400">
                  Choose where to insert the new panel in the scene
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Panel Position
                    </Label>
                    <Select
                      value={panelOrder.toString()}
                      onValueChange={(value) => setPanelOrder(parseInt(value))}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-600 bg-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {Array.from(
                          { length: maxPanelOrder },
                          (_, i) => i + 1
                        ).map((order) => (
                          <SelectItem
                            key={order}
                            value={order.toString()}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">
                                Position {order}
                              </span>
                              {order === maxPanelOrder && (
                                <Badge className="ml-2 bg-green-800 text-green-300">
                                  New
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-3">
                      Current scene has {maxPanelOrder - 1} panels. Adding at
                      position {panelOrder}.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-600 shadow-lg max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-green-300 mb-2">
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold text-lg">
                      Panel Order Confirmed
                    </span>
                  </div>
                  <p className="text-green-400 text-lg">
                    Panel will be inserted at position {panelOrder} of{" "}
                    {maxPanelOrder}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Enhanced Panel Configuration */}
          {step === 3 && (
            <div className="p-6 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Configure Panel Details
                </h2>
                <p className="text-gray-400">
                  Set up the visual and narrative elements
                </p>
              </div>

              <div className="space-y-8">
                {/* Description */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Panel Description *
                    </Label>
                    <Textarea
                      placeholder="Describe what happens in this panel in detail..."
                      value={panelSettings.description}
                      onChange={(e) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[120px] border-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
                    />
                  </CardContent>
                </Card>

                {/* Characters */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-purple-400" />
                      Characters & Configurations
                    </Label>
                    <div className="space-y-4">
                      {/* Available Characters */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-3">
                          Select Characters:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {projectData?.characters?.map((character: any) => (
                            <button
                              key={character.id}
                              onClick={() =>
                                handleCharacterToggle(character.id)
                              }
                              className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                                panelSettings.characters.some(
                                  (c) => c.id === character.id
                                )
                                  ? "border-purple-500 bg-purple-900/50 text-purple-300 shadow-md"
                                  : "border-gray-600 bg-gray-700 text-white hover:border-purple-400"
                              }`}
                            >
                              <div className="font-semibold text-sm">
                                {character.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {character.briefDescription ||
                                  character.description}
                              </div>
                            </button>
                          )) || (
                            <p className="text-gray-400 col-span-full text-center py-4">
                              No characters available in this project
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Character Configurations */}
                      {panelSettings.characters.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-300 border-t border-gray-600 pt-4">
                            Character Configurations:
                          </h4>
                          {panelSettings.characters.map((character) => (
                            <CharacterConfigPanel
                              key={character.id}
                              character={character}
                              onUpdate={updateCharacterSetting}
                              predefinedOptions={predefinedOptions}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Selectors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <VisualSelector
                      title="Location"
                      options={predefinedOptions.locations}
                      selectedValue={panelSettings.location}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          location: value,
                        }))
                      }
                      customValue={panelSettings.customLocation}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customLocation: value,
                        }))
                      }
                      icon={<MapPin className="w-5 h-5" />}
                    />

                    <VisualSelector
                      title="Art Style"
                      options={predefinedOptions.artStyles}
                      selectedValue={panelSettings.artStyle}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          artStyle: value,
                        }))
                      }
                      customValue={panelSettings.customArtStyle}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customArtStyle: value,
                        }))
                      }
                      icon={<Palette className="w-5 h-5" />}
                    />
                  </div>

                  <div className="space-y-6">
                    <VisualSelector
                      title="Lighting"
                      options={predefinedOptions.lighting}
                      selectedValue={panelSettings.lighting}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          lighting: value,
                        }))
                      }
                      customValue={panelSettings.customLighting}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customLighting: value,
                        }))
                      }
                      icon={<Eye className="w-5 h-5" />}
                    />

                    <VisualSelector
                      title="Camera Angle"
                      options={predefinedOptions.cameraAngles}
                      selectedValue={panelSettings.cameraAngle}
                      onSelect={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          cameraAngle: value,
                        }))
                      }
                      customValue={panelSettings.customCameraAngle}
                      onCustomChange={(value: string) =>
                        setPanelSettings((prev) => ({
                          ...prev,
                          customCameraAngle: value,
                        }))
                      }
                      icon={<Settings className="w-5 h-5" />}
                    />
                  </div>
                </div>

                {/* Dialogue */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-purple-400" />
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
                      className="min-h-[100px] border-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
                    />
                  </CardContent>
                </Card>

                {/* Quality Keywords */}
                <Card className="border-2 border-dashed border-gray-600 bg-gray-800 hover:border-purple-400 transition-all">
                  <CardContent className="p-6">
                    <Label className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
                      <Wand2 className="w-5 h-5 text-purple-400" />
                      Quality Enhancers (Optional)
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {predefinedOptions.qualityKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant={
                            panelSettings.qualityKeywords.includes(keyword)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            panelSettings.qualityKeywords.includes(keyword)
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                              : "hover:bg-purple-900/50 hover:text-purple-400 border-2 border-gray-600 text-gray-300"
                          }`}
                          onClick={() => handleQualityKeywordToggle(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400 font-medium">
              Step {step} of 3{" "}
              {step === 3 && canProceed.step3 && "- Ready to Generate!"}
            </div>
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Back
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceed.step1) ||
                    (step === 2 && !canProceed.step2)
                  }
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={generatePanel}
                  disabled={!canProceed.step3 || isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all min-w-[140px]"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
