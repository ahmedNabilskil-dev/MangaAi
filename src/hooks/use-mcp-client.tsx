/**
 * Hook for managing MCP client integration - simplified version
 */

import { useEffect, useState } from "react";
import { mcpService, McpTool, McpPrompt, McpState } from "@/services/mcp.service";

export type { McpPrompt, McpTool };

export interface McpActions {
  callTool: (name: string, args?: any) => Promise<any>;
  getPromptTemplate: (name: string, args?: any) => Promise<string>;
  updateEntity: (entityType: string, entityId: string, data: any) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export function useMcpClient(context: "chat" | "project-creation" = "chat") {
  const [state, setState] = useState<McpState & { isLoading: boolean }>({
    isConnected: false,
    tools: [],
    prompts: [],
    isLoading: true,
  });

  // Load MCP status
  useEffect(() => {
    let mounted = true;

    const loadMcpStatus = async () => {
      try {
        console.log("🔍 Loading MCP status...");
        setState(prev => ({ ...prev, isLoading: true }));
        
        const status = await mcpService.getStatus(context);
        
        if (mounted) {
          setState({ ...status, isLoading: false });
          console.log("✅ MCP status loaded:", status);
        }
      } catch (error) {
        console.error("❌ Failed to load MCP status:", error);
        if (mounted) {
          setState({
            isConnected: false,
            tools: [],
            prompts: [],
            isLoading: false,
          });
        }
      }
    };

    loadMcpStatus();

    return () => {
      mounted = false;
    };
  }, [context]);

  const actions: McpActions = {
    callTool: async (name: string, args?: any) => {
      try {
        console.log(`🔧 Calling MCP tool: ${name}`, args);
        const result = await mcpService.callTool(name, args);
        console.log(`✅ Tool result:`, result);
        return result;
      } catch (error) {
        console.error(`❌ Tool call failed for ${name}:`, error);
        throw error;
      }
    },

    getPromptTemplate: async (name: string, args?: any) => {
      try {
        console.log(`📝 Getting prompt template: ${name}`, args);
        const template = await mcpService.getPromptTemplate(name, args);
        console.log(`✅ Prompt template loaded`);
        return template;
      } catch (error) {
        console.error(`❌ Failed to get prompt template ${name}:`, error);
        throw error;
      }
    },

    updateEntity: async (entityType: string, entityId: string, data: any) => {
      try {
        console.log(`🔄 Updating entity: ${entityType}/${entityId}`, data);
        const result = await mcpService.callTool("update_entity", {
          entityType,
          entityId,
          data,
        });
        console.log(`✅ Entity updated successfully`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to update entity:`, error);
        return false;
      }
    },

    refreshStatus: async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const status = await mcpService.getStatus(context);
        setState({ ...status, isLoading: false });
      } catch (error) {
        console.error("Failed to refresh MCP status:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    },
  };

  return {
    state,
    actions,
  };
}
