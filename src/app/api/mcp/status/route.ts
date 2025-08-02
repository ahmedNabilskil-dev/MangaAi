import { mcpClient } from "@/backend/services/mcp-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context") || "chat";

    // Check MCP connection
    const isConnected = await mcpClient.checkConnection();

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        isConnected: false,
        tools: [],
        prompts: [],
      });
    }

    // Get tools and prompts based on context
    const tools =
      context === "chat"
        ? await mcpClient.getChatTools()
        : await mcpClient.getProjectCreationTools();

    const prompts =
      context === "chat"
        ? await mcpClient.getChatPrompts()
        : await mcpClient.getProjectCreationPrompts();

    return NextResponse.json({
      success: true,
      isConnected: true,
      tools,
      prompts,
    });
  } catch (error: any) {
    console.error("MCP status API error:", error);
    return NextResponse.json({
      success: false,
      isConnected: false,
      tools: [],
      prompts: [],
      error: error.message,
    });
  }
}
