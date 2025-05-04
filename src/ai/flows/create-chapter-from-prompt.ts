
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a chapter, its scenes, and potentially related elements based on a user prompt.
 * It utilizes specific tools to interact with the backend service (Firebase Firestore).
 *
 * - createChapterFromPrompt - A function that takes a prompt and orchestrates the creation process using tools.
 * - CreateChapterFromPromptInput - The input type for the createChapterFromPrompt function.
 * - CreateChapterFromPromptOutput - The return type for the createChapterFromPrompt function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
// Import specific CRUD operations from the Firebase service
import {
    createChapter as createChapterService,
    createScene as createSceneService,
    createPanel as createPanelService,
    createPanelDialogue as createPanelDialogueService,
    createCharacter as createCharacterService,
    assignCharacterToPanel as assignCharacterToPanelService,
    getCharacter, // Needed to potentially resolve speaker names to IDs
    getAllCharacters // Needed to find characters by name
} from '@/services/firebase'; // Import from firebase service
import type { Scene, Panel, PanelDialogue, Character } from '@/types/entities'; // Import types for context

// --- Input and Output Schemas ---

const CreateChapterFromPromptInputSchema = z.object({
  projectId: z.string().describe('The Firestore Document ID of the project to which the chapter will belong.'),
  chapterTitle: z.string().describe('The title of the chapter to be created.'),
  chapterNumber: z.number().int().positive().describe('The number for the chapter.'),
  prompt: z.string().describe('A prompt describing the desired chapter content, including potential scenes, panels, characters, and dialogue.'),
});

export type CreateChapterFromPromptInput = z.infer<typeof CreateChapterFromPromptInputSchema>;

// Output now includes IDs as strings (Firestore Document IDs)
const CreateChapterFromPromptOutputSchema = z.object({
  chapterId: z.string().describe('The Firestore Document ID of the created chapter.'),
  sceneIds: z.array(z.string()).describe('The Document IDs of the scenes created within the chapter.'),
  panelIds: z.array(z.string()).optional().describe('The Document IDs of the panels created.'),
  dialogueIds: z.array(z.string()).optional().describe('The Document IDs of the dialogues created.'),
  characterIds: z.array(z.string()).optional().describe('Document IDs of any characters created or assigned.'), // Optional: if flow creates chars
});

export type CreateChapterFromPromptOutput = z.infer<typeof CreateChapterFromPromptOutputSchema>;

// --- Exposed Function ---

export async function createChapterFromPrompt(input: CreateChapterFromPromptInput): Promise<CreateChapterFromPromptOutput> {
  return createChapterFromPromptFlow(input);
}

// --- Genkit Tools (Wrapping Firebase Service Functions) ---

const createChapterTool = ai.defineTool({
  name: 'createChapter',
  description: 'Creates a new chapter in the manga project. Call this first.',
  inputSchema: z.object({
    mangaProjectId: z.string().describe('The Document ID of the parent project.'),
    title: z.string().describe('The title of the chapter.'),
    chapterNumber: z.number().int().positive().describe('The chapter number.'),
    summary: z.string().optional().describe('A brief summary of the chapter, if inferrable from the prompt.'),
    purpose: z.string().optional().describe("The narrative purpose of this chapter."),
    tone: z.string().optional().describe("The overall tone (e.g., comedic, dramatic, mysterious)."),
    keyCharacters: z.array(z.string()).optional().describe("Names of key characters appearing in this chapter."),
  }),
  outputSchema: z.string().describe('The Document ID of the created chapter.'),
}, async (input) => {
  const chapter = await createChapterService({
    ...input,
    // Defaults for Firestore chapter
    isAiGenerated: true,
    isPublished: false,
    viewCount: 0,
  });
  return chapter.id; // Return only the ID
});

const createSceneTool = ai.defineTool({
  name: 'createScene',
  description: 'Creates a new scene within a specific chapter. Must be called after createChapter.',
  inputSchema: z.object({
    chapterId: z.string().describe('The Document ID of the chapter this scene belongs to (from createChapter tool).'),
    title: z.string().describe('A descriptive title for the scene.'),
    order: z.number().int().nonnegative().describe('The sequential order of the scene within the chapter (starts from 0 or 1).'),
    description: z.string().optional().describe('A brief description or summary of the scene.'),
    sceneContext: z.object({ // Align with Scene entity
        setting: z.string().describe('Where and when the scene takes place (e.g., "Rainy alley at night").'),
        mood: z.string().describe('The emotional atmosphere (e.g., "Tense", "Comedic", "Mysterious").'),
        presentCharacters: z.array(z.string()).describe('Names of characters actively involved in the scene.'),
        timeOfDay: z.string().optional().describe('Specific time if relevant (e.g., "Dawn", "Midnight").'),
        weather: z.string().optional().describe('Weather conditions if relevant (e.g., "Snowing", "Sunny").'),
    }).describe('Contextual details defining the scene environment and participants.'),
    dialogueOutline: z.string().optional().describe("A high-level outline or summary of the dialogue that occurs in this scene."),
    // Need chapterId to associate the scene correctly in Firestore
    // Although implied by flow, good to have explicitly if possible
  }),
  outputSchema: z.string().describe('The Document ID of the created scene.'),
}, async (input) => {
  // Fetch the chapter to get the projectId needed for context potentially, or assume it's implicitly handled
   // We need mangaProjectId from the chapter for context potentially, but the input schema for createSceneService only requires chapterId.
   // Assume the service function handles context or structure appropriately.
  const scene = await createSceneService({
    ...input,
    // chapterId is already in input
    isAiGenerated: true,
  });
  return scene.id;
});

const createPanelTool = ai.defineTool({
    name: 'createPanel',
    description: 'Creates a new panel within a specific scene. Must be called after createScene. Panels depict visual moments and actions.',
    inputSchema: z.object({
        sceneId: z.string().describe('The Document ID of the scene this panel belongs to (from createScene tool).'),
        order: z.number().int().nonnegative().describe('The sequential order of the panel within the scene.'),
        aiPrompt: z.string().optional().describe('Concise prompt for AI image generation, summarizing the visual elements if an image is desired.'),
        panelContext: z.object({ // Align with Panel entity
            action: z.string().describe('The primary action or event depicted in the panel (e.g., "Character throws a punch", "Close-up on surprised face").'),
            pose: z.string().optional().describe('General pose or composition description.'),
            characterPoses: z.array(z.object({
                characterName: z.string().describe("Name of the character."),
                pose: z.string().describe("Specific pose (e.g., 'crouching', 'arms crossed')."),
                expression: z.string().optional().describe("Facial expression (e.g., 'smiling', 'angry')."),
            })).optional().describe('Specific pose and expression for each character visible in the panel.'),
            emotion: z.string().optional().describe('The dominant emotion conveyed visually in the panel.'),
            cameraAngle: z.enum(['close-up', 'medium', 'wide', "bird's eye", 'low angle']).optional().describe("The camera's perspective."),
            shotType: z.enum(['action', 'reaction', 'establishing', 'detail']).optional().describe("The type of shot (e.g., showing action, reaction, setting)."),
            backgroundDescription: z.string().optional().describe("Description of the background elements."),
            lighting: z.string().describe('Description of the lighting (e.g., "Dramatic shadows", "Bright sunlight").'),
            effects: z.array(z.string()).optional().describe('Visual effects like speed lines, impact stars, rain, etc.'),
            dramaticPurpose: z.string().describe('What this panel achieves narratively (e.g., "Reveal surprise", "Show impact", "Build tension").'),
            narrativePosition: z.string().describe('Where this panel fits in the flow (e.g., "Start of action", "Mid-dialogue reaction").'),
        }).describe('Detailed visual and narrative context for the panel.'),
        // Pass character *names* mentioned in the panel context for potential linking later
        characterNames: z.array(z.string()).optional().describe('Names of characters present in this panel (for potential linking later using findCharacterByName tool).'),
    }),
    // Output panel ID. Image generation happens separately or is triggered by the service.
    outputSchema: z.string().describe('The Document ID of the created panel.'),
}, async (input) => {
    // Resolve character names to IDs if possible *before* creating the panel
    let characterIds: string[] = [];
    if (input.characterNames && input.characterNames.length > 0) {
        // Need project context to find characters by name. Assume we can get it.
        // This might require fetching the scene->chapter->project chain, or having projectId passed down.
        // Let's assume projectId is available somehow (e.g., from flow context - needs adjustment)
        const projectId = 'proj-123'; // Placeholder: THIS NEEDS TO BE DYNAMIC
        if (projectId) {
            const charactersInProject = await getAllCharacters(projectId);
            characterIds = input.characterNames
                .map(name => charactersInProject.find(c => c.name.toLowerCase() === name.toLowerCase())?.id)
                .filter((id): id is string => !!id); // Filter out undefined/null IDs
        } else {
            console.warn("Cannot resolve character names to IDs without project context in createPanelTool.");
        }
    }

    const panel = await createPanelService({
        sceneId: input.sceneId,
        order: input.order,
        panelContext: input.panelContext,
        aiPrompt: input.aiPrompt,
        characterIds: characterIds, // Pass resolved IDs
        isAiGenerated: true,
    });
    return panel.id;
});


const createPanelDialogueTool = ai.defineTool({
    name: 'createPanelDialogue',
    description: 'Creates dialogue text associated with a specific panel. Call after createPanel. If speakerName is provided, attempt to find character ID.',
    inputSchema: z.object({
        panelId: z.string().describe('The Document ID of the panel this dialogue belongs to (from createPanel tool).'),
        order: z.number().int().nonnegative().describe('Order of this dialogue bubble/caption within the panel.'),
        content: z.string().describe('The exact dialogue text or caption.'),
        speakerName: z.string().optional().describe('Name of the character speaking (if applicable). Will try to resolve to ID.'),
        style: z.object({
             bubbleType: z.enum(['normal', 'thought', 'scream', 'whisper']).optional().describe("Visual style of the speech bubble."),
         }).optional().describe("Stylistic hints for the dialogue."),
        emotion: z.string().optional().describe("Emotion conveyed by the dialogue delivery."),
        subtextNote: z.string().optional().describe("Underlying meaning or director's note."),
    }),
    outputSchema: z.string().describe('The Document ID of the created dialogue entry.'),
}, async (input) => {
    let speakerId: string | undefined | null = null;
    if (input.speakerName) {
         // Need project context to find characters by name
         // Placeholder: THIS NEEDS TO BE DYNAMIC
        const projectId = 'proj-123';
        if (projectId) {
             const characters = await getAllCharacters(projectId);
             const found = characters.find(c => c.name.toLowerCase() === input.speakerName?.toLowerCase());
             speakerId = found?.id;
             if (!speakerId) {
                 console.warn(`Could not find character ID for speaker: ${input.speakerName}`);
             }
        } else {
             console.warn("Cannot resolve speaker name to ID without project context in createPanelDialogueTool.");
        }
    }

    const dialogue = await createPanelDialogueService({
        panelId: input.panelId,
        order: input.order,
        content: input.content,
        style: input.style,
        emotion: input.emotion,
        subtextNote: input.subtextNote,
        speakerId: speakerId, // Pass resolved ID or null
        isAiGenerated: true,
    });
    return dialogue.id;
});

// Optional Tool: If characters need to be created *during* this flow
const createCharacterTool = ai.defineTool({
    name: 'createCharacter',
    description: 'Creates a new character profile within the project. Use if a character mentioned in the prompt does not exist.',
    inputSchema: z.object({
        mangaProjectId: z.string().describe("The project the character belongs to."),
        name: z.string().describe("The character's name."),
        briefDescription: z.string().optional().describe("A short description."),
        role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
        // Add other key fields the AI might infer or need
    }),
    outputSchema: z.string().describe("The Document ID of the created character."),
}, async (input) => {
    const character = await createCharacterService({
        ...input,
        isAiGenerated: true, // Assume AI generated
        // Add defaults for other fields if needed
    });
    return character.id;
});

// Tool to link existing characters to panels (using Firebase service function)
const assignCharacterToPanelTool = ai.defineTool({
    name: 'assignCharacterToPanel',
    description: 'Assigns an *existing* character to a specific panel. Call after createPanel and ensure the character exists.',
    inputSchema: z.object({
        panelId: z.string().describe("The Document ID of the panel."),
        // Requires character ID. LLM needs to know or retrieve this.
        characterId: z.string().describe("The Document ID of the *existing* character to assign."),
    }),
    outputSchema: z.boolean().describe("True if assignment was successful."),
}, async (input) => {
    try {
        // Firebase service function updates the panel's characterIds array
        await assignCharacterToPanelService(input.panelId, input.characterId);
        return true;
    } catch (error) {
        console.error(`Failed to assign character ${input.characterId} to panel ${input.panelId}:`, error);
        return false; // Or throw error
    }
});


// --- Prompt Definition ---

const prompt = ai.definePrompt({
  name: 'createChapterFromPromptPrompt',
  // Available tools for the LLM
  tools: [
      createChapterTool,
      createSceneTool,
      createPanelTool,
      createPanelDialogueTool,
      createCharacterTool, // Enable if AI should create characters
      assignCharacterToPanelTool // Enable if AI should link chars (needs ID handling)
    ],
  input: {
    schema: CreateChapterFromPromptInputSchema,
  },
  output: {
    // The final *flow* output needs defining. We collect IDs from tool responses.
    // The LLM's text output is just a confirmation/summary.
    schema: z.object({
        confirmation: z.string().describe("Confirmation message summarizing the creation process and any potential issues encountered.")
    }),
  },
  // Enhanced prompt instructions
  prompt: `You are an expert manga storyteller and AI assistant using Firebase Firestore. Your task is to generate the structure for Chapter {{chapterNumber}}: "{{chapterTitle}}" for the project (ID: {{projectId}}) based *only* on the user's prompt.

User Prompt:
"{{prompt}}"

Follow these steps meticulously using the available tools IN ORDER:

1.  **Create Chapter:** Use the \`createChapter\` tool ONCE. Provide the project ID (\`mangaProjectId\`), title, chapter number, and infer summary, purpose, tone, and key characters ONLY from the user prompt.
2.  **Create Scenes:** Analyze the prompt to identify distinct scenes needed to tell the story. For EACH scene:
    *   Determine a title, description, setting, mood, present characters, time/weather, and a brief dialogue outline based *strictly* on the prompt.
    *   Determine the correct sequential \`order\` for the scene within the chapter.
    *   Use the \`createScene\` tool to create it, providing the chapter ID returned by \`createChapter\`.
3.  **Create Panels:** Within each created scene, identify the necessary visual moments or actions described in the prompt. For EACH panel:
    *   Determine its sequential \`order\` within its scene.
    *   Describe the core \`action\`, character poses/expressions (\`characterPoses\`), emotion, camera angle, shot type, background, lighting, visual effects (\`effects\`), narrative purpose (\`dramaticPurpose\`), and flow position (\`narrativePosition\`) based *strictly* on the prompt.
    *   List the names of characters present in \`characterNames\`.
    *   Generate a concise \`aiPrompt\` for image generation ONLY IF the panel description clearly implies a visual is needed.
    *   Use the \`createPanel\` tool to create it, providing the scene ID returned by the corresponding \`createScene\` call.
4.  **Assign Characters to Panels:** After creating a panel where characters are present, use the \`assignCharacterToPanel\` tool for EACH character mentioned. You MUST provide the correct panel ID and the character's Document ID (you might need to create the character first using \`createCharacter` if they don't exist, or look them up if they do - this might require context or another tool not explicitly defined here, assume character IDs are known or created).
5.  **Create Dialogue:** For panels where dialogue or captions are specified in the prompt:
    *   Determine the dialogue \`content\`, its \`order\` within the panel, the speaker's name (\`speakerName\`) if mentioned, and any specified style, emotion, or subtext.
    *   Use the \`createPanelDialogue\` tool for EACH piece of dialogue/caption, providing the panel ID from the corresponding \`createPanel\` call. The tool will attempt to find the speaker's ID from their name.
6.  **(Optional Character Creation):** If the prompt mentions a new character needed for a scene or panel, use the \`createCharacter\` tool FIRST, providing the \`mangaProjectId\`.

**CRITICAL RULES:**
*   **Strict Adherence:** ONLY create entities and details explicitly mentioned or strongly implied by the user's prompt for THIS chapter. Do not add extra scenes, panels, dialogue, or details not requested.
*   **Tool Order:** Create Chapter -> (Optional Characters) -> Scenes -> Panels -> Assign Characters -> Dialogue. Use the IDs returned by previous tool calls.
*   **IDs:** You MUST use the Firestore Document IDs returned by the tools when calling subsequent tools (e.g., use chapterId from \`createChapter\` when calling \`createScene\`).
*   **No Image Generation:** You are only creating the structure. Do not generate images directly. The \`aiPrompt\` in \`createPanel\` is for *potential* later generation.
*   **Confirmation:** After attempting all creations based on the prompt, respond ONLY with a confirmation message summarizing what was created (e.g., "Chapter created with X scenes, Y panels, Z dialogues.") and mention any parts of the prompt you couldn't fulfill due to lack of detail or tool constraints. Do not include the generated Document IDs in your confirmation message.
`,
});


// --- Flow Definition ---

const createChapterFromPromptFlow = ai.defineFlow<
  typeof CreateChapterFromPromptInputSchema,
  typeof CreateChapterFromPromptOutputSchema
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
    const dialogueIds: string[] = [];
    const characterIds: string[] = []; // Track created/assigned chars

    if (toolResponses) {
        for (const response of toolResponses) {
            const toolName = response.toolRequest.toolName;
            const result = response.result; // Result is the Document ID or boolean

            if (toolName === 'createChapter' && typeof result === 'string') {
                chapterId = result;
            } else if (toolName === 'createScene' && typeof result === 'string') {
                sceneIds.push(result);
            } else if (toolName === 'createPanel' && typeof result === 'string') {
                 panelIds.push(result);
            } else if (toolName === 'createPanelDialogue' && typeof result === 'string') {
                dialogueIds.push(result);
            } else if (toolName === 'createCharacter' && typeof result === 'string') {
                 // Add character ID if created
                 if (!characterIds.includes(result)) characterIds.push(result);
            } else if (toolName === 'assignCharacterToPanel' && response.toolRequest.input) {
                // Add character ID if assigned successfully
                const assignInput = response.toolRequest.input as { characterId: string };
                 if (result === true && assignInput.characterId && !characterIds.includes(assignInput.characterId)) {
                    characterIds.push(assignInput.characterId);
                 }
            }
        }
    }


    // Validate required outputs
    if (!chapterId) {
      console.error("Flow Error: Chapter ID was not generated.", { toolCallOutput, toolRequests, toolResponses });
      throw new Error("Chapter creation failed or chapter ID was not returned by the tool. Ensure the 'createChapter' tool was called successfully.");
    }
    if (sceneIds.length === 0) {
        // This might be valid if the prompt only asked for a chapter summary, but often implies an issue.
        console.warn("Flow Warning: No scenes were generated for the chapter.", { toolCallOutput, toolRequests, toolResponses });
    }

     // Return the structured output with collected IDs
     return {
        chapterId: chapterId,
        sceneIds: sceneIds,
        panelIds: panelIds,
        dialogueIds: dialogueIds,
        characterIds: characterIds, // Include tracked chars
     };
  }
);
