
'use server';

/**
 * @fileOverview Defines the main Genkit orchestration flow for the MangaVerse AI assistant.
 * This flow interprets user prompts, determines the required action (creation, update, fetch, deletion, or general assistance),
 * and invokes the appropriate tools or the general assistant LLM.
 *
 * - processUserPrompt - The primary function that handles user input and orchestrates AI responses/actions.
 * - ProcessUserPromptInput - Input schema for the main flow.
 * - ProcessUserPromptOutput - Output schema for the main flow, indicating action taken and providing a response.
 */

import ai from '@/ai/ai-instance';
import { getDefaultModelId } from '@/ai/ai-config';
import { z } from 'genkit';
import { askGeneralAssistant } from '@/ai/assistant'; // Fallback assistant

// Import ALL available tools
import { createProjectTool, createChapterTool, createSceneTool, createPanelTool, createPanelDialogueTool, createCharacterTool } from '@/ai/tools/creation-tools';
import { getProjectTool, getChapterTool, getSceneTool, getPanelTool, getDialogueTool, getCharacterTool, findCharacterByNameTool } from '@/ai/tools/fetch-tools';
import { updateProjectTool, updateChapterTool, updateSceneTool, updatePanelTool, updatePanelDialogueTool, updateCharacterTool, assignCharacterToPanelTool, removeCharacterFromPanelTool } from '@/ai/tools/update-tools';
import { deleteProjectTool, deleteChapterTool, deleteSceneTool, deletePanelTool, deleteDialogueTool, deleteCharacterTool } from '@/ai/tools/delete-tools';
// Import brainstorming flow
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas';
// Import summarization flow
import { summarizeContent } from '@/ai/flows/summarize-content';

// --- Input and Output Schemas for the Orchestration Flow ---

const ProcessUserPromptInputSchema = z.object({
  prompt: z.string().describe("The user's input/request to the AI assistant."),
  projectId: z.string().optional().describe("The ID of the current project context. Crucial for most operations."),
  selectedItemId: z.string().optional().describe("The ID of the currently selected item in the editor (if any)."),
  selectedItemType: z.string().optional().describe("The type of the currently selected item (e.g., 'chapter', 'scene', 'panel', 'character')."),
});
export type ProcessUserPromptInput = z.infer<typeof ProcessUserPromptInputSchema>;

const ProcessUserPromptOutputSchema = z.object({
  actionTaken: z.enum(['tool_used', 'brainstormed', 'summarized', 'general_reply', 'error', 'clarification_needed', 'selection_needed']).describe("The type of action performed by the AI."),
  toolName: z.string().optional().describe("The name of the primary tool used, if any."),
  toolInput: z.any().optional().describe("The input provided to the tool."),
  toolOutput: z.any().optional().describe("The result returned by the tool."),
  aiResponse: z.string().describe("The textual response from the AI to the user."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed after the action."),
});
export type ProcessUserPromptOutput = z.infer<typeof ProcessUserPromptOutputSchema>;


// --- Exposed Function ---

export async function processUserPrompt(input: ProcessUserPromptInput): Promise<ProcessUserPromptOutput> {
  console.log("Processing user prompt with orchestration flow:", input);

  // Basic check: If no project ID is provided for potentially context-dependent prompts, ask for it.
  // More sophisticated check needed based on prompt content.
  if (!input.projectId && (input.prompt.includes('chapter') || input.prompt.includes('scene') || input.prompt.includes('panel') || input.prompt.includes('character'))) {
       console.warn("Orchestration Flow: Project ID missing for context-dependent prompt.");
        return {
            actionTaken: 'clarification_needed',
            aiResponse: "Please ensure a project is loaded or provide the project context ID for this request.",
            requiresRefresh: false,
        };
  }

   // If an item is selected and the prompt seems like an update, directly use the update flow/tool
   if (input.selectedItemId && input.selectedItemType && ['change', 'update', 'edit', 'set', 'add', 'remove', 'assign', 'modify'].some(keyword => input.prompt.toLowerCase().startsWith(keyword))) {
        console.log(`Orchestration Flow: Detected update request for selected item ${input.selectedItemId} (${input.selectedItemType}).`);
       try {
             // Directly calling updateEntity tool/flow logic (similar to how Chatbox did)
             // We'll use the `updateEntityFlow` structure here for consistency
             const result = await ai.runFlow(updateEntityFlowInternal, { // Assuming updateEntityFlowInternal is the defined flow
                 entityType: input.selectedItemType as any, // Cast needed? Ensure type compatibility
                 entityId: input.selectedItemId,
                 prompt: input.prompt,
                 projectId: input.projectId,
                 // We might need to fetch currentData here if updateEntityFlowInternal requires it
                 // currentData: await fetchCurrentData(input.selectedItemType, input.selectedItemId),
             });

             return {
                 actionTaken: 'tool_used',
                 toolName: 'updateEntity', // Representing the update action
                 toolInput: { entityType: input.selectedItemType, entityId: input.selectedItemId, prompt: input.prompt },
                 toolOutput: result,
                 aiResponse: result.message || (result.success ? `Successfully updated ${input.selectedItemType}.` : `Failed to update ${input.selectedItemType}.`),
                 requiresRefresh: result.success,
             };
       } catch (error: any) {
           console.error("Error directly calling update logic:", error);
            return {
               actionTaken: 'error',
               aiResponse: `Sorry, I encountered an error trying to update the selected ${input.selectedItemType}: ${error.message}`,
           };
       }
   }


    // --- Main Orchestration Prompt ---
    // This prompt decides which tool (if any) to call or if it should fallback to general assistance.
    const orchestrationPrompt = ai.definePrompt({
        name: 'mangaAssistantOrchestrator',
        model: getDefaultModelId(),
        // Provide ALL available tools
        tools: [
            // Creation
            createProjectTool, createChapterTool, createSceneTool, createPanelTool, createPanelDialogueTool, createCharacterTool,
            // Fetching
            getProjectTool, getChapterTool, getSceneTool, getPanelTool, getDialogueTool, getCharacterTool, findCharacterByNameTool,
            // Updating
            updateProjectTool, updateChapterTool, updateSceneTool, updatePanelTool, updatePanelDialogueTool, updateCharacterTool, assignCharacterToPanelTool, removeCharacterFromPanelTool,
             // Deletion
            deleteProjectTool, deleteChapterTool, deleteSceneTool, deletePanelTool, deleteDialogueTool, deleteCharacterTool,
             // Special Flows (represented as tools for the orchestrator)
             ai.defineTool({ name: 'brainstormCharacterIdeasTool', description: 'Use this tool to brainstorm new character ideas based on a theme or description.', inputSchema: brainstormCharacterIdeasInputSchema, outputSchema: brainstormCharacterIdeasOutputSchema }, async (input) => brainstormCharacterIdeas(input)),
             ai.defineTool({ name: 'summarizeContentTool', description: 'Use this tool to summarize existing content (like a scene description or chapter summary). Requires the content type and text/ID.', inputSchema: summarizeContentInputSchema, outputSchema: summarizeContentOutputSchema }, async (input) => summarizeContent(input)),
        ],
        input: { schema: ProcessUserPromptInputSchema },
        output: { schema: z.object({ // LLM decides intent, doesn't return the final user output directly
            reasoning: z.string().describe("Brief reasoning for the chosen action or tool."),
            chosenAction: z.enum(['call_tool', 'brainstorm', 'summarize', 'general_assist', 'clarify', 'selection_needed']).describe("The type of action the AI decided to take."),
            toolToCall: z.string().optional().describe("The name of the specific tool to call, if chosenAction is 'call_tool'."),
             // Note: The actual tool input is constructed based on the prompt and context *before* calling the tool.
        }) },
        prompt: `You are the central orchestrator for a Manga Creation AI assistant. Your goal is to understand the user's request and decide the best course of action: either call a specific tool, trigger a brainstorming or summarization flow, ask for clarification, request item selection, or handle it as a general query.

User Request: "{{prompt}}"

Current Context:
- Project ID: {{projectId Mappin "Not Set"}}
- Selected Item ID: {{selectedItemId Mappin "None"}}
- Selected Item Type: {{selectedItemType Mappin "None"}}

Available Tool Categories:
- Creation Tools: createProject, createChapter, createScene, createPanel, createPanelDialogue, createCharacter
- Fetching Tools: getProject, getChapter, getScene, getPanel, getDialogue, getCharacter, findCharacterByName
- Updating Tools: updateProject, updateChapter, updateScene, updatePanel, updatePanelDialogue, updateCharacter, assignCharacterToPanel, removeCharacterFromPanel
- Deletion Tools: deleteProject, deleteChapter, deleteScene, deletePanel, deleteDialogue, deleteCharacter (Use delete tools cautiously!)
- Special Flows: brainstormCharacterIdeasTool, summarizeContentTool

Decision Process:
1.  **Analyze Intent:** Determine the user's primary goal (create, update, fetch, delete, brainstorm, summarize, general question?).
2.  **Check Selection:** If the intent is to update, delete, summarize, or perform a context-specific action (e.g., "add dialogue to this panel"), is an item selected? If not, set \`chosenAction\` to 'selection_needed'.
3.  **Check Context:** Does the action require the projectId? If so, is it available? If not, set \`chosenAction\` to 'clarify'.
4.  **Identify Tool/Flow:** If the intent matches a specific tool or special flow (create, update, fetch, delete, brainstorm, summarize) and context/selection are met, set \`chosenAction\` to 'call_tool', 'brainstorm', or 'summarize' and specify the \`toolToCall\` name (e.g., "createChapterTool", "brainstormCharacterIdeasTool"). Ensure the tool matches the intent precisely. For example, if the user asks "tell me about chapter 3", use "getChapterTool". If they ask "change chapter 3's title", use "updateChapterTool".
5.  **Deletion Safety:** If the intent is deletion, especially \`deleteProject\`, double-check if the prompt clearly confirms the irreversible action. If unsure, set \`chosenAction\` to 'clarify'.
6.  **Fallback:** If the intent doesn't clearly match a tool/flow, or it's a general question/greeting, set \`chosenAction\` to 'general_assist'.

Provide your reasoning and the chosen action. Do NOT attempt to generate the final user response here; just decide the next step.
`,
    });


    // --- Execute Orchestration Prompt ---
    try {
        console.log("Orchestration Flow: Calling LLM to determine action...");
        const { output: decisionOutput, toolRequests, toolResponses } = await orchestrationPrompt(input);
        console.log("Orchestration Flow: LLM Decision:", decisionOutput);

        if (!decisionOutput) {
            throw new Error("Orchestration LLM failed to provide a decision.");
        }

        // --- Handle LLM Decision ---
        switch (decisionOutput.chosenAction) {
             case 'selection_needed':
                return {
                    actionTaken: 'selection_needed',
                    aiResponse: "Please select the item (chapter, scene, panel, etc.) you want to modify first.",
                    requiresRefresh: false,
                };
            case 'clarify':
                 return {
                    actionTaken: 'clarification_needed',
                    aiResponse: decisionOutput.reasoning || "I need a bit more information to proceed. Could you please clarify your request or ensure the project context is set?",
                    requiresRefresh: false,
                };

            case 'brainstorm': // Directly call the brainstorm flow
                 try {
                    const brainstormInput = { // Extract necessary input for brainstorming
                        projectId: input.projectId,
                        prompt: input.prompt, // Pass the original prompt for context
                        // Extract other potential fields like genre if possible from prompt/context
                    };
                    const result = await brainstormCharacterIdeas(brainstormInput as any); // Use the imported function
                     return {
                        actionTaken: 'brainstormed',
                        toolName: 'brainstormCharacterIdeas',
                        toolInput: brainstormInput,
                        toolOutput: result,
                        aiResponse: `Okay, I've brainstormed some character ideas based on your request! (${result.characterIdeas.length} ideas generated)`, // Modify response as needed
                        requiresRefresh: false, // Brainstorming doesn't usually change core data
                    };
                 } catch (error: any) {
                     console.error("Error calling brainstormCharacterIdeas flow:", error);
                     return { actionTaken: 'error', aiResponse: `Sorry, I failed to brainstorm: ${error.message}` };
                 }

             case 'summarize': // Directly call the summarize flow
                 try {
                    // Needs more sophisticated input extraction based on prompt/selection
                    if (!input.selectedItemId || !input.selectedItemType) {
                       return { actionTaken: 'selection_needed', aiResponse: "Please select the item you want to summarize." };
                    }
                     const summarizeInput = {
                        contentType: input.selectedItemType as any, // Cast needed
                        contentId: input.selectedItemId,
                        // text/contextData needs to be fetched or extracted
                        // text: "Fetch or extract text for " + input.selectedItemId, // Placeholder
                    };
                     const result = await summarizeContent(summarizeInput as any); // Use the imported function
                     return {
                        actionTaken: 'summarized',
                        toolName: 'summarizeContent',
                        toolInput: summarizeInput,
                        toolOutput: result,
                        aiResponse: `Here's a summary: ${result.summary}`,
                        requiresRefresh: false,
                    };
                 } catch (error: any) {
                     console.error("Error calling summarizeContent flow:", error);
                     return { actionTaken: 'error', aiResponse: `Sorry, I failed to summarize: ${error.message}` };
                 }


            case 'call_tool':
                if (!decisionOutput.toolToCall) {
                    throw new Error("Orchestration decided to call a tool but didn't specify which one.");
                }
                 // If the LLM *itself* made the tool request via the prompt definition
                 if (toolRequests && toolRequests.length > 0 && toolResponses && toolResponses.length > 0) {
                     console.log(`Orchestration Flow: LLM initiated tool call: ${toolRequests[0].toolName}`);
                     const response = toolResponses[0];
                     const success = response.result !== null && response.result !== false; // Define success based on tool output
                     // Construct a user-friendly confirmation message
                     const confirmationMessage = `Action complete: ${decisionOutput.toolToCall} executed ${success ? 'successfully' : 'with issues'}.`; // Simple confirmation
                     return {
                         actionTaken: 'tool_used',
                         toolName: response.toolRequest.toolName,
                         toolInput: response.toolRequest.input,
                         toolOutput: response.result,
                         aiResponse: confirmationMessage, // Provide confirmation, not raw output
                         requiresRefresh: success && !response.toolRequest.toolName.startsWith('get') && response.toolRequest.toolName !== 'findCharacterByName', // Refresh if successful and not a fetch tool
                     };
                 } else {
                      // Fallback: If the LLM only *decided* to call a tool, but didn't execute it.
                      // This shouldn't happen with properly defined tools and prompts.
                      // We might need to manually invoke the tool here based on `decisionOutput.toolToCall`
                      // and extracting parameters from `input.prompt`. This is complex and error-prone.
                      console.warn(`Orchestration Flow: LLM decided to call ${decisionOutput.toolToCall}, but no tool request was generated. Falling back to general assistant.`);
                      const fallbackResponse = await askGeneralAssistant(input.prompt, input.projectId ?? undefined);
                      return { actionTaken: 'general_reply', aiResponse: fallbackResponse };
                 }

            case 'general_assist':
            default:
                console.log("Orchestration Flow: Falling back to general assistant.");
                const generalResponse = await askGeneralAssistant(input.prompt, input.projectId ?? undefined);
                return {
                    actionTaken: 'general_reply',
                    aiResponse: generalResponse,
                    requiresRefresh: false,
                };
        }

    } catch (error: any) {
        console.error("Error during orchestration flow:", error);
        return {
            actionTaken: 'error',
            aiResponse: `Sorry, an unexpected error occurred while processing your request: ${error.message}`,
        };
    }
}


// --- Define Internal Flow for Update Entity (used by orchestrator) ---
// This mirrors the structure previously in update-entity-flow.ts but is kept internal
// or registered separately if needed directly.

// Schema for the flow's *internal* input, including fetched current data
const AugmentedUpdateEntityInputSchema = z.object({
    entityType: z.string().describe("The type of entity to update."), // Keep as string for flexibility
    entityId: z.string().describe("The ID of the specific entity instance to update."),
    prompt: z.string().describe("The user's instruction for how to update the entity."),
    projectId: z.string().optional().describe("The ID of the project context, needed for character lookups."),
    currentData: z.any().optional().describe("The current data of the entity being updated (for context).") // Optional current data
});
type AugmentedUpdateEntityInput = z.infer<typeof AugmentedUpdateEntityInputSchema>;

const updateEntityPrompt = ai.definePrompt({
    name: 'updateEntityInternalPrompt', // Distinct name
    model: getDefaultModelId(),
    tools: [ // Include relevant update/assignment tools
        updateProjectTool, updateChapterTool, updateSceneTool, updatePanelTool, updatePanelDialogueTool, updateCharacterTool,
        findCharacterByNameTool, // Needed for assigning/updating by name
        assignCharacterToPanelTool, removeCharacterFromPanelTool
    ],
    input: { schema: AugmentedUpdateEntityInputSchema },
    output: {
        schema: z.object({
            confirmation: z.string().describe("Confirmation message indicating if the update was attempted based on the prompt and which tools were used.")
        }),
    },
    prompt: `You are an AI assistant helping update elements of a manga project stored via tools. The user wants to modify a specific {{entityType}} with ID: {{entityId}}. {{#if projectId}}Project context ID is {{projectId}}.{{else}}Project context ID is unknown.{{/if}}

User Prompt: "{{prompt}}"

Current Data (optional context):
\`\`\`json
{{{json currentData}}}
\`\`\`

Based *only* on the user's prompt and current data:
1. Determine the specific changes requested.
2. Identify the correct tool(s) (\`update...\`, \`assign...\`, \`remove...\`, \`findCharacterByName\`).
3. If assigning/removing characters BY NAME, you MUST have the \`projectId\`. Use \`findCharacterByName\` first. If not found or no projectId, state this limitation.
4. Construct the input for the tool(s), providing only the necessary IDs and the data to be changed. For \`updatePanel\`, do not include \`characterIds\` directly; use assign/remove tools. For dialogue speaker changes by name, find the ID first.
5. Call the identified tool(s).
6. Respond ONLY with a confirmation message summarizing the actions taken or why they couldn't be taken (e.g., character not found, projectId missing).
`,
});


const updateEntityFlowInternal = ai.defineFlow<
  AugmentedUpdateEntityInput, // Use the direct type here
  UpdateEntityOutput // Reusing output schema from original file
>( {
    name: 'updateEntityFlowInternal', // Distinct name
    inputSchema: AugmentedUpdateEntityInputSchema,
    outputSchema: UpdateEntityOutputSchema, // Reusing schema from original update-entity-flow
  },
  async (input: AugmentedUpdateEntityInput): Promise<UpdateEntityOutput> => {
    console.log("Executing updateEntityFlowInternal with input:", input);
    const { output: toolCallOutput, toolRequests, toolResponses } = await updateEntityPrompt(input);

    let success = false;
    let message = toolCallOutput?.confirmation || "Update attempt finished.";

    if (toolResponses && toolResponses.length > 0) {
        const allSucceeded = toolResponses.every(response => response.result === true);
        success = allSucceeded;
        const failedTools = toolResponses.filter(r => r.result !== true).map(r => r.toolRequest.toolName);
        message = toolCallOutput?.confirmation ? `${toolCallOutput.confirmation}${failedTools.length > 0 ? ` Failed steps: ${failedTools.join(', ')}.` : ''}` : `Update ${success ? 'succeeded' : 'failed'}. ${failedTools.length > 0 ? `Failed tools: ${failedTools.join(', ')}.` : ''}`;
    } else if (toolRequests && toolRequests.length > 0) {
        message = `Update failed: Tools requested but no responses received for ${input.entityType} ${input.entityId}.`;
        console.error(message, { toolRequests });
    } else {
        success = true; // No backend action needed based on prompt
        message = toolCallOutput?.confirmation || `No backend update action taken for ${input.entityType} ${input.entityId} based on the prompt.`;
    }

     return { success, message, updatedEntityId: input.entityId };
  }
);

// --- Type alias for the output of the update flow (needed internally) ---
 type UpdateEntityOutput = z.infer<typeof UpdateEntityOutputSchema>;


// --- Schemas used by updateEntityFlowInternal (copied from update-entity-flow.ts) ---
 const UpdateEntityOutputSchema = z.object({
   success: z.boolean().describe("Whether the update was successfully processed."),
   message: z.string().describe("A message confirming the update or indicating issues."),
   updatedEntityId: z.string().describe("The ID of the entity that was updated."),
 });
 // Schemas required by the brainstorming and summarize tools
 const brainstormCharacterIdeasInputSchema = z.object({
   projectId: z.string().uuid().optional().describe('The UUID of the project context (optional).'),
   chapterTitle: z.string().optional().describe('The title of a specific chapter context (optional).'),
   projectTitle: z.string().optional().describe('The title of the project (if projectId not provided).'),
   genre: z.string().optional().describe('The genre of the manga.'),
   prompt: z.string().optional().describe('Any specific prompt or requirements for the characters.'),
   numberOfIdeas: z.number().int().positive().optional().default(5).describe('How many character ideas to generate.'),
 });
 const CharacterIdeaSchema = z.object({
     name: z.string().describe('A potential name for the character.'),
     role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional().describe('Potential role in the story.'),
     briefDescription: z.string().describe('A short description or concept for the character.'),
 }).describe('A single brainstormed character idea.');
 const brainstormCharacterIdeasOutputSchema = z.object({
   characterIdeas: z.array(CharacterIdeaSchema)
     .describe('A list of brainstormed character ideas.'),
 });
 const summarizeContentInputSchema = z.object({
   contentType: z.enum(['scene', 'panel', 'chapter', 'project', 'character', 'dialogue']).describe('The type of content being summarized.'),
   text: z.string().optional().describe('The primary text content to summarize (e.g., scene description, panel action, chapter summary).'),
   contextData: z.record(z.any()).optional().describe('Additional structured context data (e.g., full entity properties).'),
   contentId: z.string().uuid().optional().describe("The ID of the content being summarized (for context)."),
 });
 const summarizeContentOutputSchema = z.object({
   summary: z.string().describe('A short, concise summary of the provided content, suitable for display in a list or node label.'),
 });
