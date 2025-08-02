import { config } from "../../config/config";
import { ChatAdapter } from "../types";
import { GeminiAdapter } from "./gemini";

export class AIAdapterFactory {
  static createAdapter(provider: "gemini" = "gemini"): ChatAdapter {
    switch (provider) {
      case "gemini":
        if (!config.googleAiApiKey) {
          throw new Error("Google AI API key is not configured");
        }
        return new GeminiAdapter(config.googleAiApiKey);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
