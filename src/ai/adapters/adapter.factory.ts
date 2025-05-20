import { GeminiAdapter } from "@/ai/adapters/gemini";
import { ChatAdapter } from "@/ai/adapters/type";

export class ChatAdapterFactory {
  private static adapters: Map<string, (apiKey: string) => ChatAdapter> =
    new Map();

  // Register Adapters
  static registerAdapter(
    provider: string,
    adapter: (apiKey: string) => ChatAdapter
  ): void {
    this.adapters.set(provider, adapter);
  }

  // Get Adapter
  static getAdapter(provider: string, apiKey: string): ChatAdapter | null {
    const adapterFactory = this.adapters.get(provider);
    if (adapterFactory) {
      return adapterFactory(apiKey);
    }
    console.error(`No adapter found for provider: ${provider}`);
    return null;
  }
}

// Register Adapters in the Factory

ChatAdapterFactory.registerAdapter(
  "gemini",
  (apiKey: string) => new GeminiAdapter(apiKey)
);
