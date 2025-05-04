'use server';

/**
 * @fileOverview Summarizes a scene based on the text in the properties panel of a scene.
 *
 * - summarizeScenePanel - A function that handles the scene summarization process.
 * - SummarizeScenePanelInput - The input type for the summarizeScenePanel function.
 * - SummarizeScenePanelOutput - The return type for the summarizeScenePanel function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeScenePanelInputSchema = z.object({
  sceneText: z.string().describe('The text content of the scene to summarize.'),
});
export type SummarizeScenePanelInput = z.infer<typeof SummarizeScenePanelInputSchema>;

const SummarizeScenePanelOutputSchema = z.object({
  summary: z.string().describe('A short summary of the scene content.'),
});
export type SummarizeScenePanelOutput = z.infer<typeof SummarizeScenePanelOutputSchema>;

export async function summarizeScenePanel(input: SummarizeScenePanelInput): Promise<SummarizeScenePanelOutput> {
  return summarizeScenePanelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeScenePanelPrompt',
  input: {
    schema: z.object({
      sceneText: z.string().describe('The text content of the scene to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A short summary of the scene content.'),
    }),
  },
  prompt: `You are an AI assistant that summarizes scene content for a manga creation tool.  Summarize the following scene text in a concise and informative way:\n\n{{{sceneText}}}`,
});

const summarizeScenePanelFlow = ai.defineFlow<
  typeof SummarizeScenePanelInputSchema,
  typeof SummarizeScenePanelOutputSchema
>(
  {
    name: 'summarizeScenePanelFlow',
    inputSchema: SummarizeScenePanelInputSchema,
    outputSchema: SummarizeScenePanelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
