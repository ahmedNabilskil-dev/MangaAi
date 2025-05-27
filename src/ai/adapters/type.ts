import { Content } from "@google/genai";

export type Message = {
  role: "user" | "assistant" | "function";
  content: any;
  contentKey?: string;
  imageUrl?: string;
};

export type Tool = {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON schema-like
  execute: (args: any) => Promise<any>; // What the tool does
};

export type ToolCall = {
  name: string;
  arguments: any;
};

export type ImageGenerationParams = {
  prompt: string;
  size?: string;
  quality?: string;
  style?: string;
};

// Type for text generation parameters
export type TextGenerationParams = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
  context?: Record<string, any>;
};

export interface ChatAdapter {
  send(
    messages: Message[],
    tools: Tool[],
    params: TextGenerationParams,
    toolCall: boolean
  ): Promise<Message[]>;

  generateImage({
    prompt,
    history,
  }: {
    prompt: string;
    history: Content[];
  }): Promise<{ text: String; image46: string }>;
}
