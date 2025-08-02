// Message Types
export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string | any;
  contentKey?: "text" | "functionCall" | "functionResponse";
  name?: string;
}

// Tool Types
export interface Tool {
  name: string;
  description: string;
  parameters: any;
}

// Text Generation Parameters
export interface TextGenerationParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

// Chat Adapter Interface
export interface ChatAdapter {
  send(
    messages: Message[],
    tools?: Tool[],
    params?: TextGenerationParams,
    callTool?: boolean,
    depth?: number
  ): Promise<Message[]>;
}

// AI Service Response
export interface AIServiceResponse {
  success: boolean;
  data?: {
    messages: Message[];
    tokensUsed?: number;
    creditsConsumed: number;
    imageData?: string; // Base64 image data for image generation
  };
  error?: string;
}
