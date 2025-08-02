import { AIAdapterFactory } from "../ai/adapters/factory";
import {
  AIServiceResponse,
  ChatAdapter,
  Message,
  TextGenerationParams,
} from "../ai/types";
import { logger } from "../utils/logger";
import { getCreditCost } from "./credit-manager";
import { databaseService } from "./database";

export class AIService {
  private adapter: ChatAdapter;

  constructor() {
    this.adapter = AIAdapterFactory.createAdapter("gemini");
  }

  async generateText(
    userId: string,
    messages: Message[],
    params: TextGenerationParams = {},
    tools: any[] = []
  ): Promise<AIServiceResponse> {
    try {
      // Estimate credits needed (rough estimate)
      const estimatedTokens = this.estimateTokensFromMessages(messages);
      const creditsNeeded = getCreditCost("textGeneration", {
        tokens: estimatedTokens,
      });

      // Check if user has enough credits
      const { credits } = await databaseService.getUserCredits(userId);
      if (credits < creditsNeeded) {
        return {
          success: false,
          error: "Insufficient credits for text generation",
        };
      }

      // Generate content
      const responseMessages = await this.adapter.send(messages, tools, params);

      // Calculate actual credits used (more accurate based on response)
      const actualTokensUsed = this.estimateTokensFromMessages([
        ...messages,
        ...responseMessages,
      ]);
      const actualCreditsUsed = getCreditCost("textGeneration", {
        tokens: actualTokensUsed,
      });

      // Deduct credits
      const deductionResult = await databaseService.deductCredits(
        userId,
        actualCreditsUsed,
        "text_generation",
        "AI text generation",
        {
          messages_count: messages.length,
          response_messages_count: responseMessages.length,
          estimated_tokens: actualTokensUsed,
        }
      );

      if (!deductionResult.success) {
        logger.warn("Failed to deduct credits after text generation", {
          userId,
          creditsNeeded: actualCreditsUsed,
          error: deductionResult.error,
        });
      }

      return {
        success: true,
        data: {
          messages: responseMessages,
          tokensUsed: actualTokensUsed,
          creditsConsumed: actualCreditsUsed,
        },
      };
    } catch (error: any) {
      logger.error("Text generation failed:", { error, userId });
      return {
        success: false,
        error: error.message || "Text generation failed",
      };
    }
  }

  async generateImage(
    userId: string,
    prompt: string,
    width: number = 512,
    height: number = 512,
    quality: "standard" | "hd" | "ultra" = "standard"
  ): Promise<AIServiceResponse> {
    try {
      // Calculate credits needed
      const creditsNeeded = getCreditCost("imageGeneration", {
        width,
        height,
        quality,
      });

      // Check if user has enough credits
      const { credits } = await databaseService.getUserCredits(userId);
      if (credits < creditsNeeded) {
        return {
          success: false,
          error: "Insufficient credits for image generation",
        };
      }

      // Generate image using Gemini adapter
      const geminiAdapter = this.adapter as any;
      if (!geminiAdapter.generateImage) {
        throw new Error("Image generation not supported by current adapter");
      }

      const result = await geminiAdapter.generateImage({
        prompt,
        history: [],
      });

      // Deduct credits
      const deductionResult = await databaseService.deductCredits(
        userId,
        creditsNeeded,
        "image_generation",
        "AI image generation",
        {
          prompt: prompt.substring(0, 100), // First 100 chars for audit
          width,
          height,
          quality,
        }
      );

      if (!deductionResult.success) {
        logger.warn("Failed to deduct credits after image generation", {
          userId,
          creditsNeeded,
          error: deductionResult.error,
        });
      }

      return {
        success: true,
        data: {
          messages: [
            {
              role: "assistant",
              content: result.text,
            },
          ],
          creditsConsumed: creditsNeeded,
          imageData: result.image46, // Base64 image data
        },
      };
    } catch (error: any) {
      logger.error("Image generation failed:", { error, userId });
      return {
        success: false,
        error: error.message || "Image generation failed",
      };
    }
  }

  private estimateTokensFromMessages(messages: Message[]): number {
    // Rough estimation: 1 token per 4 characters
    const totalChars = messages.reduce((sum, msg) => {
      const content =
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content);
      return sum + content.length;
    }, 0);

    return Math.ceil(totalChars / 4);
  }

  async estimateCredits(
    operation: "textGeneration" | "imageGeneration",
    params: any
  ): Promise<number> {
    return getCreditCost(operation, params);
  }
}

// Export singleton instance
export const aiService = new AIService();
