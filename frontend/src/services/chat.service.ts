// Updated Chat Service for NestJS Backend Integration
import { apiRequest } from "@/lib/api-client";

export class ChatService {
  // Send message to AI chat
  async sendMessage(data: {
    projectId: string;
    message?: string;
    imageData?: string;
    sessionId?: string;
    tools?: string[];
    params?: Record<string, any>;
    provider?: string;
  }) {
    try {
      return await apiRequest.post("/ai/chat", data);
    } catch (error: any) {
      console.error("Send message error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }

  // Get chat messages/sessions
  async getMessages(
    projectId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    try {
      const params = new URLSearchParams({
        projectId,
        limit: (options.limit || 50).toString(),
        offset: (options.offset || 0).toString(),
      });

      return await apiRequest.get(`/ai/sessions?${params}`);
    } catch (error: any) {
      console.error("Get messages error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get messages"
      );
    }
  }

  // Create new AI session
  async createSession(projectId: string, sessionData: any) {
    try {
      return await apiRequest.post("/ai/sessions", {
        projectId,
        ...sessionData,
      });
    } catch (error: any) {
      console.error("Create session error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create session"
      );
    }
  }

  // Get specific session
  async getSession(sessionId: string) {
    try {
      return await apiRequest.get(`/ai/sessions/${sessionId}`);
    } catch (error: any) {
      console.error("Get session error:", error);
      throw new Error(error.response?.data?.message || "Failed to get session");
    }
  }

  // Get session messages
  async getSessionMessages(sessionId: string) {
    try {
      return await apiRequest.get(`/ai/sessions/${sessionId}/messages`);
    } catch (error: any) {
      console.error("Get session messages error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get session messages"
      );
    }
  }

  // Generate image using AI
  async generateImage(data: {
    prompt: string;
    style?: string;
    dimensions?: string;
    projectId?: string;
  }) {
    try {
      return await apiRequest.post("/ai/generate-image", data);
    } catch (error: any) {
      console.error("Generate image error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to generate image"
      );
    }
  }

  // Get AI service status
  async getAiStatus() {
    try {
      return await apiRequest.get("/ai/status");
    } catch (error: any) {
      console.error("Get AI status error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get AI status"
      );
    }
  }

  async listAvailableTools() {
    try {
      const response = await apiRequest.get("/ai/tools");

      return response.data.data;
    } catch (error: any) {
      console.error("List available tools error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to list available tools"
      );
    }
  }

  async listAvailablePrompts() {
    try {
      const response = await apiRequest.get("/ai/prompts");
      return response.data.data;
    } catch (error: any) {
      console.error("List available prompts error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to list available prompts"
      );
    }
  }

  async getPrompt(name: string, args: any) {
    try {
      const response = await apiRequest.get(`/ai/prompts/${name}`, {
        params: { args },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Get prompt error:", error);
      throw new Error(error.response?.data?.message || "Failed to get prompt");
    }
  }
}

export const chatService = new ChatService();
