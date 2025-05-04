// use server'

/**
 * @fileOverview This file defines a Genkit flow for brainstorming character ideas for a manga chapter.
 *
 * The flow takes a chapter title as input and returns a list of character ideas.
 * - brainstormCharacterIdeas - A function that triggers the character brainstorming process.
 * - BrainstormCharacterIdeasInput - The input type for the brainstormCharacterIdeas function.
 * - BrainstormCharacterIdeasOutput - The return type for the brainstormCharacterIdeas function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const BrainstormCharacterIdeasInputSchema = z.object({
  chapterTitle: z.string().describe('The title of the chapter to brainstorm character ideas for.'),
});
export type BrainstormCharacterIdeasInput = z.infer<typeof BrainstormCharacterIdeasInputSchema>;

const BrainstormCharacterIdeasOutputSchema = z.object({
  characterIdeas: z.array(
    z.string().describe('A character idea for the chapter.')
  ).describe('A list of character ideas for the chapter.'),
});
export type BrainstormCharacterIdeasOutput = z.infer<typeof BrainstormCharacterIdeasOutputSchema>;

export async function brainstormCharacterIdeas(
  input: BrainstormCharacterIdeasInput
): Promise<BrainstormCharacterIdeasOutput> {
  return brainstormCharacterIdeasFlow(input);
}

const brainstormCharacterIdeasPrompt = ai.definePrompt({
  name: 'brainstormCharacterIdeasPrompt',
  input: {
    schema: z.object({
      chapterTitle: z.string().describe('The title of the chapter to brainstorm character ideas for.'),
    }),
  },
  output: {
    schema: z.object({
      characterIdeas: z.array(
        z.string().describe('A character idea for the chapter.')
      ).describe('A list of character ideas for the chapter.'),
    }),
  },
  prompt: `You are a creative manga writer assistant. Your task is to brainstorm character ideas for a given chapter.

  Chapter Title: {{{chapterTitle}}}

  Please provide a list of character ideas that would be suitable for this chapter. Each character idea should be a short description.
  Return the ideas as an array of strings.
  `,
});

const brainstormCharacterIdeasFlow = ai.defineFlow<
  typeof BrainstormCharacterIdeasInputSchema,
  typeof BrainstormCharacterIdeasOutputSchema
>({
  name: 'brainstormCharacterIdeasFlow',
  inputSchema: BrainstormCharacterIdeasInputSchema,
  outputSchema: BrainstormCharacterIdeasOutputSchema,
}, async input => {
  const {output} = await brainstormCharacterIdeasPrompt(input);
  return output!;
});
