import { ChatAdapterFactory } from "@/backend/ai/adapters/factory";
import { serverAIConfig } from "@/backend/lib/server-ai-config";
import { Content } from "@google/genai";
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
      prompt,
      history = [],
      apiKey,
      provider = "gemini",
    }: {
      prompt: string;
      history?: Content[];
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

    if (!prompt) {
      return serverAIConfig.createErrorResponse("Prompt is required", 400);
    }

    // Sanitize prompt
    const sanitizedPrompt = serverAIConfig.sanitizePrompt(prompt);
    if (!sanitizedPrompt) {
      return serverAIConfig.createErrorResponse("Invalid prompt content", 400);
    }

    const adapter = ChatAdapterFactory.getAdapter(provider, apiKey);
    if (!adapter) {
      return serverAIConfig.createErrorResponse(
        `No adapter found for provider: ${provider}`,
        400
      );
    }

    const response = await adapter.generateImage({
      prompt: sanitizedPrompt,
      history,
    });

    // Log successful usage
    const responseTime = Date.now() - startTime;
    serverAIConfig.logApiUsage(
      "generate-image",
      provider,
      clientIP,
      true,
      responseTime
    );

    return serverAIConfig.createSuccessResponse({
      text: response.text,
      image46: response.image46,
    });
  } catch (error) {
    console.error("AI Image Generation API Error:", error);

    // Log failed usage
    const responseTime = Date.now() - startTime;
    serverAIConfig.logApiUsage(
      "generate-image",
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
