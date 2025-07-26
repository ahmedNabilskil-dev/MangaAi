/**
 * Direct Gemini Integration Service
 * Replaces the AI instance with direct Gemini SDK usage
 */

import { GoogleGenAI } from "@google/genai";

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

class GeminiService {
  private genAI: GoogleGenAI;
  private model: any;

  constructor() {
    // Initialize with API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
    if (!apiKey) {
      console.warn("NEXT_PUBLIC_GOOGLE_API_KEY not found in environment");
    }

    this.genAI = new GoogleGenAI({ apiKey });
    this.model = this.genAI; // We'll use the genAI instance directly
  }

  /**
   * Send a simple text message to Gemini
   */
  async sendMessage(
    text: string,
    systemPrompt?: string
  ): Promise<GeminiResponse> {
    try {
      const requestOptions = {
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user" as const,
            parts: [{ text }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
        },
      };

      const result = await this.genAI.models.generateContent(requestOptions);
      const responseText = result.text || "";

      return {
        text: responseText,
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      return {
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a conversation with history to Gemini
   */
  async sendConversation(
    messages: GeminiMessage[],
    systemPrompt?: string
  ): Promise<GeminiResponse> {
    try {
      const requestOptions = {
        model: "gemini-2.0-flash",
        contents: messages,
        config: {
          systemInstruction: systemPrompt,
        },
      };

      const result = await this.genAI.models.generateContent(requestOptions);
      const responseText = result.text || "";

      return {
        text: responseText,
      };
    } catch (error) {
      console.error("Gemini conversation error:", error);
      return {
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Convert chat messages to Gemini format
   */
  convertToGeminiMessages(
    messages: Array<{ role: string; content: string }>
  ): GeminiMessage[] {
    return messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * Use MCP tools through Gemini
   */
  async executeWithTools(
    text: string,
    tools: Array<{ name: string; description: string; inputSchema: any }>,
    systemPrompt?: string
  ): Promise<GeminiResponse> {
    try {
      // For now, we'll include tool descriptions in the system prompt
      let enhancedSystemPrompt =
        systemPrompt || "You are a helpful AI assistant for manga creation.";

      if (tools.length > 0) {
        enhancedSystemPrompt += "\n\nAvailable tools:\n";
        tools.forEach((tool) => {
          enhancedSystemPrompt += `- ${tool.name}: ${tool.description}\n`;
        });
        enhancedSystemPrompt +=
          "\nYou can reference these tools in your responses when appropriate.";
      }

      return await this.sendMessage(text, enhancedSystemPrompt);
    } catch (error) {
      console.error("Gemini tools execution error:", error);
      return {
        text: "I'm sorry, I encountered an error processing your request with tools. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
