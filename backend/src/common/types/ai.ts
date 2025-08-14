export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    timestamp?: number;
    tokens?: number;
    model?: string;
  };
}

export interface TextGenerationParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  function?: (args: any) => Promise<any> | any;
}

export interface ImageGenerationParams {
  prompt: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd' | 'ultra';
  style?: string;
  negativePrompt?: string;
}

export interface ImageGenerationResult {
  url: string;
  width: number;
  height: number;
  prompt: string;
  quality: string;
  credits_used: number;
}

export interface ChatAdapter {
  send(
    messages: Message[],
    tools?: Tool[],
    params?: TextGenerationParams,
    callTool?: boolean,
  ): Promise<Message[]>;

  generateImage?(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}
