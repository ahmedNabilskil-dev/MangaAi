
// src/ai/ai-instance.ts
// This file should only run on the server or during build where environment variables are fully available.

import { genkit, type Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Import helpers and config values from the config file
import {
    getDefaultModelId,
    getDefaultProvider,
    getProvidersConfig // Get the full config map {key -> {label, apiKeyEnvVar}}
    // DO NOT import getConfiguredProvidersMap - it's client-side logic now
} from './ai-config';

// Hypothetical imports - install these packages if needed: npm install @genkit-ai/openai @genkit-ai/anthropic
// import { openAI } from '@genkit-ai/openai';
// import { anthropic } from '@genkit-ai/anthropic';


const plugins: Plugin<any>[] = [];
const providersConfig = getProvidersConfig(); // Get { 'googleai': { label: ..., apiKeyEnvVar: ... }}
const configuredProviderLabels: string[] = []; // Track labels of successfully configured providers

// Configure Google AI if API key is provided via server-side env var
if (process.env.GOOGLE_GENAI_API_KEY) {
  try {
    plugins.push(googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }));
    configuredProviderLabels.push(providersConfig['googleai'].label);
    console.log("Google AI Plugin configured.");
  } catch (error) {
    console.error("Failed to initialize Google AI plugin:", error);
  }
} else {
    console.log("Google AI API key not found in environment.");
}

// Configure OpenAI if API key is provided (Uncomment when needed)
/*
if (process.env.OPENAI_API_KEY) {
  try {
    plugins.push(openAI({ apiKey: process.env.OPENAI_API_KEY }));
    configuredProviderLabels.push(providersConfig['openai'].label);
    console.log("OpenAI Plugin configured.");
  } catch (error) {
    console.error("Failed to initialize OpenAI plugin:", error);
  }
} else {
     console.log("OpenAI API key not found in environment.");
}
*/

// Configure Anthropic if API key is provided (Uncomment when needed)
/*
if (process.env.ANTHROPIC_API_KEY) {
  try {
    plugins.push(anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
    configuredProviderLabels.push(providersConfig['anthropic'].label);
     console.log("Anthropic Plugin configured.");
  } catch (error) {
    console.error("Failed to initialize Anthropic plugin:", error);
  }
} else {
    console.log("Anthropic API key not found in environment.");
}
*/

// Get default model and provider from config helpers
let finalDefaultModelId = getDefaultModelId();
let finalDefaultProvider = getDefaultProvider();

// Adjust default provider/model if the configured default doesn't match any *actually* configured provider
if (finalDefaultProvider && !configuredProviderLabels.includes(providersConfig[finalDefaultProvider]?.label)) {
    console.warn(`Default provider '${finalDefaultProvider}' is not configured with a valid API key.`);
    if (configuredProviderLabels.length > 0) {
        // Fallback to the first provider that *was* successfully configured
        const firstConfiguredKey = Object.keys(providersConfig).find(key => configuredProviderLabels.includes(providersConfig[key].label));
        if (firstConfiguredKey) {
            finalDefaultProvider = firstConfiguredKey;
            // Adjust model ID if necessary
             if (finalDefaultProvider === 'googleai' && !finalDefaultModelId.startsWith('googleai/')) {
                 finalDefaultModelId = 'googleai/gemini-1.5-flash-latest'; // Default google model
             }
             // Add similar logic for other providers...
            console.log(`Falling back to first configured provider: '${finalDefaultProvider}' with model '${finalDefaultModelId}'`);
        } else {
            finalDefaultProvider = null; // No providers configured
             console.error("Cannot set default provider, no providers configured.");
        }
    } else {
        finalDefaultProvider = null; // No providers configured
         console.error("Cannot set default provider, no providers configured.");
    }
}


if (plugins.length === 0) {
  console.warn("No AI provider API keys found or plugins configured in environment. Genkit may not function correctly.");
} else {
    console.log("Configured Genkit AI Providers:", configuredProviderLabels.join(', '));
    console.log("Default Genkit Model ID set to:", finalDefaultModelId);
    console.log("Default Genkit Provider set to:", finalDefaultProvider ?? 'None');
}

// Initialize Genkit
export const ai = genkit({
  plugins: plugins,
  logLevel: 'debug', // Optional: for more verbose logging during development
  // We don't necessarily need to set a global default model here,
  // as it's usually specified per prompt/flow using getDefaultModelId()
});

// Note: Helper functions like getDefaultModelId are now imported from ai-config.ts
// No need to export them again from here.

// Export the initialized ai instance
export default ai;
