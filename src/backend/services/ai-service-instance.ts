// src/backend/services/ai-service-instance.ts
import { AIService } from "./ai.service";

// Export the singleton instance of the AI service
export const aiService = AIService.getInstance();
