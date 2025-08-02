// Frontend chat service - simplified to just call backend APIs
export class ChatService {
  async sendMessage(data: {
    projectId: string;
    message?: string;
    imageData?: string;
    selectedMcpTools?: string[];
    userId: string;
  }) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send message");
    }

    return response.json();
  }

  async getMessages(
    projectId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const params = new URLSearchParams({
      projectId,
      limit: (options.limit || 50).toString(),
      offset: (options.offset || 0).toString(),
    });

    const response = await fetch(`/api/chat?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get messages");
    }

    return response.json();
  }
}

export const chatService = new ChatService();
