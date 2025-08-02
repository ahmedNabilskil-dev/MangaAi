import {
  Content,
  FunctionCallingConfigMode,
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
  Modality,
  Part,
  ToolListUnion,
} from "@google/genai";
import { ChatAdapter, Message, TextGenerationParams, Tool } from "../type";
export class GeminiAdapter implements ChatAdapter {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  async send(
    messages: Message[],
    tools: Tool[] = [],
    params: TextGenerationParams,
    callTool?: boolean,
    depth = 0
  ): Promise<Message[]> {
    if (depth > 10) throw new Error("Too many recursive tool calls");

    const geminiTools: ToolListUnion = tools.length
      ? [
          {
            functionDeclarations: tools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters,
            })),
          },
        ]
      : [];

    const contents: Content[] = messages.map((m) => {
      let parts: Part[] = [];
      if (m.contentKey === "functionCall") {
        parts.push({
          functionCall: m.content as {
            name: string;
            args: Record<string, any>;
          },
        });
      } else if (m.contentKey === "functionResponse") {
        parts.push({
          functionResponse: m.content as { name: string; response: any },
        });
      } else {
        parts.push({ text: m.content as string });
      }

      // Map your internal role to the SDK's Role type
      const role = m.role === "assistant" ? "model" : m.role;

      return {
        role: role,
        parts: parts,
      };
    });

    const requestOptions: GenerateContentParameters = {
      model: params.model || "gemini-2.0-flash",
      contents: contents,
      config: {
        tools: geminiTools.length ? geminiTools : undefined,
        systemInstruction: params.systemPrompt,
      },
    };

    if (params.context?.outputSchema && !callTool) {
      requestOptions.config!.responseMimeType = "application/json";
      requestOptions.config!.responseSchema = params.context.outputSchema;
    }

    if (callTool) {
      // When calling a tool, the mode should be ANY
      requestOptions.config!.toolConfig = {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
        },
      };
    }

    let result: GenerateContentResponse;
    try {
      result = await this.genAI.models.generateContent(requestOptions);
    } catch (error: any) {
      // Handle potential errors from the API call
      console.error("Error generating content:", error);
      // Attempt to parse the error message if it's in a JSON format from the API
      try {
        const errorData = JSON.parse(error.message.split("\n")[0]);
        if (errorData && errorData.error && errorData.error.message) {
          throw new Error(`Gemini API Error: ${errorData.error.message}`);
        }
      } catch (parseError) {
        // If not a JSON error, re-throw the original error
        throw error;
      }
      throw error; // Re-throw if parsing fails
    }

    const toolCalls = result.functionCalls || [];

    if (toolCalls.length > 0) {
      // Handle only one tool call at a time (Gemini limitation if multiple are returned)
      const call = toolCalls[0];
      // Use MCP client to call the tool remotely
      const args = call.args || {};
      const toolName = typeof call.name === "string" ? call.name : "";
      if (!toolName) throw new Error("Tool call missing name");
      let toolResult;
      try {
        // Dynamically import mcpClient to avoid circular dependencies
        const { mcpClient } = await import("../../services/mcp-client");
        toolResult = await mcpClient.callTool(toolName, args);
      } catch (err) {
        throw new Error(
          `MCP tool call failed for ${toolName}: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }

      const updatedMessages: Message[] = [
        ...messages,
        {
          role: "assistant",
          content: call,
          contentKey: "functionCall",
        },
        {
          role: "user",
          content: {
            name: call.name,
            response: { result: toolResult }, // Use the MCP result directly
          },
          contentKey: "functionResponse",
        },
      ];

      return await this.send(updatedMessages, [], params, false, depth + 1);
    }

    // No tool call — normal response
    return result.candidates!.map((c) => ({
      role: "assistant",
      content: c.content?.parts?.map((p) => p.text || "").join("") || "",
    }));
  }

  generateImage = async ({
    prompt,
    history,
  }: {
    prompt: string;
    history: Content[];
  }) => {
    const chat = this.genAI.chats.create({
      model: "gemini-2.0-flash-preview-image-generation",
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 0,
      },
      history,
    });

    const response = await chat.sendMessage({ message: [{ text: prompt }] });

    const finalResponse = { text: "", image46: "" };

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        finalResponse.text = part.text;
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        finalResponse.image46 = imageData || "";
      }
    }

    return finalResponse;
  };
}
