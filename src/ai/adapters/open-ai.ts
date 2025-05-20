import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import {
  ChatAdapter,
  Message,
  TextGenerationParams,
  Tool,
} from "@/lib/ai/type";

export class OpenAIAdapter implements ChatAdapter {
  constructor(private apiKey: string) {}

  async send(
    messages: Message[],
    tools: Tool[] = [],
    params: TextGenerationParams,
    manga_project_id: string
  ): Promise<Message[]> {
    const systemPrompt: Message = {
      role: "system",
      content: SYSTEM_PROMPT,
    };

    const functions = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.model,
        messages: [systemPrompt, ...messages],
        functions,
        tool_choice: "auto",
      }),
    });

    const data = await res.json();

    const toolCalls = data.choices[0].message.tool_calls || [];

    const toolResponses: Message[] = [];

    for (const call of toolCalls) {
      const tool = tools.find((t) => t.name === call.function.name);
      if (!tool) continue;

      const args = JSON.parse(call.function.arguments);
      const result = await tool.execute(args);

      toolResponses.push({
        role: "tool",
        content: result,
        name: call.function.name,
      });
    }

    const nextMessages: Message[] = [...messages, ...toolResponses];

    if (toolResponses.length > 0) {
      // Re-send with tool results to complete the flow
      return this.send(nextMessages, tools, params);
    }

    return data.choices.map((choice: any) => ({
      role: choice.message.role,
      content: choice.message.content,
    }));
  }
}
