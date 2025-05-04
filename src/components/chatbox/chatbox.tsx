'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User, Loader2, Wand2 } from 'lucide-react'; // Added Wand2 for AI actions
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage as it wasn't used
import { useToast } from '@/hooks/use-toast';

// Import actual Genkit flow functions
import { createChapterFromPrompt } from '@/ai/flows/create-chapter-from-prompt';
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas';
// Assume a general assistant flow exists or create one
// import { askGeneralAssistant } from '@/ai/flows/general-assistant';

// Placeholder for the general assistant - replace with actual flow later
async function askGeneralAssistant(message: string): Promise<string> {
    console.log('Sending to General AI:', message);
    await new Promise(resolve => setTimeout(resolve, 800));
    // Basic keyword matching for demo
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello there! How can I help you create your manga today?";
    } else if (message.toLowerCase().includes('help')) {
        return "I can help you create chapters, scenes, panels, and characters. Try asking me to 'create chapter 1 titled The Adventure Begins' or 'brainstorm character ideas for a fantasy project'.";
    }
    return `I received: "${message}". I can assist with manga creation tasks like generating chapters or brainstorming ideas.`;
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

    // ---- Mock Project Context ----
    // In a real app, this would come from state management or props
    const currentProjectId = 'proj-123'; // Example UUID
    const currentProjectTitle = 'My Awesome Manga';
    // ---- End Mock Context ----

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollAreaRef.current) {
                 const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                 if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                 }
            }
        }, 50); // Slightly increased delay
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function to interpret user input and call the appropriate AI flow
    const processUserInput = async (userInput: string) => {
        setIsLoading(true);
        setMessages((prev) => [...prev, { id: Date.now().toString() + '-think', text: 'Thinking...', sender: 'ai', isThinking: true }]);
        scrollToBottom();

        let aiResponse: Message | null = null;

        try {
             // --- Command Interpretation ---
            // Very basic keyword matching for demonstration
            if (userInput.toLowerCase().startsWith('create chapter')) {
                 // Example: "create chapter 1 titled The Beginning about..."
                 const match = userInput.match(/create chapter (\d+)\s+titled\s+["']?([^"']+)["']?\s*(?:about|:)?\s*(.*)/i);
                 if (match) {
                    const [, chapterNum, title, prompt] = match;
                    toast({ title: "AI Action", description: `Creating Chapter ${chapterNum}: ${title}...` });
                    const result = await createChapterFromPrompt({
                        projectId: currentProjectId,
                        chapterNumber: parseInt(chapterNum, 10),
                        chapterTitle: title.trim(),
                        prompt: prompt.trim() || `Create content for ${title}`, // Default prompt if none provided
                    });
                     aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                         <div>
                             <p>✅ Chapter "{title}" (ID: ...{result.chapterId.slice(-6)}) created!</p>
                             <p>   - Scenes created: {result.sceneIds.length}</p>
                             {result.panelIds && <p>   - Panels created: {result.panelIds.length}</p>}
                             {/* Add button to view/navigate? */}
                         </div>
                     )};
                 } else {
                      aiResponse = { id: Date.now().toString(), sender: 'ai', text: "Please use the format: 'create chapter [number] titled \"[Title]\" about [prompt]'." };
                 }

             } else if (userInput.toLowerCase().startsWith('brainstorm character') || userInput.toLowerCase().startsWith('suggest character')) {
                 // Example: "brainstorm character ideas for a fantasy project"
                 const match = userInput.match(/(?:brainstorm|suggest) character ideas?(?:\s+for\s+(.+))?/i);
                 const prompt = match?.[1]?.trim() || 'general manga'; // Extract optional context
                 toast({ title: "AI Action", description: "Brainstorming character ideas..." });
                 const result = await brainstormCharacterIdeas({
                     projectId: currentProjectId, // Pass context
                     projectTitle: currentProjectTitle,
                     prompt: `Brainstorm characters for: ${prompt}`,
                 });
                 aiResponse = { id: Date.now().toString(), sender: 'ai', text: (
                     <div>
                         <p>💡 Here are some character ideas:</p>
                         <ul className="list-disc list-inside ml-4 text-sm">
                             {result.characterIdeas.map((idea, index) => (
                                 <li key={index}><strong>{idea.name}:</strong> {idea.briefDescription} {idea.role && `(${idea.role})`}</li>
                             ))}
                         </ul>
                     </div>
                 )};

             } else {
                 // --- General Assistant Fallback ---
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
                // Remove the "Thinking..." message and add the actual response
                const filtered = prev.filter(msg => !msg.isThinking);
                return aiResponse ? [...filtered, aiResponse] : filtered;
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
        scrollToBottom(); // Scroll after adding user message

        // Process the input using AI
        await processUserInput(userMessageText);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }} // Faster transition
            className="bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-[450px] flex flex-col backdrop-blur-sm bg-opacity-90" // Added backdrop blur and reduced opacity
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
                            exit={{ opacity: 0, y: -10 }}
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
                                        : 'bg-secondary text-secondary-foreground' // Use theme colors
                                    } ${message.isThinking ? 'italic text-muted-foreground' : ''}`}
                            >
                                {message.isThinking ? (
                                     <div className="flex items-center gap-2">
                                         <Loader2 className="h-4 w-4 animate-spin" />
                                         {message.text}
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

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-background/80 flex items-center gap-2">
                 {/* Optional AI Action Button */}
                 {/* <Button type="button" variant="ghost" size="icon" className="text-primary" onClick={() => alert("AI Actions Menu Placeholder")}>
                     <Wand2 className="h-5 w-5" />
                 </Button> */}
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI: 'create chapter 1 titled...' or 'brainstorm...'" // Updated placeholder
                    className="flex-grow bg-input focus-visible:ring-primary text-sm" // Smaller text
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
