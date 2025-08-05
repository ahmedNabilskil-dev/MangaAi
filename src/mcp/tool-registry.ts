// src/mcp/tool-registry.ts
// Central registry for MCP tools using MCP SDK types

// Adjust the import to use the correct exported type from the SDK
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { chapterTools } from "./tools/chapter.tools";
import { characterTools } from "./tools/character.tools";
import { dialogueTools } from "./tools/dialogue.tools";
import { genericTools } from "./tools/generic.tools";
import { PanelTools } from "./tools/panel.tools";
import { projectTools } from "./tools/project.tools";
import { sceneTools } from "./tools/scene.tools";
import { TemplateTools } from "./tools/template.tools";

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
    if (!tool || typeof tool.handler !== "function") {
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

toolRegistry.registerTools(projectTools);
toolRegistry.registerTools(chapterTools);
toolRegistry.registerTools(characterTools);
toolRegistry.registerTools(sceneTools);
toolRegistry.registerTools(PanelTools);
toolRegistry.registerTools(dialogueTools);
toolRegistry.registerTools(TemplateTools);
toolRegistry.registerTools(genericTools);
