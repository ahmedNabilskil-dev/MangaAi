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
} from '@/ai/tools/creation-tools';
// Import image generation tool when available
// import { generateImageTool } from '@/ai/tools/image-tools';

const PanelDialogueInputSchema = z.object({
  prompt: z.string().describe("User's request related to panel content (e.g., 'Create a panel showing a fight', 'Add dialogue: \"Watch out!\"', 'Update panel 3 action', 'Generate image for this panel')."),
  projectId: z.string().describe("The ID of the project context. Needed for character lookups."),
  sceneId: z.string().optional().describe("The ID of the parent scene context, required for creating new panels."),
  panelId: z.string().optional().describe("The ID of the specific panel to modify or add dialogue to."),
  // Add other relevant context if needed, e.g., panel description
});
export type PanelDialogueInput = z.infer<typeof PanelDialogueInputSchema>;

const PanelDialogueOutputSchema = z.object({
  summary: z.string().describe("A summary of the panel/dialogue actions taken or information generated."),
  createdPanelId: z.string().optional().describe("The ID of the panel created, if applicable."),
  createdDialogueId: z.string().optional().describe("The ID of the dialogue created, if applicable."),
  updatedPanelId: z.string().optional().describe("The ID of the panel updated, if applicable."),
  updatedDialogueId: z.string().optional().describe("The ID of the dialogue updated, if applicable."),
  imageUrl: z.string().optional().describe("URL of the generated image, if applicable."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
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
  name: 'panelDialogueAgentPrompt',
  model: getDefaultModelId(),
  tools: [
      createPanelTool,
      createPanelDialogueTool,
      updatePanelTool,
      updatePanelDialogueTool,
      assignCharacterToPanelTool,
      findCharacterByNameTool, // Needed to assign characters by name
      generateImageTool, // Add image generation tool
    ],
  input: { schema: PanelDialogueInputSchema },
  output: { schema: PanelDialogueOutputSchema }, // Output should be the summary/result
  prompt: `You are a Panel & Dialogue AI Agent for a manga creation tool. Your task is to create or modify panel content (visual descriptions, AI image prompts, dialogue) based on the user's prompt within the given project and scene/panel context.

Project ID: {{projectId}}
{{#if sceneId}}Scene ID Context: {{sceneId}}{{/if}}
{{#if panelId}}Panel ID Context: {{panelId}}{{/if}}
User Prompt: "{{prompt}}"

Instructions:
1.  **Analyze Prompt:** Determine if the user wants to create/update a panel, create/update dialogue, assign characters, or generate an image for a panel.
2.  **Check Context:** Creating a panel requires \`sceneId\`. Modifying a panel/dialogue or adding dialogue requires \`panelId\`. Assigning characters or generating images typically requires \`panelId\`. If context is missing, state it in the summary.
3.  **Use Tools Appropriately:**
    *   **Create Panel:** Use \`createPanelTool\`. Extract order, visual context (action, poses, camera, etc.), character names, and an \`aiPrompt\` for potential image generation. Provide the \`sceneId\`. If characters are mentioned by name, use \`findCharacterByNameTool\` first to get their IDs, then pass these IDs to \`createPanel\` (or use \`assignCharacterToPanel\` after creation).
    *   **Update Panel:** Use \`updatePanelTool\`. Provide the \`panelId\` and the specific \`updates\` (e.g., \`updates: { panelContext: {...}, aiPrompt: '...' }\`). Use \`assignCharacterToPanelTool\` or \`removeCharacterFromPanelTool\` (not part of updatePanelTool) if character assignments need changing (requires character ID, use \`findCharacterByNameTool\` if needed).
    *   **Create Dialogue:** Use \`createPanelDialogueTool\`. Extract order, content, speaker name, style, emotion, etc. Provide the \`panelId\`. The tool attempts speaker ID lookup by name.
    *   **Update Dialogue:** Use \`updatePanelDialogueTool\`. Provide the \`dialogueId\` (needs context or lookup, not directly provided here - assume user selects dialogue or AI infers) and the specific \`updates\`. Can also update speaker via \`speakerName\`.
    *   **Generate Image:** If asked to generate an image for a panel (requires \`panelId\`), use the \`generateImageTool\`. Extract or create a detailed generation prompt based on the user request and potentially the panel's existing context.
4.  **Generate Summary:** Provide a concise \`summary\` confirming actions taken (e.g., "Created panel 3", "Added dialogue to panel 2", "Updated panel 1 action.", "Generated image for panel 4.") or explaining why no action was taken (e.g., "Panel ID required to add dialogue."). Include the generated image URL in the summary if applicable.
5.  **Set Output Fields:** Populate relevant output fields like \`createdPanelId\`, \`createdDialogueId\`, \`updatedPanelId\`, \`updatedDialogueId\`, \`imageUrl\`. Set \`requiresRefresh\` to true if creation or update occurred.

Focus ONLY on the content within a single panel (or creating one). Do NOT create projects, chapters, scenes, or manage characters beyond assignment/lookup for the panel context.
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

    // Default response
    let summary = output?.summary ?? "Panel & Dialogue agent processed the request.";
    let createdPanelId = output?.createdPanelId;
    let createdDialogueId = output?.createdDialogueId;
    let updatedPanelId = output?.updatedPanelId;
    let updatedDialogueId = output?.updatedDialogueId;
    let imageUrl = output?.imageUrl;
    let requiresRefresh = output?.requiresRefresh ?? false;

     // Process tool results
     if (toolResponses && toolResponses.length > 0) {
         // Handle multiple potential tool calls
        for (const response of toolResponses) {
            const toolName = response.toolRequest.toolName;
            const toolResult = response.result;

            if (toolName === 'createPanel' && typeof toolResult === 'string') {
                createdPanelId = toolResult;
                summary = output?.summary || `Successfully created new panel (ID: ${createdPanelId}).`;
                requiresRefresh = true;
            } else if (toolName === 'createPanelDialogue' && typeof toolResult === 'string') {
                createdDialogueId = toolResult;
                summary = output?.summary || `Successfully created new dialogue (ID: ${createdDialogueId}).`;
                requiresRefresh = true;
            } else if (toolName === 'updatePanel' && toolResult === true) {
                updatedPanelId = (response.toolRequest.input as any)?.panelId;
                summary = output?.summary || `Successfully updated panel ${updatedPanelId}.`;
                requiresRefresh = true;
            } else if (toolName === 'updatePanelDialogue' && toolResult === true) {
                updatedDialogueId = (response.toolRequest.input as any)?.dialogueId; // Assuming dialogueId is in input
                summary = output?.summary || `Successfully updated dialogue ${updatedDialogueId}.`;
                requiresRefresh = true;
            } else if (toolName === 'assignCharacterToPanel' && toolResult === true) {
                 summary = output?.summary || `Successfully assigned character to panel.`;
                 requiresRefresh = true; // Character assignment changes data
            } else if (toolName === 'findCharacterByName' && toolResult) {
                // Finding a character doesn't usually require a specific summary update here,
                // it's usually followed by another action like assign/update.
                // We could log it for debugging.
                console.log("Panel/Dialogue Agent: Found character", (toolResult as any)?.id);
            } else if (toolName === 'generateImage' && toolResult && (toolResult as any).imageUrl) {
                imageUrl = (toolResult as any).imageUrl;
                summary = output?.summary || `Successfully generated image for panel. URL: ${imageUrl}`;
                // Decide if image generation requires immediate data refresh
                // Maybe update the panel's imageUrl field via updatePanelTool?
                requiresRefresh = true; // Assume refresh needed to show image potentially
            } else if (!toolResult && !['findCharacterByName'].includes(toolName) ) { // Ignore failed finds?
                 summary = output?.summary || `Tool ${toolName} execution failed or returned no result.`;
            }
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Panel/Dialogue Agent: Tool requested but no response received", toolRequests);
    }


    return {
        summary,
        createdPanelId,
        createdDialogueId,
        updatedPanelId,
        updatedDialogueId,
        imageUrl,
        requiresRefresh
    };
  }
);