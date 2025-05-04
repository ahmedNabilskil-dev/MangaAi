'use server';

/**
 * @fileOverview Summarizes scene or panel content based on provided text or structured data.
 *
 * - summarizeContent - A function that handles the content summarization process.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

// Input can be simple text or potentially structured data later
const SummarizeContentInputSchema = z.object({
  contentType: z.enum(['scene', 'panel', 'chapter', 'project']).describe('The type of content being summarized.'),
  text: z.string().optional().describe('The primary text content to summarize (e.g., scene description, panel action).'),
  // Optionally add structured data if needed for better context
  // contextData: z.record(z.any()).optional().describe('Additional structured context data.'),
});
export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('A short, concise summary of the provided content.'),
});
export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  // Basic validation: Ensure at least text is provided for now
  if (!input.text) {
      throw new Error("No text content provided for summarization.");
  }
  return summarizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {
    schema: SummarizeContentInputSchema,
  },
  output: {
    schema: SummarizeContentOutputSchema,
  },
  // Updated prompt to be more generic
  prompt: `You are an AI assistant that summarizes content for a manga creation tool.
Summarize the following {{contentType}} content concisely and informatively:

Content:
{{{text}}}

{{#if contextData}}
Additional Context:
{{{json contextData}}}
{{/if}}

Provide only the summary.`,
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
    if (!output) {
        throw new Error("Failed to generate summary.");
    }
    return output;
  }
);
