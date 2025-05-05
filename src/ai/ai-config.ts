
// src/ai/ai-config.ts
// This file should ONLY rely on server-side environment variables (process.env)
// It provides helpers to get the configuration determined at server startup.

// --- Configuration Values (Derived from Environment Variables) ---

// Define the structure for provider configuration internally
interface ProviderInfo {
    label: string;
    apiKeyEnvVar: string; // Keep track of the expected env var
}

// Map of ALL potential providers the application *could* support.
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
// This logic runs on server/build time safely.
// It reflects the intended default, assuming the corresponding provider is configured.
function readDefaultModelId(): string {
     // Read directly from server environment
     const envModelId = (typeof process !== 'undefined' ? process.env?.DEFAULT_GENAI_MODEL_ID : undefined);
     return envModelId || 'googleai/gemini-1.5-flash-latest'; // Default fallback
}

// Determine the intended default provider based on the model ID prefix
function determineDefaultProviderFromModel(modelId: string): string | null {
     if (modelId.startsWith('googleai/')) return 'googleai';
     if (modelId.startsWith('openai/')) return 'openai'; // Uncomment when OpenAI supported
     if (modelId.startsWith('anthropic/')) return 'anthropic'; // Uncomment when Anthropic supported
     console.warn(`Default model ID '${modelId}' does not match a known provider prefix. Default provider cannot be determined solely from model ID.`);
     return null;
}

// --- Exported Helper Functions ---
// These functions provide read-only access to the configuration *determined by the server environment*.

// Helper function to get the configured default model ID (safe for server/client)
// Reads the value determined by the server environment.
export function getDefaultModelId(): string {
    return readDefaultModelId();
}

// Helper function to get the configured default provider key (e.g., 'googleai') (safe for server/client)
// This reflects the *intended* default based on the DEFAULT_GENAI_MODEL_ID env var.
// The actual *active* provider depends on API keys being present (handled in ai-instance.ts).
export function getDefaultProvider(): string | null {
    const modelId = getDefaultModelId();
    return determineDefaultProviderFromModel(modelId);
}

// Helper function to get the map of *all* potential providers (key -> { label, apiKeyEnvVar }) (safe for server/client)
// This lists all providers the app *could* support, not necessarily what's active.
export function getProvidersConfig(): Record<string, ProviderInfo> {
    return providersConfigMap;
}

// --- REMOVED Client-Side Specific Helpers ---
// getConfiguredProvidersMap and getConfiguredProviderLabels are removed.
// Client-side checks are unreliable as they don't reflect the server's actual Genkit configuration.
// The settings form now relies on the server-determined defaults (getDefaultProvider/Model)
// and indicates status based on whether the *default* provider is active.
