
import { genkit, type Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Hypothetical imports - install these packages if needed: npm install @genkit-ai/openai @genkit-ai/anthropic
// import { openAI } from '@genkit-ai/openai';
// import { anthropic } from '@genkit-ai/anthropic';

const plugins: Plugin<any>[] = [];
const configuredProviders: Record<string, string> = {}; // Store key -> label

// Configure Google AI if API key is provided
if (process.env.GOOGLE_GENAI_API_KEY) {
  try {
    plugins.push(googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }));
    configuredProviders['googleai'] = 'Google AI (Gemini)';
  } catch (error) {
    console.error("Failed to initialize Google AI plugin:", error);
  }
}

// Configure OpenAI if API key is provided (Uncomment when needed)
/*
if (process.env.OPENAI_API_KEY) {
  try {
    plugins.push(openAI({ apiKey: process.env.OPENAI_API_KEY }));
    configuredProviders['openai'] = 'OpenAI (ChatGPT)';
  } catch (error) {
    console.error("Failed to initialize OpenAI plugin:", error);
  }
}
*/

// Configure Anthropic if API key is provided (Uncomment when needed)
/*
if (process.env.ANTHROPIC_API_KEY) {
  try {
    plugins.push(anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
    configuredProviders['anthropic'] = 'Anthropic (Claude)';
  } catch (error) {
    console.error("Failed to initialize Anthropic plugin:", error);
  }
}
*/

// Determine the default model ID from environment or fallback
let defaultModelId = process.env.DEFAULT_GENAI_MODEL_ID || 'googleai/gemini-1.5-flash-latest'; // Updated fallback
let defaultProvider: string | null = null;

// Determine default provider based on model ID or first configured
if (defaultModelId.startsWith('googleai/')) {
    defaultProvider = 'googleai';
} else if (defaultModelId.startsWith('openai/')) {
    defaultProvider = 'openai';
} else if (defaultModelId.startsWith('anthropic/')) {
    defaultProvider = 'anthropic';
} else if (Object.keys(configuredProviders).length > 0) {
    // Fallback to the first configured provider if the default model doesn't match known prefixes
    defaultProvider = Object.keys(configuredProviders)[0];
     // Adjust default model if the provider doesn't match
     if (defaultProvider === 'googleai' && !defaultModelId.startsWith('googleai/')) {
         defaultModelId = 'googleai/gemini-1.5-flash-latest'; // Default google model
     }
    // Add similar logic for other providers if they become the default fallback
    console.warn(`Default model ID '${process.env.DEFAULT_GENAI_MODEL_ID}' does not match a known provider prefix. Falling back to first configured provider '${defaultProvider}' and adjusting model ID to '${defaultModelId}'.`);
}


if (plugins.length === 0) {
  console.warn("No AI provider API keys found or plugins configured in environment. Genkit may not function correctly.");
} else {
    console.log("Configured Genkit AI Providers:", Object.values(configuredProviders).join(', '));
    console.log("Default Genkit Model ID set to:", defaultModelId);
    console.log("Default Genkit Provider set to:", defaultProvider);
}


export const ai = genkit({
  plugins: plugins,
  logLevel: 'debug', // Optional: for more verbose logging during development
  // Setting a default model here might be overridden by model specified in definePrompt
  // model: defaultModelId, // Consider if a global default is needed vs. per-prompt
});

// Helper function to get the configured default model ID
export function getDefaultModelId(): string {
    return defaultModelId;
}

// Helper function to get the configured default provider key (e.g., 'googleai')
export function getDefaultProvider(): string | null {
    return defaultProvider;
}

// Helper function to get the list of configured provider display names
export function getConfiguredProviders(): string[] {
    return Object.values(configuredProviders);
}
