import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tool handlers

// Import schemas

import mangaMCPPrompts from "./prompts/manga-prompts.js";
import { toolRegistry } from "./tool-registry.js";

export abstract class BaseMangaAiMcpServer {
  protected server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "manga-ai-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupPromptHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: toolRegistry.getRegisteredTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        return await toolRegistry.executeTool(name, args);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool ${name}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupPromptHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      try {
        return {
          prompts: Object.entries(mangaMCPPrompts).map(([key, prompt]) => ({
            name: key,
            description: prompt.description,
            arguments: prompt.arguments || [],
          })),
        };
      } catch (error) {
        console.error("Error listing prompts:", error);
        throw new Error("Failed to list prompts");
      }
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      try {
        const promptTemplate =
          mangaMCPPrompts[request.params.name as keyof typeof mangaMCPPrompts];

        if (!promptTemplate) {
          throw new Error(`Prompt not found: ${request.params.name}`);
        }

        const renderedPrompt = await promptTemplate.handler(
          request.params.arguments || {}
        );

        return {
          description: promptTemplate.description,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: renderedPrompt,
              },
            },
          ],
        };
      } catch (error) {
        console.error("Error getting prompt:", error);
        throw new Error(
          `Failed to get prompt: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });
  }

  // Abstract method that concrete implementations must provide
  abstract run(): Promise<void>;
}
