
'use server';

/**
 * @fileOverview Defines the Genkit flow for the Panel & Dialogue AI Agent.
 * This agent focuses on the content of individual panels, including actions,
 * visuals (via prompts for generation tools), and dialogue.
 *
 * - detailPanel - The primary function for this agent.
 * - PanelDialogueInput - Input schema for the agent.
 * - PanelDialogueOutput - Output schema for the agent.
 */

import ai from '@/ai/ai-instance';
import { getDefaultModelId } from '@/ai/ai-config';
import { z } from 'genkit';
import {
    createPanelTool,
    createPanelDialogueTool,
    updatePanelTool,
    updatePanelDialogueTool,
    assignCharacterToPanelTool,
    findCharacterByNameTool,
    deletePanelTool, // Added delete tools
    deleteDialogueTool,
    removeCharacterFromPanelTool,
} from '@/ai/tools/creation-tools';
// Import fetch tools for context
import { getPanelTool, getDialogueTool } from '@/ai/tools/fetch-tools';
// Import image generation tool when available
// import { generateImageTool } from '@/ai/tools/image-tools';

const PanelDialogueInputSchema = z.object({
  prompt: z.string().describe("User's request related to panel content (e.g., 'Create a panel showing a fight', 'Add dialogue: \"Watch out!\"', 'Update panel 3 action', 'Generate image for this panel', 'Make this dialogue funnier', 'Delete this panel')."),
  projectId: z.string().describe("The ID of the project context. Needed for character lookups."),
  sceneId: z.string().optional().describe("The ID of the parent scene context, required for creating new panels."),
  panelId: z.string().optional().describe("The ID of the specific panel to modify or add dialogue to."),
  dialogueId: z.string().optional().describe("The ID of the specific dialogue to modify or delete."), // Added for direct dialogue ops
  // Add other relevant context if needed, e.g., panel description from selection
  // selectedPanelContext: z.string().optional().describe("Existing context/description of the selected panel (if any)."),
  // selectedDialogueContent: z.string().optional().describe("Existing content of the selected dialogue (if any)."),
});
export type PanelDialogueInput = z.infer<typeof PanelDialogueInputSchema>;

const PanelDialogueOutputSchema = z.object({
  summary: z.string().describe("A summary of the panel/dialogue actions taken or information generated."),
  createdPanelId: z.string().optional().describe("The ID of the panel created, if applicable."),
  createdDialogueId: z.string().optional().describe("The ID of the dialogue created, if applicable."),
  updatedPanelId: z.string().optional().describe("The ID of the panel updated, if applicable."),
  updatedDialogueId: z.string().optional().describe("The ID of the dialogue updated, if applicable."),
  deletedPanelId: z.string().optional().describe("The ID of the panel deleted, if applicable."), // Added deleted IDs
  deletedDialogueId: z.string().optional().describe("The ID of the dialogue deleted, if applicable."),
  imageUrl: z.string().optional().describe("URL of the generated image, if applicable."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
  lastToolName: z.string().optional().describe("Name of the last tool called, if any."),
  lastToolResult: z.any().optional().describe("Result of the last tool call, if any."),
});
export type PanelDialogueOutput = z.infer<typeof PanelDialogueOutputSchema>;

// Placeholder for image generation tool
const generateImageTool = ai.defineTool(
    {
        name: 'generateImage',
        description: 'Generates an image based on a text prompt, potentially using panel context.',
        inputSchema: z.object({
            prompt: z.string().describe("Detailed prompt for image generation."),
            panelId: z.string().optional().describe("Optional panel context ID."),
            // Add style hints, aspect ratio etc. if needed
        }),
        outputSchema: z.object({ imageUrl: z.string().url().describe("URL of the generated image.") })
    },
    async (input) => {
        console.log("Placeholder: Generating image for prompt:", input.prompt);
        // In a real implementation, call the actual image generation model/API
        // For Gemini 2.0 Flash:
        /*
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp', // MUST be this model
            prompt: input.prompt,
            config: { responseModalities: ['TEXT', 'IMAGE'] }, // MUST include both
        });
        if (!media?.url) throw new Error("Image generation failed");
        return { imageUrl: media.url };
        */
        return { imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300` }; // Placeholder URL
    }
);

export async function detailPanel(input: PanelDialogueInput): Promise<PanelDialogueOutput> {
  console.log("Panel & Dialogue Agent: Processing request", input);
   if (!input.projectId) {
     throw new Error("Panel & Dialogue Agent requires a valid projectId.");
   }
  return panelDialogueFlow(input);
}

const panelDialoguePrompt = ai.definePrompt({
  name: 'panelDialogueAgentPrompt_v2', // Updated version
  model: getDefaultModelId(),
  tools: [
      createPanelTool,
      createPanelDialogueTool,
      updatePanelTool,
      updatePanelDialogueTool,
      deletePanelTool, // Added delete tools
      deleteDialogueTool,
      assignCharacterToPanelTool,
      removeCharacterFromPanelTool, // Added remove tool
      findCharacterByNameTool, // Needed to assign characters by name
      getPanelTool, // For context fetching
      getDialogueTool, // For context fetching
      generateImageTool, // Add image generation tool
    ],
  input: { schema: PanelDialogueInputSchema },
  output: { schema: PanelDialogueOutputSchema }, // Output should be the summary/result
  prompt: `You are a Panel & Dialogue AI Agent for a manga creation tool. Your task is to create, modify, or delete panel content (visual descriptions, AI image prompts, dialogue) based on the user's prompt within the given project and scene/panel/dialogue context.

Project ID: {{projectId}}
{{#if sceneId}}Scene ID Context: {{sceneId}}{{/if}}
{{#if panelId}}Panel ID Context: {{panelId}}{{/if}}
{{#if dialogueId}}Dialogue ID Context: {{dialogueId}}{{/if}}
User Prompt: "{{prompt}}"

Instructions:
1.  **Analyze Prompt:** Determine if the user wants to create/update/delete a panel or dialogue, assign/remove characters, or generate an image for a panel. Also, detect refinement requests like "make this dialogue funnier".
2.  **Check Context:**
    *   Creating a panel requires \`sceneId\`.
    *   Modifying/deleting a panel requires \`panelId\`.
    *   Adding/modifying/deleting dialogue requires \`panelId\` (for adding) or \`dialogueId\` (for modifying/deleting).
    *   Assigning/removing characters requires \`panelId\`.
    *   Generating images requires \`panelId\`.
    *   Refinement requests (e.g., "make this funnier") require the relevant context ID (\`panelId\` or \`dialogueId\`).
    *   If context is missing, state it clearly in the summary and don't call a tool.
3.  **Fetch Context for Updates (if needed):** If the prompt asks for a modification (e.g., "make dialogue funnier", "change panel action") and you have the ID (\`dialogueId\` or \`panelId\`), use \`getDialogueTool\` or \`getPanelTool\` FIRST to retrieve the current content. Use this context to inform the update.
4.  **Use Tools Appropriately:**
    *   **Create Panel:** Use \`createPanelTool\`. Extract order, visual context (action, poses, camera, etc.), character names, and an \`aiPrompt\` for potential image generation. Provide the \`sceneId\`. If characters are mentioned by name, use \`findCharacterByNameTool\` first to get their IDs, then pass these IDs to \`createPanel\` or use \`assignCharacterToPanelTool\` after creation.
    *   **Update Panel:** Use \`updatePanelTool\`. Provide the \`panelId\` and the specific \`updates\` based on the prompt and fetched context (e.g., \`updates: { panelContext: {...}, aiPrompt: '...' }\`).
    *   **Delete Panel:** Use \`deletePanelTool\` with the \`panelId\`.
    *   **Create Dialogue:** Use \`createPanelDialogueTool\`. Extract order, content, speaker name, style, emotion, etc. Provide the \`panelId\`. The tool attempts speaker ID lookup by name.
    *   **Update Dialogue:** Use \`updatePanelDialogueTool\`. Provide the \`dialogueId\` and the specific \`updates\` based on the prompt and fetched context (e.g., refining content, changing speaker via \`speakerName\`).
    *   **Delete Dialogue:** Use \`deleteDialogueTool\` with the \`dialogueId\`.
    *   **Assign Character:** Use \`assignCharacterToPanelTool\`. Requires \`panelId\` and \`characterId\` (use \`findCharacterByNameTool\` if only name is given).
    *   **Remove Character:** Use \`removeCharacterFromPanelTool\`. Requires \`panelId\` and \`characterId\` (use \`findCharacterByNameTool\` if only name is given).
    *   **Generate Image:** Use the \`generateImageTool\`. Requires \`panelId\`. Extract or create a detailed generation prompt based on the user request and potentially the panel's existing context (fetched via \`getPanelTool\` if needed).
5.  **Generate Summary:** Provide a concise \`summary\` confirming actions taken (e.g., "Created panel 3", "Added dialogue to panel 2", "Updated panel 1 action to be more dramatic.", "Generated image for panel 4.", "Deleted dialogue.", "Removed Kenji from panel 5.") or explaining why no action was taken (e.g., "Panel ID required to add dialogue."). Include the generated image URL in the summary if applicable.
6.  **Set Output Fields:** Populate relevant output fields like \`createdPanelId\`, \`createdDialogueId\`, \`updatedPanelId\`, \`updatedDialogueId\`, \`deletedPanelId\`, \`deletedDialogueId\`, \`imageUrl\`. Set \`requiresRefresh\` to true if creation, update, or deletion occurred. Include \`lastToolName\` and \`lastToolResult\`.

Focus ONLY on the content within a single panel (or creating/deleting one). Do NOT create projects, chapters, scenes, or manage characters beyond assignment/lookup for the panel context.
`,
});

const panelDialogueFlow = ai.defineFlow<
  typeof PanelDialogueInputSchema,
  typeof PanelDialogueOutputSchema
>(
  {
    name: 'panelDialogueFlow',
    inputSchema: PanelDialogueInputSchema,
    outputSchema: PanelDialogueOutputSchema,
  },
  async (input) => {
     const { output, toolRequests, toolResponses } = await panelDialoguePrompt(input);

    // Default response values
    let summary = output?.summary ?? "Panel & Dialogue agent processed the request.";
    let createdPanelId = output?.createdPanelId;
    let createdDialogueId = output?.createdDialogueId;
    let updatedPanelId = output?.updatedPanelId;
    let updatedDialogueId = output?.updatedDialogueId;
    let deletedPanelId = output?.deletedPanelId;
    let deletedDialogueId = output?.deletedDialogueId;
    let imageUrl = output?.imageUrl;
    let requiresRefresh = output?.requiresRefresh ?? false;
    let lastToolName: string | undefined = undefined;
    let lastToolResult: any = undefined;

     // Process tool results (potentially multiple calls, e.g., get->update or find->assign)
     if (toolResponses && toolResponses.length > 0) {
        // Handle potentially multiple tool calls
        let contextData: any = null; // Store fetched context
        let foundCharId: string | undefined = undefined; // Store found character ID

        for (const response of toolResponses) {
            lastToolName = response.toolRequest.toolName;
            lastToolResult = response.result;

             // Store context if fetched
             if (lastToolName === 'getPanel' && lastToolResult) {
                 contextData = lastToolResult;
                 summary = output?.summary || `Retrieved panel details for context.`;
                 requiresRefresh = false;
                 continue; // Move to next tool response if any
             }
             if (lastToolName === 'getDialogue' && lastToolResult) {
                 contextData = lastToolResult;
                 summary = output?.summary || `Retrieved dialogue details for context.`;
                 requiresRefresh = false;
                 continue; // Move to next tool response if any
             }
             if (lastToolName === 'findCharacterByName' && lastToolResult) {
                 foundCharId = (lastToolResult as any)?.id;
                 const foundName = (lastToolResult as any)?.name;
                 summary = output?.summary || (foundCharId ? `Found character '${foundName}' (ID: ${foundCharId}) for assignment/removal.` : `Character not found.`);
                 requiresRefresh = false;
                 continue; // Move to next tool response if any
             }

            // Handle action tools
            if (lastToolName === 'createPanel' && typeof lastToolResult === 'string') {
                createdPanelId = lastToolResult;
                summary = output?.summary || `Successfully created new panel (ID: ${createdPanelId}).`;
                requiresRefresh = true;
            } else if (lastToolName === 'createPanelDialogue' && typeof lastToolResult === 'string') {
                createdDialogueId = lastToolResult;
                summary = output?.summary || `Successfully created new dialogue (ID: ${createdDialogueId}).`;
                requiresRefresh = true;
            } else if (lastToolName === 'updatePanel' && lastToolResult === true) {
                updatedPanelId = (response.toolRequest.input as any)?.panelId ?? input.panelId;
                summary = output?.summary || `Successfully updated panel ${updatedPanelId}.`;
                requiresRefresh = true;
            } else if (lastToolName === 'updatePanelDialogue' && lastToolResult === true) {
                updatedDialogueId = (response.toolRequest.input as any)?.dialogueId ?? input.dialogueId;
                summary = output?.summary || `Successfully updated dialogue ${updatedDialogueId}.`;
                requiresRefresh = true;
            } else if (lastToolName === 'deletePanel' && lastToolResult === true) {
                 deletedPanelId = (response.toolRequest.input as any)?.panelId ?? input.panelId;
                 summary = output?.summary || `Successfully deleted panel ${deletedPanelId}.`;
                 requiresRefresh = true;
            } else if (lastToolName === 'deleteDialogue' && lastToolResult === true) {
                 deletedDialogueId = (response.toolRequest.input as any)?.dialogueId ?? input.dialogueId;
                 summary = output?.summary || `Successfully deleted dialogue ${deletedDialogueId}.`;
                 requiresRefresh = true;
            } else if (lastToolName === 'assignCharacterToPanel' && lastToolResult === true) {
                 summary = output?.summary || `Successfully assigned character to panel.`;
                 requiresRefresh = true;
            } else if (lastToolName === 'removeCharacterFromPanel' && lastToolResult === true) {
                summary = output?.summary || `Successfully removed character from panel.`;
                requiresRefresh = true;
            } else if (lastToolName === 'generateImage' && lastToolResult && (lastToolResult as any).imageUrl) {
                imageUrl = (lastToolResult as any).imageUrl;
                summary = output?.summary || `Successfully generated image for panel. URL: ${imageUrl}`;
                requiresRefresh = true; // Assume refresh needed to show image potentially
            } else if (!lastToolResult && !['getPanel', 'getDialogue', 'findCharacterByName'].includes(lastToolName)) {
                 // Report failure for action tools
                 summary = output?.summary || `Tool ${lastToolName} execution failed or returned no result.`;
                 requiresRefresh = false;
            } else if (output?.summary && !['create', 'update', 'delete', 'assign', 'remove', 'generate'].some(prefix => lastToolName?.startsWith(prefix))) {
                 // If LLM provided a summary without calling an action tool, use it
                 summary = output.summary;
                 requiresRefresh = output.requiresRefresh ?? false;
            }
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Panel/Dialogue Agent: Tool requested but no response received", toolRequests);
         requiresRefresh = false;
    }


    return {
        summary,
        createdPanelId,
        createdDialogueId,
        updatedPanelId,
        updatedDialogueId,
        deletedPanelId,
        deletedDialogueId,
        imageUrl,
        requiresRefresh,
        lastToolName,
        lastToolResult,
    };
  }
);

    