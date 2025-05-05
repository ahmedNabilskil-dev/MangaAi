
'use server';

/**
 * @fileOverview This file defines a Genkit flow for brainstorming character ideas for a manga project or chapter.
 *
 * The flow takes a project or chapter context and returns a list of character ideas, potentially with basic details.
 * - brainstormCharacterIdeas - A function that triggers the character brainstorming process.
 * - BrainstormCharacterIdeasInput - The input type for the brainstormCharacterIdeas function.
 * - BrainstormCharacterIdeasOutput - The return type for the brainstormCharacterIdeas function.
 */

import ai from '@/ai/ai-instance'; // Import the initialized ai instance
import { getDefaultModelId } from '@/ai/ai-config'; // Import helper from config
import { z } from 'genkit';

// Accept project or chapter context for better brainstorming
const BrainstormCharacterIdeasInputSchema = z.object({
  projectId: z.string().uuid().optional().describe('The UUID of the project context (optional).'),
  chapterTitle: z.string().optional().describe('The title of a specific chapter context (optional).'),
  projectTitle: z.string().optional().describe('The title of the project (if projectId not provided).'),
  genre: z.string().optional().describe('The genre of the manga.'),
  prompt: z.string().optional().describe('Any specific prompt or requirements for the characters.'),
  numberOfIdeas: z.number().int().positive().optional().default(5).describe('How many character ideas to generate.'),
});
export type BrainstormCharacterIdeasInput = z.infer<typeof BrainstormCharacterIdeasInputSchema>;

// Output more structured character ideas
const CharacterIdeaSchema = z.object({
    name: z.string().describe('A potential name for the character.'),
    role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional().describe('Potential role in the story.'),
    briefDescription: z.string().describe('A short description or concept for the character.'),
    // Add other key fields if desired, e.g., personality keywords
}).describe('A single brainstormed character idea.');

const BrainstormCharacterIdeasOutputSchema = z.object({
  characterIdeas: z.array(CharacterIdeaSchema)
    .describe('A list of brainstormed character ideas.'),
});
export type BrainstormCharacterIdeasOutput = z.infer<typeof BrainstormCharacterIdeasOutputSchema>;

export async function brainstormCharacterIdeas(
  input: BrainstormCharacterIdeasInput
): Promise<BrainstormCharacterIdeasOutput> {
  // Basic validation
  if (!input.projectId && !input.chapterTitle && !input.projectTitle) {
    throw new Error("Please provide project or chapter context (ID or title).");
  }
  return brainstormCharacterIdeasFlow(input);
}

const brainstormCharacterIdeasPrompt = ai.definePrompt({
  name: 'brainstormCharacterIdeasPrompt',
  model: getDefaultModelId(), // Use the configured default model from config
  input: {
    schema: BrainstormCharacterIdeasInputSchema,
  },
  output: {
    schema: BrainstormCharacterIdeasOutputSchema, // Use structured output
  },
  prompt: `You are a creative manga writer assistant. Your task is to brainstorm character ideas based on the provided context.

Context:
{{#if projectId}}Project ID: {{projectId}}{{/if}}
{{#if projectTitle}}Project Title: {{projectTitle}}{{/if}}
{{#if chapterTitle}}Chapter Title: {{chapterTitle}}{{/if}}
{{#if genre}}Genre: {{genre}}{{/if}}

User Prompt/Requirements:
{{{prompt Mappin ""}}}

Please generate {{numberOfIdeas}} distinct character ideas suitable for this context. For each character, provide:
1.  A potential Name.
2.  A brief Description (1-2 sentences highlighting their core concept).
3.  (Optional) Suggest a possible Role (protagonist, antagonist, supporting, minor).

Return the ideas as an array of structured objects, following the defined output schema. Ensure variety in the concepts.
  `,
});

const brainstormCharacterIdeasFlow = ai.defineFlow<
  typeof BrainstormCharacterIdeasInputSchema,
  typeof BrainstormCharacterIdeasOutputSchema
>({
  name: 'brainstormCharacterIdeasFlow',
  inputSchema: BrainstormCharacterIdeasInputSchema,
  outputSchema: BrainstormCharacterIdeasOutputSchema,
}, async (input) => {
  const { output } = await brainstormCharacterIdeasPrompt(input);
  if (!output?.characterIdeas) {
      throw new Error("Failed to generate character ideas.");
  }
  return output;
});
