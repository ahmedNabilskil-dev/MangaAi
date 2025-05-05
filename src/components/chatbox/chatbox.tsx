
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
import { cn } from '@/lib/utils';

// Import Genkit flow functions
import { createChapterFromPrompt } from '@/ai/flows/create-chapter-from-prompt';
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas';
import { updateEntity } from '@/ai/flows/update-entity-flow';
import type { NodeType } from '@/types/nodes';
import { db, getDefaultProject } from '@/services/db'; // Import Dexie DB service
import { askGeneralAssistant } from '@/ai/assistant'; // Import the abstract assistant function


interface Message {
    id: string;
    text: string | React.ReactNode;
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
    const selectedNode = useVisualEditorStore((state) => state.selectedNode);
    const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode);
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Trigger refresh

    // ---- Project Context ----
    // Fetch the default project ID and title dynamically
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [currentProjectTitle, setCurrentProjectTitle] = useState<string | null>(null);
    const [projectLoading, setProjectLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            setProjectLoading(true);
            try {
                const project = await getDefaultProject();
                if (project) {
                    setCurrentProjectId(project.id);
                    setCurrentProjectTitle(project.title);
                } else {
                    console.error("Could not load default project for chat context.");
                     toast({ title: "Error", description: "Could not load project context for AI.", variant: "destructive" });
                }
            } catch (error) {
                console.error("Error fetching project context:", error);
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
        }, 50); // Short delay to ensure DOM update
    }, []);


    useEffect(() => {
        if (!isMinimized && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isMinimized, scrollToBottom]);

    const processUserInput = async (userInput: string) => {
        if (!currentProjectId) {
             toast({ title: "Error", description: "Project context not loaded. Cannot process command.", variant: "destructive" });
             setIsLoading(false);
             return; // Need project context for most operations
        }

        setIsLoading(true);
        const thinkingId = Date.now().toString() + '-think';
        setMessages((prev) => [...prev, { id: thinkingId, text: 'Thinking...', sender: 'ai', isThinking: true }]);
        scrollToBottom(); // Scroll down when thinking message appears

        let aiResponse: Message | null = null;
        let actionTaken = false;

        try {
             // --- Command Interpretation ---

             // 1. Creation Commands (No selection needed)
             if (userInput.toLowerCase().startsWith('create chapter')) {
                 actionTaken = true;
                 const match = userInput.match(/create chapter (\d+)\s+titled\s+["']?([^"']+)["']?\s*(?:about|:)?\s*(.*)/i);
                 if (match) {
                    const [, chapterNum, title, prompt] = match;
                    toast({ title: "AI Action", description: `Creating Chapter ${chapterNum}: ${title}...` });
                    const result = await createChapterFromPrompt({
                        projectId: currentProjectId, // Use fetched project ID
                        chapterNumber: parseInt(chapterNum, 10),
                        chapterTitle: title.trim(),
                        prompt: prompt.trim() || `Create content for ${title}`,
                    });
                     aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                         <div>
                             <p>✅ Chapter "{title}" (ID: {result.chapterId?.substring(0, 8)}...) created!</p>
                             <p>   - Scenes created: {result.sceneIds.length}</p>
                             {result.panelIds && result.panelIds.length > 0 && <p>   - Panels created: {result.panelIds.length}</p>}
                             {result.dialogueIds && result.dialogueIds.length > 0 && <p>   - Dialogues created: {result.dialogueIds.length}</p>}
                             {result.characterIds && result.characterIds.length > 0 && <p className="text-xs italic">   - Characters created/assigned: {result.characterIds.length}</p>}
                         </div>
                     )};
                     refreshFlowData(); // Refresh editor
                 } else {
                      aiResponse = { id: Date.now().toString(), sender: 'ai', text: "Please use the format: 'create chapter [number] titled \"[Title]\" about [prompt]'." };
                 }

             } else if (userInput.toLowerCase().startsWith('brainstorm character') || userInput.toLowerCase().startsWith('suggest character')) {
                  actionTaken = true;
                 const match = userInput.match(/(?:brainstorm|suggest) character ideas?(?:\s+for\s+(.+))?/i);
                 const prompt = match?.[1]?.trim() || 'general manga';
                 toast({ title: "AI Action", description: "Brainstorming character ideas..." });
                 const result = await brainstormCharacterIdeas({
                     projectId: currentProjectId, // Provide project context
                     projectTitle: currentProjectTitle ?? undefined, // Optional title context
                     prompt: `Brainstorm characters for: ${prompt}`,
                 });
                 aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                     <div>
                         <p>💡 Here are some character ideas:</p>
                         <ul className="list-disc list-inside ml-4 text-sm">
                             {result.characterIdeas.map((idea, index) => (
                                 <li key={index}><strong>{idea.name || 'Unnamed'}:</strong> {idea.briefDescription} {idea.role && `(${idea.role})`}</li>
                             ))}
                         </ul>
                     </div>
                 )};
                 // Note: Brainstorming doesn't automatically add characters yet.

             // 2. Update Command (*Requires* a selected node)
             } else if (selectedNode && selectedNode.data?.properties?.id && selectedNode.data.type) {
                  actionTaken = true;
                  const entityId = selectedNode.data.properties.id; // Dexie ID
                  const entityType = selectedNode.data.type as NodeType;

                  // Check if the input seems like an update command
                  if (['change', 'update', 'edit', 'set', 'add', 'remove'].some(keyword => userInput.toLowerCase().startsWith(keyword))) {
                      toast({ title: "AI Action", description: `Updating ${entityType} "${selectedNode.data.label}"...` });

                      const result = await updateEntity({
                          entityType: entityType,
                          entityId: entityId,
                          prompt: userInput,
                          projectId: currentProjectId, // Pass project context
                      });

                      aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                          <div>
                              <p>{result.success ? '✅' : '⚠️'} Update for {entityType} (ID: {result.updatedEntityId?.substring(0, 8)}...) processed.</p>
                              <p className="text-xs italic">{result.message}</p>
                          </div>
                      )};
                      if (result.success) {
                          refreshFlowData(); // Refresh editor
                          setSelectedNode(null); // Clear selection after update
                      }
                  } else {
                       actionTaken = false;
                       console.log("Input given while node selected, but not an update command. Passing to general assistant.");
                  }

             // 3. General Assistant Fallback
             }

             // If no specific action was taken, use the general assistant
             if (!actionTaken) {
                 const generalResponseText = await askGeneralAssistant(userInput, currentProjectId); // Pass project ID
                 aiResponse = { id: Date.now().toString(), text: generalResponseText, sender: 'ai' };
             }

        } catch (error: any) {
            console.error('Error processing AI command:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast({
                title: "AI Error",
                description: `Failed to process request: ${errorMessage}`,
                variant: "destructive",
            });
            aiResponse = { id: Date.now().toString(), text: `Sorry, I encountered an error: ${errorMessage}`, sender: 'ai' };
        } finally {
             setMessages((prev) => {
                return prev.map(msg => msg.id === thinkingId ? (aiResponse ?? { id: thinkingId, text: '...', sender: 'ai' }) : msg)
                           .filter(msg => !(msg.id === thinkingId && !aiResponse));
            });

            setIsLoading(false);
            scrollToBottom(); // Scroll down after response is added
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
        scrollToBottom(); // Scroll down after user message is added

        await processUserInput(userMessageText);
    };

     const placeholderText = projectLoading
        ? "Loading project context..."
        : selectedNode
        ? `Editing ${selectedNode.data.type} "${selectedNode.data.label}"...`
        : "Ask AI: 'create chapter 1 titled...' or 'brainstorm characters...'";


    return (
        <motion.div
            layout
            animate={isMinimized ? "closed" : "open"}
            variants={chatboxVariants}
            initial={false}
            className={cn(
                "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80",
                "resizable-chat", // Keep resizable class if needed for styling handles
                // Remove explicit height settings, let variants control it
                 "max-h-[80vh]" // Keep max-height constraint
            )}
             style={{
                 // Width can still be managed by resizable-chat class/JS if implemented
                 width: '500px', // Default width, can be overridden by resize handles
                 position: 'absolute', // Required for Draggable
                 resize: 'both', // Enable browser's native resize
                 overflow: 'auto', // Important for resize to work
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
                        className="flex flex-col flex-grow min-h-0 overflow-hidden" // Important for flex layout with scroll
                    >
                        {/* Message Area */}
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                            {/* Viewport needs ref for scrolling */}
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
                                                <Avatar className="h-8 w-8 border border-primary/20 shrink-0"> {/* Added shrink-0 */}
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        <Bot size={18} />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={`rounded-lg p-2.5 max-w-[80%] text-sm shadow-sm break-words ${message.sender === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-secondary text-secondary-foreground'
                                                    } ${message.isThinking ? 'italic text-muted-foreground' : ''}`}
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
                                                <Avatar className="h-8 w-8 shrink-0"> {/* Added shrink-0 */}
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
                        {selectedNode && (
                            <div className="p-2 border-t border-border bg-background/80 text-xs text-muted-foreground flex items-center gap-2 justify-center shrink-0">
                                <Pencil size={14} className="text-primary shrink-0" />
                                <span>Editing: <span className="font-medium text-foreground">{selectedNode.data.label}</span> ({selectedNode.data.type})</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setSelectedNode(null)} title="Clear selection">
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
