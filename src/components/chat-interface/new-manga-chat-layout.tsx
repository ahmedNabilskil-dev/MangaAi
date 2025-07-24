"use client";

import { Message } from "@/ai/adapters/type";
import { ProcessMangaRequestFlow } from "@/ai/flows/planner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Image,
  Layers,
  MapPin,
  Palette,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  Wand2,
  Wrench,
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
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
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
            <DropdownMenu
              open={toolsDropdownOpen}
              onOpenChange={setToolsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative overflow-hidden border border-gray-300 hover:border-blue-400 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-gradient-to-br from-blue-100 to-purple-100">
                      <Wrench className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="font-medium">Tools</span>
                    <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 p-2 bg-white border border-gray-200 shadow-xl rounded-xl"
                sideOffset={8}
              >
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Generation Tools
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={() => {
                    setManualPanelDialog(true);
                    setToolsDropdownOpen(false);
                  }}
                  className="group relative overflow-hidden rounded-lg p-4 cursor-pointer border border-transparent hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm group-hover:shadow-md transition-shadow">
                      <Wand2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        Generate Panel Manually
                      </div>
                      <div className="text-sm text-gray-500 mt-1 group-hover:text-gray-600">
                        Create custom manga panels with detailed scene settings
                        and character management
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-700"
                        >
                          Premium
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          AI Powered
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>

                <div className="my-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    More Tools
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={() => setToolsDropdownOpen(false)}
                  className="group rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-green-100 transition-colors">
                      <Image className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Image Enhancement
                      </div>
                      <div className="text-xs text-gray-500">
                        Upscale and improve existing images
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setToolsDropdownOpen(false)}
                  className="group rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
                      <Settings className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Project Settings
                      </div>
                      <div className="text-xs text-gray-500">
                        Configure your manga project
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
  const [activeTab, setActiveTab] = useState<"scene" | "characters">("scene");
  const [sceneSettings, setSceneSettings] = useState({
    description: "",
    artStyle: "modern, clean anime style",
    background: "school rooftop",
    lighting: "soft, diffused lighting",
    cameraAngle: "medium shot",
    qualityKeywords: [] as string[],
  });
  const [characters, setCharacters] = useState<any[]>([]);
  const [characterInteraction, setCharacterInteraction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["description", "style", "environment"])
  );

  const predefinedOptions = {
    artStyles: [
      { label: "Modern Anime", value: "modern, clean anime style", icon: "🎨" },
      {
        label: "Pastel Anime",
        value: "soft, pastel anime illustration",
        icon: "🌸",
      },
      {
        label: "Dynamic Shonen",
        value: "dynamic shonen anime style",
        icon: "⚡",
      },
      {
        label: "Detailed Fantasy",
        value: "detailed fantasy anime",
        icon: "🧙‍♂️",
      },
      { label: "Chibi Style", value: "chibi style", icon: "🐱" },
      { label: "Dark Gothic", value: "dark gothic anime style", icon: "🖤" },
    ],
    backgrounds: [
      {
        label: "School Rooftop",
        value: "bright, airy school rooftop",
        icon: "🏫",
      },
      {
        label: "Cherry Blossom Park",
        value: "serene park path with cherry blossoms",
        icon: "🌸",
      },
      {
        label: "Festival Street",
        value: "bustling festival street",
        icon: "🎪",
      },
      { label: "Cozy Cafe", value: "cozy cafe interior", icon: "☕" },
      { label: "Urban Cityscape", value: "modern urban cityscape", icon: "🏙️" },
      { label: "Fantasy Forest", value: "mystical forest setting", icon: "🌲" },
      { label: "Beach Sunset", value: "romantic beach at sunset", icon: "🌅" },
      {
        label: "Library",
        value: "quiet library with tall bookshelves",
        icon: "📚",
      },
    ],
    lighting: [
      { label: "Soft Diffused", value: "soft, diffused lighting", icon: "☁️" },
      {
        label: "Bright Sunlight",
        value: "bright, natural sunlight",
        icon: "☀️",
      },
      { label: "Warm Indoor", value: "warm, indoor lighting", icon: "🏠" },
      {
        label: "Dramatic Backlighting",
        value: "dramatic backlighting",
        icon: "🎭",
      },
      { label: "Golden Hour", value: "evening golden hour", icon: "🌇" },
      { label: "Neon Cyberpunk", value: "neon cyberpunk lighting", icon: "🌃" },
      { label: "Moonlight", value: "soft moonlight", icon: "🌙" },
    ],
    cameraAngles: [
      { label: "Medium Shot", value: "medium shot", icon: "📷" },
      { label: "Close-up Portrait", value: "close-up portrait", icon: "👤" },
      { label: "Full Body Shot", value: "full body shot", icon: "🧍" },
      { label: "Low Angle Hero", value: "low angle looking up", icon: "📐" },
      {
        label: "Bird's Eye View",
        value: "bird's eye view from above",
        icon: "🦅",
      },
      { label: "Over Shoulder", value: "over the shoulder shot", icon: "👁️" },
    ],
    poses: [
      {
        label: "Confident Stance",
        value: "confident standing pose",
        icon: "💪",
      },
      { label: "Graceful Sitting", value: "sitting gracefully", icon: "🪑" },
      { label: "Dynamic Action", value: "dynamic action pose", icon: "🏃" },
      { label: "Shy & Bashful", value: "shy, bashful posture", icon: "😊" },
      { label: "Leaning Casual", value: "casually leaning", icon: "🧘" },
      { label: "Thinking Pose", value: "thoughtful thinking pose", icon: "🤔" },
    ],
    expressions: [
      { label: "Serene Smile", value: "soft, serene smile", icon: "😌" },
      {
        label: "Determined Gaze",
        value: "determined, focused gaze",
        icon: "😤",
      },
      { label: "Playful Wink", value: "playful wink", icon: "😉" },
      { label: "Surprised Wonder", value: "wide-eyed surprise", icon: "😮" },
      {
        label: "Melancholic",
        value: "melancholic, thoughtful gaze",
        icon: "😔",
      },
      {
        label: "Joyful Laugh",
        value: "joyful laughing expression",
        icon: "😄",
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleQualityKeywordToggle = (keyword: string) => {
    setSceneSettings((prev) => ({
      ...prev,
      qualityKeywords: prev.qualityKeywords.includes(keyword)
        ? prev.qualityKeywords.filter((k) => k !== keyword)
        : [...prev.qualityKeywords, keyword],
    }));
  };

  const addCharacter = () => {
    const newCharacter = {
      id: Date.now(),
      name: `Character ${characters.length + 1}`,
      description: "",
      pose: "",
      expression: "",
      clothing: "",
    };
    setCharacters((prev) => [...prev, newCharacter]);
  };

  const updateCharacter = (id: number, field: string, value: string) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, [field]: value } : char))
    );
  };

  const removeCharacter = (id: number) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id));
  };

  const generatePanel = async () => {
    setIsGenerating(true);
    // Simulate generation process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Generating panel with settings:", {
      sceneSettings,
      characters,
      characterInteraction,
    });
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Manual Panel Generator
              </span>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Create stunning manga panels with AI-powered customization
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="p-4 space-y-2">
              <button
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "scene"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                }`}
                onClick={() => setActiveTab("scene")}
              >
                <div className="flex items-center gap-3">
                  <Image size={20} />
                  <div>
                    <div className="font-semibold">Scene Settings</div>
                    <div className="text-xs opacity-80">
                      Environment & Style
                    </div>
                  </div>
                </div>
              </button>

              <button
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "characters"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                }`}
                onClick={() => setActiveTab("characters")}
              >
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <div>
                    <div className="font-semibold">Characters</div>
                    <div className="text-xs opacity-80">
                      {characters.length} added
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              {activeTab === "scene" ? (
                <div className="space-y-6 max-w-4xl">
                  {/* Scene Description */}
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("description")}
                    >
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          Scene Description
                        </div>
                        {expandedSections.has("description") ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.has("description") && (
                      <CardContent className="pt-0">
                        <Textarea
                          placeholder="Describe the overall scene, mood, and atmosphere... For example: 'A peaceful school rooftop at sunset with cherry blossoms floating in the warm breeze'"
                          value={sceneSettings.description}
                          onChange={(e) =>
                            setSceneSettings((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="min-h-[120px] focus:ring-blue-500 border-gray-300"
                        />
                      </CardContent>
                    )}
                  </Card>

                  {/* Art Style */}
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("style")}
                    >
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                            <Palette className="w-5 h-5 text-purple-600" />
                          </div>
                          Art Style & Visual Settings
                        </div>
                        {expandedSections.has("style") ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.has("style") && (
                      <CardContent className="pt-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium mb-3 block">
                              Art Style
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              {predefinedOptions.artStyles.map((style) => (
                                <button
                                  key={style.value}
                                  onClick={() =>
                                    setSceneSettings((prev) => ({
                                      ...prev,
                                      artStyle: style.value,
                                    }))
                                  }
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                    sceneSettings.artStyle === style.value
                                      ? "border-blue-500 bg-blue-50 shadow-md"
                                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25"
                                  }`}
                                >
                                  <div className="text-2xl mb-1">
                                    {style.icon}
                                  </div>
                                  <div className="font-medium text-sm">
                                    {style.label}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-3 block">
                              Camera Angle
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              {predefinedOptions.cameraAngles.map((angle) => (
                                <button
                                  key={angle.value}
                                  onClick={() =>
                                    setSceneSettings((prev) => ({
                                      ...prev,
                                      cameraAngle: angle.value,
                                    }))
                                  }
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                    sceneSettings.cameraAngle === angle.value
                                      ? "border-blue-500 bg-blue-50 shadow-md"
                                      : "border-gray-200 bg-white hover:border-blue-300"
                                  }`}
                                >
                                  <div className="text-2xl mb-1">
                                    {angle.icon}
                                  </div>
                                  <div className="font-medium text-sm">
                                    {angle.label}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Environment */}
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("environment")}
                    >
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          Environment & Lighting
                        </div>
                        {expandedSections.has("environment") ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.has("environment") && (
                      <CardContent className="pt-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium mb-3 block">
                              Background Setting
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              {predefinedOptions.backgrounds.map((bg) => (
                                <button
                                  key={bg.value}
                                  onClick={() =>
                                    setSceneSettings((prev) => ({
                                      ...prev,
                                      background: bg.value,
                                    }))
                                  }
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                    sceneSettings.background === bg.value
                                      ? "border-green-500 bg-green-50 shadow-md"
                                      : "border-gray-200 bg-white hover:border-green-300"
                                  }`}
                                >
                                  <div className="text-2xl mb-1">{bg.icon}</div>
                                  <div className="font-medium text-sm">
                                    {bg.label}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-3 block">
                              Lighting
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              {predefinedOptions.lighting.map((light) => (
                                <button
                                  key={light.value}
                                  onClick={() =>
                                    setSceneSettings((prev) => ({
                                      ...prev,
                                      lighting: light.value,
                                    }))
                                  }
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                    sceneSettings.lighting === light.value
                                      ? "border-yellow-500 bg-yellow-50 shadow-md"
                                      : "border-gray-200 bg-white hover:border-yellow-300"
                                  }`}
                                >
                                  <div className="text-2xl mb-1">
                                    {light.icon}
                                  </div>
                                  <div className="font-medium text-sm">
                                    {light.label}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Quality Settings */}
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("quality")}
                    >
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                          </div>
                          Quality Enhancers
                        </div>
                        {expandedSections.has("quality") ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.has("quality") && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {predefinedOptions.qualityKeywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant={
                                sceneSettings.qualityKeywords.includes(keyword)
                                  ? "default"
                                  : "outline"
                              }
                              className={`cursor-pointer transition-all hover:scale-105 ${
                                sceneSettings.qualityKeywords.includes(keyword)
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                  : "hover:bg-blue-50 hover:border-blue-300"
                              }`}
                              onClick={() =>
                                handleQualityKeywordToggle(keyword)
                              }
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Character Interaction */}
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100">
                          <Users className="w-5 h-5 text-pink-600" />
                        </div>
                        Character Interaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Describe how characters interact in this scene... For example: 'Two friends laughing together while sharing a bento box'"
                        value={characterInteraction}
                        onChange={(e) =>
                          setCharacterInteraction(e.target.value)
                        }
                        className="min-h-[100px] focus:ring-blue-500 border-gray-300"
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl">
                  {characters.length === 0 ? (
                    <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50">
                      <CardContent className="p-12 text-center">
                        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-blue-500 mb-4">
                          <Users size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No characters added yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Add characters to bring your manga panel to life
                        </p>
                        <Button
                          onClick={addCharacter}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                          <Plus className="mr-2 h-5 w-5" />
                          Add Your First Character
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Characters ({characters.length})
                        </h3>
                        <Button
                          onClick={addCharacter}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Character
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {characters.map((character, index) => (
                          <Card
                            key={character.id}
                            className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">
                                      Character {index + 1}
                                    </CardTitle>
                                    <div className="text-sm text-gray-500">
                                      Customize appearance and personality
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeCharacter(character.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Character Name
                                </Label>
                                <Input
                                  placeholder="Enter character name..."
                                  value={character.name}
                                  onChange={(e) =>
                                    updateCharacter(
                                      character.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="focus:ring-blue-500 border-gray-300"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Character Description
                                </Label>
                                <Textarea
                                  placeholder="Describe the character's appearance, personality, and unique features..."
                                  value={character.description}
                                  onChange={(e) =>
                                    updateCharacter(
                                      character.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="min-h-[80px] focus:ring-blue-500 border-gray-300"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-sm font-medium mb-2 block">
                                    Pose
                                  </Label>
                                  <Select
                                    value={character.pose}
                                    onValueChange={(value) =>
                                      updateCharacter(
                                        character.id,
                                        "pose",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="focus:ring-blue-500">
                                      <SelectValue placeholder="Select pose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {predefinedOptions.poses.map((pose) => (
                                        <SelectItem
                                          key={pose.value}
                                          value={pose.value}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span>{pose.icon}</span>
                                            {pose.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium mb-2 block">
                                    Expression
                                  </Label>
                                  <Select
                                    value={character.expression}
                                    onValueChange={(value) =>
                                      updateCharacter(
                                        character.id,
                                        "expression",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="focus:ring-blue-500">
                                      <SelectValue placeholder="Select expression" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {predefinedOptions.expressions.map(
                                        (expression) => (
                                          <SelectItem
                                            key={expression.value}
                                            value={expression.value}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span>{expression.icon}</span>
                                              {expression.label}
                                            </div>
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium mb-2 block">
                                    Clothing
                                  </Label>
                                  <Input
                                    placeholder="Describe clothing..."
                                    value={character.clothing}
                                    onChange={(e) =>
                                      updateCharacter(
                                        character.id,
                                        "clothing",
                                        e.target.value
                                      )
                                    }
                                    className="focus:ring-blue-500 border-gray-300"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {activeTab === "scene"
                    ? "Configure your scene settings"
                    : `${characters.length} characters added`}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={generatePanel}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all min-w-[140px]"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
