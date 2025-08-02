// Frontend MCP service - simplified to call backend APIs
export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
    type?: string;
    enum?: string[];
  }>;
}

export interface McpState {
  isConnected: boolean;
  tools: McpTool[];
  prompts: McpPrompt[];
}

export class McpService {
  async getStatus(
    context: "chat" | "project-creation" = "chat"
  ): Promise<McpState> {
    try {
      const response = await fetch(`/api/mcp/status?context=${context}`);
      const data = await response.json();

      return {
        isConnected: data.isConnected || false,
        tools: data.tools || [],
        prompts: data.prompts || [],
      };
    } catch (error) {
      console.error("Failed to get MCP status:", error);
      return {
        isConnected: false,
        tools: [],
        prompts: [],
      };
    }
  }

  async callTool(name: string, args: any = {}) {
    const response = await fetch("/api/mcp/call-tool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, args }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to call MCP tool");
    }

    const data = await response.json();
    return data.result;
  }

  async getPrompt(name: string, args: any = {}) {
    const response = await fetch("/api/mcp/get-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, args }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get MCP prompt");
    }

    const data = await response.json();
    return data.prompt;
  }

  async getPromptTemplate(name: string, args: any = {}): Promise<string> {
    const promptResponse = await this.getPrompt(name, args);

    // Extract text from the prompt response
    if (promptResponse.messages && promptResponse.messages.length > 0) {
      const userMessage = promptResponse.messages.find(
        (m: any) => m.role === "user"
      );
      if (userMessage && userMessage.content && userMessage.content.text) {
        return userMessage.content.text;
      }
    }

    return promptResponse.description || name;
  }
}

export const mcpService = new McpService();
