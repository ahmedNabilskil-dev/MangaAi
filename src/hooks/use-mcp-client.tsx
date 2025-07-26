/**
 * Hook for managing MCP client integration
 */

import {
  mcpClient,
  McpPrompt,
  McpResource,
  McpTool,
} from "@/services/mcp-client";
import { useCallback, useEffect, useState } from "react";

// Re-export the types for convenience
export type { McpPrompt, McpResource, McpTool };

export interface McpState {
  isConnected: boolean;
  isLoading: boolean;
  tools: McpTool[];
  resources: McpResource[];
  prompts: McpPrompt[];
  error: string | null;
}

export interface McpActions {
  checkConnection: () => Promise<void>;
  refreshData: () => Promise<void>;
  callTool: (name: string, args: any) => Promise<any>;
  readResource: (uri: string) => Promise<any>;
  getPrompt: (name: string, args?: any) => Promise<string>;
  getPromptTemplate: (name: string, args?: any) => Promise<string>;
}

export function useMcpClient(context: "chat" | "project-creation" = "chat") {
  const [state, setState] = useState<McpState>({
    isConnected: false,
    isLoading: true,
    tools: [],
    resources: [],
    prompts: [],
    error: null,
  });

  const checkConnection = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const isConnected = await mcpClient.checkConnection();
      setState((prev) => ({ ...prev, isConnected, isLoading: false }));

      if (isConnected) {
        await refreshData();
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use context-appropriate methods
      const [tools, resources, prompts] = await Promise.all([
        context === "chat"
          ? mcpClient.getChatTools()
          : mcpClient.getProjectCreationTools(),
        mcpClient.getResources(), // Resources are always available
        context === "chat"
          ? mcpClient.getChatPrompts()
          : mcpClient.getProjectCreationPrompts(),
      ]);

      setState((prev) => ({
        ...prev,
        tools,
        resources,
        prompts,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to refresh data",
      }));
    }
  }, [context]);

  const callTool = useCallback(async (name: string, args: any) => {
    try {
      return await mcpClient.callTool(name, args);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Tool call failed",
      }));
      throw error;
    }
  }, []);

  const readResource = useCallback(async (uri: string) => {
    try {
      return await mcpClient.readResource(uri);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Resource read failed",
      }));
      throw error;
    }
  }, []);

  const getPrompt = useCallback(async (name: string, args?: any) => {
    try {
      const promptResponse = await mcpClient.getPrompt(name, args);
      return promptResponse.messages[0]?.content?.text || "";
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Prompt fetch failed",
      }));
      throw error;
    }
  }, []);

  const getPromptTemplate = useCallback(async (name: string, args?: any) => {
    try {
      return await mcpClient.getPromptTemplate(name, args);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Prompt template fetch failed",
      }));
      throw error;
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Refresh data when context changes
  useEffect(() => {
    if (state.isConnected) {
      refreshData();
    }
  }, [context, state.isConnected, refreshData]);

  const actions: McpActions = {
    checkConnection,
    refreshData,
    callTool,
    readResource,
    getPrompt,
    getPromptTemplate,
  };

  return { state, actions };
}
