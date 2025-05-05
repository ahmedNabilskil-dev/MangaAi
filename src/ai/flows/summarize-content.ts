
'use server';

/**
 * @fileOverview Summarizes content (project, chapter, scene, panel) based on provided text or structured data.
 * Renamed from summarize-scene-panel.
 *
 * - summarizeContent - A function that handles the content summarization process.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
 */

import { ai, getDefaultModelId } from '@/ai/ai-instance'; // Import helper
import { z } from 'genkit';

// Input can be simple text or potentially structured data later
const SummarizeContentInputSchema = z.object({
  contentType: z.enum(['scene', 'panel', 'chapter', 'project', 'character', 'dialogue']).describe('The type of content being summarized.'),
  text: z.string().optional().describe('The primary text content to summarize (e.g., scene description, panel action, chapter summary).'),
  // Optionally add structured data if needed for better context
  contextData: z.record(z.any()).optional().describe('Additional structured context data (e.g., full entity properties).'),
  contentId: z.string().uuid().optional().describe("The ID of the content being summarized (for context)."),
});
export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('A short, concise summary of the provided content, suitable for display in a list or node label.'),
});
export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  // Basic validation: Ensure some form of content is provided
  if (!input.text && !input.contextData) {
      throw new Error("No text or context data provided for summarization.");
  }
  return summarizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  model: getDefaultModelId(), // Use the configured default model
  input: {
    schema: SummarizeContentInputSchema,
  },
  output: {
    schema: SummarizeContentOutputSchema,
  },
  // Updated prompt to be more generic and handle context
  prompt: `You are an AI assistant tasked with creating brief, informative summaries for elements within a manga creation tool.
Generate a concise summary (ideally 10 words or less, suitable for a label or preview) for the following {{contentType}}{{#if contentId}} (ID: {{contentId}}){{/if}}.

Focus on the most important identifying information or the core concept.

{{#if text}}
Primary Text Content:
{{{text}}}
{{/if}}

{{#if contextData}}
Additional Context Data:
{{{json contextData}}}
{{/if}}

Provide ONLY the generated summary text.`,
});

const summarizeContentFlow = ai.defineFlow<
  typeof SummarizeContentInputSchema,
  typeof SummarizeContentOutputSchema
>(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output?.summary) {
        // Attempt a fallback if only contextData was provided
        if (!input.text && input.contextData) {
             const fallbackInput = { ...input, text: JSON.stringify(input.contextData) }; // Use stringified context as text
             const fallbackResult = await prompt(fallbackInput);
             if (fallbackResult.output?.summary) return fallbackResult.output;
        }
        console.error("Failed to generate summary for:", input);
        throw new Error("Failed to generate summary.");
    }
    return output;
  }
);
