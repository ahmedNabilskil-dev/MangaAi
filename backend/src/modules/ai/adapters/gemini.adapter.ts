import {
  Content,
  FunctionCallingConfigMode,
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
  Modality,
  Part,
  ToolListUnion,
} from '@google/genai';
import { ChatAdapter, Message, TextGenerationParams, Tool } from '../type';
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
    depth = 0,
  ): Promise<Message[]> {
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
      if (m.contentKey === 'functionCall') {
        parts.push({
          functionCall: m.content as {
            name: string;
            args: Record<string, any>;
          },
        });
      } else if (m.contentKey === 'functionResponse') {
        parts.push({
          functionResponse: m.content as { name: string; response: any },
        });
      } else {
        parts.push({ text: m.content as string });
      }

      // Map your internal role to the SDK's Role type
      const role = m.role === 'assistant' ? 'model' : m.role;

      return {
        role: role,
        parts: parts,
      };
    });

    const requestOptions: GenerateContentParameters = {
      model: params.model || 'gemini-2.5-flash',
      contents: contents,
      config: {
        tools: geminiTools.length ? geminiTools : undefined,
        systemInstruction: params.systemPrompt,
        temperature: params.temperature || 0.7,
        maxOutputTokens: params.maxOutputTokens || 8192,
        topP: params.topP || 0.8,
        topK: params.topK || 40,
      },
    };

    // Handle structured output based on scenarios:
    // 1. No tools: AI outputs structured output directly if schema exists
    // 2. Tools present:
    //    a. callTool=true: AI calls tools first, then on second call (when tools=[]) returns structured output
    //    b. callTool=false or undefined: Pass same config including tools, allowing recursive tool calls

    const hasTools = tools.length > 0;
    const hasOutputSchema = params.context?.outputSchema;

    // Scenario 1: No tools
    if (!hasTools) {
      if (hasOutputSchema) {
        // No tools + output schema = structured output
        requestOptions.config!.responseMimeType = 'application/json';
        requestOptions.config!.responseSchema = params.context!.outputSchema;
      }
      // If callTool=true but no tools, just ignore callTool (no tools to call)
    }

    // Scenario 2: Tools present
    if (hasTools) {
      if (callTool === true) {
        // Scenario 2a: Force tool calling, no structured output in this call
        requestOptions.config!.toolConfig = {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
          },
        };
        // Don't set structured output here - will be set in recursive call
      } else {
        // Scenario 2b: callTool=false or undefined
        // Allow tools to be available but don't force them
        if (hasOutputSchema) {
          // Tools available + structured output
          requestOptions.config!.responseMimeType = 'application/json';
          requestOptions.config!.responseSchema = params.context!.outputSchema;
        }
        // If no output schema, tools are still available for optional use
      }
    }

    let result: GenerateContentResponse;
    try {
      result = await this.genAI.models.generateContent(requestOptions);
    } catch (error: any) {
      // Handle potential errors from the API call
      console.error('Error generating content:', error);
      // Attempt to parse the error message if it's in a JSON format from the API
      try {
        const errorData = JSON.parse(error.message.split('\n')[0]);
        if (errorData && errorData.error && errorData.error.message) {
          throw new Error(`Gemini API Error: ${errorData.error.message}`);
        }
      } catch (parseError) {
        // If not a JSON error, re-throw the original error
        throw error;
      }
      throw error; // Re-throw if parsing fails
    }
    console.log({ result: JSON.stringify(result, null, 2) });
    const toolCalls = result.functionCalls || [];
    const candidate = result.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Check if there are any text parts in the response
    const textParts = parts
      .filter((p) => p.text)
      .map((p) => p.text)
      .join('');

    if (toolCalls.length > 0) {
      // Handle multiple tool calls
      const updatedMessages: Message[] = [...messages];

      // Add text content if present
      if (textParts.trim()) {
        updatedMessages.push({
          role: 'assistant',
          content: textParts,
        });
      }

      // Process all tool calls
      for (const call of toolCalls) {
        const args = call.args || {};
        const toolName = typeof call.name === 'string' ? call.name : '';
        if (!toolName) throw new Error('Tool call missing name');

        let toolResult;
        try {
          // Dynamically import mcpClient to avoid circular dependencies
          const { mcpClient } = await import('../../../services/mcp-client');

          toolResult = await mcpClient.callTool(toolName, args);
        } catch (err) {
          throw new Error(
            `MCP tool call failed for ${toolName}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }

        // Add function call and response to messages
        updatedMessages.push(
          {
            role: 'assistant',
            content: call,
            contentKey: 'functionCall',
          },
          {
            role: 'user',
            content: {
              name: call.name,
              response: { result: toolResult },
            },
            contentKey: 'functionResponse',
          },
        );
      }

      // Continue the conversation with all tool results
      // If callTool was true, next call should have no tools to allow structured output
      // If callTool was false/undefined, keep the same tools configuration
      const nextTools = callTool ? [] : tools;
      const nextCallTool = callTool ? false : callTool;
      return await this.send(
        updatedMessages,
        nextTools,
        params,
        nextCallTool,
        depth + 1,
      );
    }

    // No tool call — normal response
    return result.candidates!.map((c) => ({
      role: 'assistant',
      content: c.content?.parts?.map((p) => p.text || '').join('') || '',
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
      model: 'gemini-2.0-flash-preview-image-generation',
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 0,
      },
      history,
    });

    const response = await chat.sendMessage({ message: [{ text: prompt }] });

    const finalResponse = { text: '', image46: '' };

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        finalResponse.text = part.text;
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        finalResponse.image46 = imageData || '';
      }
    }

    return finalResponse;
  };
}
