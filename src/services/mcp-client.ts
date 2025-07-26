/**
 * Improved MCP Client Service with Better Connection Handling
 * Addresses common "Connection closed" issues
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  CallToolResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListToolsResultSchema,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

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
    type?: string;
    enum?: string[];
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
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private sessionId: string | null = null;

  // Configuration
  private readonly serverUrl = "http://localhost:3001/mcp";
  private readonly clientInfo = {
    name: "manga-ai-client",
    version: "1.0.0",
  };

  /**
   * Initialize MCP client connection with improved error handling
   */
  private async initializeClient(): Promise<void> {
    if (this.connectionPromise) {
      console.log("⏳ Waiting for existing connection...");
      return this.connectionPromise;
    }

    if (this.client && this.isConnected && this.transport) {
      console.log("✅ Using existing connection");
      return;
    }

    this.connectionPromise = this._doInitialization();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async _doInitialization(): Promise<void> {
    try {
      console.log("🚀 Initializing MCP client...");

      // Clean up any existing connections
      await this.cleanup();

      // Create new transport with session handling
      this.transport = new StreamableHTTPClientTransport(
        new URL(this.serverUrl),
        {
          // headers: this.sessionId ? { "mcp-session-id": this.sessionId } : {},
        }
      );

      // Create new client
      this.client = new Client(
        {
          name: this.clientInfo.name,
          version: this.clientInfo.version,
        },
        {
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
          },
        }
      );

      // Set up connection event handlers
      this.setupConnectionHandlers();

      // Connect to server with timeout
      console.log(`📡 Connecting to MCP server at ${this.serverUrl}...`);

      const connectPromise = this.client.connect(this.transport);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 10000);
      });

      await Promise.race([connectPromise, timeoutPromise]);

      // Extract session ID from response headers if available
      if (this.transport && "sessionId" in this.transport) {
        this.sessionId = (this.transport as any).sessionId;
        console.log(`📝 Session ID: ${this.sessionId}`);
      }

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("✅ MCP client connected successfully");
    } catch (error: any) {
      console.error("❌ Failed to initialize MCP client:", error.message);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Set up connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.client || !this.transport) return;

    // Handle transport close
    this.transport.onclose = () => {
      console.warn("🔌 Transport connection closed");
      this.isConnected = false;
    };

    // Handle client errors
    this.client.onerror = (error) => {
      console.error("❌ Client error:", error);
      this.isConnected = false;
    };
  }

  /**
   * Clean up existing connections
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
      }
    } catch (error) {
      console.warn("⚠️ Error during client cleanup:", error);
    }

    try {
      if (this.transport) {
        await this.transport.close();
      }
    } catch (error) {
      console.warn("⚠️ Error during transport cleanup:", error);
    }

    this.client = null;
    this.transport = null;
    this.isConnected = false;
  }

  /**
   * Check if MCP server is available with health check
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log("🔍 Checking MCP connection...");

      // First, try a health check
      try {
        const healthResponse = await fetch(`http://localhost:3001/health`);
        if (!healthResponse.ok) {
          console.warn("❌ Health check failed");
          return false;
        }
        console.log("✅ Server health check passed");
      } catch (error) {
        console.warn("❌ Server health check failed:", error);
        return false;
      }

      // Try to connect if not already connected
      await this.initializeClient();

      // Test the connection with a simple request
      if (this.client && this.isConnected) {
        await this.client.listTools();
        console.log("📡 Connection check successful");
        return true;
      }

      return false;
    } catch (error: any) {
      console.warn("❌ MCP connection check failed:", error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Ensure client is connected with retry logic
   */
  private async ensureConnected(): Promise<Client> {
    if (!this.client || !this.isConnected) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `🔄 Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * this.reconnectAttempts)
        );

        await this.initializeClient();
      } else {
        throw new Error(
          `Failed to establish MCP connection after ${this.maxReconnectAttempts} attempts`
        );
      }
    }

    if (!this.client) {
      throw new Error("Failed to establish MCP connection");
    }

    return this.client;
  }

  /**
   * Execute MCP request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxReconnectAttempts; attempt++) {
      try {
        const client = await this.ensureConnected();
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.warn(
          `❌ ${operationName} failed (attempt ${attempt}):`,
          error.message
        );

        if (
          error.message.includes("Connection closed") ||
          error.message.includes("transport")
        ) {
          console.log("🔄 Connection issue detected, resetting connection...");
          this.isConnected = false;
          await this.cleanup();

          if (attempt < this.maxReconnectAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }

        if (attempt === this.maxReconnectAttempts) {
          throw lastError;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Get available tools from MCP server
   */
  async getTools(): Promise<McpTool[]> {
    return this.executeWithRetry(async () => {
      console.log("🛠️ Fetching tools...");
      const client = await this.ensureConnected();

      const response = await client.listTools();
      const result = ListToolsResultSchema.parse(response);

      const tools: McpTool[] = result.tools.map((tool) => ({
        name: tool.name,
        description: tool.description ?? "",
        inputSchema: tool.inputSchema,
      }));

      console.log(`✅ Retrieved ${tools.length} tools`);
      return tools;
    }, "getTools");
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(name: string, arguments_: any = {}): Promise<any> {
    return this.executeWithRetry(async () => {
      console.log(`🔧 Calling tool: ${name}`, arguments_);
      const client = await this.ensureConnected();

      const response = await client.callTool({
        name,
        arguments: arguments_,
      });

      const result = CallToolResultSchema.parse(response);
      console.log(`✅ Tool ${name} completed`);
      return result;
    }, `callTool(${name})`);
  }

  /**
   * Get available resources from MCP server
   */
  async getResources(): Promise<McpResource[]> {
    return this.executeWithRetry(async () => {
      console.log("📄 Fetching resources...");
      const client = await this.ensureConnected();

      const response = await client.listResources();
      const result = ListResourcesResultSchema.parse(response);

      const resources: McpResource[] = result.resources.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description || "",
        mimeType: resource.mimeType || "application/json",
      }));

      console.log(`✅ Retrieved ${resources.length} resources`);
      return resources;
    }, "getResources");
  }

  /**
   * Read a resource from the MCP server
   */
  async readResource(uri: string): Promise<any> {
    return this.executeWithRetry(async () => {
      console.log(`📖 Reading resource: ${uri}`);
      const client = await this.ensureConnected();

      const response = await client.readResource({ uri });
      const result = ReadResourceResultSchema.parse(response);

      console.log(`✅ Resource read successfully`);
      return result;
    }, `readResource(${uri})`);
  }

  /**
   * Get available prompts from MCP server
   */
  async getPrompts(): Promise<McpPrompt[]> {
    return this.executeWithRetry(async () => {
      console.log("📝 Fetching prompts...");
      const client = await this.ensureConnected();

      const response = await client.listPrompts();
      const result = ListPromptsResultSchema.parse(response);

      const prompts: McpPrompt[] = result.prompts.map((prompt) => ({
        name: prompt.name,
        description: prompt.description ?? "",
        arguments: prompt.arguments?.map((arg) => ({
          name: arg.name,
          description: arg.description ?? "",
          required: arg.required,
          type: typeof arg.type === "string" ? arg.type : undefined,
          enum: Array.isArray(arg.enum) ? (arg.enum as string[]) : undefined,
        })),
      }));

      console.log(`✅ Retrieved ${prompts.length} prompts`);
      return prompts;
    }, "getPrompts");
  }

  /**
   * Get a specific prompt from the MCP server
   */
  async getPrompt(
    name: string,
    arguments_: Record<string, any> = {}
  ): Promise<McpPromptResponse> {
    return this.executeWithRetry(async () => {
      console.log(`📝 Getting prompt: ${name}`, arguments_);
      const client = await this.ensureConnected();

      const response = await client.getPrompt({
        name,
        arguments: arguments_,
      });

      const result = GetPromptResultSchema.parse(response);

      const promptResponse: McpPromptResponse = {
        description: result.description || "",
        messages: result.messages.map((msg) => ({
          role: msg.role,
          content: {
            type: "text",
            text:
              typeof msg.content === "string"
                ? msg.content
                : typeof msg.content.text === "string"
                ? msg.content.text
                : "",
          },
        })),
      };

      console.log(`✅ Prompt ${name} retrieved`);
      return promptResponse;
    }, `getPrompt(${name})`);
  }

  /**
   * Get a prompt template text to populate chat input
   */
  async getPromptTemplate(name: string, arguments_: any = {}): Promise<string> {
    try {
      console.log(`📋 Getting prompt template: ${name}`);
      const promptResponse = await this.getPrompt(name, arguments_);

      if (!promptResponse.messages || promptResponse.messages.length === 0) {
        throw new Error("No prompt content received");
      }

      const promptText = promptResponse.messages[0].content.text;
      console.log(`✅ Template retrieved for ${name}`);
      return promptText;
    } catch (error: any) {
      console.error(`❌ Failed to get prompt template ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Get prompts filtered for chat interface
   */
  async getChatPrompts(): Promise<McpPrompt[]> {
    const allPrompts = await this.getPrompts();
    const excludedPrompts = ["story-generation"];
    const filtered = allPrompts.filter(
      (prompt) => !excludedPrompts.includes(prompt.name)
    );
    console.log(`📝 Chat prompts: ${filtered.length}/${allPrompts.length}`);
    return filtered;
  }

  /**
   * Get tools filtered for chat interface
   */
  async getChatTools(): Promise<McpTool[]> {
    const allTools = await this.getTools();
    const excludedTools = ["create-project"];
    const filtered = allTools.filter(
      (tool) => !excludedTools.includes(tool.name)
    );
    console.log(`🛠️ Chat tools: ${filtered.length}/${allTools.length}`);
    return filtered;
  }

  /**
   * Get prompts for project creation
   */
  async getProjectCreationPrompts(): Promise<McpPrompt[]> {
    const allPrompts = await this.getPrompts();
    const projectCreationPrompts = ["story-generation"];
    const filtered = allPrompts.filter((prompt) =>
      projectCreationPrompts.includes(prompt.name)
    );
    console.log(`📝 Project prompts: ${filtered.length}/${allPrompts.length}`);
    return filtered;
  }

  /**
   * Get tools for project creation
   */
  async getProjectCreationTools(): Promise<McpTool[]> {
    const allTools = await this.getTools();
    const projectCreationTools = ["create-project"];
    const filtered = allTools.filter((tool) =>
      projectCreationTools.includes(tool.name)
    );
    console.log(`🛠️ Project tools: ${filtered.length}/${allTools.length}`);
    return filtered;
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    try {
      console.log("🔌 Disconnecting from MCP server...");
      await this.cleanup();
      this.sessionId = null;
      this.reconnectAttempts = 0;
      console.log("✅ Disconnected successfully");
    } catch (error: any) {
      console.error("❌ Error during disconnect:", error.message);
    }
  }

  /**
   * Reset connection state (useful for debugging)
   */
  async resetConnection(): Promise<void> {
    console.log("🔄 Resetting MCP connection...");
    await this.disconnect();
    // Connection will be re-established on next request
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    hasClient: boolean;
    sessionId: string | null;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      hasClient: this.client !== null,
      sessionId: this.sessionId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Force reconnection (useful for testing)
   */
  async forceReconnect(): Promise<void> {
    console.log("🔄 Forcing reconnection...");
    this.isConnected = false;
    await this.cleanup();
    this.reconnectAttempts = 0;
    await this.initializeClient();
  }
}

// Export singleton instance
export const mcpClient = new McpClientService();
