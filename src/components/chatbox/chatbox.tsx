"use client";

import { Message } from "@/ai/adapters/type";
import { ProcessMangaRequestFlow } from "@/ai/flows/planner";
import { useToast } from "@/hooks/use-toast";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  Copy,
  FileText,
  Image,
  Plus,
  Send,
  Sparkles,
  Trash,
  User,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

// Extract the message display into its own component to optimize rendering
const MessageItem = memo(
  ({
    message,
    copiedMessageId,
    copyMessage,
  }: {
    message: Message;
    copiedMessageId: string | null;
    copyMessage: (id: string, content: string) => void;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex gap-3 group ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {message.role === "assistant" && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-xl p-3 relative ${
            message.role === "user"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
          }`}
        >
          <button
            onClick={() => copyMessage(message.id!, message.content)}
            className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              message.role === "user"
                ? "hover:bg-blue-700 text-blue-100"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            {copiedMessageId === message.id ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>

          <div className="pr-6">
            {message.role === "assistant" ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        </div>

        {message.role === "user" && (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </motion.div>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default function ChatBox() {
  const { id } = useParams();
  const { toast } = useToast();

  // Optimize store selections by extracting only what we need
  const { nodes, selectedNode, setSelectedNode } = useVisualEditorStore(
    useCallback(
      (state) => ({
        nodes: state.nodes,
        selectedNode: state.selectedNode,
        setSelectedNode: state.setSelectedNode,
      }),
      []
    )
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectLoading = !nodes.length;

  // Constants
  const MAX_MESSAGES = 10;

  // Helper function to keep only the latest 10 messages
  const keepLatestMessages = useCallback((msgs: Message[]) => {
    return msgs.length > MAX_MESSAGES ? msgs.slice(-MAX_MESSAGES) : msgs;
  }, []);

  // Memoize chapter nodes count
  const hasChapters = useMemo(() => {
    return nodes.some((node) => node.data.type?.toLowerCase() === "chapter");
  }, [nodes]);

  // Memoize suggested actions
  const suggestedActions = useMemo(() => {
    if (!selectedNode) return [];

    const nodeType = selectedNode.data.type?.toLowerCase();
    const nodeData = selectedNode.data;

    switch (nodeType) {
      case "project":
        return hasChapters
          ? [{ text: "Create next chapter", icon: Plus }]
          : [{ text: "Create first chapter", icon: Plus }];

      case "chapter": {
        const hasScenes = !!(nodeData.properties as any)?.scenes?.length;
        return [
          ...(hasScenes
            ? [
                {
                  text: "Create remaining scenes for this chapter",
                  icon: FileText,
                },
                { text: "Create next scene for this chapter", icon: Plus },
              ]
            : [
                { text: "Create all scenes for this chapter", icon: FileText },
                { text: "Create first scene for this chapter", icon: Plus },
              ]),
          { text: "Delete this chapter", icon: Trash },
        ];
      }

      case "scene": {
        const hasPanels = !!(nodeData.properties as any)?.panels?.length;
        return [
          ...(hasPanels
            ? [
                {
                  text: "Create remaining panels for this scene with dialogs",
                  icon: FileText,
                },
                { text: "Create next panel with dialogs", icon: Plus },
              ]
            : [
                {
                  text: "Create all panels for this scene with dialogs",
                  icon: FileText,
                },
                { text: "Create first panel with dialogs", icon: Plus },
              ]),
          { text: "Delete this scene", icon: Trash },
        ];
      }

      case "panel":
        return [
          { text: "Generate image for this panel", icon: Image },
          { text: "Create dialogs for this panel", icon: FileText },
          { text: "Delete this panel", icon: Trash },
        ];

      case "dialog":
        return [
          { text: "Edit this dialog", icon: FileText },
          { text: "Delete this dialog", icon: Trash },
        ];

      case "character":
        return [
          { text: "Generate image for this character", icon: Image },
          { text: "Delete this character", icon: Trash },
        ];

      default:
        return [];
    }
  }, [selectedNode, hasChapters]);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`messages-${id}`);
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(keepLatestMessages(parsed));
    } else {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Hello! I'm your AI manga assistant. How can I help with your project today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [id, keepLatestMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle sending messages
  const handleSend = useCallback(
    async (messageText: string) => {
      const textToSend = typeof messageText === "string" ? messageText : input;
      if (!textToSend.trim() || isLoading || projectLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: textToSend,
        timestamp: new Date().toISOString(),
      };
      const prevMessages = [...messages];
      const updatedMessages = keepLatestMessages([...messages, userMessage]);
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const response = await ProcessMangaRequestFlow({
          userInput: textToSend,
          selectedNode: selectedNode
            ? {
                id: selectedNode.id,
                type: selectedNode.data.type,
                date: selectedNode.data,
              }
            : undefined,
          projectId: id as string,
          prevChats: prevMessages,
        });

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = keepLatestMessages([
          ...updatedMessages,
          aiMessage,
        ]);
        setMessages(finalMessages);
        localStorage.setItem(`messages-${id}`, JSON.stringify(finalMessages));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to get AI response",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      isLoading,
      projectLoading,
      messages,
      selectedNode,
      id,
      toast,
      keepLatestMessages,
    ]
  );

  // Stable input handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSend(input);
    },
    [handleSend, input]
  );

  const handleSuggestionClick = useCallback(
    (suggestionText: string) => {
      handleSend(suggestionText);
    },
    [handleSend]
  );

  const copyMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        toast({
          title: "Copied!",
          description: "Message copied to clipboard",
        });
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy message",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Manga AI Assistant
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ready to help with your project
            </p>
          </div>
        </div>
      </div>

      {/* Selected Node Indicator */}
      {selectedNode && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm text-blue-800 dark:text-blue-200 truncate flex-1">
            Editing: {selectedNode.data.label}
          </span>
          <button
            onClick={clearSelection}
            className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50"
          >
            <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      )}

      {suggestedActions.length > 0 && (
        <div className="flex justify-center px-4 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="w-full max-w-md">
            <div className="text-base font-semibold text-center text-gray-700 dark:text-gray-200 mb-4">
              Quick Actions
            </div>
            <div className="flex flex-col gap-3">
              {suggestedActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(action.text)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <IconComponent className="w-5 h-5" />
                    {action.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              copiedMessageId={copiedMessageId}
              copyMessage={copyMessage}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 rounded-full border-2 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin"></div>
                Thinking...
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              projectLoading
                ? "Loading project..."
                : selectedNode
                ? `Ask about ${selectedNode.data.label}...`
                : "Ask about your manga project..."
            }
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-800 dark:text-white"
            disabled={isLoading || projectLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || projectLoading}
            className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center disabled:opacity-50 transition-all hover:shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
