import { mcpClient } from "@/backend/services/mcp-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, args = {} } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tool name is required" },
        { status: 400 }
      );
    }

    // Execute the MCP tool
    const result = await mcpClient.callTool(name, args);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("MCP call tool API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
