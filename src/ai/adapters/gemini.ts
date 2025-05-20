import {
  ChatAdapter,
  Message,
  TextGenerationParams,
  Tool,
} from "@/ai/adapters/type";

export class GeminiAdapter implements ChatAdapter {
  constructor(private apiKey: string) {}

  async send(
    messages: Message[],
    tools: Tool[] = [],
    params: TextGenerationParams,
    callTool?: boolean,
    depth = 0
  ): Promise<Message[]> {
    if (depth > 10) throw new Error("Too many recursive tool calls");

    const responseShape = callTool
      ? {
          tool_config: {
            function_calling_config: {
              mode: "ANY",
            },
          },
        }
      : params.context?.outputSchema
      ? {
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: params.context.outputSchema,
          },
        }
      : {};
    const toolDeclarations = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    const buildContents = (msgs: Message[]) =>
      msgs.map((m) => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ [m.contentKey || "text"]: m.content }],
      }));

    const baseContents = buildContents(messages);

    const requestBody = {
      system_instruction: params.systemPrompt
        ? {
            parts: [
              {
                text: params.systemPrompt,
              },
            ],
          }
        : undefined,
      contents: baseContents,
      tools: toolDeclarations.length
        ? [
            {
              functionDeclarations: toolDeclarations,
            },
          ]
        : undefined,
      ...responseShape,
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await res.json();
    const candidates = data.candidates || [];

    const toolCalls = (candidates[0]?.content?.parts || []).filter(
      (part: any) => part.functionCall
    );

    if (toolCalls.length > 0) {
      // Handle only one tool call at a time (Gemini limitation)
      const call = toolCalls[0];
      const tool = tools.find((t) => t.name === call.functionCall.name);
      if (!tool) throw new Error(`Tool not found: ${call.functionCall.name}`);

      const args = call.functionCall.args || {};
      const result = await tool.execute(args);
      const updatedContents: Message[] = [
        ...messages,
        {
          role: "assistant",
          content: call.functionCall,
          contentKey: "functionCall",
        },
        {
          role: "user",
          content: {
            name: call.functionCall.name,
            response: { result },
          },
          contentKey: "functionResponse",
        },
      ];

      return await this.send(updatedContents, [], params, false, depth + 1);
    }

    // No tool call — normal response
    return candidates.map((c: any) => ({
      role: "assistant",
      content: c.content?.parts?.map((p: any) => p.text || "").join("") || "",
    }));
  }
}
