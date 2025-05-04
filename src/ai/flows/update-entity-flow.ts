
'use server';
/**
 * @fileOverview Defines a Genkit flow for updating various manga entities (Project, Chapter, Scene, Panel, Dialogue, Character) in Firebase Firestore based on user prompts.
 *
 * This flow uses specific tools to interact with the backend service (Firebase) for updates.
 * - updateEntity - A function that takes an entity type, ID, and prompt, then orchestrates the update using tools.
 * - UpdateEntityInput - The input type for the updateEntity function.
 * - UpdateEntityOutput - The return type for the updateEntity function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import {
    updateProject,
    updateChapter,
    updateScene,
    updatePanel,
    updatePanelDialogue,
    updateCharacter,
    assignCharacterToPanel,
    removeCharacterFromPanel,
    getProject,
    getChapter,
    getScene,
    getPanel,
    getPanelDialogue,
    getCharacter,
    getAllCharacters
} from '@/services/firebase'; // Import Firebase service functions
import type { NodeType } from '@/types/nodes';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils';

// --- Schemas for Tools (Subset of Full Entities, Focusing on Updatable Fields) ---
// Define schemas for *data the AI can provide* for updates. Exclude read-only fields like ID, createdAt etc.
// Use DeepPartial as updates modify only parts of the entity.

// Note: Firebase update function expects a flat object with fields to update.
// Nested objects (like panelContext) need to be handled carefully (either update the whole object or use dot notation).
// For simplicity here, we'll pass the partial object and let the Firebase service handle it if needed (though direct update might require dot notation for nested fields).

const UpdateProjectSchema = z.custom<DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>>()
    .describe("Fields that can be updated for a Manga Project.");

const UpdateChapterSchema = z.custom<DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>>()
    .describe("Fields that can be updated for a Chapter.");

const UpdateSceneSchema = z.custom<DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>>()
    .describe("Fields that can be updated for a Scene.");

// For panels, specifically allow updating characterIds array
const UpdatePanelSchema = z.custom<DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>>()
    .describe("Fields that can be updated for a Panel, including 'characterIds'.");

const UpdatePanelDialogueSchema = z.custom<DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>>()
    .describe("Fields that can be updated for Panel Dialogue.");

const UpdateCharacterSchema = z.custom<DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>>()
    .describe("Fields that can be updated for a Character.");


// --- Input and Output Schemas for the Flow ---

const UpdateEntityInputSchema = z.object({
  entityType: z.enum(['project', 'chapter', 'scene', 'panel', 'dialogue', 'character']).describe("The type of entity to update."),
  entityId: z.string().describe("The Firestore Document ID of the specific entity instance to update."),
  prompt: z.string().describe("The user's instruction for how to update the entity (e.g., 'Change the scene setting to a dark forest', 'Add character X to the panel', 'Rewrite the dialogue to be more menacing')."),
  // Add projectId context if needed, especially for finding characters
  projectId: z.string().optional().describe("The Firestore Document ID of the project context (important for character lookups)."),
});
export type UpdateEntityInput = z.infer<typeof UpdateEntityInputSchema>;

// Output indicates success and potentially the updated entity ID (though it's the same as input)
const UpdateEntityOutputSchema = z.object({
  success: z.boolean().describe("Whether the update was successfully processed."),
  message: z.string().describe("A message confirming the update or indicating issues."),
  updatedEntityId: z.string().describe("The ID of the entity that was updated."),
});
export type UpdateEntityOutput = z.infer<typeof UpdateEntityOutputSchema>;

// Schema for the flow's *internal* input, including fetched current data
const AugmentedUpdateEntityInputSchema = UpdateEntityInputSchema.extend({
    currentData: z.any().optional().describe("The current data of the entity being updated (for context).")
});
type AugmentedUpdateEntityInput = z.infer<typeof AugmentedUpdateEntityInputSchema>;


// --- Exposed Function ---

export async function updateEntity(input: UpdateEntityInput): Promise<UpdateEntityOutput> {
    // Fetch current data to provide context to the LLM if needed
    let currentData: any = null;
    try {
        console.log(`Fetching current data for ${input.entityType} ${input.entityId}`);
        switch (input.entityType) {
            case 'project': currentData = await getProject(input.entityId); break; // Project fetch already gets deep data
            case 'chapter': currentData = await getChapter(input.entityId); break; // Fetch chapter only
            case 'scene': currentData = await getScene(input.entityId); break; // Fetch scene only
            case 'panel': currentData = await getPanel(input.entityId); break; // Fetch panel only
            case 'dialogue': currentData = await getPanelDialogue(input.entityId); break; // Fetch dialogue only
            case 'character': currentData = await getCharacter(input.entityId); break; // Fetch character only
        }
         console.log("Current data fetched:", currentData ? 'Data found' : 'Not found');
    } catch (error) {
        console.warn(`Could not fetch current data for ${input.entityType} ${input.entityId}:`, error);
        // Proceed without currentData, but the LLM might be less effective
    }

     // Find projectId if not provided and needed for context (e.g., character lookups)
     let projectId = input.projectId;
     if (!projectId && input.entityType !== 'project' && currentData) {
        // Try to infer projectId from the fetched data's hierarchy
        if (currentData.mangaProjectId) projectId = currentData.mangaProjectId;
        else if (currentData.chapterId) {
            const scene = await getScene(currentData.panelId);
            if(scene?.chapterId) {
                const chapter = await getChapter(scene.chapterId);
                if (chapter?.mangaProjectId) projectId = chapter.mangaProjectId;
            }
        } else if (currentData.panelId) {
            const panel = await getPanel(currentData.panelId);
            if(panel?.sceneId) {
                 const scene = await getScene(panel.sceneId);
                 if (scene?.chapterId) {
                     const chapter = await getChapter(scene.chapterId);
                     if (chapter?.mangaProjectId) projectId = chapter.mangaProjectId;
                 }
            }
        }
         console.log("Inferred projectId:", projectId);
     }


    // Augment input with current data and potentially inferred projectId for the flow
    const flowInput: AugmentedUpdateEntityInput = { ...input, projectId, currentData };

    return updateEntityFlow(flowInput);
}


// --- Genkit Tools for Updates ---

const updateProjectTool = ai.defineTool({
    name: 'updateProject',
    description: 'Updates specific fields of a Manga Project entity.',
    inputSchema: z.object({
        id: z.string().describe("The Document ID of the project to update."),
        data: UpdateProjectSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
    try {
        await updateProject(id, data);
        return true;
    } catch (e) { console.error("updateProjectTool Error:", e); return false; }
});

const updateChapterTool = ai.defineTool({
    name: 'updateChapter',
    description: 'Updates specific fields of a Chapter entity.',
    inputSchema: z.object({
        id: z.string().describe("The Document ID of the chapter to update."),
        data: UpdateChapterSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updateChapter(id, data);
        return true;
    } catch (e) { console.error("updateChapterTool Error:", e); return false; }
});

const updateSceneTool = ai.defineTool({
    name: 'updateScene',
    description: 'Updates specific fields of a Scene entity.',
    inputSchema: z.object({
        id: z.string().describe("The Document ID of the scene to update."),
        data: UpdateSceneSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updateScene(id, data);
        return true;
    } catch (e) { console.error("updateSceneTool Error:", e); return false; }
});

const updatePanelTool = ai.defineTool({
    name: 'updatePanel',
    description: 'Updates specific fields of a Panel entity. Use assign/remove tools for character list changes.',
    inputSchema: z.object({
        id: z.string().describe("The Document ID of the panel to update."),
        // Exclude characterIds from direct update data here, force use of assignment tools
        data: z.custom<DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters' | 'characterIds'>>>()
            .describe("The fields and new values to update (excluding characterIds)."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updatePanel(id, data); // Service function handles the update
        return true;
    } catch (e) { console.error("updatePanelTool Error:", e); return false; }
});

const updatePanelDialogueTool = ai.defineTool({
    name: 'updatePanelDialogue',
    description: 'Updates specific fields of a Panel Dialogue entity.',
    inputSchema: z.object({
        id: z.string().describe("The Document ID of the dialogue to update."),
        data: UpdatePanelDialogueSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updatePanelDialogue(id, data);
        return true;
    } catch (e) { console.error("updatePanelDialogueTool Error:", e); return false; }
});

const updateCharacterTool = ai.defineTool({
    name: 'updateCharacter',
    description: 'Updates specific fields of a Character entity.',
    inputSchema: z.object({
        id: z.string().describe("The Document ID of the character to update."),
        data: UpdateCharacterSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updateCharacter(id, data);
        return true;
    } catch (e) { console.error("updateCharacterTool Error:", e); return false; }
});

// Tool to find character ID by name (needed for assignment tools)
const findCharacterByNameTool = ai.defineTool({
    name: "findCharacterByName",
    description: "Finds the Document ID of an existing character given their name within the current project context.",
    inputSchema: z.object({
        characterName: z.string().describe("The exact name of the character to find."),
        projectId: z.string().optional().describe("The Document ID of the current project context (REQUIRED for lookup)."),
    }),
    // Return ID or null explicitly
    outputSchema: z.string().nullable().describe("The Document ID of the found character, or null if not found or projectId is missing."),
}, async ({ characterName, projectId }) => {
    if (!projectId) {
         console.warn("findCharacterByNameTool requires projectId for context.");
         return null; // Cannot search without project context
    }
    try {
        console.log(`Finding character "${characterName}" in project ${projectId}`);
        const characters = await getAllCharacters(projectId);
        const found = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase());
        console.log(`Found character: ${found?.id ?? 'null'}`);
        return found?.id ?? null;
    } catch (error) {
        console.error(`Error finding character "${characterName}" in project ${projectId}:`, error);
        return null;
    }
});


// Use Firebase assignment tools
const assignCharacterToPanelTool = ai.defineTool({
    name: 'assignCharacterToPanel',
    description: 'Assigns an *existing* character to a specific panel. Use findCharacterByName first if you only have the name.',
    inputSchema: z.object({
        panelId: z.string().describe("The Document ID of the panel."),
        characterId: z.string().describe("The Document ID of the *existing* character to assign."),
    }),
    outputSchema: z.boolean().describe("True if assignment was successful."),
}, async (input) => {
    try {
        await assignCharacterToPanel(input.panelId, input.characterId); // Firebase service
        return true;
    } catch (error) {
        console.error(`Failed to assign character ${input.characterId} to panel ${input.panelId}:`, error);
        return false;
    }
});

const removeCharacterFromPanelTool = ai.defineTool({
    name: 'removeCharacterFromPanel',
    description: 'Removes a character from a specific panel. Use findCharacterByName first if you only have the name.',
     inputSchema: z.object({
        panelId: z.string().describe("The Document ID of the panel."),
        characterId: z.string().describe("The Document ID of the character to remove."),
    }),
    outputSchema: z.boolean().describe("True if removal was successful."),
}, async (input) => {
    try {
        await removeCharacterFromPanel(input.panelId, input.characterId); // Firebase service
        return true;
    } catch (error) {
        console.error(`Failed to remove character ${input.characterId} from panel ${input.panelId}:`, error);
        return false;
    }
});


// --- Prompt Definition ---

const prompt = ai.definePrompt({
  name: 'updateEntityPrompt',
  tools: [
      updateProjectTool,
      updateChapterTool,
      updateSceneTool,
      updatePanelTool,
      updatePanelDialogueTool,
      updateCharacterTool,
      findCharacterByNameTool,
      assignCharacterToPanelTool,
      removeCharacterFromPanelTool
    ],
  input: {
    schema: AugmentedUpdateEntityInputSchema,
  },
  output: {
    schema: z.object({
        confirmation: z.string().describe("Confirmation message indicating if the update was attempted based on the prompt and which tools were used.")
    }),
  },
  prompt: `You are an AI assistant helping update elements of a manga project stored in Firebase Firestore. The user wants to modify a specific {{entityType}} with Document ID: {{entityId}}. The project context ID is {{projectId}}.

User Prompt:
"{{prompt}}"

Current Data (for context, may be null if fetch failed):
\`\`\`json
{{{json currentData}}}
\`\`\`

Based *only* on the user's prompt and the current data:
1.  Determine the specific changes requested.
2.  Identify the correct tool(s) to apply these changes (e.g., \`updateScene\`, \`assignCharacterToPanel\`).
3.  If the prompt involves adding or removing a character from a panel BY NAME:
    a. FIRST use \`findCharacterByName\` to get their Document ID, providing the \`projectId\` ({{projectId}}) for context.
    b. If the character ID is found, use \`assignCharacterToPanel\` or \`removeCharacterFromPanel\` with the panel ID and the found character ID.
    c. If the character ID is NOT found, inform the user in the confirmation message and DO NOT attempt to assign/remove.
4.  If the prompt involves updating fields of an entity (e.g., changing title, description, context):
    a. Construct the \`data\` object for the appropriate update tool (e.g., \`updateScene\`, \`updatePanelDialogue\`). Include ONLY the fields to be changed with their NEW values.
    b. For \`updatePanel\`, DO NOT include \`characterIds\` in the \`data\` object; use the assignment/removal tools instead.
    c. Call the appropriate update tool with the entity ID (\`{{entityId}}\`) and the update \`data\`.
5.  Handle speaker changes in dialogue: If the prompt requests changing the speaker by name, use \`findCharacterByName\` to get the ID, then call \`updatePanelDialogue\` with the new \`speakerId\`. If the name is not found, report it.

**CRITICAL RULES:**
*   **Targeted Updates:** Only update the fields or relationships explicitly requested or strongly implied by the user's prompt. Do not change unrelated data.
*   **Correct Tool:** Use the tool corresponding to the \`entityType\` (e.g., use \`updateSceneTool\` for a scene). Use assignment/removal tools for panel character list changes.
*   **Use IDs:** Provide the correct \`entityId\` (\`{{entityId}}\`) to the tools. Use character IDs found via \`findCharacterByName\` when required by other tools. Provide the \`projectId\` ({{projectId}}) to \`findCharacterByName\`.
*   **Character IDs:** Only use \`assignCharacterToPanel\` or \`removeCharacterFromPanel\` if you have the character's Document ID.
*   **Confirmation:** After attempting the updates, respond ONLY with a confirmation message summarizing the actions taken (or why they couldn't be taken, e.g., character not found, missing projectId). Do not include full data structures in the response.
`,
});


// --- Flow Definition ---

const updateEntityFlow = ai.defineFlow<
  AugmentedUpdateEntityInput, // Use the direct type here
  UpdateEntityOutput // Output schema type
>( {
    name: 'updateEntityFlow',
    inputSchema: AugmentedUpdateEntityInputSchema, // Zod schema for validation
    outputSchema: UpdateEntityOutputSchema,
  },
  async (input: AugmentedUpdateEntityInput): Promise<UpdateEntityOutput> => {
    console.log("Executing updateEntityFlow with input:", input);

    // Ensure projectId is available if needed for character lookup
    if (!input.projectId && (input.prompt.toLowerCase().includes('character') || input.prompt.toLowerCase().includes('speaker'))) {
         console.warn("Update prompt mentions character/speaker but projectId is missing. Character lookup might fail.");
         // Consider throwing an error or adding a specific message if projectId is crucial
         // return { success: false, message: "Project ID context is missing for character-related updates.", updatedEntityId: input.entityId };
    }


    // Invoke the prompt with the input (including currentData and projectId)
    const { output: toolCallOutput, toolRequests, toolResponses } = await prompt(input);

    let success = false;
    let message = toolCallOutput?.confirmation || "Update attempt finished."; // Default message

    // Check if any tool call was made and if it was successful
    if (toolResponses && toolResponses.length > 0) {
        const allSucceeded = toolResponses.every(response => response.result === true);
        if (allSucceeded) {
            success = true;
            message = toolCallOutput?.confirmation || `Successfully updated ${input.entityType} ${input.entityId}.`;
             console.log(`Update successful for ${input.entityType} ${input.entityId}.`);
        } else {
             success = false; // Mark as failure if any tool call failed
             const failedTools = toolResponses.filter(r => r.result !== true).map(r => r.toolRequest.toolName);
             message = toolCallOutput?.confirmation ? `${toolCallOutput.confirmation} However, the following update steps failed: ${failedTools.join(', ')}.` : `Update failed for ${input.entityType} ${input.entityId}. Failed tools: ${failedTools.join(', ')}. Check logs.`;
             console.error(`Update failed for ${input.entityType} ${input.entityId}. Failed tools: ${failedTools.join(', ')}. Tool responses:`, toolResponses);
        }
    } else if (toolRequests && toolRequests.length > 0) {
        // Tools were requested but didn't execute or return responses? Error case.
        success = false;
        message = `Update failed: Tools were requested but no responses received for ${input.entityType} ${input.entityId}.`;
        console.error(message, { toolRequests });
    } else {
        // No tool calls were made - maybe the prompt didn't require an update?
        success = true; // Flow ran, no action needed based on prompt
        message = toolCallOutput?.confirmation || `No update action taken for ${input.entityType} ${input.entityId} based on the prompt.`;
        console.log(`No update actions required for ${input.entityType} ${input.entityId}.`);
    }


     return {
        success: success,
        message: message,
        updatedEntityId: input.entityId,
     };
  }
);
