// src/ai/ai-config.ts
'use client'; // Mark as client-safe, as it only deals with config values read from process.env

// --- Configuration Values (Derived from Environment Variables) ---

// Define the structure for provider configuration internally
interface ProviderInfo {
    label: string;
    apiKeyEnvVar: string; // Keep track of the expected env var
}

const providersConfigMap: Record<string, ProviderInfo> = {
  googleai: {
    label: 'Google AI (Gemini)',
    apiKeyEnvVar: 'GOOGLE_GENAI_API_KEY',
  },
  // Add other providers here when implemented
  // openai: { label: 'OpenAI (ChatGPT)', apiKeyEnvVar: 'OPENAI_API_KEY' },
  // anthropic: { label: 'Anthropic (Claude)', apiKeyEnvVar: 'ANTHROPIC_API_KEY' },
};


// Determine configured providers based *only* on the presence of environment keys
// This check *can* run safely on the client, but process.env might be limited
const configuredProviders: Record<string, string> = {}; // Store key -> label
if (typeof process !== 'undefined' && process.env?.GOOGLE_GENAI_API_KEY) {
    configuredProviders['googleai'] = providersConfigMap['googleai'].label;
}
// Add similar checks for other providers using their respective env vars


// Determine the default model ID from environment or fallback
let defaultModelId = (typeof process !== 'undefined' ? process.env?.DEFAULT_GENAI_MODEL_ID : undefined) || 'googleai/gemini-1.5-flash-latest'; // Updated fallback
let defaultProvider: string | null = null;

// Determine default provider based on model ID or first configured
if (defaultModelId.startsWith('googleai/')) {
    defaultProvider = 'googleai';
} else if (defaultModelId.startsWith('openai/')) {
    // defaultProvider = 'openai'; // Uncomment when OpenAI supported
} else if (defaultModelId.startsWith('anthropic/')) {
    // defaultProvider = 'anthropic'; // Uncomment when Anthropic supported
} else if (Object.keys(configuredProviders).length > 0) {
    // Fallback to the first configured provider if the default model doesn't match known prefixes
    defaultProvider = Object.keys(configuredProviders)[0];
     // Adjust default model if the provider doesn't match
     if (defaultProvider === 'googleai' && !defaultModelId.startsWith('googleai/')) {
         defaultModelId = 'googleai/gemini-1.5-flash-latest'; // Default google model
     }
    // Add similar logic for other providers if they become the default fallback
    console.warn(`Default model ID '${process.env?.DEFAULT_GENAI_MODEL_ID}' does not match a known provider prefix. Falling back to first configured provider '${defaultProvider}' and adjusting model ID to '${defaultModelId}'.`);
}

// --- Exported Helper Functions ---

// Helper function to get the configured default model ID
export function getDefaultModelId(): string {
    // Recalculate in case env vars change during build/runtime (though typically static)
    // This simple implementation uses the values computed above.
    return defaultModelId;
}

// Helper function to get the configured default provider key (e.g., 'googleai')
export function getDefaultProvider(): string | null {
     // Recalculate
     let provider: string | null = null;
     const modelId = getDefaultModelId(); // Use the helper to get current default
     if (modelId.startsWith('googleai/')) provider = 'googleai';
     // Add checks for openai, anthropic
     else if (Object.keys(getConfiguredProvidersMap()).length > 0) {
         provider = Object.keys(getConfiguredProvidersMap())[0];
     }
    return provider;
}

// Helper function to get the map of configured providers (key -> label)
export function getConfiguredProvidersMap(): Record<string, string> {
    // Recalculate based on env vars
    const providers: Record<string, string> = {};
    if (typeof process !== 'undefined' && process.env?.GOOGLE_GENAI_API_KEY) {
        providers['googleai'] = providersConfigMap['googleai'].label;
    }
    // Add checks for others
    return providers;
}

// Helper function to get just the labels of configured providers
export function getConfiguredProviderLabels(): string[] {
    return Object.values(getConfiguredProvidersMap());
}

// Helper function to get the full provider config map (used internally and potentially by settings)
export function getProvidersConfig(): Record<string, ProviderInfo> {
    return providersConfigMap;
}
