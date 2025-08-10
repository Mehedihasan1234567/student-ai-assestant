"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
};

export default function AIAgentPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your AI study assistant. I can help you with questions about your notes, create summaries, generate quizzes, and more. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai-openrouter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input.trim() }),
            });

            const data = await response.json();
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data[0]?.generated_text || "I'm sorry, I couldn't generate a response. Please try again.",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error calling AI API:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm sorry, there was an error processing your request. Please try again.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
            {/* Header */}
            <div className="border-b bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm p-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 shadow-md">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">AI Study Assistant</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Ask me anything about your studies</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-3",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {message.role === "assistant" && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 shadow-md">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[80%] rounded-xl p-3 shadow-sm",
                                    message.role === "user"
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white dark:bg-neutral-800 border"
                                )}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={cn(
                                    "mt-1 text-xs",
                                    message.role === "user"
                                        ? "text-indigo-100"
                                        : "text-neutral-500 dark:text-neutral-400"
                                )}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {message.role === "user" && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <User className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 shadow-md">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-white dark:bg-neutral-800 border rounded-xl p-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Thinking...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm p-4 rounded-b-xl">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about your studies..."
                        className="min-h-[44px] max-h-32 resize-none"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="h-11 w-11 bg-gradient-to-br from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    );
}
