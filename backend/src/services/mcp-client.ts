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
  ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: any[];
}

export interface McpPromptResponse {
  messages: Array<{
    role: string;
    content: {
      type: string;
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
  private readonly serverUrl = config.mcpClientUrl;
  private readonly clientInfo = {
    name: "manga-ai-client",
    version: "1.0.0",
  };

  /**
   * Initialize MCP client connection with improved error handling
   */
  private async initializeClient(): Promise<void> {
    if (this.connectionPromise) {
      logger.info("⏳ Waiting for existing connection...");
      return this.connectionPromise;
    }

    if (this.client && this.isConnected && this.transport) {
      logger.info("✅ Using existing connection");
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
      logger.info("🚀 Initializing MCP client...");

      // Clean up any existing connections
      await this.cleanup();

      // Create new transport with session handling
      this.transport = new StreamableHTTPClientTransport(
        new URL(this.serverUrl)
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
      logger.info(`📡 Connecting to MCP server at ${this.serverUrl}...`);

      const connectPromise = this.client.connect(this.transport);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 10000);
      });

      await Promise.race([connectPromise, timeoutPromise]);

      // Extract session ID from response headers if available
      if (this.transport && "sessionId" in this.transport) {
        this.sessionId = (this.transport as any).sessionId;
        logger.info(`📝 Session ID: ${this.sessionId}`);
      }

      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info("✅ MCP client connected successfully");
    } catch (error: any) {
      logger.error("❌ Failed to initialize MCP client:", error.message);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Set up connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.client || !this.transport) return;

    this.transport.onclose = () => {
      logger.warn("🔌 MCP connection closed");
      this.isConnected = false;
    };

    this.transport.onerror = (error: any) => {
      logger.error("💥 MCP transport error:", error);
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
        this.client = null;
      }

      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }

      this.isConnected = false;
      this.sessionId = null;
    } catch (error) {
      logger.warn("⚠️ Error during cleanup:", error);
    }
  }

  /**
   * Check if MCP server is available with health check
   */
  async checkConnection(): Promise<boolean> {
    try {
      logger.info("🔍 Checking MCP connection...");

      // First, try a health check
      try {
        const healthResponse = await fetch(
          `http://localhost:${config.mcpServerPort}/health`
        );
        if (!healthResponse.ok) {
          logger.warn("❌ Health check failed");
          return false;
        }
        logger.info("✅ Server health check passed");
      } catch (error) {
        logger.warn("❌ Server health check failed:", error);
        return false;
      }

      // Try to connect if not already connected
      await this.initializeClient();

      // Test the connection with a simple request
      if (this.client && this.isConnected) {
        await this.client.listTools();
        logger.info("📡 Connection check successful");
        return true;
      }

      return false;
    } catch (error: any) {
      logger.warn("❌ MCP connection check failed:", error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Ensure client is connected with retry logic
   */
  private async ensureConnected(): Promise<Client> {
    if (!this.client || !this.isConnected) {
      await this.initializeClient();
    }

    if (!this.client) {
      throw new Error("Failed to initialize MCP client");
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
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxReconnectAttempts; attempt++) {
      try {
        await this.ensureConnected();
        const result = await operation();
        this.reconnectAttempts = 0; // Reset on success
        return result;
      } catch (error: any) {
        lastError = error;
        this.isConnected = false;

        logger.warn(
          `⚠️ ${operationName} failed (attempt ${attempt}/${this.maxReconnectAttempts}):`,
          error.message
        );

        if (attempt < this.maxReconnectAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.info(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          await this.cleanup(); // Clean up before retry
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
      const client = await this.ensureConnected();
      const result = await client.request(
        { method: "tools/list" },
        ListToolsResultSchema
      );
      return result.tools.map((tool) => ({
        name: tool.name,
        description: tool.description || "",
        inputSchema: tool.inputSchema,
      }));
    }, "getTools");
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(name: string, arguments_: any = {}): Promise<any> {
    return this.executeWithRetry(async () => {
      const client = await this.ensureConnected();
      const result = await client.request(
        {
          method: "tools/call",
          params: {
            name,
            arguments: arguments_,
          },
        },
        CallToolResultSchema
      );

      // Extract the actual content from the result
      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("");

        try {
          return JSON.parse(textContent);
        } catch {
          return textContent;
        }
      }

      return result;
    }, `callTool(${name})`);
  }

  /**
   * Get available prompts from MCP server
   */
  async getPrompts(): Promise<McpPrompt[]> {
    return this.executeWithRetry(async () => {
      const client = await this.ensureConnected();
      const result = await client.request(
        { method: "prompts/list" },
        ListPromptsResultSchema
      );
      return result.prompts.map((prompt) => ({
        name: prompt.name,
        description: prompt.description || "",
        arguments: prompt.arguments,
      }));
    }, "getPrompts");
  }

  /**
   * Get a specific prompt from the MCP server
   */
  async getPrompt(name: string, arguments_?: any): Promise<McpPromptResponse> {
    return this.executeWithRetry(async () => {
      const client = await this.ensureConnected();
      const result = await client.request(
        {
          method: "prompts/get",
          params: {
            name,
            arguments: arguments_ || {},
          },
        },
        GetPromptResultSchema
      );

      return {
        messages: result.messages.map((msg) => ({
          role: msg.role,
          content: {
            type: "text",
            text: msg.content.text || "",
          },
        })),
      };
    }, `getPrompt(${name})`);
  }

  /**
   * Close the MCP client connection
   */
  async close(): Promise<void> {
    logger.info("🔌 Closing MCP client connection...");
    await this.cleanup();
    logger.info("✅ MCP client connection closed");
  }
}

// Export singleton instance
export const mcpClient = new McpClientService();
