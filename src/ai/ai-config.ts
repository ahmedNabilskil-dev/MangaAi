
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


// Determine the default model ID from environment or fallback
// This logic can run on server/build time safely.
let defaultModelId = (typeof process !== 'undefined' ? process.env?.DEFAULT_GENAI_MODEL_ID : undefined) || 'googleai/gemini-1.5-flash-latest'; // Updated fallback
let defaultProvider: string | null = null;

// Determine default provider based on model ID
if (defaultModelId.startsWith('googleai/')) {
    defaultProvider = 'googleai';
} else if (defaultModelId.startsWith('openai/')) {
    // defaultProvider = 'openai'; // Uncomment when OpenAI supported
} else if (defaultModelId.startsWith('anthropic/')) {
    // defaultProvider = 'anthropic'; // Uncomment when Anthropic supported
} else {
    // Fallback logic if default model doesn't match known prefixes is handled in ai-instance.ts
    // We only set the provider based on the explicit default model ID here.
     console.warn(`Default model ID '${defaultModelId}' does not match a known provider prefix. Default provider cannot be determined solely from model ID.`);
}


// --- Exported Helper Functions ---

// Helper function to get the configured default model ID (safe for server/client)
export function getDefaultModelId(): string {
    // Recalculate in case env vars change during build/runtime (though typically static)
    // This simple implementation uses the values computed above.
     const envModelId = (typeof process !== 'undefined' ? process.env?.DEFAULT_GENAI_MODEL_ID : undefined);
     return envModelId || 'googleai/gemini-1.5-flash-latest';
}

// Helper function to get the configured default provider key (e.g., 'googleai') (safe for server/client)
export function getDefaultProvider(): string | null {
     // Recalculate based on default model ID
     let provider: string | null = null;
     const modelId = getDefaultModelId(); // Use the helper to get current default
     if (modelId.startsWith('googleai/')) provider = 'googleai';
     // Add checks for openai, anthropic
     // Note: Fallback logic if model ID doesn't match is in ai-instance.ts
    return provider;
}

// Helper function to get the map of *all* potential providers (key -> { label, apiKeyEnvVar }) (safe for server/client)
export function getProvidersConfig(): Record<string, ProviderInfo> {
    return providersConfigMap;
}


// --- Client-Side Specific Helpers ---
// These helpers read process.env and are intended for client-side components like SettingsForm.
// They determine configuration based on the *presence* of environment variables *accessible to the client*.
// IMPORTANT: This does NOT guarantee the keys are valid or that the server is configured correctly.

// Helper function to get the map of *configured* providers based on client-accessible env vars (key -> label)
// Intended for client-side use (e.g., SettingsForm)
export function getConfiguredProvidersMap(): Record<string, string> {
    const providers: Record<string, string> = {};
    // Check for NEXT_PUBLIC_ prefixed vars if secrets shouldn't be exposed,
    // otherwise check for regular env vars (understand the security implications).
    // For now, assume settings page checks general env vars (which might be empty on client).
    if (typeof process !== 'undefined' && process.env?.GOOGLE_GENAI_API_KEY) {
        providers['googleai'] = providersConfigMap['googleai'].label;
    }
    // Add checks for others (e.g., process.env.OPENAI_API_KEY)
    return providers;
}


// Helper function to get just the labels of configured providers (client-side)
export function getConfiguredProviderLabels(): string[] {
    return Object.values(getConfiguredProvidersMap());
}
