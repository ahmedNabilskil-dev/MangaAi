import { mcpClient } from "@/backend/services/mcp-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, args = {} } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Prompt name is required" },
        { status: 400 }
      );
    }

    // Get the prompt template from MCP server
    const promptResponse = await mcpClient.getPrompt(name, args);

    return NextResponse.json({
      success: true,
      prompt: promptResponse,
    });
  } catch (error: any) {
    console.error("MCP get prompt API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
