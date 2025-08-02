import { ChatAdapterFactory } from "@/backend/ai/adapters/factory";
import { GeminiAdapter } from "@/backend/ai/adapters/gemini";
import { Message, TextGenerationParams, Tool } from "@/backend/ai/type";
import { Content } from "@google/genai";

// Register adapters
ChatAdapterFactory.registerAdapter(
  "gemini",
  (apiKey: string) => new GeminiAdapter(apiKey)
);

export class AIService {
  private static instance: AIService;
  private apiKey: string = "";
  private provider: string = "gemini";

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public setProvider(provider: string): void {
    this.provider = provider;
  }

  public async sendChatMessage(
    messages: Message[],
    tools: Tool[] = [],
    params: TextGenerationParams = {},
    callTool: boolean = false
  ): Promise<Message[]> {
    if (!this.apiKey) {
      throw new Error("API key is required. Please set the API key first.");
    }

    const adapter = ChatAdapterFactory.getAdapter(this.provider, this.apiKey);
    if (!adapter) {
      throw new Error(`No adapter found for provider: ${this.provider}`);
    }

    try {
      return await adapter.send(messages, tools, params, callTool);
    } catch (error: any) {
      throw new Error(`Chat message failed: ${error.message}`);
    }
  }

  public async generateImage(
    prompt: string,
    history: Content[] = []
  ): Promise<{ text: string; image46: string }> {
    if (!this.apiKey) {
      throw new Error("API key is required. Please set the API key first.");
    }

    const adapter = ChatAdapterFactory.getAdapter(this.provider, this.apiKey);
    if (!adapter) {
      throw new Error(`No adapter found for provider: ${this.provider}`);
    }

    try {
      // Check if adapter supports image generation
      if (typeof (adapter as any).generateImage === "function") {
        return await (adapter as any).generateImage({ prompt, history });
      } else {
        throw new Error(
          `Provider ${this.provider} does not support image generation`
        );
      }
    } catch (error: any) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  public async createProject(
    mangaIdea: string,
    mcpTools: Tool[],
    systemPrompt: string
  ): Promise<string> {
    const messages = [
      {
        role: "user" as const,
        content: `Create a manga project based on the following idea: "${mangaIdea}"`,
      },
    ];

    const params = {
      model: "gemini-2.0-flash",
      systemPrompt,
      context: {
        outputSchema: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
              description: "The ID of the created manga project.",
            },
          },
          required: ["projectId"],
        },
      },
    };

    const responseMessages = await this.sendChatMessage(
      messages,
      mcpTools,
      params,
      true
    );

    const assistantMsg = responseMessages.find((m) => m.role === "assistant");
    const parsedContent = JSON.parse(assistantMsg?.content || "{}");

    const projectId = (parsedContent as any).projectId;

    if (!projectId) {
      throw new Error(
        "Project created, but no projectId returned. Response: " +
          (assistantMsg?.content || "")
      );
    }

    return projectId;
  }
}

// Export a singleton instance
export const aiService = AIService.getInstance();
