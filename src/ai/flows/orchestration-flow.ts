
'use server';

/**
 * @fileOverview Defines the main Genkit orchestration flow for the MangaVerse AI assistant.
 * This flow interprets user prompts, determines the required domain (worldbuilding, plot, character, panel/dialogue),
 * and invokes the appropriate specialized agent flow or specific utility flow. It considers the current editor context.
 *
 * - processUserPrompt - The primary function that handles user input and orchestrates AI responses/actions.
 * - ProcessUserPromptInput - Input schema for the main flow.
 * - ProcessUserPromptOutput - Output schema for the main flow, indicating action taken and providing a response.
 */

import ai from '@/ai/ai-instance';
import { getDefaultModelId } from '@/ai/ai-config';
import { z } from 'genkit';

// Import the specialized agent flows
import { buildWorld, type WorldBuilderOutput } from '@/ai/flows/worldbuilder-flow';
import { weavePlot, type PlotWeaverOutput } from '@/ai/flows/plot-weaver-flow';
import { manageCharacter, type CharacterArchitectOutput } from '@/ai/flows/character-architect-flow';
import { detailPanel, type PanelDialogueOutput } from '@/ai/flows/panel-dialogue-flow';
// Import brainstorming and summarization flows directly (can be called by agents or orchestrator)
import { brainstormCharacterIdeas, type BrainstormCharacterIdeasOutput } from '@/ai/flows/brainstorm-character-ideas';
import { summarizeContent, type SummarizeContentOutput } from '@/ai/flows/summarize-content';
// Import data fetching tools if needed for context gathering by the orchestrator or agents
import { getSceneTool } from '@/ai/tools/fetch-tools'; // Example: needed for summarize

// --- Input and Output Schemas for the Orchestration Flow ---

const ProcessUserPromptInputSchema = z.object({
  prompt: z.string().describe("The user's input/request to the AI assistant."),
  projectId: z.string().optional().describe("The ID of the current project context. Crucial for most operations."),
  selectedItemId: z.string().optional().describe("The ID of the currently selected item in the editor (if any)."),
  selectedItemType: z.string().optional().describe("The type of the currently selected item (e.g., 'chapter', 'scene', 'panel', 'character')."),
  // Add context for iterative refinement if needed later
  // conversationHistory: z.array(z.object({ role: z.enum(['user', 'ai']), text: z.string() })).optional(),
  // previousAiResponse: z.string().optional(),
});
export type ProcessUserPromptInput = z.infer<typeof ProcessUserPromptInputSchema>;

// Output includes agent response and refresh flag
const ProcessUserPromptOutputSchema = z.object({
  agentUsed: z.enum(['worldbuilder', 'plotWeaver', 'characterArchitect', 'panelDialogue', 'brainstormCharacter', 'summarizeContent', 'orchestrator', 'clarification', 'error']).describe("Which agent or flow handled the request."),
  agentResponse: z.any().optional().describe("The structured output from the agent flow."), // Keep flexible for different agent outputs
  aiResponse: z.string().describe("The final textual response to display to the user."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed after the action."),
  actionTaken: z.string().optional().describe("A code indicating the primary action (e.g., 'delegated_to_agent', 'clarification_needed', 'handled_general', 'error_occurred')."), // For potential UI logic
  toolName: z.string().optional().describe("Name of the tool called by the agent, if applicable."), // Pass back for context
  toolOutput: z.any().optional().describe("Result of the tool call, if applicable."), // Pass back for context
});
export type ProcessUserPromptOutput = z.infer<typeof ProcessUserPromptOutputSchema>;


// --- Exposed Function ---

export async function processUserPrompt(input: ProcessUserPromptInput): Promise<ProcessUserPromptOutput> {
  console.log("Orchestrator: Processing user prompt:", input);

  // Basic check: If no project ID is provided for potentially context-dependent prompts, ask for it.
  // More sophisticated check moved to LLM prompt.
   if (!input.projectId && (input.prompt.toLowerCase().includes('create project') || input.prompt.toLowerCase().includes('new manga'))) {
       // Allow project creation without ID
       console.log("Orchestrator: Allowing project creation request without project ID.");
   } else if (!input.projectId && (input.prompt.includes('chapter') || input.prompt.includes('scene') || input.prompt.includes('panel') || input.prompt.includes('character') || input.prompt.includes('plot') || input.prompt.includes('event') || input.prompt.includes('dialogue') || input.prompt.includes('world') || input.prompt.includes('setting'))) {
       console.warn("Orchestration Flow: Project ID potentially missing for context-dependent prompt.");
        // Let the LLM decide if clarification is needed based on the specific prompt
        // return {
        //     agentUsed: 'clarification',
        //     aiResponse: "Please load or create a project first, or specify the project context for your request.",
        //     requiresRefresh: false,
        //     actionTaken: 'clarification_needed',
        // };
  }

    // --- Main Orchestration Prompt ---
    // This prompt decides which specialized agent to call.
    const orchestrationPrompt = ai.definePrompt({
        name: 'mangaOrchestratorAgentSelector_v2', // Updated version
        model: getDefaultModelId(),
        // NO tools here - this prompt only DECIDES which agent flow to call next.
        input: { schema: ProcessUserPromptInputSchema },
        output: { schema: z.object({
            reasoning: z.string().describe("Brief reasoning for choosing the agent or action."),
            chosenAgent: z.enum([
                'worldbuilder', // For project setup, world details, locations
                'plotWeaver',   // For chapters, scenes, plot structure, key events
                'characterArchitect', // For creating, updating, finding, brainstorming characters
                'panelDialogue', // For panel content (action, dialogue, image gen trigger)
                'brainstormCharacter', // Specific call to brainstorming
                'summarizeContent', // Specific call to summarization
                'clarify', // Ask user for more info (missing context, ambiguity)
                'general', // Handle greetings, simple thanks, etc. directly
            ]).describe("The specialized agent or action to delegate the task to."),
            requiresSelection: z.boolean().optional().describe("Set to true if the request likely requires an item to be selected first (e.g., 'update this', 'summarize this')."),
            clarificationQuestion: z.string().optional().describe("If chosenAgent is 'clarify', provide the specific question to ask the user."),
        }) },
        prompt: `You are the central orchestrator for a Manga Creation AI assistant. Your primary goal is to analyze the user's request and delegate it to the most appropriate specialized agent or flow, considering the current context.

User Request: "{{prompt}}"

Current Context:
- Project ID: {{projectId Mappin "Not Set"}}
- Selected Item ID: {{selectedItemId Mappin "None"}}
- Selected Item Type: {{selectedItemType Mappin "None"}}
{{#if currentChapterId}}- Current Chapter ID: {{currentChapterId}}{{/if}}
{{#if currentSceneId}}- Current Scene ID: {{currentSceneId}}{{/if}}

Available Agents/Flows:
- **worldbuilder**: Handles project creation/updates, world details (lore, history, magic systems), locations. Keywords: 'project', 'world', 'setting', 'lore', 'location', 'history', 'magic system', 'create manga', 'new project'. Handles requests *even if Project ID is "Not Set"* if the prompt implies creating a new project.
- **plotWeaver**: Handles chapters, scenes, overall plot structure, key events. Keywords: 'chapter', 'scene', 'plot', 'story', 'event', 'outline', 'structure', 'climax', 'twist'. Requires Project ID.
- **characterArchitect**: Handles creating, updating, finding, or brainstorming characters. Keywords: 'character', 'person', 'protagonist', 'villain', 'NPC', 'create character', 'update character', 'find character', 'brainstorm character'. Requires Project ID.
- **panelDialogue**: Handles specific panel content: creating/updating panels, dialogue, actions, poses, triggering image generation *for a panel*. Keywords: 'panel', 'dialogue', 'caption', 'action', 'pose', 'camera', 'image for panel', 'speech bubble', 'add text'. Requires Project ID, and often Scene or Panel ID context.
- **brainstormCharacter**: Specifically for brainstorming character ideas *if explicitly asked*. Keywords: 'brainstorm characters', 'give me character ideas'. Requires Project ID.
- **summarizeContent**: Specifically for summarizing existing content *if explicitly asked AND an item is selected*. Keywords: 'summarize this', 'summary of scene/chapter'. Requires Selected Item ID/Type.
- **clarify**: If the request is too ambiguous, lacks required context (like a project ID for creating a chapter, or selection for 'update this'), or requires information not available.
- **general**: For simple greetings, thanks, or questions that don't fit other agents.

Decision Process:
1.  **Analyze Intent:** Determine the primary focus of the user's request based on keywords and context.
2.  **Check Project ID Context:** If the intent requires a Project ID (plot, character, panel, brainstorming, non-creation worldbuilding) and \`projectId\` is "Not Set", choose \`clarify\` and set \`clarificationQuestion\` to "Please load or create a project first, or specify the project for your request."
3.  **Check Selection Requirement:** If the prompt uses vague terms like "update this", "summarize this", "generate image for this", "add dialogue here", "make this funnier" and no item is selected (\`selectedItemId\` is "None"), set \`requiresSelection\` to true and choose agent 'clarify'. Set \`clarificationQuestion\` to "Please select the item (panel, scene, dialogue, etc.) you want to work with first."
4.  **Choose Agent:** Based on the intent and context checks, select the MOST relevant agent from the list above (\`chosenAgent\`). Be specific.
    *   If user explicitly asks to brainstorm characters, choose \`brainstormCharacter\`.
    *   If user explicitly asks to summarize and an item is selected, choose \`summarizeContent\`.
    *   If the request is about refining or changing existing content (e.g., "make dialogue funnier", "change the panel description", "add a plot twist to this scene") AND an item is selected, choose the agent responsible for that item type (e.g., \`panelDialogue\` for dialogue/panel updates, \`plotWeaver\` for scene updates). The agent will handle the iterative refinement.
5.  **Fallback:** If the intent doesn't clearly match a specialized agent, or is a simple conversational turn, choose \`general\` or \`clarify\` (if ambiguity persists). If clarifying, provide a \`clarificationQuestion\`.

Provide your reasoning and the chosen agent/action. Do NOT attempt to fulfill the request here, only delegate.
`,
    });


    // --- Execute Orchestration Prompt & Delegate ---
    try {
        console.log("Orchestrator: Calling LLM to select agent...");
        const { output: decision } = await orchestrationPrompt(input);
        console.log("Orchestrator: LLM Decision:", decision);

        if (!decision || !decision.chosenAgent) {
            console.error("Orchestrator: LLM failed to provide a valid decision.");
            return { agentUsed: 'error', aiResponse: "Sorry, I couldn't determine how to handle that request.", actionTaken: 'error_occurred' };
        }

        // Handle clarification requirement
        if (decision.chosenAgent === 'clarify') {
            console.log("Orchestrator: Request requires clarification.");
            const responseText = decision.clarificationQuestion || decision.reasoning || "I need a bit more information or context. Could you please clarify your request?";
            return {
                agentUsed: 'clarification',
                aiResponse: responseText,
                requiresRefresh: false,
                actionTaken: 'clarification_needed',
            };
        }

         // Handle selection requirement (redundant with clarify check, but good practice)
         if (decision.requiresSelection) {
             console.log("Orchestrator: Request requires item selection.");
             return {
                 agentUsed: 'clarification',
                 aiResponse: "Please select the item (panel, scene, etc.) you want to work with first.",
                 requiresRefresh: false,
                 actionTaken: 'clarification_needed',
             };
         }


        // --- Delegate to Chosen Agent/Flow ---
        let agentResult: any = null; // Store result from the agent/flow call

        switch (decision.chosenAgent) {
            case 'worldbuilder':
                console.log("Orchestrator: Delegating to Worldbuilder Agent.");
                agentResult = await buildWorld({
                    prompt: input.prompt,
                    projectId: input.projectId, // Pass optional ID
                });
                break;

            case 'plotWeaver':
                 console.log("Orchestrator: Delegating to Plot Weaver Agent.");
                  // Context check now primarily handled by LLM prompt
                 agentResult = await weavePlot({
                     prompt: input.prompt,
                     projectId: input.projectId!, // Assert ID exists based on LLM check
                     // Pass context if available and relevant to the task
                     currentChapterId: input.selectedItemType === 'chapter' ? input.selectedItemId : undefined,
                     // currentSceneId: input.selectedItemType === 'scene' ? input.selectedItemId : undefined, // Pass scene if needed
                 });
                 break;

            case 'characterArchitect':
                console.log("Orchestrator: Delegating to Character Architect Agent.");
                agentResult = await manageCharacter({
                    prompt: input.prompt,
                    projectId: input.projectId!, // Assert ID exists
                    // Pass selected character context if relevant for update/find
                    // selectedCharacterId: input.selectedItemType === 'character' ? input.selectedItemId : undefined,
                });
                break;

             case 'panelDialogue':
                 console.log("Orchestrator: Delegating to Panel & Dialogue Agent.");
                  // Determine panel/scene context from selection or passed props
                  let panelIdForAgent: string | undefined = input.selectedItemType === 'panel' ? input.selectedItemId : undefined;
                   let sceneIdForAgent: string | undefined = input.selectedItemType === 'scene' ? input.selectedItemId : undefined;
                   let dialogueIdForAgent: string | undefined = input.selectedItemType === 'dialogue' ? input.selectedItemId : undefined;

                  // More robust context gathering might be needed here or within the agent itself
                  // e.g., if dialogue is selected, find its parent panel ID.
                  // If panel is selected, find its parent scene ID.

                 agentResult = await detailPanel({
                     prompt: input.prompt,
                     projectId: input.projectId!, // Assert ID exists
                     sceneId: sceneIdForAgent,
                     panelId: panelIdForAgent,
                     dialogueId: dialogueIdForAgent, // Pass dialogue ID if selected
                 });
                 break;

            case 'brainstormCharacter':
                console.log("Orchestrator: Calling Brainstorm Character Ideas flow.");
                const brainstormOutput: BrainstormCharacterIdeasOutput = await brainstormCharacterIdeas({
                    prompt: input.prompt, // Pass full prompt for context
                    projectId: input.projectId!, // Assert ID exists
                });
                 // Format a user-friendly response from the brainstorm output
                 const ideaCount = brainstormOutput.characterIdeas?.length ?? 0;
                 let brainstormResponse = `Okay, I brainstormed ${ideaCount} character ideas:`;
                 brainstormOutput.characterIdeas?.forEach(idea => {
                     brainstormResponse += `\n- **${idea.name}**: ${idea.briefDescription}`;
                 });
                 if (ideaCount === 0) {
                     brainstormResponse = "I couldn't come up with any character ideas based on that prompt.";
                 }
                 return { // Return directly as it's a utility flow, not a full agent action
                    agentUsed: 'brainstormCharacter',
                    agentResponse: brainstormOutput,
                    aiResponse: brainstormResponse,
                    requiresRefresh: false, // Brainstorming usually doesn't change core data
                    actionTaken: 'handled_utility',
                };

            case 'summarizeContent':
                console.log("Orchestrator: Calling Summarize Content flow.");
                if (!input.selectedItemId || !input.selectedItemType) {
                    // This should have been caught by the 'clarify' logic, but double-check
                    return { agentUsed: 'clarification', aiResponse: "Please select the item you want to summarize.", actionTaken: 'clarification_needed' };
                }

                // Fetch the actual content based on ID/Type. This requires the orchestrator
                // to have access to data fetching capabilities (or tools).
                let contentToSummarize: string | undefined;
                let contextData: Record<string, any> | undefined;
                try {
                     // Example: Fetching scene data (replace with actual fetch logic based on type)
                     if (input.selectedItemType === 'scene') {
                         const sceneData = await getSceneTool({ sceneId: input.selectedItemId });
                         contentToSummarize = sceneData?.description;
                         contextData = sceneData ?? undefined;
                     } else if (input.selectedItemType === 'chapter') {
                        // const chapterData = await getChapterTool({ chapterId: input.selectedItemId });
                        // contentToSummarize = chapterData?.summary;
                        // contextData = chapterData ?? undefined;
                     } // Add cases for other types (panel, dialogue, character)
                     else {
                         throw new Error(`Summarization not implemented for type: ${input.selectedItemType}`);
                     }
                     if (!contentToSummarize && !contextData) {
                         throw new Error("Could not retrieve content to summarize.");
                     }
                } catch (fetchError: any) {
                     console.error("Error fetching content for summarization:", fetchError);
                     return { agentUsed: 'error', aiResponse: `Could not fetch the content to summarize: ${fetchError.message}`, actionTaken: 'error_occurred'};
                }

                const summaryInput = {
                    contentType: input.selectedItemType as any, // Needs validation/mapping if needed
                    contentId: input.selectedItemId,
                    text: contentToSummarize,
                    contextData: contextData,
                };
                const summaryOutput: SummarizeContentOutput = await summarizeContent(summaryInput);
                 return { // Return directly
                    agentUsed: 'summarizeContent',
                    agentResponse: summaryOutput,
                    aiResponse: `Here's a summary: ${summaryOutput.summary}`,
                    requiresRefresh: false,
                    actionTaken: 'handled_utility',
                };

            case 'general':
            default:
                 console.log("Orchestrator: Handling as general conversation.");
                 // Simple hardcoded replies for greetings/thanks
                 const lowerPrompt = input.prompt.toLowerCase();
                 let generalResponse = "I'm ready to help with worldbuilding, plot, characters, or panel details. What would you like to do?";
                 if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
                     generalResponse = "Hello there! How can I help you create your manga today?";
                 } else if (lowerPrompt.includes('thank')) {
                     generalResponse = "You're welcome! Let me know if there's anything else.";
                 }
                 return {
                     agentUsed: 'orchestrator',
                     aiResponse: generalResponse,
                     requiresRefresh: false,
                     actionTaken: 'handled_general',
                 };
        }

        // --- Process Agent Result ---
        // Check if agentResult has the expected structure (e.g., summary, requiresRefresh)
        if (!agentResult || typeof agentResult.summary !== 'string') {
            console.error("Orchestrator: Agent did not return a valid result structure.", agentResult);
            return {
                agentUsed: decision.chosenAgent, // Report which agent was attempted
                aiResponse: `Sorry, the ${decision.chosenAgent} agent encountered an issue processing your request.`,
                actionTaken: 'error_occurred'
            };
        }

        // Return the result from the delegated agent/flow
        return {
            agentUsed: decision.chosenAgent,
            agentResponse: agentResult,
            aiResponse: agentResult.summary,
            requiresRefresh: agentResult.requiresRefresh ?? false,
            actionTaken: 'delegated_to_agent',
            // Pass back tool info if the agent result included it
            toolName: agentResult.lastToolName,
            toolOutput: agentResult.lastToolResult,
        };


    } catch (error: any) {
        console.error("Error during orchestration flow:", error);
        // Distinguish between Genkit errors and other errors if possible
        const errorMessage = error.message || "An unexpected error occurred.";
        return {
            agentUsed: 'error',
            aiResponse: `Sorry, an unexpected error occurred: ${errorMessage}`,
            actionTaken: 'error_occurred',
        };
    }
}

    