
import { genkit, type Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Hypothetical imports - install these packages if needed: npm install @genkit-ai/openai @genkit-ai/anthropic
// import { openAI } from '@genkit-ai/openai';
// import { anthropic } from '@genkit-ai/anthropic';

const plugins: Plugin<any>[] = [];
const configuredProviders: string[] = [];

// Configure Google AI if API key is provided
if (process.env.GOOGLE_GENAI_API_KEY) {
  try {
    plugins.push(googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }));
    configuredProviders.push('Google AI');
  } catch (error) {
    console.error("Failed to initialize Google AI plugin:", error);
  }
}

// Configure OpenAI if API key is provided (Uncomment when needed)
/*
if (process.env.OPENAI_API_KEY) {
  try {
    plugins.push(openAI({ apiKey: process.env.OPENAI_API_KEY }));
    configuredProviders.push('OpenAI');
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
    configuredProviders.push('Anthropic');
  } catch (error) {
    console.error("Failed to initialize Anthropic plugin:", error);
  }
}
*/

// Determine the default model ID from environment or fallback
const defaultModelId = process.env.DEFAULT_GENAI_MODEL_ID || 'googleai/gemini-2.0-flash';

if (plugins.length === 0) {
  console.warn("No AI provider API keys found or plugins configured in environment. Genkit may not function correctly.");
} else {
    console.log("Configured Genkit AI Providers:", configuredProviders.join(', '));
    console.log("Default Genkit Model ID set to:", defaultModelId);
}


export const ai = genkit({
  plugins: plugins,
  logLevel: 'debug', // Optional: for more verbose logging during development
  // Setting a default model here might be overridden by model specified in definePrompt
  // model: defaultModelId,
});

// Helper function to get the configured default model ID
export function getDefaultModelId(): string {
    return defaultModelId;
}
