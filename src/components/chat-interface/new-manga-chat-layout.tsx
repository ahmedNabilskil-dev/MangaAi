"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMcpClient } from "@/hooks/use-mcp-client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getProject } from "@/services/data-service";
import { geminiService } from "@/services/gemini-service";
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
import { McpProjectStructurePanel } from "./mcp-project-structure-panel";
import { McpPromptSelector } from "./mcp-prompt-selector";
import { McpStatusIndicator } from "./mcp-status-indicator";
import {
  EnhancedProjectStructurePanel,
  EnhancedTemplateLibraryPanel,
} from "./styled-side-panels";

import { McpResource, McpTool } from "@/hooks/use-mcp-client";
import { Database, Wrench } from "lucide-react"; // Add these if not already imported
import ManualPanelGenerator from "./manual-panel-genration";
import { McpResourcesSelector } from "./mcp-resources-selector";
import { McpToolsSelector } from "./mcp-tools-selector";

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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
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

  // MCP Client Integration
  const { state: mcpState, actions: mcpActions } = useMcpClient("chat");

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
  const [mcpPromptDialog, setMcpPromptDialog] = useState(false);

  const [mcpResourcesDialog, setMcpResourcesDialog] = useState(false);
  const [mcpToolsDialog, setMcpToolsDialog] = useState(false);
  const [selectedMcpResources, setSelectedMcpResources] = useState<
    McpResource[]
  >([]);
  const [selectedMcpTools, setSelectedMcpTools] = useState<McpTool[]>([]);
  const [mcpResourceContents, setMcpResourceContents] = useState<
    Record<string, any>
  >({});

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
      component: mcpState.isConnected
        ? McpProjectStructurePanel
        : EnhancedProjectStructurePanel,
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
          const prompt = `Create new outfit templates for the manga project based on the existing characters and story context.
          
Project Context: ${JSON.stringify(currentProjectData, null, 2)}
Existing Characters: ${JSON.stringify(
            currentProjectData?.characters || [],
            null,
            2
          )}
Existing Outfit Templates: ${JSON.stringify(
            currentProjectData?.outfitTemplates || [],
            null,
            2
          )}
Existing Location Templates: ${JSON.stringify(
            currentProjectData?.locationTemplates || [],
            null,
            2
          )}

Please generate creative and diverse outfit templates that fit the manga's style and characters.`;

          const result = await geminiService.sendMessage(
            prompt,
            "You are a helpful AI assistant for manga creation. Generate outfit templates in a structured format."
          );

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
          const prompt = `Create new location templates for the manga project based on the existing story context and settings.
          
Project Context: ${JSON.stringify(currentProjectData, null, 2)}
Existing Location Templates: ${JSON.stringify(
            currentProjectData?.locationTemplates || [],
            null,
            2
          )}

Please generate diverse and atmospheric location templates that enhance the manga's world-building.`;

          const result = await geminiService.sendMessage(
            prompt,
            "You are a helpful AI assistant for manga creation. Generate location templates in a structured format."
          );

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
        let response;

        // Prepare context with MCP resources and tools
        let contextMessage = textToSend;

        // Add MCP resources context
        if (selectedMcpResources.length > 0) {
          const resourcesContext = selectedMcpResources
            .map((resource) => {
              const content = mcpResourceContents[resource.uri];
              return `**Resource: ${resource.name}**\nURI: ${
                resource.uri
              }\nDescription: ${
                resource.description || "N/A"
              }\nContent: ${JSON.stringify(content, null, 2)}`;
            })
            .join("\n\n");

          contextMessage = `${textToSend}\n\n--- MCP RESOURCES CONTEXT ---\n${resourcesContext}`;
        }

        // Add MCP tools context
        if (selectedMcpTools.length > 0) {
          const toolsContext = selectedMcpTools
            .map((tool) => {
              return `**Tool: ${tool.name}**\nDescription: ${
                tool.description
              }\nParameters: ${JSON.stringify(
                tool.inputSchema?.properties || {},
                null,
                2
              )}`;
            })
            .join("\n\n");

          contextMessage = `${contextMessage}\n\n--- AVAILABLE MCP TOOLS ---\n${toolsContext}\n\nNote: You can use these tools by calling them with appropriate parameters.`;
        }

        // Try to use MCP client if available and connected
        if (mcpState.isConnected && mcpState.prompts.length > 0) {
          // Check if this looks like a request that should use MCP prompts
          const isContentRequest = /create|generate|add|make|new/i.test(
            textToSend
          );
          const isCharacterRequest =
            /character|person|protagonist|hero|villain/i.test(textToSend);
          const isChapterRequest = /chapter|story|plot|narrative/i.test(
            textToSend
          );
          const isSceneRequest = /scene|setting|location/i.test(textToSend);
          const isPanelRequest = /panel|frame|image|visual/i.test(textToSend);

          if (isContentRequest) {
            // Determine which MCP prompt to use based on context
            let promptName = "";
            if (isCharacterRequest) {
              promptName = "character-generation";
            } else if (isChapterRequest) {
              promptName = "chapter-generation";
            } else if (isSceneRequest) {
              promptName = "scene-generation";
            } else if (isPanelRequest) {
              promptName = "panel-generation";
            } else {
              promptName = "story-generation"; // Default
            }

            // Get MCP prompt template and use it with Gemini
            try {
              const promptTemplate = await mcpActions.getPromptTemplate(
                promptName,
                {
                  userInput: textToSend,
                  projectId: projectId,
                  selectedEntity: selectedEntity,
                }
              );

              // Use Gemini service directly with the prompt template
              const geminiResponse = await geminiService.sendMessage(
                promptTemplate,
                "You are a helpful AI assistant for manga creation."
              );

              response = {
                message: geminiResponse.text,
                type: geminiResponse.error
                  ? ("error" as const)
                  : ("success" as const),
              };
            } catch (mcpError) {
              console.warn(
                "MCP prompt failed, falling back to Gemini direct:",
                mcpError
              );
              // Fall back to Gemini direct
              const geminiResponse = await geminiService.sendMessage(
                textToSend,
                "You are a helpful AI assistant for manga creation. Help users create characters, chapters, scenes, and panels for their manga projects."
              );

              response = {
                message: geminiResponse.text,
                type: geminiResponse.error
                  ? ("error" as const)
                  : ("success" as const),
              };
            }
          } else {
            // Use Gemini directly for non-content requests with conversation history
            try {
              const geminiMessages = geminiService.convertToGeminiMessages(
                messages.map((m) => ({ role: m.role, content: m.content }))
              );

              geminiMessages.push({
                role: "user",
                parts: [{ text: textToSend }],
              });

              const geminiResponse = await geminiService.sendConversation(
                geminiMessages,
                "You are a helpful AI assistant for manga creation. Help users create characters, chapters, scenes, and panels for their manga projects."
              );

              response = {
                message: geminiResponse.text,
                type: geminiResponse.error
                  ? ("error" as const)
                  : ("success" as const),
              };
            } catch (error) {
              console.warn("Gemini direct call failed:", error);
              // Final fallback - simple error message
              response = {
                message:
                  "I encountered an issue processing your request. Please try again or rephrase your message.",
                type: "error" as const,
              };
            }
          }
        } else {
          // MCP not available, use Gemini directly or fall back to regular flow
          try {
            const geminiMessages = geminiService.convertToGeminiMessages(
              messages.map((m) => ({ role: m.role, content: m.content }))
            );

            geminiMessages.push({
              role: "user",
              parts: [{ text: textToSend }],
            });

            const geminiResponse = await geminiService.sendConversation(
              geminiMessages,
              "You are a helpful AI assistant for manga creation. Help users create characters, chapters, scenes, and panels for their manga projects."
            );

            response = {
              message: geminiResponse.text,
              type: geminiResponse.error
                ? ("error" as const)
                : ("success" as const),
            };
          } catch (error) {
            console.warn("Gemini failed:", error);
            // Final error response
            response = {
              message:
                "I encountered an issue processing your request. Please try again or rephrase your message.",
              type: "error" as const,
            };
          }
        }

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
    [
      input,
      isLoading,
      messages,
      projectId,
      toast,
      mcpState.isConnected,
      mcpState.prompts,
      mcpActions,
      selectedEntity,
      selectedMcpResources, // ADD THIS
      selectedMcpTools, // ADD THIS
      mcpResourceContents,
    ]
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

  // Handle MCP prompt selection (populate input field)
  const handleMcpPromptExecute = useCallback(
    async (promptName: string, promptArgs?: any) => {
      try {
        // Get the prompt template from MCP server
        const promptTemplate = await mcpActions.getPromptTemplate(promptName, {
          projectId: projectId,
          selectedEntity: selectedEntity,
          ...promptArgs,
        });

        // Populate the input field with the prompt template
        setInput(promptTemplate);

        // Focus the textarea so user can see the populated content
        if (textareaRef.current) {
          textareaRef.current.focus();
        }

        toast({
          title: "Prompt Template Loaded",
          description: `${promptName
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) =>
              l.toUpperCase()
            )} template has been loaded into the input field.`,
        });
      } catch (error) {
        console.error("Failed to load MCP prompt:", error);
        toast({
          title: "Error",
          description: "Failed to load prompt template. Please try again.",
          variant: "destructive",
        });
      }
    },
    [mcpActions, projectId, selectedEntity, toast]
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

  const handleMcpResourcesSelect = useCallback(
    (resources: McpResource[], resourceContents: Record<string, any>) => {
      setSelectedMcpResources(resources);
      setMcpResourceContents(resourceContents);

      const resourceMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📚 **MCP Resources Added**\n\nI now have access to ${
          resources.length
        } resource${resources.length !== 1 ? "s" : ""}:\n\n${resources
          .map((r) => `• **${r.name}** - ${r.description || r.uri}`)
          .join(
            "\n"
          )}\n\nI can now reference and use information from these resources in our conversation. What would you like to do with them?`,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setMessages((prev) => [...prev, resourceMessage]);

      toast({
        title: "Resources Added",
        description: `${resources.length} MCP resource${
          resources.length !== 1 ? "s" : ""
        } added to chat context`,
      });
    },
    [toast]
  );

  const handleMcpToolsSelect = useCallback(
    (tools: McpTool[]) => {
      setSelectedMcpTools(tools);

      const toolsMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🔧 **MCP Tools Enabled**\n\nI now have access to ${
          tools.length
        } tool${tools.length !== 1 ? "s" : ""}:\n\n${tools
          .map(
            (t) =>
              `• **${t.name
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}** - ${t.description}`
          )
          .join(
            "\n"
          )}\n\nI can now use these tools to perform actions and operations. Just ask me what you'd like me to do!`,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setMessages((prev) => [...prev, toolsMessage]);

      toast({
        title: "Tools Enabled",
        description: `${tools.length} MCP tool${
          tools.length !== 1 ? "s" : ""
        } enabled for AI use`,
      });
    },
    [toast]
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
              <div className="flex flex-col gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  Manga Studio
                </h2>
                <McpStatusIndicator />
              </div>
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

            {/* Side Panel Content - Only render the active tab's component to avoid infinite requests */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {(() => {
                const activeTab = sidePanelTabs.find(
                  (tab) => tab.id === sidePanel.activeTab
                );
                if (!activeTab) return null;
                const commonProps = {
                  projectId,
                  onComponentSelect: handleComponentSelect,
                  selectedEntity,
                  onEntitySelect: handleEntitySelect,
                  onAssetSelect: handleAssetSelect,
                };
                if (activeTab.id === "templates") {
                  return (
                    <EnhancedTemplateLibraryPanel
                      {...commonProps}
                      onTemplateCreate={handleTemplateCreate}
                    />
                  );
                }
                const Component = activeTab.component;
                return <Component {...commonProps} />;
              })()}
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

            {/* MCP Resources Button */}
            {mcpState.isConnected && mcpState.resources.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMcpResourcesDialog(true)}
                className="border border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">MCP Resources</span>
                  {selectedMcpResources.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-600 text-white text-xs"
                    >
                      {selectedMcpResources.length}
                    </Badge>
                  )}
                </div>
              </Button>
            )}

            {/* MCP Tools Button */}
            {mcpState.isConnected && mcpState.tools.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMcpToolsDialog(true)}
                className="border border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span className="font-medium">MCP Tools</span>
                  {selectedMcpTools.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-600 text-white text-xs"
                    >
                      {selectedMcpTools.length}
                    </Badge>
                  )}
                </div>
              </Button>
            )}

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
              {/* MCP Context Display - ADD THIS */}
              {(selectedMcpResources.length > 0 ||
                selectedMcpTools.length > 0) && (
                <div className="w-full mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <Settings className="w-3 h-3" />
                    <span className="font-medium">Active MCP Context:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMcpResources.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                      >
                        <Database className="w-3 h-3 mr-1" />
                        {selectedMcpResources.length} Resource
                        {selectedMcpResources.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {selectedMcpTools.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600"
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        {selectedMcpTools.length} Tool
                        {selectedMcpTools.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
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
              {/* MCP Prompt Button */}
              {mcpState.isConnected && mcpState.prompts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMcpPromptDialog(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title="Use MCP Prompts"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              )}
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

      {/* MCP Prompt Selector */}
      <McpPromptSelector
        isOpen={mcpPromptDialog}
        onClose={() => setMcpPromptDialog(false)}
        onPromptExecute={handleMcpPromptExecute}
        selectedEntity={selectedEntity}
        projectId={projectId}
      />
      <McpResourcesSelector
        isOpen={mcpResourcesDialog}
        onClose={() => setMcpResourcesDialog(false)}
        onResourcesSelect={handleMcpResourcesSelect}
        projectId={projectId}
      />

      {/* MCP Tools Selector */}
      <McpToolsSelector
        isOpen={mcpToolsDialog}
        onClose={() => setMcpToolsDialog(false)}
        onToolsSelect={handleMcpToolsSelect}
        projectId={projectId}
      />
    </div>
  );
}

// ============================================================================
// MANUAL PANEL GENERATOR COMPONENT
// ============================================================================
