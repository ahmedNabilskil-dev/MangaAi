'use server';

/**
 * @fileOverview Defines the main Genkit orchestration flow for the MangaVerse AI assistant.
 * This flow interprets user prompts, determines the required domain (worldbuilding, plot, character, panel/dialogue),
 * and invokes the appropriate specialized agent flow.
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

// --- Input and Output Schemas for the Orchestration Flow ---

const ProcessUserPromptInputSchema = z.object({
  prompt: z.string().describe("The user's input/request to the AI assistant."),
  projectId: z.string().optional().describe("The ID of the current project context. Crucial for most operations."),
  selectedItemId: z.string().optional().describe("The ID of the currently selected item in the editor (if any)."),
  selectedItemType: z.string().optional().describe("The type of the currently selected item (e.g., 'chapter', 'scene', 'panel', 'character')."),
   // Add currentChapterId context if available and relevant
  currentChapterId: z.string().optional().describe("The ID of the current chapter context, if relevant."),
  currentSceneId: z.string().optional().describe("The ID of the current scene context, if relevant."),
  // Optionally add conversational history context here if needed
});
export type ProcessUserPromptInput = z.infer<typeof ProcessUserPromptInputSchema>;

// Output includes agent response and refresh flag
const ProcessUserPromptOutputSchema = z.object({
  agentUsed: z.enum(['worldbuilder', 'plotWeaver', 'characterArchitect', 'panelDialogue', 'brainstorm', 'summarize', 'orchestrator', 'clarification', 'error']).describe("Which agent or flow handled the request."),
  agentResponse: z.any().optional().describe("The structured output from the agent flow."), // Keep flexible for different agent outputs
  aiResponse: z.string().describe("The final textual response to display to the user."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed after the action."),
});
export type ProcessUserPromptOutput = z.infer<typeof ProcessUserPromptOutputSchema>;


// --- Exposed Function ---

export async function processUserPrompt(input: ProcessUserPromptInput): Promise<ProcessUserPromptOutput> {
  console.log("Orchestrator: Processing user prompt:", input);

  // Basic check: If no project ID is provided for potentially context-dependent prompts, ask for it.
  // More sophisticated check needed based on prompt content.
   if (!input.projectId && (input.prompt.includes('chapter') || input.prompt.includes('scene') || input.prompt.includes('panel') || input.prompt.includes('character') || input.prompt.includes('plot') || input.prompt.includes('event') || input.prompt.includes('dialogue'))) {
       console.warn("Orchestration Flow: Project ID missing for context-dependent prompt.");
        return {
            agentUsed: 'clarification',
            aiResponse: "Please load or create a project first, or specify the project context for your request.",
            requiresRefresh: false,
        };
  }

    // --- Main Orchestration Prompt ---
    // This prompt decides which specialized agent to call.
    const orchestrationPrompt = ai.definePrompt({
        name: 'mangaOrchestratorAgentSelector',
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
                'clarify', // Ask user for more info
                'general', // Handle greetings, simple thanks, etc. directly
            ]).describe("The specialized agent or action to delegate the task to."),
            requiresSelection: z.boolean().optional().describe("Set to true if the request likely requires an item to be selected first (e.g., 'update this', 'summarize this')."),
        }) },
        prompt: `You are the central orchestrator for a Manga Creation AI assistant. Your primary goal is to analyze the user's request and delegate it to the most appropriate specialized agent or flow.

User Request: "{{prompt}}"

Current Context:
- Project ID: {{projectId Mappin "Not Set"}}
- Selected Item ID: {{selectedItemId Mappin "None"}}
- Selected Item Type: {{selectedItemType Mappin "None"}}
- Current Chapter ID: {{currentChapterId Mappin "None"}}
- Current Scene ID: {{currentSceneId Mappin "None"}}


Available Agents/Flows:
- **worldbuilder**: Handles project creation/updates, world details (lore, history, magic systems), locations. Keywords: 'project', 'world', 'setting', 'lore', 'location', 'history', 'magic system', 'create manga'.
- **plotWeaver**: Handles chapters, scenes, overall plot structure, key events. Keywords: 'chapter', 'scene', 'plot', 'story', 'event', 'outline', 'structure', 'climax', 'twist'.
- **characterArchitect**: Handles creating, updating, finding, or brainstorming characters. Keywords: 'character', 'person', 'protagonist', 'villain', 'NPC', 'create character', 'update character', 'find character', 'brainstorm character'.
- **panelDialogue**: Handles specific panel content: creating/updating panels, dialogue, actions, poses, triggering image generation *for a panel*. Keywords: 'panel', 'dialogue', 'caption', 'action', 'pose', 'camera', 'image for panel', 'speech bubble', 'add text'.
- **brainstormCharacter**: Specifically for brainstorming character ideas *if explicitly asked*. Keywords: 'brainstorm characters', 'give me character ideas'.
- **summarizeContent**: Specifically for summarizing existing content *if explicitly asked*. Keywords: 'summarize this', 'summary of scene/chapter'.
- **clarify**: If the request is too ambiguous or requires missing context (like a missing project ID for creating a chapter).
- **general**: For simple greetings, thanks, or questions that don't fit other agents.

Decision Process:
1.  **Analyze Intent:** Determine the primary focus of the user's request based on keywords and context.
2.  **Check Selection Requirement:** If the prompt uses vague terms like "update this", "summarize this", "generate image for this", and no item is selected (\`selectedItemId\` is "None"), set \`requiresSelection\` to true and choose agent 'clarify'.
3.  **Choose Agent:** Based on the intent, select the MOST relevant agent from the list above (\`chosenAgent\`). Be specific. If the user asks to "brainstorm characters", choose \`brainstormCharacter\`, not \`characterArchitect\`. If they ask "summarize the selected scene", choose \`summarizeContent\`.
4.  **Fallback:** If the intent doesn't clearly match a specialized agent, or is a simple conversational turn, choose \`general\` or \`clarify\`.

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
            return { agentUsed: 'error', aiResponse: "Sorry, I couldn't determine how to handle that request." };
        }

        // Handle selection requirement
         if (decision.requiresSelection) {
             console.log("Orchestrator: Request requires item selection.");
             return {
                 agentUsed: 'clarification',
                 aiResponse: "Please select the item (panel, scene, etc.) you want to work with first.",
                 requiresRefresh: false,
             };
         }


        // --- Delegate to Chosen Agent/Flow ---
        switch (decision.chosenAgent) {
            case 'worldbuilder':
                console.log("Orchestrator: Delegating to Worldbuilder Agent.");
                const worldOutput: WorldBuilderOutput = await buildWorld({
                    prompt: input.prompt,
                    projectId: input.projectId,
                });
                return {
                    agentUsed: 'worldbuilder',
                    agentResponse: worldOutput,
                    aiResponse: worldOutput.summary, // Use summary from agent
                    requiresRefresh: worldOutput.requiresRefresh,
                };

            case 'plotWeaver':
                 console.log("Orchestrator: Delegating to Plot Weaver Agent.");
                  if (!input.projectId) { // Double-check required context
                      return { agentUsed: 'clarification', aiResponse: "A project context (ID) is needed to manage the plot." };
                  }
                 const plotOutput: PlotWeaverOutput = await weavePlot({
                     prompt: input.prompt,
                     projectId: input.projectId,
                     currentChapterId: input.currentChapterId ?? input.selectedItemType === 'chapter' ? input.selectedItemId : undefined, // Pass chapter context
                 });
                 return {
                     agentUsed: 'plotWeaver',
                     agentResponse: plotOutput,
                     aiResponse: plotOutput.summary,
                     requiresRefresh: plotOutput.requiresRefresh,
                 };

            case 'characterArchitect':
                console.log("Orchestrator: Delegating to Character Architect Agent.");
                 if (!input.projectId) { // Double-check required context
                    return { agentUsed: 'clarification', aiResponse: "A project context (ID) is needed to manage characters." };
                 }
                const charOutput: CharacterArchitectOutput = await manageCharacter({
                    prompt: input.prompt,
                    projectId: input.projectId,
                });
                return {
                    agentUsed: 'characterArchitect',
                    agentResponse: charOutput,
                    aiResponse: charOutput.summary,
                    requiresRefresh: charOutput.requiresRefresh,
                };

             case 'panelDialogue':
                 console.log("Orchestrator: Delegating to Panel & Dialogue Agent.");
                  if (!input.projectId) { // Double-check required context
                      return { agentUsed: 'clarification', aiResponse: "A project context (ID) is needed for panel/dialogue actions." };
                  }
                  // Determine panel/scene context from selection or passed props
                  let panelIdForAgent: string | undefined = input.panelId ?? (input.selectedItemType === 'panel' ? input.selectedItemId ?? undefined : undefined);
                   let sceneIdForAgent: string | undefined = input.currentSceneId ?? (input.selectedItemType === 'scene' ? input.selectedItemId ?? undefined : undefined);

                   // If panel is selected, try to infer scene if not provided (requires data fetch - skip for now)
                   // if (panelIdForAgent && !sceneIdForAgent) { /* Fetch panel to get sceneId */ }

                   if (!panelIdForAgent && !sceneIdForAgent && (input.prompt.includes('panel') || input.prompt.includes('dialogue'))) {
                        // Might need panel context but none is clearly available
                        // Could try to infer from selected scene if possible, otherwise clarify
                        if (input.selectedItemType === 'scene' && input.selectedItemId) {
                             sceneIdForAgent = input.selectedItemId;
                        } else {
                             console.warn("Panel/Dialogue Agent: Missing panel/scene context.");
                            // Ask for clarification or let the agent handle it
                            // return { agentUsed: 'clarification', aiResponse: "Please select a panel or scene first, or provide context." };
                        }
                   }


                 const panelOutput: PanelDialogueOutput = await detailPanel({
                     prompt: input.prompt,
                     projectId: input.projectId,
                     sceneId: sceneIdForAgent,
                     panelId: panelIdForAgent,
                 });
                 return {
                     agentUsed: 'panelDialogue',
                     agentResponse: panelOutput,
                     aiResponse: panelOutput.summary,
                     requiresRefresh: panelOutput.requiresRefresh,
                 };

            case 'brainstormCharacter':
                console.log("Orchestrator: Calling Brainstorm Character Ideas flow.");
                 if (!input.projectId) { // Double-check required context
                     return { agentUsed: 'clarification', aiResponse: "A project context (ID) is needed to brainstorm characters." };
                 }
                const brainstormOutput: BrainstormCharacterIdeasOutput = await brainstormCharacterIdeas({
                    prompt: input.prompt, // Pass full prompt for context
                    projectId: input.projectId,
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
                return {
                    agentUsed: 'brainstorm',
                    agentResponse: brainstormOutput,
                    aiResponse: brainstormResponse,
                    requiresRefresh: false, // Brainstorming usually doesn't change core data
                };

            case 'summarizeContent':
                console.log("Orchestrator: Calling Summarize Content flow.");
                if (!input.selectedItemId || !input.selectedItemType) {
                    return { agentUsed: 'clarification', aiResponse: "Please select the item you want to summarize." };
                }
                // More complex logic needed here: Fetch the actual content based on ID/Type
                // This might require adding fetch tools or integrating data fetching here.
                // Placeholder call:
                const summaryInput = {
                    contentType: input.selectedItemType as any, // Needs validation/mapping
                    contentId: input.selectedItemId,
                    // text: await fetchContent(input.selectedItemId, input.selectedItemType), // Needs implementation
                    text: `Content for ${input.selectedItemType} ${input.selectedItemId}` // Placeholder
                };
                const summaryOutput: SummarizeContentOutput = await summarizeContent(summaryInput);
                return {
                    agentUsed: 'summarize',
                    agentResponse: summaryOutput,
                    aiResponse: `Here's a summary: ${summaryOutput.summary}`,
                    requiresRefresh: false,
                };

            case 'clarify':
                 console.log("Orchestrator: Request requires clarification.");
                 return {
                     agentUsed: 'clarification',
                     aiResponse: decision.reasoning || "I need a bit more information or context. Could you please clarify your request?",
                     requiresRefresh: false,
                 };

            case 'general':
            default:
                 console.log("Orchestrator: Handling as general conversation.");
                 // Simple hardcoded replies for greetings/thanks
                 const lowerPrompt = input.prompt.toLowerCase();
                 if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
                     return { agentUsed: 'orchestrator', aiResponse: "Hello there! How can I help you create your manga today?" };
                 } else if (lowerPrompt.includes('thank')) {
                     return { agentUsed: 'orchestrator', aiResponse: "You're welcome! Let me know if there's anything else." };
                 }
                 // Fallback for unhandled general queries
                 return {
                     agentUsed: 'orchestrator',
                     aiResponse: "I'm ready to help with worldbuilding, plot, characters, or panel details. What would you like to do?",
                     requiresRefresh: false,
                 };
        }

    } catch (error: any) {
        console.error("Error during orchestration flow:", error);
        return {
            agentUsed: 'error',
            aiResponse: `Sorry, an unexpected error occurred: ${error.message}`,
        };
    }
}