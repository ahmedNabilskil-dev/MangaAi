/**
 * MCP Client Service
 * Handles communication with the MCP server for tools, resources, and prompts
 */

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export interface McpPromptResponse {
  description: string;
  messages: Array<{
    role: "user" | "assistant";
    content: {
      type: "text";
      text: string;
    };
  }>;
}

class McpClientService {
  private baseUrl = "http://localhost:3001";
  private isConnected = false;

  /**
   * Check if MCP server is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.warn("MCP server not available:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get available tools from MCP server
   */
  async getTools(): Promise<McpTool[]> {
    if (!this.isConnected && !(await this.checkConnection())) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/mcp/tools/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error("Failed to fetch MCP tools:", error);
      return [];
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(name: string, arguments_: any = {}): Promise<any> {
    if (!this.isConnected && !(await this.checkConnection())) {
      throw new Error("MCP server not available");
    }

    try {
      const response = await fetch(`${this.baseUrl}/mcp/tools/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          arguments: arguments_,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.isError) {
        throw new Error(data.content[0]?.text || "Tool execution failed");
      }

      return data;
    } catch (error) {
      console.error(`Failed to call MCP tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get available resources from MCP server
   */
  async getResources(): Promise<McpResource[]> {
    if (!this.isConnected && !(await this.checkConnection())) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/mcp/resources/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.resources || [];
    } catch (error) {
      console.error("Failed to fetch MCP resources:", error);
      return [];
    }
  }

  /**
   * Read a resource from MCP server
   */
  async readResource(uri: string): Promise<any> {
    if (!this.isConnected && !(await this.checkConnection())) {
      throw new Error("MCP server not available");
    }

    try {
      const response = await fetch(`${this.baseUrl}/mcp/resources/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uri }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to read MCP resource ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Get available prompts from MCP server
   */
  async getPrompts(): Promise<McpPrompt[]> {
    if (!this.isConnected && !(await this.checkConnection())) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/mcp/prompts/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.prompts || [];
    } catch (error) {
      console.error("Failed to fetch MCP prompts:", error);
      return [];
    }
  }

  /**
   * Get a prompt from MCP server
   */
  async getPrompt(
    name: string,
    arguments_: any = {}
  ): Promise<McpPromptResponse> {
    if (!this.isConnected && !(await this.checkConnection())) {
      throw new Error("MCP server not available");
    }

    try {
      const response = await fetch(`${this.baseUrl}/mcp/prompts/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          arguments: arguments_,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to get MCP prompt ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a prompt template text to populate chat input
   */
  async getPromptTemplate(name: string, arguments_: any = {}): Promise<string> {
    try {
      // Get the prompt from MCP server
      const promptResponse = await this.getPrompt(name, arguments_);

      if (!promptResponse.messages || promptResponse.messages.length === 0) {
        throw new Error("No prompt content received");
      }

      // Extract the prompt text as a template
      const promptText = promptResponse.messages[0].content.text;
      return promptText;
    } catch (error) {
      console.error(`Failed to get prompt template ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get prompts filtered for chat interface (excludes project creation prompts)
   */
  async getChatPrompts(): Promise<McpPrompt[]> {
    const allPrompts = await this.getPrompts();

    // Filter out project creation prompts for chat interface
    const excludedPrompts = ["story-generation"];

    return allPrompts.filter(
      (prompt) => !excludedPrompts.includes(prompt.name)
    );
  }

  /**
   * Get tools filtered for chat interface (excludes project creation tools)
   */
  async getChatTools(): Promise<McpTool[]> {
    const allTools = await this.getTools();

    // Filter out project creation tools for chat interface
    const excludedTools = ["create-project"];

    return allTools.filter((tool) => !excludedTools.includes(tool.name));
  }

  /**
   * Get prompts for project creation (only includes project creation prompts)
   */
  async getProjectCreationPrompts(): Promise<McpPrompt[]> {
    const allPrompts = await this.getPrompts();

    // Only include project creation prompts
    const projectCreationPrompts = ["story-generation"];

    return allPrompts.filter((prompt) =>
      projectCreationPrompts.includes(prompt.name)
    );
  }

  /**
   * Get tools for project creation (only includes project creation tools)
   */
  async getProjectCreationTools(): Promise<McpTool[]> {
    const allTools = await this.getTools();

    // Only include project creation tools
    const projectCreationTools = ["create-project"];

    return allTools.filter((tool) => projectCreationTools.includes(tool.name));
  }
}

// Export singleton instance
export const mcpClient = new McpClientService();
