'use server';
/**
 * @fileOverview Defines a Genkit flow for updating various manga entities (Project, Chapter, Scene, Panel, Dialogue, Character) based on user prompts.
 *
 * This flow uses specific tools to interact with the backend service (Strapi) for updates.
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
    // Get functions might be needed if the prompt requires existing data
    getProject,
    getChapter,
    getScene,
    getPanel,
    getPanelDialogue,
    getCharacter,
    getAllCharacters // For finding character IDs by name
} from '@/services/strapi';
import type { NodeType } from '@/types/nodes';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';

// --- Schemas for Tools (Subset of Full Entities, Focusing on Updatable Fields) ---
// Define schemas for *data the AI can provide* for updates. Exclude read-only fields like ID, createdAt etc.

const UpdateProjectSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['draft', 'planning', 'writing', 'revising', 'published', 'archived']).optional(), // Assuming MangaStatus enum values
    genre: z.string().optional(),
    artStyle: z.string().optional(),
    // Add other fields the AI might reasonably update based on a prompt
}).describe("Fields that can be updated for a Manga Project.");

const UpdateChapterSchema = z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    purpose: z.string().optional(),
    tone: z.string().optional(),
    keyCharacters: z.array(z.string()).optional().describe("Updated list of key character names."),
    // Add other updatable fields
}).describe("Fields that can be updated for a Chapter.");

const UpdateSceneSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    sceneContext: z.object({
        setting: z.string().optional(),
        mood: z.string().optional(),
        presentCharacters: z.array(z.string()).optional(),
        timeOfDay: z.string().optional(),
        weather: z.string().optional(),
    }).partial().optional().describe("Updates to the scene's context."),
    dialogueOutline: z.string().optional().describe("Updated dialogue outline."),
}).describe("Fields that can be updated for a Scene.");

const UpdatePanelSchema = z.object({
    aiPrompt: z.string().optional().describe("Updated prompt for AI image generation."),
    panelContext: z.object({
        action: z.string().optional(),
        pose: z.string().optional(),
        characterPoses: z.array(z.object({
            characterName: z.string(),
            pose: z.string(),
            expression: z.string().optional(),
        })).optional(),
        emotion: z.string().optional(),
        cameraAngle: z.enum(['close-up', 'medium', 'wide', "bird's eye", 'low angle']).optional(),
        shotType: z.enum(['action', 'reaction', 'establishing', 'detail']).optional(),
        backgroundDescription: z.string().optional(),
        lighting: z.string().optional(),
        effects: z.array(z.string()).optional(),
        dramaticPurpose: z.string().optional(),
        narrativePosition: z.string().optional(),
    }).partial().optional().describe("Updates to the panel's visual/narrative context."),
}).describe("Fields that can be updated for a Panel.");

const UpdatePanelDialogueSchema = z.object({
    content: z.string().optional().describe("Updated dialogue text."),
    style: z.object({
         bubbleType: z.enum(['normal', 'thought', 'scream', 'whisper']).optional(),
    }).partial().optional().describe("Updates to dialogue style."),
    emotion: z.string().optional().describe("Updated emotion."),
    subtextNote: z.string().optional().describe("Updated subtext."),
    // Speaker changes might require separate logic or tools
}).describe("Fields that can be updated for Panel Dialogue.");

const UpdateCharacterSchema = z.object({
    name: z.string().optional(),
    age: z.number().int().optional(),
    gender: z.string().optional(),
    briefDescription: z.string().optional(),
    personality: z.string().optional(),
    abilities: z.string().optional(),
    backstory: z.string().optional(),
    // Add other key updatable fields
}).describe("Fields that can be updated for a Character.");


// --- Input and Output Schemas for the Flow ---

const UpdateEntityInputSchema = z.object({
  entityType: z.enum(['project', 'chapter', 'scene', 'panel', 'dialogue', 'character']).describe("The type of entity to update."),
  entityId: z.string().uuid().describe("The UUID of the specific entity instance to update."),
  prompt: z.string().describe("The user's instruction for how to update the entity (e.g., 'Change the scene setting to a dark forest', 'Add character X to the panel', 'Rewrite the dialogue to be more menacing')."),
});
export type UpdateEntityInput = z.infer<typeof UpdateEntityInputSchema>;

// Output indicates success and potentially the updated entity ID (though it's the same as input)
const UpdateEntityOutputSchema = z.object({
  success: z.boolean().describe("Whether the update was successfully processed."),
  message: z.string().describe("A message confirming the update or indicating issues."),
  updatedEntityId: z.string().uuid().describe("The ID of the entity that was updated."),
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
    // This makes the flow more robust as the LLM knows the starting state.
    let currentData: any = null;
    try {
        switch (input.entityType) {
            case 'project': currentData = await getProject(input.entityId); break;
            case 'chapter': currentData = await getChapter(input.entityId); break;
            case 'scene': currentData = await getScene(input.entityId); break;
            case 'panel': currentData = await getPanel(input.entityId); break;
            case 'dialogue': currentData = await getPanelDialogue(input.entityId); break;
            case 'character': currentData = await getCharacter(input.entityId); break;
        }
    } catch (error) {
        console.warn(`Could not fetch current data for ${input.entityType} ${input.entityId}:`, error);
        // Proceed without currentData, but the LLM might be less effective
    }

    // Augment input with current data for the flow
    const flowInput: AugmentedUpdateEntityInput = { ...input, currentData };

    return updateEntityFlow(flowInput);
}


// --- Genkit Tools for Updates ---

const updateProjectTool = ai.defineTool({
    name: 'updateProject',
    description: 'Updates specific fields of a Manga Project entity.',
    inputSchema: z.object({
        id: z.string().uuid().describe("The UUID of the project to update."),
        data: UpdateProjectSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
    try {
        await updateProject(id, data);
        return true;
    } catch (e) { console.error(e); return false; }
});

const updateChapterTool = ai.defineTool({
    name: 'updateChapter',
    description: 'Updates specific fields of a Chapter entity.',
    inputSchema: z.object({
        id: z.string().uuid().describe("The UUID of the chapter to update."),
        data: UpdateChapterSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updateChapter(id, data);
        return true;
    } catch (e) { console.error(e); return false; }
});

const updateSceneTool = ai.defineTool({
    name: 'updateScene',
    description: 'Updates specific fields of a Scene entity.',
    inputSchema: z.object({
        id: z.string().uuid().describe("The UUID of the scene to update."),
        data: UpdateSceneSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updateScene(id, data);
        return true;
    } catch (e) { console.error(e); return false; }
});

const updatePanelTool = ai.defineTool({
    name: 'updatePanel',
    description: 'Updates specific fields of a Panel entity.',
    inputSchema: z.object({
        id: z.string().uuid().describe("The UUID of the panel to update."),
        data: UpdatePanelSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updatePanel(id, data);
        return true;
    } catch (e) { console.error(e); return false; }
});

const updatePanelDialogueTool = ai.defineTool({
    name: 'updatePanelDialogue',
    description: 'Updates specific fields of a Panel Dialogue entity.',
    inputSchema: z.object({
        id: z.string().uuid().describe("The UUID of the dialogue to update."),
        data: UpdatePanelDialogueSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updatePanelDialogue(id, data);
        return true;
    } catch (e) { console.error(e); return false; }
});

const updateCharacterTool = ai.defineTool({
    name: 'updateCharacter',
    description: 'Updates specific fields of a Character entity.',
    inputSchema: z.object({
        id: z.string().uuid().describe("The UUID of the character to update."),
        data: UpdateCharacterSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded."),
}, async ({ id, data }) => {
     try {
        await updateCharacter(id, data);
        return true;
    } catch (e) { console.error(e); return false; }
});

// Tool to find character ID by name (needed for assignment tools)
const findCharacterByNameTool = ai.defineTool({
    name: "findCharacterByName",
    description: "Finds the UUID of an existing character given their name within the current project context.",
    inputSchema: z.object({
        characterName: z.string().describe("The exact name of the character to find."),
        projectId: z.string().uuid().optional().describe("The ID of the current project (needed for filtering)."),
    }),
    outputSchema: z.string().uuid().nullable().describe("The UUID of the found character, or null if not found."),
}, async ({ characterName, projectId }) => {
    if (!projectId) {
         console.warn("findCharacterByNameTool requires projectId for context.");
         // Maybe try searching globally? Risky due to name collisions.
         return null;
    }
    try {
        const characters = await getAllCharacters(projectId);
        const found = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase());
        return found?.id ?? null;
    } catch (error) {
        console.error(`Error finding character "${characterName}" in project ${projectId}:`, error);
        return null;
    }
});


// Re-use assignment tools from create-chapter flow if applicable, or redefine here
const assignCharacterToPanelTool = ai.defineTool({
    name: 'assignCharacterToPanel',
    description: 'Assigns an *existing* character to a specific panel. Use findCharacterByName first if you only have the name.',
    inputSchema: z.object({
        panelId: z.string().uuid().describe("The UUID of the panel."),
        characterId: z.string().uuid().describe("The UUID of the *existing* character to assign."),
    }),
    outputSchema: z.boolean().describe("True if assignment was successful."),
}, async (input) => {
    try {
        await assignCharacterToPanel(input.panelId, input.characterId);
        return true;
    } catch (error) {
        console.error(`Failed to assign character ${input.characterId} to panel ${input.panelId}:`, error);
        return false;
    }
});

const removeCharacterFromPanelTool = ai.defineTool({
    name: 'removeCharacterFromPanel',
    description: 'Removes a character from a specific panel.',
     inputSchema: z.object({
        panelId: z.string().uuid().describe("The UUID of the panel."),
        characterId: z.string().uuid().describe("The UUID of the character to remove."),
    }),
    outputSchema: z.boolean().describe("True if removal was successful."),
}, async (input) => {
    try {
        await removeCharacterFromPanel(input.panelId, input.characterId);
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
      findCharacterByNameTool, // Allow finding char IDs
      assignCharacterToPanelTool, // Allow adding chars to panels
      removeCharacterFromPanelTool // Allow removing chars from panels
    ],
  input: {
    // Use the augmented schema including currentData for the prompt's input context
    schema: AugmentedUpdateEntityInputSchema,
  },
  output: {
    // LLM provides confirmation, flow provides structured success/failure
    schema: z.object({
        confirmation: z.string().describe("Confirmation message indicating if the update was attempted based on the prompt and which tools were used.")
    }),
  },
  prompt: `You are an AI assistant helping update elements of a manga project. The user wants to modify a specific {{entityType}} with ID: {{entityId}}.

User Prompt:
"{{prompt}}"

Current Data (for context, may be null if fetch failed):
\`\`\`json
{{{json currentData}}}
\`\`\`

Based *only* on the user's prompt and the current data:
1.  Determine the specific changes requested.
2.  Identify the correct tool(s) to apply these changes (e.g., \`updateScene\`, \`assignCharacterToPanel\`).
3.  If assigning/removing a character by name, FIRST use \`findCharacterByName\` to get their UUID. If not found, inform the user in the confirmation.
4.  Construct the necessary input data for the tool(s), containing ONLY the fields to be changed with their NEW values.
5.  Call the appropriate tool(s) with the entity ID (\`{{entityId}}\`) and the update data.
6.  If the prompt asks to add or remove a character from a panel, use \`assignCharacterToPanel\` or \`removeCharacterFromPanel\` AFTER finding the character's ID.

**CRITICAL RULES:**
*   **Targeted Updates:** Only update the fields explicitly requested or strongly implied by the user's prompt. Do not change unrelated fields.
*   **Correct Tool:** Use the tool corresponding to the \`entityType\` (e.g., use \`updateSceneTool\` for a scene). For relationship changes like adding/removing characters from panels, use the dedicated assignment/removal tools.
*   **Use IDs:** Provide the correct \`entityId\` (\`{{entityId}}\`) to the tools. Use character IDs found via \`findCharacterByName\` when required by other tools.
*   **Confirmation:** After attempting the updates, respond ONLY with a confirmation message summarizing the actions taken (or why they couldn't be taken, e.g., character not found). Do not include full data structures in the response.
`,
});


// --- Flow Definition ---

const updateEntityFlow = ai.defineFlow<
  typeof AugmentedUpdateEntityInputSchema, // Pass the schema object itself
  typeof UpdateEntityOutputSchema // Pass the schema object itself
>( {
    name: 'updateEntityFlow',
    inputSchema: AugmentedUpdateEntityInputSchema, // Use augmented input schema
    outputSchema: UpdateEntityOutputSchema,
  },
  async (input: AugmentedUpdateEntityInput): Promise<UpdateEntityOutput> => { // Explicitly type input
    // Invoke the prompt with the input (including currentData)
    const { output: toolCallOutput, toolRequests, toolResponses } = await prompt(input);

    let success = false;
    let message = toolCallOutput?.confirmation || "Update attempt finished."; // Default message

    // Check if any tool call was made and if it was successful
    if (toolResponses && toolResponses.length > 0) {
        // Check if *all* tool calls returned true (or were successful)
        const allSucceeded = toolResponses.every(response => response.result === true);
        if (allSucceeded) {
            success = true;
            message = toolCallOutput?.confirmation || `Successfully updated ${input.entityType} ${input.entityId}.`;
        } else {
             success = false; // Mark as failure if any tool call failed
             message = toolCallOutput?.confirmation ? `${toolCallOutput.confirmation} However, one or more update steps failed.` : `Update failed for ${input.entityType} ${input.entityId}. Check logs.`;
             console.error(`Update failed for ${input.entityType} ${input.entityId}. Tool responses:`, toolResponses);
        }
    } else if (toolRequests && toolRequests.length > 0) {
        // Tools were requested but didn't execute or return responses? Error case.
        success = false;
        message = `Update failed: Tools were requested but no responses received for ${input.entityType} ${input.entityId}.`;
        console.error(message, { toolRequests });
    } else {
        // No tool calls were made - maybe the prompt didn't require an update?
        // Consider this a "success" in that the flow ran, but no action was taken.
        success = true; // Or false depending on whether an update was expected
        message = toolCallOutput?.confirmation || `No update action taken for ${input.entityType} ${input.entityId} based on the prompt.`;
    }


     return {
        success: success,
        message: message,
        updatedEntityId: input.entityId,
     };
  }
);
