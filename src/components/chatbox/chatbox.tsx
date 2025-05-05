
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User, Loader2, Wand2, Pencil, X, ChevronDown, ChevronUp, Minus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useVisualEditorStore } from '@/store/visual-editor-store';
import { useEditorStore } from '@/store/editor-store'; // For fabric shape selection
import { cn } from '@/lib/utils';

// Import the central orchestration flow function
import { processUserPrompt } from '@/ai/flows/orchestration-flow';
import type { NodeType } from '@/types/nodes'; // For Flow node types
import type { ShapeConfig } from '@/types/editor'; // For Fabric shape types

// Import function from the abstract data service to get project context
import { getDefaultProject } from '@/services/data-service';

interface Message {
    id: string;
    text: string | React.ReactNode; // Allow React nodes for rich responses
    sender: 'user' | 'ai';
    isThinking?: boolean;
}

const chatboxVariants = {
    open: {
        opacity: 1,
        y: 0,
        height: 'auto', // Let content define height when open
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
        opacity: 1,
        y: 0,
        height: '52px', // Fixed height when minimized
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

const HEADER_HEIGHT = '52px'; // Approx height of header + border

export default function Chatbox() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    // Get selected items from both stores
    const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);
    const selectedShapeId = useEditorStore((state) => state.selectedShapeId); // Fabric shape ID
    const selectedShape = useEditorStore((state) => state.pages.flatMap(p => p.shapes).find(s => s.id === selectedShapeId));

    // Determine the currently selected item (Flow node takes precedence for now if both are selected)
    const selectedItemId = selectedFlowNode?.id ?? selectedShapeId ?? null;
    const selectedItemType = selectedFlowNode?.data?.type ?? selectedShape?.type ?? null;

    const clearFlowNodeSelection = useVisualEditorStore((state) => state.setSelectedNode);
    const clearShapeSelection = useEditorStore((state) => state.setSelectedShapeId);
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Trigger flow refresh

    // ---- Project Context ----
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [projectLoading, setProjectLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            setProjectLoading(true);
            try {
                const project = await getDefaultProject();
                if (project) {
                    setCurrentProjectId(project.id);
                    console.log("Chatbox: Project context loaded - ID:", project.id);
                } else {
                    console.error("Chatbox: Could not load default project for context.");
                    toast({ title: "Error", description: "Could not load project context for AI.", variant: "destructive" });
                }
            } catch (error) {
                console.error("Chatbox: Error fetching project context:", error);
                toast({ title: "Error", description: "Failed to fetch project context.", variant: "destructive" });
            } finally {
                setProjectLoading(false);
            }
        };
        fetchProject();
    }, [toast]);
    // ---- End Context ----

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            const viewport = viewportRef.current;
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 50);
    }, []);

    useEffect(() => {
        if (!isMinimized && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isMinimized, scrollToBottom]);

    // --- Send user input to the central orchestration flow ---
    const processUserInput = async (userInput: string) => {
        if (!currentProjectId && !(userInput.toLowerCase().startsWith('create project'))) {
             toast({ title: "Error", description: "Project context not loaded. Cannot process command.", variant: "destructive" });
             setIsLoading(false);
             return; // Usually need project context
        }

        setIsLoading(true);
        const thinkingId = Date.now().toString() + '-think';
        setMessages((prev) => [...prev, { id: thinkingId, text: 'Thinking...', sender: 'ai', isThinking: true }]);
        scrollToBottom();

        let finalResponse: Message | null = null;

        try {
            console.log("Chatbox: Sending prompt to orchestration flow:", userInput);
            const result = await processUserPrompt({
                prompt: userInput,
                projectId: currentProjectId,
                selectedItemId: selectedItemId,
                selectedItemType: selectedItemType as string | undefined, // Pass type as string
            });
            console.log("Chatbox: Received result from orchestration flow:", result);

            finalResponse = { id: Date.now().toString(), text: result.aiResponse, sender: 'ai' };

            // Handle side effects based on the result
            if (result.requiresRefresh) {
                 console.log("Chatbox: Orchestration result requires refresh.");
                 // Determine which refresh to call (Flow or Fabric)
                 // For now, assume Flow refresh covers most backend data changes
                 refreshFlowData();
                 // Optionally trigger Fabric refresh if result indicates shape changes
                 // useEditorStore.getState().forceUpdate(); // Add forceUpdate if needed
            }

             // Clear selection if an update was successful or context changed significantly
             if (result.actionTaken === 'tool_used' && result.toolName?.startsWith('update') && result.toolOutput?.success) {
                 clearFlowNodeSelection(null);
                 clearShapeSelection(null);
             }
             if (result.actionTaken === 'selection_needed') {
                // Don't clear selection if AI needs it
             }

        } catch (error: any) {
            console.error('Chatbox: Error calling processUserPrompt flow:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast({
                title: "AI Error",
                description: `Failed to process request: ${errorMessage}`,
                variant: "destructive",
            });
            finalResponse = { id: Date.now().toString(), text: `Sorry, I encountered an error: ${errorMessage}`, sender: 'ai' };
        } finally {
             setMessages((prev) => {
                return prev.map(msg => msg.id === thinkingId ? (finalResponse ?? { id: thinkingId, text: '...', sender: 'ai' }) : msg)
                           .filter(msg => !(msg.id === thinkingId && !finalResponse)); // Remove thinking if no response
            });

            setIsLoading(false);
            scrollToBottom();
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || projectLoading) return;

        if (isMinimized) {
            setIsMinimized(false);
             await new Promise(resolve => setTimeout(resolve, 50)); // Wait for animation
        }

        const userMessageText = input;
        const userMessage: Message = { id: Date.now().toString(), text: userMessageText, sender: 'user' };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        scrollToBottom();

        await processUserInput(userMessageText);
    };

    const handleClearSelection = () => {
        clearFlowNodeSelection(null);
        clearShapeSelection(null);
    };

     const placeholderText = projectLoading
        ? "Loading project context..."
        : selectedItemId
        ? `Editing ${selectedItemType} "${(selectedFlowNode?.data?.label || selectedShape?.id)?.substring(0, 20)}..."`
        : "Ask AI to create, edit, or describe manga elements...";


    return (
        <motion.div
            layout
            animate={isMinimized ? "closed" : "open"}
            variants={chatboxVariants}
            initial={false} // Start based on current state (open)
            className={cn(
                "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80",
                "resizable-chat", // Keep resizable class
                "max-h-[80vh]"
            )}
             style={{
                 width: '500px', // Default width
                 position: 'absolute', // Needed for Draggable
                 resize: 'both',
                 overflow: 'auto',
             }}
        >
            {/* Header */}
            <div className="chatbox-drag-handle flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/80 shrink-0 cursor-grab active:cursor-grabbing" style={{ height: HEADER_HEIGHT }}>
                 <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical size={14} />
                    <h3 className="text-sm font-medium">AI Assistant</h3>
                 </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsMinimized(!isMinimized)}
                    aria-label={isMinimized ? "Maximize Chat" : "Minimize Chat"}
                >
                    {isMinimized ? <ChevronUp size={16} /> : <Minus size={16} />}
                </Button>
            </div>

            {/* Content Area */}
            <AnimatePresence initial={false}>
                {!isMinimized && (
                    <motion.div
                        key="chat-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-grow min-h-0 overflow-hidden"
                    >
                        {/* Message Area */}
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                            <ScrollAreaViewport ref={viewportRef} className="h-full w-full">
                                <AnimatePresence initial={false}>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: message.sender === 'ai' ? -10 : 10 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex gap-3 my-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.sender === 'ai' && (
                                                <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        <Bot size={18} />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={cn(
                                                    "rounded-lg p-2.5 max-w-[80%] text-sm shadow-sm break-words",
                                                    message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
                                                    message.isThinking && 'italic text-muted-foreground'
                                                )}
                                            >
                                                {message.isThinking ? (
                                                     <div className="flex items-center gap-2">
                                                         <Loader2 className="h-4 w-4 animate-spin" />
                                                         {typeof message.text === 'string' ? message.text : 'Processing...'}
                                                     </div>
                                                ) : (
                                                    message.text
                                                )}
                                            </div>
                                            {message.sender === 'user' && (
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarFallback>
                                                        <User size={18} />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                           </ScrollAreaViewport>
                        </ScrollArea>

                         {/* Selected Item Indicator */}
                        {selectedItemId && (
                            <div className="p-2 border-t border-border bg-background/80 text-xs text-muted-foreground flex items-center gap-2 justify-center shrink-0">
                                <Pencil size={14} className="text-primary shrink-0" />
                                <span>Editing: <span className="font-medium text-foreground">{(selectedFlowNode?.data?.label || selectedShape?.id || 'Item')?.substring(0, 20)}</span> ({selectedItemType})</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={handleClearSelection} title="Clear selection">
                                    <X size={14} />
                                    <span className="sr-only">Clear Selection</span>
                                </Button>
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 border-t border-border bg-background/80 flex items-center gap-2 shrink-0">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={placeholderText}
                                className="flex-grow bg-input focus-visible:ring-primary text-sm"
                                disabled={isLoading || projectLoading}
                                aria-label="Chat input"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || projectLoading || !input.trim()} className="bg-primary hover:bg-primary/90 shrink-0">
                                {isLoading || projectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                     </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
