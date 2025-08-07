import { MANGA_AI_SYSTEM_PROMPT } from "@/backend/lib/manga-system-prompt";
import { dataService } from "@/backend/services/data-service";
import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "image";
  imageUrl?: string;
  imageData?: string;
  projectId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, idea } = body;

    // Check if user exists and has credits (skip for anonymous users)
    let userProfile = null;
    if (userId) {
      console.log("Chat API: Looking for user:", userId);
      try {
        userProfile = await dataService.getUserById(userId);
        console.log("Chat API: User found:", userProfile ? "YES" : "NO");
        if (userProfile) {
          console.log("Chat API: User credits:", userProfile.credits);
        }
      } catch (error) {
        console.error("Chat API: Error getting user:", error);
        return NextResponse.json(
          { error: "Error fetching user" },
          { status: 500 }
        );
      }

      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (userProfile.credits <= 0) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 402 }
        );
      }
    }

    // Use AI adapter directly instead of HTTP call
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Import and use AI adapter directly
    const { ChatAdapterFactory } = await import(
      "@/backend/ai/adapters/factory"
    );
    const adapter = ChatAdapterFactory.getAdapter("gemini", apiKey);

    if (!adapter) {
      return NextResponse.json(
        { error: "AI adapter not available" },
        { status: 500 }
      );
    }

    const geminiResponses = await adapter.send(
      [{ role: "user", content: idea }],
      [],
      {
        model: "gemini-2.0-flash",
        systemPrompt: MANGA_AI_SYSTEM_PROMPT,
        temperature: 0.8, // Increased for more creativity
        maxOutputTokens: 8192,
        topP: 0.85, // Slightly increased for more varied responses
        topK: 50, // Increased for more creative word choices
        context: {
          outputSchema: {
            type: "object",
            properties: {
              projectId: { type: "string", description: "Unique project ID" },
              response: {
                type: "string",
                description: "AI response text of what is created",
              },
            },
            required: ["projectId", "response"],
          },
        },
      },
      false // callTool = false - allow structured output without forcing tools
    );

    const geminiResponseText =
      geminiResponses[geminiResponses.length - 1].content.trim();

    console.log("Raw AI response:", geminiResponseText);

    // Parse the structured JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(geminiResponseText);
      console.log("Parsed AI response:", parsedResponse);
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", geminiResponseText);
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!parsedResponse.projectId || !parsedResponse.response) {
      console.error("Invalid AI response structure:", parsedResponse);
      return NextResponse.json(
        { error: "Invalid AI response structure" },
        { status: 500 }
      );
    }

    const projectId = parsedResponse.projectId;
    const aiResponseText = parsedResponse.response;

    // Create the user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: idea,
      timestamp: new Date().toISOString(),
      type: "text",
      projectId: projectId, // Use AI-generated project ID
    };

    // Create the AI response message
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponseText, // Use the response text from AI
      timestamp: new Date().toISOString(),
      type: "text",
      projectId: projectId, // Use same AI-generated project ID
    };

    // Save both messages to database
    await dataService.createChatMessage({
      projectId: userMessage.projectId,
      userId,
      role: userMessage.role,
      content: userMessage.content,
      timestamp: userMessage.timestamp,
      messageType: userMessage.type,
      imageUrl: userMessage.imageUrl,
    });

    await dataService.createChatMessage({
      projectId: aiMessage.projectId,
      userId,
      role: aiMessage.role,
      content: aiMessage.content,
      timestamp: aiMessage.timestamp,
      messageType: aiMessage.type,
      imageUrl: aiMessage.imageUrl,
    });

    return NextResponse.json({
      success: true,
      projectUrl: `/projects/${projectId}`, // Use AI-generated project ID
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
