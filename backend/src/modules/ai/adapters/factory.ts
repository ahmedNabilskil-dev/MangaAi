import { ChatAdapter } from '@/common/types/ai';

export class ChatAdapterFactory {
  private static adapters = new Map<string, (apiKey: string) => ChatAdapter>();

  static registerAdapter(
    provider: string,
    factory: (apiKey: string) => ChatAdapter,
  ): void {
    this.adapters.set(provider, factory);
  }

  static getAdapter(provider: string, apiKey: string): ChatAdapter | null {
    const factory = this.adapters.get(provider);
    return factory ? factory(apiKey) : null;
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}
