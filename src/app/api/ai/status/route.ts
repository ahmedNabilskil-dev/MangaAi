import { serverAIConfig } from "@/backend/lib/server-ai-config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const status = {
      service: "MangaAI Server-Side AI",
      status: "operational",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      endpoints: {
        chat: "/api/ai/chat",
        generateImage: "/api/ai/generate-image",
        status: "/api/ai/status",
      },
      providers: ["gemini"],
      features: [
        "chat_completion",
        "image_generation",
        "tool_calling",
        "project_creation",
        "rate_limiting",
        "input_sanitization",
      ],
    };

    return serverAIConfig.createSuccessResponse(status);
  } catch (error) {
    return serverAIConfig.createErrorResponse(
      "Service status check failed",
      500
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}
