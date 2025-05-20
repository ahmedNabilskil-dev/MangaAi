"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronUp,
  GripVertical,
  Loader2,
  Minus,
  Pencil,
  SendHorizonal,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Utilities and stores
import { cn } from "@/lib/utils";
import { useVisualEditorStore } from "@/store/visual-editor-store";

// Services and types
import { ProcessMangaRequestFlow } from "@/ai/flows/planner";
import { NodeData } from "@/types/nodes";
import { useParams } from "next/navigation";
import { Edge, Node } from "reactflow";

// Constants
const HEADER_HEIGHT = 52;
const DEFAULT_WIDTH = 500;
const MIN_HEIGHT = 300;
const THINKING_MESSAGE = "Thinking...";

// Types
export type Message = {
  role: "user" | "assistant" | "function";
  content: any;
  imageUrl?: string;
  isThinking?: boolean;
};

/**
 * ChatboxHeader component
 */
interface ChatboxHeaderProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const ChatboxHeader: React.FC<ChatboxHeaderProps> = ({
  isMinimized,
  onToggleMinimize,
}) => (
  <div
    className="chatbox-drag-handle flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/80 shrink-0 cursor-grab active:cursor-grabbing"
    style={{ height: `${HEADER_HEIGHT}px` }}
  >
    <div className="flex items-center gap-1 text-muted-foreground">
      <GripVertical size={14} />
      <h3 className="text-sm font-medium">AI Assistant</h3>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={onToggleMinimize}
      aria-label={isMinimized ? "Maximize Chat" : "Minimize Chat"}
    >
      {isMinimized ? <ChevronUp size={16} /> : <Minus size={16} />}
    </Button>
  </div>
);

/**
 * Message component
 */
interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => (
  <motion.div
    key={`${message.role}-${Date.now()}`}
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: message.role === "assistant" ? -10 : 10 }}
    transition={{ duration: 0.2 }}
    className={`flex gap-3 my-3 ${
      message.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    {message.role === "assistant" && (
      <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot size={18} />
        </AvatarFallback>
      </Avatar>
    )}

    <div
      className={cn(
        "rounded-lg p-2.5 max-w-[80%] text-sm shadow-sm break-words",
        message.role === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
        message.isThinking && "italic text-muted-foreground"
      )}
    >
      {message.isThinking ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {typeof message.content === "string"
            ? message.content
            : "Processing..."}
        </div>
      ) : typeof message.content === "string" ? (
        message.content
      ) : (
        JSON.stringify(message.content)
      )}

      {message.imageUrl && (
        <img
          src={message.imageUrl}
          alt="Message attachment"
          className="mt-2 rounded-md max-w-full h-auto"
        />
      )}
    </div>

    {message.role === "user" && (
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          <User size={18} />
        </AvatarFallback>
      </Avatar>
    )}
  </motion.div>
);

/**
 * SelectedItemIndicator component
 */
interface SelectedItemIndicatorProps {
  itemId: string | null;
  itemType: string | null;
  itemLabel: string | null;
  onClearSelection: () => void;
}

const SelectedItemIndicator: React.FC<SelectedItemIndicatorProps> = ({
  itemId,
  itemType,
  itemLabel,
  onClearSelection,
}) => {
  if (!itemId) return null;

  return (
    <div className="p-2 border-t border-border bg-background/80 text-xs text-muted-foreground flex items-center gap-2 justify-center shrink-0">
      <Pencil size={14} className="text-primary shrink-0" />
      <span>
        Editing:{" "}
        <span className="font-medium text-foreground">
          {(itemLabel || "Item")?.substring(0, 20)}
        </span>{" "}
        ({itemType})
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 ml-auto"
        onClick={onClearSelection}
        title="Clear selection"
      >
        <X size={14} />
        <span className="sr-only">Clear Selection</span>
      </Button>
    </div>
  );
};

/**
 * InputForm component
 */
interface InputFormProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  isProjectLoading: boolean;
  placeholderText: string;
  onSubmit: (e: React.FormEvent) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  input,
  setInput,
  isLoading,
  isProjectLoading,
  placeholderText,
  onSubmit,
}) => (
  <form
    onSubmit={onSubmit}
    className="p-3 border-t border-border bg-background/80 flex items-center gap-2 shrink-0"
  >
    <Input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={placeholderText}
      className="flex-grow bg-input focus-visible:ring-primary text-sm"
      disabled={isLoading || isProjectLoading}
      aria-label="Chat input"
    />
    <Button
      type="submit"
      size="icon"
      disabled={isLoading || isProjectLoading || !input.trim()}
      className="bg-primary hover:bg-primary/90 shrink-0"
    >
      {isLoading || isProjectLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <SendHorizonal className="h-4 w-4" />
      )}
      <span className="sr-only">Send</span>
    </Button>
  </form>
);
/**
 * Main Chatbox component
 */
export default function Chatbox() {
  // Store hooks
  const { id } = useParams();
  const { nodes } = useVisualEditorStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const projectLoading = !nodes.length;
  const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);
  const clearFlowNodeSelection = useVisualEditorStore(
    (state) => state.setSelectedNode
  );

  // State
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: MIN_HEIGHT,
  });

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);

  // Utilities
  const { toast } = useToast();

  // Derived state
  const selectedItemId = selectedFlowNode?.id ?? null;
  const selectedItemType = selectedFlowNode?.data?.type ?? null;
  const selectedItemLabel = selectedFlowNode?.data?.label || null;

  useEffect(() => {
    const storedMessages =
      (JSON.parse(
        localStorage.getItem("messages") || JSON.stringify([])
      ) as Message[]) || [];
    setMessages(storedMessages);
  }, []);

  /**
   * Handle scrolling to bottom of chat
   */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  }, []);

  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
    if (!isMinimized && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isMinimized, scrollToBottom]);

  const processUserInput = async (userInput: string) => {
    setIsLoading(true);

    scrollToBottom();
    let finalResponse: Message | null = null;

    try {
      const res = await ProcessMangaRequestFlow({
        userInput,
        selectedNode: selectedFlowNode
          ? {
              id: selectedItemId,
              type: selectedItemType,
              date: selectedFlowNode.data,
            }
          : undefined,
        projectId: id as string,
      });
      finalResponse = {
        role: "assistant",
        content: res.message,
      };
    } catch (error: any) {
      console.error("Chatbox: Error calling processUserPrompt flow:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";

      toast({
        title: "AI Error",
        description: `Failed to process request: ${errorMessage}`,
        variant: "destructive",
      });

      finalResponse = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}`,
      };
    } finally {
      if (finalResponse) {
        localStorage.setItem(
          "messages",
          JSON.stringify([...messages, finalResponse as Message])
        );
        setMessages((prev) => [...prev, finalResponse as Message]);
      }
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || projectLoading) return;

    // Maximize chat if minimized
    if (isMinimized) {
      setIsMinimized(false);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    scrollToBottom();

    // Process the input
    await processUserInput(input);
  };

  const handleClearSelection = () => {
    clearFlowNodeSelection(null);
  };

  const getPlaceholderText = () => {
    if (projectLoading) {
      return "Loading project context...";
    }

    if (selectedItemId) {
      return `Editing ${selectedItemType} "${selectedItemLabel?.substring(
        0,
        20
      )}..."`;
    }

    return "Ask AI to create, edit, or describe manga elements...";
  };

  const placeholderText = getPlaceholderText();
  return (
    <TooltipProvider>
      <motion.div
        ref={chatboxRef}
        className={cn(
          "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80",
          "resizable-chat",
          "max-h-[80vh]"
        )}
        style={{
          width: `${dimensions.width}px`,
          height: isMinimized ? `${HEADER_HEIGHT}px` : `${dimensions.height}px`,
          minWidth: "300px",
          minHeight: `${HEADER_HEIGHT}px`,
          position: "absolute",
          resize: isMinimized ? "none" : "both",
          overflow: "hidden",
        }}
        animate={{
          height: isMinimized ? HEADER_HEIGHT : dimensions.height,
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        {/* Header */}
        <ChatboxHeader
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized(!isMinimized)}
        />

        {/* Content Area */}
        {!isMinimized && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Message Area */}
            <ScrollArea
              className="flex-1 p-4 overflow-y-auto"
              ref={scrollAreaRef}
            >
              <AnimatePresence>
                {messages.map((message, i) => (
                  <MessageItem key={i} message={message} />
                ))}
                {isLoading && (
                  <MessageItem
                    message={{
                      role: "assistant",
                      isThinking: true,
                      content: THINKING_MESSAGE,
                    }}
                  />
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Selected Item Indicator */}
            <SelectedItemIndicator
              itemId={selectedItemId}
              itemType={selectedItemType}
              itemLabel={selectedItemLabel}
              onClearSelection={handleClearSelection}
            />

            {/* Input Area */}
            <InputForm
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              isProjectLoading={projectLoading}
              placeholderText={placeholderText}
              onSubmit={handleSend}
            />
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}

/**
 * Utility function to build a manga context tree from flow nodes and edges
 */
type TreeNode = Node<NodeData> & { children: TreeNode[] };

export function buildMangaContextTree(nodes: Node<NodeData>[], edges: Edge[]) {
  const nodeMap = new Map<string, TreeNode>();

  // Initialize map with empty children arrays
  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  // Populate parent → child relationships
  for (const edge of edges) {
    const parent = nodeMap.get(edge.source);
    const child = nodeMap.get(edge.target);
    if (parent && child) {
      parent.children.push(child);
    }
  }

  // Find root project node (not a target of any edge)
  const allTargetIds = new Set(edges.map((e) => e.target));
  const root = nodes.find(
    (n) => !allTargetIds.has(n.id) && n.data.type === "project"
  );

  if (!root) throw new Error("No root project node found");

  const buildTree = (node: TreeNode): any => {
    const base = {
      id: node.id,
      type: node.data.type,
      label: node.data.label,
      properties: node.data.properties,
    };

    switch (node.data.type) {
      case "project":
        return { ...base, chapters: node.children.map(buildTree) };
      case "chapter":
        return { ...base, scenes: node.children.map(buildTree) };
      case "scene":
        return { ...base, panels: node.children.map(buildTree) };
      case "panel":
        return { ...base, dialogues: node.children.map(buildTree) };
      case "dialogue":
        return base;
      case "character":
        return null; // Optional handling
      default:
        return base;
    }
  };

  return buildTree(nodeMap.get(root.id)!);
}
