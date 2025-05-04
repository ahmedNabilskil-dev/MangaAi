'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User, Loader2, Wand2, Pencil } from 'lucide-react'; // Added Pencil for edit
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import store

// Import actual Genkit flow functions
import { createChapterFromPrompt } from '@/ai/flows/create-chapter-from-prompt';
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas';
import { updateEntity } from '@/ai/flows/update-entity-flow'; // Import the update flow
import type { NodeType } from '@/types/nodes'; // Import NodeType

// Placeholder for the general assistant - replace with actual flow later
async function askGeneralAssistant(message: string): Promise<string> {
    console.log('Sending to General AI:', message);
    await new Promise(resolve => setTimeout(resolve, 800));
    // Basic keyword matching for demo
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello there! How can I help you create or edit your manga today?";
    } else if (message.toLowerCase().includes('help')) {
        return "I can help you create chapters, scenes, panels, characters, and dialogues. Try 'create chapter 1 titled...' or 'brainstorm characters...'. To edit, select an item in the editor and tell me what to change, like 'change the scene setting to a beach'.";
    }
    return `I received: "${message}". I can assist with manga creation tasks like generating or editing chapters, scenes, characters, etc. Select an item or use commands like 'create ...' or 'brainstorm ...'.`;
}


interface Message {
    id: string;
    text: string | React.ReactNode; // Allow React nodes for richer messages
    sender: 'user' | 'ai';
    isThinking?: boolean; // Flag for AI thinking state
}

export default function Chatbox() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const selectedNode = useVisualEditorStore((state) => state.selectedNode); // Get selected node from Zustand store
    const setSelectedNode = useVisualEditorStore((state) => state.setSelectedNode); // For clearing selection if needed
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Function to trigger refetch

    // ---- Mock Project Context ----
    // TODO: Replace with actual project context from state/props/store
    const currentProjectId = 'proj-123'; // Example UUID - Make sure this exists or is created
    const currentProjectTitle = 'My Awesome Manga';
    // ---- End Mock Context ----

    const scrollToBottom = () => {
        // Debounce or use timeout to ensure scroll happens after render
        setTimeout(() => {
            if (scrollAreaRef.current) {
                 const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                 if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                 }
            }
        }, 100); // Adjust delay if needed
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function to interpret user input and call the appropriate AI flow
    const processUserInput = async (userInput: string) => {
        setIsLoading(true);
        // Use a temporary thinking message ID
        const thinkingId = Date.now().toString() + '-think';
        setMessages((prev) => [...prev, { id: thinkingId, text: 'Thinking...', sender: 'ai', isThinking: true }]);
        scrollToBottom();

        let aiResponse: Message | null = null;
        let actionTaken = false; // Flag to see if a specific action was triggered

        try {
             // --- Command Interpretation ---

             // 1. Creation Commands (e.g., "create chapter", "brainstorm")
             if (userInput.toLowerCase().startsWith('create chapter')) {
                 actionTaken = true;
                 const match = userInput.match(/create chapter (\d+)\s+titled\s+["']?([^"']+)["']?\s*(?:about|:)?\s*(.*)/i);
                 if (match) {
                    const [, chapterNum, title, prompt] = match;
                    toast({ title: "AI Action", description: `Creating Chapter ${chapterNum}: ${title}...` });
                    const result = await createChapterFromPrompt({
                        // Ensure a valid project ID exists for this to work
                        projectId: currentProjectId || "default-project-id", // Provide a fallback or ensure it's set
                        chapterNumber: parseInt(chapterNum, 10),
                        chapterTitle: title.trim(),
                        prompt: prompt.trim() || `Create content for ${title}`,
                    });
                     aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                         <div>
                             <p>✅ Chapter "{title}" (ID: ...{result.chapterId.slice(-6)}) created!</p>
                             <p>   - Scenes created: {result.sceneIds.length}</p>
                             {result.panelIds && result.panelIds.length > 0 && <p>   - Panels created: {result.panelIds.length}</p>}
                             {result.dialogueIds && result.dialogueIds.length > 0 && <p>   - Dialogues created: {result.dialogueIds.length}</p>}
                         </div>
                     )};
                     refreshFlowData(); // Refresh editor after creation
                 } else {
                      aiResponse = { id: Date.now().toString(), sender: 'ai', text: "Please use the format: 'create chapter [number] titled \"[Title]\" about [prompt]'." };
                 }

             } else if (userInput.toLowerCase().startsWith('brainstorm character') || userInput.toLowerCase().startsWith('suggest character')) {
                  actionTaken = true;
                 const match = userInput.match(/(?:brainstorm|suggest) character ideas?(?:\s+for\s+(.+))?/i);
                 const prompt = match?.[1]?.trim() || 'general manga';
                 toast({ title: "AI Action", description: "Brainstorming character ideas..." });
                 const result = await brainstormCharacterIdeas({
                     projectId: currentProjectId || "default-project-id", // Provide context
                     projectTitle: currentProjectTitle,
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
                 // Brainstorming might not directly affect the flow view unless characters are added

             // 2. Update Command (if a node is selected)
             } else if (selectedNode && selectedNode.data?.properties?.id && selectedNode.data.type) {
                  actionTaken = true;
                  toast({ title: "AI Action", description: `Updating ${selectedNode.data.type} "${selectedNode.data.label}"...` });

                  const result = await updateEntity({
                      entityType: selectedNode.data.type as NodeType, // Cast as we know it exists here
                      entityId: selectedNode.data.properties.id,
                      prompt: userInput,
                  });

                  aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                      <div>
                          <p>{result.success ? '✅' : '⚠️'} Update for {selectedNode.data.type} (ID: ...{result.updatedEntityId.slice(-6)}) processed.</p>
                          <p className="text-xs italic">{result.message}</p>
                      </div>
                  )};
                  if (result.success) {
                      refreshFlowData(); // Refresh editor after successful update
                      setSelectedNode(null); // Optionally clear selection after update
                  }

             // 3. General Assistant Fallback
             } else {
                  // Check if it looks like an update command but nothing is selected
                 if (['change', 'update', 'edit', 'set', 'add', 'remove'].some(keyword => userInput.toLowerCase().startsWith(keyword)) && !selectedNode) {
                     aiResponse = { id: Date.now().toString(), text: "Please select an item in the visual editor first before asking me to make changes to it.", sender: 'ai' };
                 } else {
                     // Call general assistant if no specific command matched
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
                // Replace the "Thinking..." message with the actual response
                return prev.map(msg => msg.id === thinkingId ? (aiResponse ?? { id: thinkingId, text: '...', sender: 'ai' }) : msg) // Ensure response exists
                           .filter(msg => !(msg.id === thinkingId && !aiResponse)); // Remove thinking if no response
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
        // No need to scroll here, useEffect handles it

        // Process the input using AI
        await processUserInput(userMessageText);
    };

     // Determine placeholder text based on selection
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
                            layout // Animate layout changes
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: message.sender === 'ai' ? -10 : 10 }} // Slide out based on sender
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
                 {/* Optional AI Action Button (Placeholder) */}
                 {/* <Button type="button" variant="ghost" size="icon" className="text-primary" onClick={() => alert("AI Actions Menu Placeholder")}>
                     <Wand2 className="h-5 w-5" />
                 </Button> */}
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholderText} // Dynamic placeholder
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
    );
}
