// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Request Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Credit Operation Types
export interface CreditDeductionRequest {
  operation: "textGeneration" | "imageGeneration";
  count?: number;
  description?: string;
  // Dynamic parameters
  tokens?: number;
  characters?: number;
  width?: number;
  height?: number;
  quality?: "standard" | "hd" | "ultra";
}

export interface CreditPurchaseRequest {
  packageId: string;
  paymentMethodId?: string;
}

// AI Request Types
export interface AITextRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  tools?: any[];
  systemPrompt?: string;
}

export interface AIImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  quality?: "standard" | "hd" | "ultra";
  style?: string;
}

// MCP Types
export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPPromptRequest {
  name: string;
  arguments?: Record<string, any>;
}
