import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  CallToolResultSchema,
  GetPromptResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';

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

export interface McpCallResult {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
  }>;
  isError?: boolean;
}

@Injectable()
export class McpClientService {
  private readonly logger = new Logger(McpClientService.name);
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {}

  private async ensureConnected(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.client && this.isConnected) {
      return;
    }

    this.connectionPromise = this._connect();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async _connect(): Promise<void> {
    try {
      this.logger.log('Connecting to MCP server via stdio...');

      // Cleanup any existing connections
      await this.cleanup();

      // Get the path to the MCP server
      const mcpServerPath = path.join(process.cwd(), 'src', 'mcp', 'server.ts');

      // Create stdio transport
      this.transport = new StdioClientTransport({
        command: 'npx',
        args: ['tsx', mcpServerPath],
        cwd: process.cwd(),
      });

      // Create client
      this.client = new Client(
        {
          name: 'manga-ai-backend-client',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
            resources: {},
            prompts: {},
          },
        },
      );

      // Connect client to transport
      await this.client.connect(this.transport);

      this.isConnected = true;
      this.logger.log('Successfully connected to MCP server');
    } catch (error) {
      this.logger.error('Failed to connect to MCP server:', error);
      await this.cleanup();
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
    } catch (error) {
      this.logger.warn('Error during client cleanup:', error);
    }

    try {
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }
    } catch (error) {
      this.logger.warn('Error during transport cleanup:', error);
    }

    this.isConnected = false;
  }

  async callTool(name: string, args: any = {}): Promise<McpCallResult> {
    try {
      await this.ensureConnected();

      if (!this.client) {
        throw new Error('MCP client not connected');
      }

      this.logger.log(`Calling MCP tool: ${name} with args:`, args);

      const response = await this.client.callTool({
        name,
        arguments: args,
      });

      const result = CallToolResultSchema.parse(response);

      return {
        content: result.content.map((item) => ({
          type: item.type || 'text',
          text:
            typeof (item as any).text === 'string'
              ? (item as any).text
              : undefined,
          data: (item as any).data || undefined,
        })),
        isError: result.isError,
      };
    } catch (error) {
      this.logger.error(`Error calling tool ${name}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error calling tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getPrompt(name: string, args: any = {}) {
    try {
      await this.ensureConnected();

      if (!this.client) {
        throw new Error('MCP client not connected');
      }

      const response = await this.client.getPrompt({
        name,
        arguments: args,
      });

      const result = GetPromptResultSchema.parse(response);

      return {
        messages: result.messages.map((msg) => ({
          role: msg.role,
          content: {
            type: 'text',
            text:
              typeof msg.content === 'string'
                ? msg.content
                : (msg.content as any)?.text || '',
          },
        })),
        description: result.description || '',
      };
    } catch (error) {
      this.logger.error(`Error getting prompt ${name}:`, error);
      throw new Error(
        `Failed to get prompt ${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Method to get available tools for AI context
  async getAvailableTools(): Promise<McpTool[]> {
    try {
      await this.ensureConnected();
      const result = await this.client.listTools();
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        return Object.values(result) as McpTool[];
      }
      return result as unknown as McpTool[];
    } catch (error) {
      this.logger.error('Error getting available tools:', error);
      return [];
    }
  }
  // Method to get available prompts for AI context
  async getAvailablePrompts(): Promise<McpPrompt[]> {
    try {
      await this.ensureConnected();
      const result = await this.client.listPrompts();
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        return Object.values(result) as McpPrompt[];
      }
      return result as unknown as McpPrompt[];
    } catch (error) {
      this.logger.error('Error getting available prompts:', error);
      return [];
    }
  }
}

export const mcpClient = new McpClientService();
