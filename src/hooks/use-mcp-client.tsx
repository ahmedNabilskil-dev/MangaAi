/**
 * Hook for managing MCP client integration - SDK version
 */

import {
  mcpClient,
  McpPrompt,
  McpResource,
  McpTool,
} from "@/services/mcp-client";
import { useCallback, useEffect, useRef, useState } from "react";

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
  disconnect: () => Promise<void>;
  resetConnection: () => Promise<void>;
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

  // Use ref to prevent multiple simultaneous refresh calls
  const refreshInProgress = useRef(false);
  const mounted = useRef(true);

  const checkConnection = useCallback(async () => {
    if (!mounted.current) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log("🔍 Checking MCP connection...");
      const isConnected = await mcpClient.checkConnection();
      console.log("📡 Connection status:", isConnected);

      if (!mounted.current) return;

      setState((prev) => ({ ...prev, isConnected, isLoading: false }));

      if (isConnected) {
        await refreshData();
      }
    } catch (error) {
      console.error("❌ Connection check failed:", error);
      if (!mounted.current) return;

      setState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Connection failed",
      }));
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!mounted.current || refreshInProgress.current) return;

    refreshInProgress.current = true;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      console.log(`🔄 Refreshing data for context: ${context}`);

      // Use Promise.allSettled for better error handling with SDK
      const [toolsResult, resourcesResult, promptsResult] =
        await Promise.allSettled([
          context === "chat"
            ? mcpClient.getChatTools()
            : mcpClient.getProjectCreationTools(),
          mcpClient.getResources(),
          context === "chat"
            ? mcpClient.getChatPrompts()
            : mcpClient.getProjectCreationPrompts(),
        ]);

      if (!mounted.current) return;

      // Extract results or empty arrays if failed
      const tools = toolsResult.status === "fulfilled" ? toolsResult.value : [];
      const resources =
        resourcesResult.status === "fulfilled" ? resourcesResult.value : [];
      const prompts =
        promptsResult.status === "fulfilled" ? promptsResult.value : [];

      // Log individual results
      console.log("✅ Tools received:", tools.length);
      console.log("✅ Resources received:", resources.length);
      console.log("✅ Prompts received:", prompts.length);

      // Log any failures
      if (toolsResult.status === "rejected") {
        console.error("❌ Tools fetch failed:", toolsResult.reason);
      }
      if (resourcesResult.status === "rejected") {
        console.error("❌ Resources fetch failed:", resourcesResult.reason);
      }
      if (promptsResult.status === "rejected") {
        console.error("❌ Prompts fetch failed:", promptsResult.reason);
      }

      // Collect errors
      const errors = [toolsResult, resourcesResult, promptsResult]
        .filter((result) => result.status === "rejected")
        .map(
          (result) =>
            (result as PromiseRejectedResult).reason?.message || "Unknown error"
        );

      setState((prev) => ({
        ...prev,
        tools,
        resources,
        prompts,
        isLoading: false,
        error: errors.length > 0 ? errors.join("; ") : null,
      }));

      console.log("🎉 Data refresh completed");
    } catch (error) {
      console.error("❌ Data refresh failed:", error);
      if (!mounted.current) return;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to refresh data",
      }));
    } finally {
      refreshInProgress.current = false;
    }
  }, [context]);

  const callTool = useCallback(async (name: string, args: any) => {
    try {
      console.log(`🔧 Calling tool: ${name}`, args);
      const result = await mcpClient.callTool(name, args);
      console.log(`✅ Tool result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Tool call failed for ${name}:`, error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Tool call failed",
      }));
      throw error;
    }
  }, []);

  const readResource = useCallback(async (uri: string) => {
    try {
      console.log(`📖 Reading resource: ${uri}`);
      const result = await mcpClient.readResource(uri);
      console.log(`✅ Resource read:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Resource read failed for ${uri}:`, error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Resource read failed",
      }));
      throw error;
    }
  }, []);

  const getPrompt = useCallback(async (name: string, args?: any) => {
    try {
      console.log(`📝 Getting prompt: ${name}`, args);
      const promptResponse = await mcpClient.getPrompt(name, args);
      console.log(`✅ Prompt response:`, promptResponse);
      return promptResponse.messages[0]?.content?.text || "";
    } catch (error) {
      console.error(`❌ Prompt fetch failed for ${name}:`, error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Prompt fetch failed",
      }));
      throw error;
    }
  }, []);

  const getPromptTemplate = useCallback(async (name: string, args?: any) => {
    try {
      console.log(`📋 Getting prompt template: ${name}`, args);
      const result = await mcpClient.getPromptTemplate(name, args);
      console.log(`✅ Prompt template:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Prompt template fetch failed for ${name}:`, error);
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

  const disconnect = useCallback(async () => {
    try {
      console.log("🔌 Disconnecting MCP client...");
      await mcpClient.disconnect();
      setState((prev) => ({
        ...prev,
        isConnected: false,
        tools: [],
        resources: [],
        prompts: [],
        error: null,
      }));
      console.log("✅ Disconnected successfully");
    } catch (error) {
      console.error("❌ Disconnect failed:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Disconnect failed",
      }));
    }
  }, []);

  const resetConnection = useCallback(async () => {
    try {
      console.log("🔄 Resetting MCP connection...");
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      await mcpClient.resetConnection();

      setState((prev) => ({
        ...prev,
        isConnected: false,
        tools: [],
        resources: [],
        prompts: [],
      }));

      // Reconnect
      await checkConnection();
    } catch (error) {
      console.error("❌ Reset failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Reset failed",
      }));
    }
  }, [checkConnection]);

  // Initialize connection on mount
  useEffect(() => {
    mounted.current = true;
    console.log("🚀 Initializing MCP client...");
    checkConnection();

    return () => {
      mounted.current = false;
      // Clean up connection on unmount
      mcpClient.disconnect().catch((error) => {
        console.warn("⚠️ Error during cleanup disconnect:", error);
      });
    };
  }, []); // Remove checkConnection from deps to prevent re-initialization

  // Refresh data when context changes (but only if connected)
  useEffect(() => {
    if (state.isConnected && !refreshInProgress.current) {
      console.log(`🔄 Context changed to: ${context}, refreshing data...`);
      refreshData();
    }
  }, [context, state.isConnected]); // Remove refreshData from deps

  const actions: McpActions = {
    checkConnection,
    refreshData,
    callTool,
    readResource,
    getPrompt,
    getPromptTemplate,
    disconnect,
    resetConnection,
  };

  return { state, actions };
}
