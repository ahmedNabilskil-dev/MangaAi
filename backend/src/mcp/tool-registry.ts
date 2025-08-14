// src/mcp/tool-registry.ts
// Central registry for MCP tools using MCP SDK types

// Adjust the import to use the correct exported type from the SDK
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { chapterTools } from './tools/chapter.tools';
import { characterTools } from './tools/character.tools';
import { dialogueTools } from './tools/dialogue.tools';
import { genericTools } from './tools/generic.tools';
import { PanelTools } from './tools/panel.tools';
import { sceneTools } from './tools/scene.tools';
import { TemplateTools } from './tools/template.tools';

export interface RegisteredTool extends Tool {
  handler?: (args: any) => Promise<any>;
}

export class ToolRegistry {
  private toolRegistry: Map<string, RegisteredTool> = new Map<
    string,
    RegisteredTool
  >();

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.toolRegistry.get(name);
    if (!tool || typeof tool.handler !== 'function') {
      throw new Error(`Tool '${name}' not found or has no handler.`);
    }
    return await tool.handler(args);
  }

  registerTool(tool: Tool) {
    this.toolRegistry.set(tool.name, tool);
  }

  registerTools(tools: Tool[]) {
    tools.forEach((tool) => this.registerTool(tool));
  }

  getRegisteredTools(): Tool[] {
    return Array.from(this.toolRegistry.values());
  }

  getToolByName(name: string): Tool | undefined {
    return this.toolRegistry.get(name);
  }
}

// Instantiate the registry
export const toolRegistry = new ToolRegistry();

// Create some basic demo tools for testing
const demoTools: RegisteredTool[] = [
  {
    name: 'echo',
    description: 'Echo the input message',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message to echo',
        },
      },
      required: ['message'],
    },
    handler: async (args: { message: string }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${args.message}`,
          },
        ],
      };
    },
  },
  {
    name: 'analyze_code',
    description: 'Analyze code for potential improvements',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to analyze',
        },
        language: {
          type: 'string',
          description: 'Programming language',
        },
      },
      required: ['code'],
    },
    handler: async (args: { code: string; language?: string }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Code analysis for ${args.language || 'unknown language'}:\n\nCode:\n${args.code}\n\nAnalysis:\n- Code appears to be well-structured\n- Consider adding comments for clarity\n- No obvious syntax errors detected`,
          },
        ],
      };
    },
  },
];

// TODO: Re-enable these tools once we have proper backend implementations
toolRegistry.registerTools(chapterTools);
toolRegistry.registerTools(characterTools);
toolRegistry.registerTools(sceneTools);
toolRegistry.registerTools(PanelTools);
toolRegistry.registerTools(dialogueTools);
toolRegistry.registerTools(TemplateTools);
toolRegistry.registerTools(genericTools);

// Also keep demo tools for testing
toolRegistry.registerTools(demoTools);
