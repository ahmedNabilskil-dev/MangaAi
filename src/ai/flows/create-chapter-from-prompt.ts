'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a chapter, its scenes, and images based on a user prompt.
 *
 * - createChapterFromPrompt - A function that takes a prompt and creates a chapter with scenes and images.
 * - CreateChapterFromPromptInput - The input type for the createChapterFromPrompt function.
 * - CreateChapterFromPromptOutput - The return type for the createChapterFromPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {createChapter, createScene, createImage} from '@/services/strapi';

const CreateChapterFromPromptInputSchema = z.object({
  projectTitle: z.string().describe('The title of the project to which the chapter will belong.'),
  chapterTitle: z.string().describe('The title of the chapter to be created.'),
  prompt: z.string().describe('A prompt describing the desired chapter content, including the number of scenes and images per scene.'),
});

export type CreateChapterFromPromptInput = z.infer<typeof CreateChapterFromPromptInputSchema>;

const CreateChapterFromPromptOutputSchema = z.object({
  chapterId: z.number().describe('The ID of the created chapter.'),
  sceneIds: z.array(z.number()).describe('The IDs of the scenes created within the chapter.'),
  imageUrls: z.array(z.string()).describe('The URLs of the images created for the scenes.'),
});

export type CreateChapterFromPromptOutput = z.infer<typeof CreateChapterFromPromptOutputSchema>;

export async function createChapterFromPrompt(input: CreateChapterFromPromptInput): Promise<CreateChapterFromPromptOutput> {
  return createChapterFromPromptFlow(input);
}

const createChapterTool = ai.defineTool({
  name: 'createChapter',
  description: 'Creates a new chapter in the manga project.',
  inputSchema: z.object({
    projectId: z.number().describe('The ID of the project to which the chapter belongs.'),
    title: z.string().describe('The title of the chapter.'),
  }),
  outputSchema: z.number().describe('The ID of the created chapter.'),
}, async input => {
  const chapter = await createChapter({
    title: input.title,
    projectId: input.projectId,
  });
  return chapter.id;
});

const createSceneTool = ai.defineTool({
  name: 'createScene',
  description: 'Creates a new scene in the chapter.',
  inputSchema: z.object({
    chapterId: z.number().describe('The ID of the chapter to which the scene belongs.'),
    title: z.string().describe('The title of the scene.'),
  }),
  outputSchema: z.number().describe('The ID of the created scene.'),
}, async input => {
  const scene = await createScene({
    title: input.title,
    chapterId: input.chapterId,
  });
  return scene.id;
});

const createImageTool = ai.defineTool({
  name: 'createImage',
  description: 'Creates a new image for a scene.',
  inputSchema: z.object({
    sceneId: z.number().describe('The ID of the scene to which the image belongs.'),
    url: z.string().describe('The URL of the image.'),
  }),
  outputSchema: z.string().describe('The URL of the created image.'),
}, async input => {
  const image = await createImage({
    url: input.url,
    sceneId: input.sceneId,
  });
  return image.url;
});


const prompt = ai.definePrompt({
  name: 'createChapterFromPromptPrompt',
  tools: [createChapterTool, createSceneTool, createImageTool],
  input: {
    schema: z.object({
      projectTitle: z.string().describe('The title of the project to which the chapter will belong.'),
      chapterTitle: z.string().describe('The title of the chapter to be created.'),
      prompt: z.string().describe('A prompt describing the desired chapter content, including the number of scenes and images per scene.'),
    }),
  },
  output: {
    schema: z.object({
      chapterId: z.number().describe('The ID of the created chapter.'),
      sceneIds: z.array(z.number()).describe('The IDs of the scenes created within the chapter.'),
      imageUrls: z.array(z.string()).describe('The URLs of the images created for the scenes.'),
    }),
  },
  prompt: `You are an AI manga assistant helping create a new chapter for a project. The project title is {{projectTitle}}. The chapter title is {{chapterTitle}}. The user has provided the following prompt: {{prompt}}. Use the available tools to create the chapter, scenes, and images as described in the prompt. Return the IDs of the created chapter and scenes, as well as the URLs of the created images. Follow the user's instructions precisely.
`,
});


const createChapterFromPromptFlow = ai.defineFlow<
  typeof CreateChapterFromPromptInputSchema,
  typeof CreateChapterFromPromptOutputSchema
>({
  name: 'createChapterFromPromptFlow',
  inputSchema: CreateChapterFromPromptInputSchema,
  outputSchema: CreateChapterFromPromptOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

