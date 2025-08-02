import { ChatAdapterFactory } from "@/backend/ai/adapters/factory";
import { Message, TextGenerationParams, Tool } from "@/backend/ai/type";
import { serverAIConfig } from "@/backend/lib/server-ai-config";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = serverAIConfig.getClientIP(request);

  try {
    // Rate limiting check
    if (!serverAIConfig.checkRateLimit(clientIP)) {
      return serverAIConfig.createErrorResponse("Rate limit exceeded", 429);
    }

    const {
      messages,
      tools = [],
      params = {},
      callTool = false,
      apiKey,
      provider = "gemini",
    }: {
      messages: Message[];
      tools?: Tool[];
      params?: TextGenerationParams;
      callTool?: boolean;
      apiKey: string;
      provider?: string;
    } = await request.json();

    // Validate required fields
    if (!apiKey) {
      return serverAIConfig.createErrorResponse("API key is required", 400);
    }

    if (!serverAIConfig.validateApiKey(apiKey, provider)) {
      return serverAIConfig.createErrorResponse("Invalid API key format", 400);
    }

    if (!messages || !Array.isArray(messages)) {
      return serverAIConfig.createErrorResponse(
        "Messages array is required",
        400
      );
    }

    // Sanitize message content
    const sanitizedMessages = messages.map((msg) => ({
      ...msg,
      content:
        typeof msg.content === "string"
          ? serverAIConfig.sanitizePrompt(msg.content)
          : msg.content,
    }));

    const adapter = ChatAdapterFactory.getAdapter(provider, apiKey);
    if (!adapter) {
      return serverAIConfig.createErrorResponse(
        `No adapter found for provider: ${provider}`,
        400
      );
    }

    const response = await adapter.send(
      sanitizedMessages,
      tools,
      params,
      callTool
    );

    // Log successful usage
    const responseTime = Date.now() - startTime;
    serverAIConfig.logApiUsage("chat", provider, clientIP, true, responseTime);

    return serverAIConfig.createSuccessResponse({
      messages: response,
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);

    // Log failed usage
    const responseTime = Date.now() - startTime;
    serverAIConfig.logApiUsage(
      "chat",
      "unknown",
      clientIP,
      false,
      responseTime
    );

    return serverAIConfig.createErrorResponse(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
}
