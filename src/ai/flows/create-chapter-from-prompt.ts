'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a chapter, its scenes, and potentially related elements (like panels or images) based on a user prompt.
 *
 * - createChapterFromPrompt - A function that takes a prompt and orchestrates the creation process using tools.
 * - CreateChapterFromPromptInput - The input type for the createChapterFromPrompt function.
 * - CreateChapterFromPromptOutput - The return type for the createChapterFromPrompt function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { createChapter, createScene, createPanel /*, createImage */ } from '@/services/strapi'; // Assuming createImage maps to createPanel or similar concept

// --- Input and Output Schemas ---

const CreateChapterFromPromptInputSchema = z.object({
  projectId: z.string().uuid().describe('The UUID of the project to which the chapter will belong.'), // Use string UUID
  chapterTitle: z.string().describe('The title of the chapter to be created.'),
  chapterNumber: z.number().int().positive().describe('The number for the chapter.'),
  prompt: z.string().describe('A prompt describing the desired chapter content, including potential scenes, panels, and characters.'),
});

export type CreateChapterFromPromptInput = z.infer<typeof CreateChapterFromPromptInputSchema>;

// Output now includes IDs as strings (UUIDs)
const CreateChapterFromPromptOutputSchema = z.object({
  chapterId: z.string().uuid().describe('The UUID of the created chapter.'),
  sceneIds: z.array(z.string().uuid()).describe('The UUIDs of the scenes created within the chapter.'),
  panelIds: z.array(z.string().uuid()).optional().describe('The UUIDs of the panels created (if applicable).'),
  // imageUrls: z.array(z.string()).optional().describe('The URLs of the images created (if applicable).'), // Keep if image generation is separate
});

export type CreateChapterFromPromptOutput = z.infer<typeof CreateChapterFromPromptOutputSchema>;

// --- Exposed Function ---

export async function createChapterFromPrompt(input: CreateChapterFromPromptInput): Promise<CreateChapterFromPromptOutput> {
  return createChapterFromPromptFlow(input);
}

// --- Genkit Tools (Aligned with Strapi Service) ---

const createChapterTool = ai.defineTool({
  name: 'createChapter',
  description: 'Creates a new chapter in the manga project.',
  inputSchema: z.object({
    mangaProjectId: z.string().uuid().describe('The UUID of the project.'), // Use UUID
    title: z.string().describe('The title of the chapter.'),
    chapterNumber: z.number().int().positive().describe('The chapter number.'),
    summary: z.string().optional().describe('An optional summary for the chapter.'),
    // Add other relevant Chapter fields from schema if needed by AI
  }),
  outputSchema: z.string().uuid().describe('The UUID of the created chapter.'), // Return UUID
}, async (input) => {
  // Call the updated Strapi service function
  const chapter = await createChapter({
    title: input.title,
    chapterNumber: input.chapterNumber,
    mangaProjectId: input.mangaProjectId,
    summary: input.summary,
    // Map other fields as necessary
    // Defaults will be set by TypeORM/Strapi if not provided
    isAiGenerated: true, // Assume AI generated
    isPublished: false,
    viewCount: 0,
    purpose: '', // Add defaults or make optional in service/db
    tone: '',
    keyCharacters: [],
  });
  return chapter.id;
});

const createSceneTool = ai.defineTool({
  name: 'createScene',
  description: 'Creates a new scene within a chapter.',
  inputSchema: z.object({
    chapterId: z.string().uuid().describe('The UUID of the chapter.'), // Use UUID
    title: z.string().describe('The title of the scene.'),
    order: z.number().int().nonnegative().describe('The order of the scene within the chapter.'),
    description: z.string().optional().describe('An optional description for the scene.'),
    sceneContext: z.object({ // Align with Scene entity
        setting: z.string().describe('The setting of the scene.'),
        mood: z.string().describe('The mood of the scene.'),
        presentCharacters: z.array(z.string()).describe('Names of characters present.'),
        timeOfDay: z.string().optional().describe('Time of day (e.g., morning, night).'),
        weather: z.string().optional().describe('Current weather.'),
    }).describe('Contextual details of the scene.'),
    // Add other relevant Scene fields if needed
  }),
  outputSchema: z.string().uuid().describe('The UUID of the created scene.'), // Return UUID
}, async (input) => {
  // Call the updated Strapi service function
  const scene = await createScene({
    title: input.title,
    chapterId: input.chapterId,
    order: input.order,
    description: input.description,
    sceneContext: input.sceneContext,
    // Defaults
    isAiGenerated: true,
    dialogueOutline: {}, // Default or make optional
  });
  return scene.id;
});

const createPanelTool = ai.defineTool({
    name: 'createPanel',
    description: 'Creates a new panel within a scene, potentially generating an image.',
    inputSchema: z.object({
        sceneId: z.string().uuid().describe('The UUID of the scene.'),
        order: z.number().int().nonnegative().describe('The order of the panel within the scene.'),
        aiPrompt: z.string().optional().describe('Prompt for AI image generation (if applicable).'), // Use aiPrompt
        panelContext: z.object({ // Align with Panel entity
            action: z.string().describe('The main action happening in the panel.'),
            pose: z.string().optional().describe('General pose.'),
            characterPoses: z.array(z.object({
                characterName: z.string(),
                pose: z.string(),
                expression: z.string().optional(),
            })).optional().describe('Specific character poses/expressions.'),
            emotion: z.string().optional().describe('Overall emotion conveyed.'),
            cameraAngle: z.enum(['close-up', 'medium', 'wide', "bird's eye", 'low angle']).optional(),
            shotType: z.enum(['action', 'reaction', 'establishing', 'detail']).optional(),
            backgroundDescription: z.string().optional(),
            lighting: z.string().describe('Description of the lighting.'),
            effects: z.array(z.string()).optional().describe('Visual effects (e.g., speed lines, rain).'),
            dramaticPurpose: z.string().describe('The purpose of this panel in the narrative.'),
            narrativePosition: z.string().describe('Where this panel fits in the scene flow.'),
        }).describe('Contextual details of the panel.'),
        // characterIds: z.array(z.string().uuid()).optional().describe('UUIDs of characters present in the panel.'), // For relation
    }),
    outputSchema: z.object({
        panelId: z.string().uuid().describe('The UUID of the created panel.'),
        imageUrl: z.string().url().optional().describe('The URL of the generated image (if any).'),
    }),
}, async (input) => {
    // TODO: Implement image generation logic here if needed, using input.aiPrompt
    // This might involve calling another Genkit flow or service
    const generatedImageUrl = input.aiPrompt ? `https://picsum.photos/seed/${input.sceneId}-${input.order}/400/600` : undefined; // Placeholder

    const panel = await createPanel({
        sceneId: input.sceneId,
        order: input.order,
        imageUrl: generatedImageUrl,
        panelContext: input.panelContext,
        aiPrompt: input.aiPrompt,
       // characters: input.characterIds || [], // Map character IDs for relation if provided
        isAiGenerated: true, // Assume AI generated panel structure/context
        // Dialogues would likely be created separately
    });
    return { panelId: panel.id, imageUrl: panel.attributes.imageUrl };
});


// --- Prompt Definition ---

const prompt = ai.definePrompt({
  name: 'createChapterFromPromptPrompt',
  tools: [createChapterTool, createSceneTool, createPanelTool], // Include createPanelTool
  input: {
    schema: CreateChapterFromPromptInputSchema, // Use updated input schema
  },
  output: {
    // Although tools return values, the final *flow* output needs defining.
    // Let the LLM decide which tool outputs to aggregate.
    // A simpler approach for now: let the LLM just confirm completion or report issues.
    // A more complex approach: Define an output schema that *mirrors* the flow's output schema
    // and instruct the LLM to populate it based on tool results.
    schema: z.object({
        confirmation: z.string().describe("Confirmation message indicating success or issues encountered during creation.")
        // Potentially include aggregated IDs if needed directly from LLM, though tool use is preferred
         // chapterId: z.string().uuid().optional(),
         // sceneIds: z.array(z.string().uuid()).optional(),
         // panelIds: z.array(z.string().uuid()).optional(),
    }),
  },
  prompt: `You are an AI manga assistant helping create a new chapter (Chapter {{chapterNumber}}: "{{chapterTitle}}") for a project (ID: {{projectId}}).
The user provided the following prompt:
"{{prompt}}"

Based *only* on the user's prompt, perform the following steps using the available tools:
1.  Create the chapter using the \`createChapter\` tool. Provide the project ID, title, and chapter number. Include a summary if inferrable from the prompt.
2.  Analyze the prompt to identify distinct scenes. For each scene:
    *   Determine a suitable title, order, description, setting, mood, and characters present based *only* on the prompt.
    *   Use the \`createScene\` tool to create the scene, providing the generated chapter ID and the scene details.
3.  Analyze the prompt for descriptions of specific panels within scenes. For each panel described:
    *   Determine the panel's order within its scene, the action, relevant character poses/expressions, camera angle, shot type, background, lighting, effects, and dramatic purpose based *only* on the prompt.
    *   Generate a concise AI image generation prompt (\`aiPrompt\`) based on these details if an image seems implied by the panel description.
    *   Use the \`createPanel\` tool to create the panel, providing the relevant scene ID, panel order, context details, and the generated \`aiPrompt\` (if applicable).
4.  **Important**: Only create entities explicitly mentioned or strongly implied by the user's prompt. Do not invent extra scenes or panels.
5.  After attempting all creations, respond with a confirmation message summarizing what was created (chapter, number of scenes, number of panels) or any issues encountered. Do not return the IDs directly in the final response message, rely on the flow's output structure.
`,
});


// --- Flow Definition ---

const createChapterFromPromptFlow = ai.defineFlow<
  typeof CreateChapterFromPromptInputSchema,
  typeof CreateChapterFromPromptOutputSchema // Use updated output schema
>( {
    name: 'createChapterFromPromptFlow',
    inputSchema: CreateChapterFromPromptInputSchema,
    outputSchema: CreateChapterFromPromptOutputSchema,
  },
  async (input) => {
    // The prompt invocation handles the tool orchestration.
    // The LLM will call the tools based on the instructions.
    const { output: toolCallOutput, toolRequests, toolResponses } = await prompt(input);

    // Extract IDs from tool responses to construct the final flow output
    let chapterId: string | undefined;
    const sceneIds: string[] = [];
    const panelIds: string[] = [];

    if (toolResponses) {
        for (const response of toolResponses) {
            if (response.toolRequest.toolName === 'createChapter') {
                chapterId = response.result as string;
            } else if (response.toolRequest.toolName === 'createScene') {
                sceneIds.push(response.result as string);
            } else if (response.toolRequest.toolName === 'createPanel') {
                 // The tool returns an object { panelId: string, imageUrl?: string }
                 const panelResult = response.result as { panelId: string, imageUrl?: string };
                 if (panelResult?.panelId) {
                     panelIds.push(panelResult.panelId);
                 }
            }
        }
    }


    // Validate required outputs
    if (!chapterId) {
      console.error("Flow Error: Chapter ID was not generated.", toolCallOutput, toolRequests, toolResponses);
      throw new Error("Chapter creation failed or chapter ID was not returned by the tool.");
    }

     // Return the structured output with collected IDs
     return {
        chapterId: chapterId,
        sceneIds: sceneIds,
        panelIds: panelIds,
        // imageUrls: panelImageUrls, // Populate if image URLs are collected separately
     };
  }
);
