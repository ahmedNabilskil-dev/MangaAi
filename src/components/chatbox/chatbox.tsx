'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Placeholder for AI function - replace with actual Genkit flow call
// import { askMangaAssistant } from '@/ai/flows/manga-assistant'; // Assuming this flow exists

// Placeholder AI function
async function askMangaAssistant(message: string): Promise<string> {
    console.log('Sending to AI:', message);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate AI response based on keywords
    if (message.toLowerCase().includes('chapter')) {
        return "Okay, I'll create a new chapter for you. What should the title be?";
    } else if (message.toLowerCase().includes('scene')) {
        return "Sure, I can add a scene. What's the scene description?";
    } else if (message.toLowerCase().includes('character')) {
         return "Adding a character! Tell me about them.";
    } else {
        return `I received your message: "${message}". I can help with creating projects, chapters, scenes, and characters.`;
    }
}


interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export default function Chatbox() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        // Timeout ensures scroll happens after the DOM updates
        setTimeout(() => {
            if (scrollAreaRef.current) {
                 const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                 if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                 }
            }
        }, 0);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll whenever messages change

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        scrollToBottom(); // Scroll after adding user message

        try {
            // Replace with actual AI call
            const aiResponseText = await askMangaAssistant(userMessage.text);
            const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error calling AI:', error);
            toast({
                title: "Error",
                description: "Failed to get response from AI.",
                variant: "destructive",
            });
            // Optionally add an error message to the chat
             const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I couldn't process that request.", sender: 'ai' };
             setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            scrollToBottom(); // Scroll after adding AI message or error
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-[400px] flex flex-col" // Added flex-col
        >
            {/* Header (Optional) */}
            {/* <div className="p-3 border-b border-border flex items-center bg-muted/50">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                <span className="font-semibold text-sm text-foreground">Manga AI Assistant</span>
            </div> */}

            {/* Message Area */}
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-3 my-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.sender === 'ai' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Bot size={18} />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`rounded-lg p-2.5 max-w-[75%] text-sm shadow-sm ${message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground'
                                    }`}
                            >
                                {message.text}
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
                     {isLoading && (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 my-3 justify-start"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot size={18} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-2.5 bg-secondary text-secondary-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Thinking...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-background flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI to create content..."
                    className="flex-grow bg-input focus-visible:ring-primary"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </motion.div>
    );
}
