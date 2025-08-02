import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side AI configuration and utilities
 */
export class ServerAIConfig {
  private static instance: ServerAIConfig;

  private constructor() {}

  public static getInstance(): ServerAIConfig {
    if (!ServerAIConfig.instance) {
      ServerAIConfig.instance = new ServerAIConfig();
    }
    return ServerAIConfig.instance;
  }

  /**
   * Validate API key format (basic validation)
   */
  public validateApiKey(apiKey: string, provider: string = "gemini"): boolean {
    if (!apiKey || typeof apiKey !== "string") {
      return false;
    }

    // Basic format validation based on provider
    switch (provider) {
      case "gemini":
        // Gemini API keys typically start with 'AI' and are longer than 30 characters
        return apiKey.startsWith("AI") && apiKey.length > 30;
      default:
        return apiKey.length > 10; // Generic validation
    }
  }

  /**
   * Rate limiting helper (basic implementation)
   */
  public checkRateLimit(ip: string): boolean {
    // This is a basic implementation
    // In production, you'd want to use Redis or a proper rate limiting service
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // Max requests per window

    // For now, we'll just return true (no rate limiting)
    // TODO: Implement proper rate limiting
    return true;
  }

  /**
   * Sanitize user input for AI prompts
   */
  public sanitizePrompt(prompt: string): string {
    if (!prompt || typeof prompt !== "string") {
      return "";
    }

    // Remove potentially harmful content
    return prompt
      .trim()
      .replace(/[<>]/g, "") // Remove HTML tags
      .substring(0, 10000); // Limit length
  }

  /**
   * Create standardized error response
   */
  public createErrorResponse(
    error: string,
    status: number = 500
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  /**
   * Create standardized success response
   */
  public createSuccessResponse(data: any): NextResponse {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  /**
   * Extract client IP from request
   */
  public getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const real = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (real) {
      return real;
    }

    return "unknown";
  }

  /**
   * Log API usage for monitoring
   */
  public logApiUsage(
    endpoint: string,
    provider: string,
    ip: string,
    success: boolean,
    responseTime: number
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      endpoint,
      provider,
      ip,
      success,
      responseTime,
    };

    // In production, you'd want to send this to a logging service
    console.log("AI API Usage:", JSON.stringify(logData));
  }
}

export const serverAIConfig = ServerAIConfig.getInstance();
