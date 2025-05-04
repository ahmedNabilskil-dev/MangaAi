'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User, Loader2, Wand2, Pencil, X } from 'lucide-react'; // Added X
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import store

// Import Firebase Genkit flow functions
import { createChapterFromPrompt } from '@/ai/flows/create-chapter-from-prompt';
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas';
import { updateEntity } from '@/ai/flows/update-entity-flow';
import type { NodeType } from '@/types/nodes';

// Placeholder for the general assistant
async function askGeneralAssistant(message: string): Promise<string> {
    console.log('Sending to General AI:', message);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello there! How can I help you create or edit your manga today using Firebase?";
    } else if (message.toLowerCase().includes('help')) {
        return "I can help create/edit chapters, scenes, panels, characters, dialogues stored in Firestore. Try 'create chapter 1 titled...' or 'brainstorm characters...'. Select an item to edit it, e.g., 'change the scene setting to a beach'.";
    }
    return `I received: "${message}". I can assist with manga creation tasks like generating or editing chapters, scenes, characters, etc., interacting with Firestore. Select an item or use commands like 'create ...' or 'brainstorm ...'.`;
}


interface Message {
    id: string;
    text: string | React.ReactNode;
    sender: 'user' | 'ai';
    isThinking?: boolean;
}

export default function Chatbox() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const selectedNode = useVisualEditorStore((state) => state.selectedNode);
    const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode);
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData);

    // ---- Firebase Project Context ----
    const currentProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const currentProjectTitle = 'My Awesome Manga'; // Replace if dynamic title is needed
    // ---- End Context ----

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollAreaRef.current) {
                 const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                 if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                 }
            }
        }, 100);
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const processUserInput = async (userInput: string) => {
        if (!currentProjectId) {
             toast({
                title: "Project ID Missing",
                description: "Firebase Project ID is not configured. Please set NEXT_PUBLIC_FIREBASE_PROJECT_ID in your environment variables.",
                variant: "destructive",
            });
            setInput(userInput); // Put input back if failed pre-check
            return;
        }

        setIsLoading(true);
        const thinkingId = Date.now().toString() + '-think';
        setMessages((prev) => [...prev, { id: thinkingId, text: 'Thinking...', sender: 'ai', isThinking: true }]);
        scrollToBottom();

        let aiResponse: Message | null = null;
        let actionTaken = false;

        try {
             // --- Command Interpretation ---

             // 1. Creation Commands
             if (userInput.toLowerCase().startsWith('create chapter')) {
                 actionTaken = true;
                 const match = userInput.match(/create chapter (\d+)\s+titled\s+["']?([^"']+)["']?\s*(?:about|:)?\s*(.*)/i);
                 if (match) {
                    const [, chapterNum, title, prompt] = match;
                    toast({ title: "AI Action", description: `Creating Chapter ${chapterNum}: ${title}...` });
                    const result = await createChapterFromPrompt({
                        projectId: currentProjectId, // Use Firestore project ID
                        chapterNumber: parseInt(chapterNum, 10),
                        chapterTitle: title.trim(),
                        prompt: prompt.trim() || `Create content for ${title}`,
                    });
                     aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                         <div>
                             <p>✅ Chapter "{title}" (ID: {result.chapterId.substring(0, 6)}...) created!</p>
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
                 // Note: Brainstorming doesn't automatically add characters to Firestore yet.

             // 2. Update Command (if a node is selected)
             } else if (selectedNode && selectedNode.data?.properties?.id && selectedNode.data.type) {
                  actionTaken = true;
                  const entityId = selectedNode.data.properties.id; // Firestore ID
                  const entityType = selectedNode.data.type as NodeType;

                  toast({ title: "AI Action", description: `Updating ${entityType} "${selectedNode.data.label}"...` });

                  const result = await updateEntity({
                      entityType: entityType,
                      entityId: entityId,
                      prompt: userInput,
                      projectId: currentProjectId, // Pass project context for potential lookups
                  });

                  aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                      <div>
                          <p>{result.success ? '✅' : '⚠️'} Update for {entityType} (ID: {result.updatedEntityId.substring(0, 6)}...) processed.</p>
                          <p className="text-xs italic">{result.message}</p>
                      </div>
                  )};
                  if (result.success) {
                      refreshFlowData(); // Refresh editor
                      setSelectedNode(null); // Clear selection after update
                  }

             // 3. General Assistant Fallback
             } else {
                 if (['change', 'update', 'edit', 'set', 'add', 'remove'].some(keyword => userInput.toLowerCase().startsWith(keyword)) && !selectedNode) {
                     aiResponse = { id: Date.now().toString(), text: "Please select an item in the visual editor first before asking me to make changes to it.", sender: 'ai' };
                 } else {
                     const generalResponseText = await askGeneralAssistant(userInput);
                     aiResponse = { id: Date.now().toString(), text: generalResponseText, sender: 'ai' };
                 }
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
            scrollToBottom();
        }
    };


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessageText = input;
        const userMessage: Message = { id: Date.now().toString(), text: userMessageText, sender: 'user' };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        await processUserInput(userMessageText);
    };

     const placeholderText = selectedNode
        ? `Editing ${selectedNode.data.type} "${selectedNode.data.label}". What should I change?`
        : "Ask AI: 'create chapter 1 titled...' or select an item to edit...";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-[450px] flex flex-col backdrop-blur-sm bg-opacity-90"
        >
            {/* Message Area */}
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
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
            </ScrollArea>

             {/* Selected Item Indicator */}
            {selectedNode && (
                <div className="p-2 border-t border-border bg-background/80 text-xs text-muted-foreground flex items-center gap-2 justify-center">
                    <Pencil size={14} className="text-primary shrink-0" />
                    <span>Editing: <span className="font-medium text-foreground">{selectedNode.data.label}</span> ({selectedNode.data.type})</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setSelectedNode(null)} title="Clear selection">
                        <X size={14} />
                        <span className="sr-only">Clear Selection</span>
                    </Button>
                </div>
            )}


            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-background/80 flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholderText}
                    className="flex-grow bg-input focus-visible:ring-primary text-sm"
                    disabled={isLoading || !currentProjectId} // Disable if no project ID
                    aria-label="Chat input"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !currentProjectId} className="bg-primary hover:bg-primary/90 shrink-0">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
            {/* Warning if Project ID is missing */}
             {!currentProjectId && (
                <div className="p-2 bg-destructive/10 text-destructive text-xs text-center border-t border-destructive/20">
                    Warning: Firebase Project ID not configured. Please set NEXT_PUBLIC_FIREBASE_PROJECT_ID in your environment variables.
                </div>
            )}
        </motion.div>
    );
}
