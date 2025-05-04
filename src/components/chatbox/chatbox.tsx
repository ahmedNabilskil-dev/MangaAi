
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User, Loader2, Wand2, Pencil, X, ChevronDown, ChevronUp, Minus, GripVertical } from 'lucide-react'; // Added GripVertical
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area'; // Import ScrollAreaViewport
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import store
import { cn } from '@/lib/utils'; // Import cn utility

// Import Genkit flow functions
import { createChapterFromPrompt } from '@/ai/flows/create-chapter-from-prompt';
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas';
import { updateEntity } from '@/ai/flows/update-entity-flow';
import type { NodeType } from '@/types/nodes';
// Import the default project ID from the constants file
import { DEFAULT_PROJECT_ID } from '@/config/constants';

// Placeholder for the general assistant
async function askGeneralAssistant(message: string): Promise<string> {
    console.log('Sending to General AI:', message);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello there! How can I help you create or edit your manga today using the in-memory store?";
    } else if (message.toLowerCase().includes('help')) {
        return "I can help create chapters, scenes, panels, characters, dialogues, or brainstorm ideas. Try 'create chapter 1 titled...' or 'brainstorm characters...'. To edit a specific item (like changing a scene's setting), please select it first in the editor.";
    }
    // Provide clearer guidance if an update-like command is used without selection
    if (['change', 'update', 'edit', 'set', 'add', 'remove'].some(keyword => message.toLowerCase().startsWith(keyword))) {
         return "To modify a specific item (e.g., change a description, add a character to a panel), please select it in the visual editor first. Otherwise, tell me what you'd like to create or brainstorm.";
    }
    return `I received: "${message}". I can assist with manga creation tasks like generating chapters, scenes, characters, etc., interacting with the in-memory store. Use commands like 'create ...' or 'brainstorm ...'. Select an item if you want to edit it.`;
}


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
        height: '450px', // Max height when open
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
        opacity: 1,
        y: 0,
        height: '60px', // Height when minimized (adjust as needed)
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

export default function Chatbox() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false); // State for minimize/maximize
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport element
    const selectedNode = useVisualEditorStore((state) => state.selectedNode);
    const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode);
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData);

    // ---- Project Context ----
    const currentProjectId = DEFAULT_PROJECT_ID; // Use the default ID from constants
    const currentProjectTitle = 'My First Manga Project'; // Hardcoded for now, could fetch if needed
    // ---- End Context ----

    const scrollToBottom = useCallback(() => {
        // Ensure this runs after the DOM has updated
        setTimeout(() => {
            const viewport = viewportRef.current;
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            } else {
                // Fallback if viewportRef isn't set yet (less likely but possible)
                const scrollArea = scrollAreaRef.current;
                if (scrollArea) {
                    // Try to query the viewport element inside ScrollArea
                     const viewportEl = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
                     if (viewportEl) {
                         viewportEl.scrollTop = viewportEl.scrollHeight;
                     }
                }
            }
        }, 50); // Small delay to ensure DOM update
    }, []);


    useEffect(() => {
        // Scroll to bottom whenever messages change and chatbox is not minimized
        if (!isMinimized && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isMinimized, scrollToBottom]);

    const processUserInput = async (userInput: string) => {
        // No need to check project ID existence for in-memory

        setIsLoading(true);
        const thinkingId = Date.now().toString() + '-think';
        setMessages((prev) => [...prev, { id: thinkingId, text: 'Thinking...', sender: 'ai', isThinking: true }]);
        // scrollToBottom(); // Scroll is handled by useEffect

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
                        projectId: currentProjectId, // Use default project ID
                        chapterNumber: parseInt(chapterNum, 10),
                        chapterTitle: title.trim(),
                        prompt: prompt.trim() || `Create content for ${title}`,
                    });
                     aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                         <div>
                             <p>✅ Chapter "{title}" (ID: {result.chapterId?.substring(0, 6)}...) created!</p>
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
                     projectTitle: currentProjectTitle, // Optional title context
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
                  const entityId = selectedNode.data.properties.id; // In-memory ID
                  const entityType = selectedNode.data.type as NodeType;

                  // Check if the input seems like an update command
                  if (['change', 'update', 'edit', 'set', 'add', 'remove'].some(keyword => userInput.toLowerCase().startsWith(keyword))) {
                      toast({ title: "AI Action", description: `Updating ${entityType} "${selectedNode.data.label}"...` });

                      const result = await updateEntity({
                          entityType: entityType,
                          entityId: entityId,
                          prompt: userInput,
                          projectId: currentProjectId, // Pass default project context
                      });

                      aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                          <div>
                              <p>{result.success ? '✅' : '⚠️'} Update for {entityType} (ID: {result.updatedEntityId?.substring(0, 6)}...) processed.</p>
                              <p className="text-xs italic">{result.message}</p>
                          </div>
                      )};
                      if (result.success) {
                          refreshFlowData(); // Refresh editor
                          setSelectedNode(null); // Clear selection after update
                      }
                  } else {
                       // Input was given while a node was selected, but it wasn't an obvious update command
                       // Treat as general query, but maybe add context? Or just let general assistant handle it.
                       actionTaken = false; // Fall through to general assistant
                       console.log("Input given while node selected, but not an update command. Passing to general assistant.");
                  }

             // 3. General Assistant Fallback (No selection or not an update command)
             }

             // If no specific action was taken above, use the general assistant
             if (!actionTaken) {
                 const generalResponseText = await askGeneralAssistant(userInput);
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
            // scrollToBottom(); // Scroll is handled by useEffect
        }
    };


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // If minimized, maximize first
        if (isMinimized) {
            setIsMinimized(false);
             await new Promise(resolve => setTimeout(resolve, 50)); // Short delay for animation
        }

        const userMessageText = input;
        const userMessage: Message = { id: Date.now().toString(), text: userMessageText, sender: 'user' };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        await processUserInput(userMessageText);
    };

     // Updated placeholder text
     const placeholderText = selectedNode
        ? `Editing ${selectedNode.data.type} "${selectedNode.data.label}". What should I change?`
        : "Ask AI: 'create chapter 1 titled...' or 'brainstorm characters...'";

    // Handle resizing state
    const [chatSize, setChatSize] = useState({ width: 500, height: 450 }); // Initial size

    return (
        // Use motion.div for layout animation, but size is controlled by resize interaction
        <motion.div
            layout // Animate layout changes (like height) if needed
            animate={isMinimized ? "closed" : "open"}
            variants={chatboxVariants} // Still use variants for minimize/maximize animation
            initial={false}
            className={cn(
                "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-90",
                "resizable-chat", // Add a class for potential resizing styles/JS targeting
                isMinimized ? "max-h-[60px]" : "max-h-[80vh]" // Allow larger max height when open
            )}
             style={{
                 width: isMinimized ? undefined : `${chatSize.width}px`, // Control width/height via state when not minimized
                 height: isMinimized ? undefined : `${chatSize.height}px`,
                 position: 'absolute', // Required for react-draggable positioning
                 bottom: '1rem', // Example initial position (overridden by Draggable)
                 left: '50%',
                 transform: 'translateX(-50%)',
                 resize: 'both', // Allow resizing
                 overflow: 'auto', // Needed for resize handles
             }}
        >
            {/* Header with Minimize/Maximize Button & Drag Handle */}
            {/* Added 'chatbox-drag-handle' class */}
            <div className="chatbox-drag-handle flex items-center justify-between px-3 py-1.5 border-b border-border bg-background/80 shrink-0 cursor-grab active:cursor-grabbing">
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

            {/* AnimatePresence for smooth showing/hiding of content */}
            <AnimatePresence initial={false}>
                {!isMinimized && (
                    <motion.div
                        key="chat-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-grow min-h-0" // Important for flex layout with scroll
                    >
                        {/* Message Area */}
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                           {/* Pass viewportRef to the ScrollAreaViewport */}
                            <ScrollAreaViewport ref={viewportRef} className="h-full w-full">
                                <AnimatePresence initial={false}>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            layout // Animate message position changes
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: message.sender === 'ai' ? -10 : 10 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex gap-3 my-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.sender === 'ai' && (
                                                <Avatar className="h-8 w-8 border border-primary/20">
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
                                                <Avatar className="h-8 w-8">
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
                                disabled={isLoading}
                                aria-label="Chat input"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90 shrink-0">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                     </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
