// src/ai/ai-instance.ts
// This file should only run on the server or during build where environment variables are fully available.

import { genkit, type Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Import helpers and config values from the new config file
import {
    getDefaultModelId,
    getDefaultProvider,
    getConfiguredProvidersMap,
    getProvidersConfig
} from './ai-config';

// Hypothetical imports - install these packages if needed: npm install @genkit-ai/openai @genkit-ai/anthropic
// import { openAI } from '@genkit-ai/openai';
// import { anthropic } from '@genkit-ai/anthropic';


const plugins: Plugin<any>[] = [];
const configuredProviders = getConfiguredProvidersMap(); // Get the map { 'googleai': 'Google AI (Gemini)' }
const providersConfig = getProvidersConfig(); // Get { 'googleai': { label: ..., apiKeyEnvVar: ... }}

// Configure Google AI if API key is provided
if (configuredProviders['googleai'] && process.env.GOOGLE_GENAI_API_KEY) {
  try {
    plugins.push(googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }));
    console.log("Google AI Plugin configured.");
  } catch (error) {
    console.error("Failed to initialize Google AI plugin:", error);
  }
}

// Configure OpenAI if API key is provided (Uncomment when needed)
/*
if (configuredProviders['openai'] && process.env.OPENAI_API_KEY) {
  try {
    plugins.push(openAI({ apiKey: process.env.OPENAI_API_KEY }));
     console.log("OpenAI Plugin configured.");
  } catch (error) {
    console.error("Failed to initialize OpenAI plugin:", error);
  }
}
*/

// Configure Anthropic if API key is provided (Uncomment when needed)
/*
if (configuredProviders['anthropic'] && process.env.ANTHROPIC_API_KEY) {
  try {
    plugins.push(anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
     console.log("Anthropic Plugin configured.");
  } catch (error) {
    console.error("Failed to initialize Anthropic plugin:", error);
  }
}
*/

// Get default model and provider from config helpers
const finalDefaultModelId = getDefaultModelId();
const finalDefaultProvider = getDefaultProvider();


if (plugins.length === 0) {
  console.warn("No AI provider API keys found or plugins configured in environment. Genkit may not function correctly.");
} else {
    console.log("Configured Genkit AI Providers:", Object.values(configuredProviders).join(', '));
    console.log("Default Genkit Model ID set to:", finalDefaultModelId);
    console.log("Default Genkit Provider set to:", finalDefaultProvider);
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
