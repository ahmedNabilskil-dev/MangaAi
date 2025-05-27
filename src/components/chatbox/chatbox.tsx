"use client";

import { ProcessMangaRequestFlow } from "@/ai/flows/planner";
import { useToast } from "@/hooks/use-toast";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function EnhancedChatbox() {
  const { id } = useParams();
  const { toast } = useToast();
  const { nodes, selectedNode, setSelectedNode } = useVisualEditorStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const projectLoading = !nodes.length;

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("manga-chat-messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content:
            "Hello! I'm your AI manga assistant. How can I help with your project today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle sending messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || projectLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Process AI response
      const response = await ProcessMangaRequestFlow({
        userInput: input,
        selectedNode: selectedNode
          ? {
              id: selectedNode.id,
              type: selectedNode.data.type,
              date: selectedNode.data,
            }
          : undefined,
        projectId: id,
      });

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      localStorage.setItem(
        "manga-chat-messages",
        JSON.stringify(finalMessages)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selected node
  const clearSelection = () => {
    setSelectedNode(null);
  };

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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                }`}
              >
                <p className="text-sm dark:text-gray-100">{message.content}</p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
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
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
