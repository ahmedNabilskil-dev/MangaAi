'use server';

/**
 * @fileOverview Defines the Genkit flow for the Plot Weaver AI Agent.
 * This agent focuses on creating and structuring the narrative, including
 * chapters, scenes, key events, and plot points.
 *
 * - weavePlot - The primary function for this agent.
 * - PlotWeaverInput - Input schema for the agent.
 * - PlotWeaverOutput - Output schema for the agent.
 */

import ai from '@/ai/ai-instance';
import { getDefaultModelId } from '@/ai/ai-config';
import { z } from 'genkit';
import { createChapterTool, createSceneTool, updateChapterTool, updateProjectTool } from '@/ai/tools/creation-tools'; // Assuming updateProject handles plotStructure, keyEvents
// Add brainstormKeyEventsTool import when available

const PlotWeaverInputSchema = z.object({
  prompt: z.string().describe("User's request related to plot or narrative structure (e.g., 'Create chapter 1', 'Add a scene where the hero meets the villain', 'Outline the key events')."),
  projectId: z.string().describe("The ID of the project context. Required for creating/updating chapters/scenes."),
  // Add other relevant context fields if needed, e.g., current chapter ID, project summary
  currentChapterId: z.string().optional().describe("The ID of the current chapter context, if relevant."),
});
export type PlotWeaverInput = z.infer<typeof PlotWeaverInputSchema>;

// Define a placeholder schema for the brainstormKeyEvents tool if needed
const BrainstormKeyEventsInputSchema = z.object({
  projectId: z.string().describe("The project context for brainstorming events."),
  plotSummary: z.string().optional().describe("Existing plot summary for context."),
  count: z.number().int().positive().optional().default(5),
});
const KeyEventIdeaSchema = z.object({ name: z.string(), briefDescription: z.string(), sequence: z.number().optional() });
const BrainstormKeyEventsOutputSchema = z.object({ keyEvents: z.array(KeyEventIdeaSchema) });

// Placeholder for brainstormKeyEventsTool - replace with actual import when created
const brainstormKeyEventsTool = ai.defineTool(
    {
        name: 'brainstormKeyEvents',
        description: 'Brainstorms key plot events for the manga project.',
        inputSchema: BrainstormKeyEventsInputSchema,
        outputSchema: BrainstormKeyEventsOutputSchema,
    },
    async (input) => {
        console.log("Placeholder: Brainstorming key events for project", input.projectId);
        // In a real implementation, this would call another Genkit flow or LLM
        return { keyEvents: [{ name: "Placeholder Event", briefDescription: "A significant plot point." }] };
    }
);

const PlotWeaverOutputSchema = z.object({
  summary: z.string().describe("A summary of the plotting actions taken or information generated."),
  createdChapterId: z.string().optional().describe("The ID of the chapter created, if applicable."),
  createdSceneId: z.string().optional().describe("The ID of the scene created, if applicable."),
  updatedProjectId: z.string().optional().describe("The ID of the project updated (for plot structure/key events), if applicable."),
  updatedChapterId: z.string().optional().describe("The ID of the chapter updated (e.g., summary), if applicable."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
});
export type PlotWeaverOutput = z.infer<typeof PlotWeaverOutputSchema>;

export async function weavePlot(input: PlotWeaverInput): Promise<PlotWeaverOutput> {
  console.log("Plot Weaver Agent: Processing request", input);
  if (!input.projectId) {
    throw new Error("Plot Weaver Agent requires a valid projectId.");
  }
  return plotWeaverFlow(input);
}

const plotWeaverPrompt = ai.definePrompt({
  name: 'plotWeaverAgentPrompt',
  model: getDefaultModelId(),
  tools: [
      createChapterTool,
      createSceneTool,
      updateChapterTool, // For updating chapter summary/details
      updateProjectTool, // For updating project-level plot structure, key events
      brainstormKeyEventsTool,
    ],
  input: { schema: PlotWeaverInputSchema },
  output: { schema: PlotWeaverOutputSchema }, // Output should be the summary/result
  prompt: `You are a Plot Weaver AI Agent for a manga creation tool. Your task is to create or modify the narrative structure (chapters, scenes, plot points) based on the user's prompt within the given project context.

Project ID: {{projectId}}
{{#if currentChapterId}}Current Chapter ID Context: {{currentChapterId}}{{/if}}
User Prompt: "{{prompt}}"

Instructions:
1.  **Analyze Prompt:** Determine if the user wants to create a new chapter/scene, update an existing one, update the overall project plot structure, or brainstorm key events.
2.  **Use Tools Appropriately:**
    *   **Create Chapter:** If asked to create a chapter, use \`createChapterTool\`. Extract title, chapter number, summary, key characters, etc., from the prompt. Provide the \`projectId\`.
    *   **Create Scene:** If asked to create a scene, use \`createSceneTool\`. Extract title, order, setting, mood, characters present, etc. You MUST have a \`chapterId\` (either from context \`currentChapterId\` or determined from the prompt/previous steps).
    *   **Update Chapter:** If asked to modify a chapter (e.g., change summary), use \`updateChapterTool\`. Provide the \`chapterId\` and the specific \`updates\`.
    *   **Update Project Plot:** If asked to define or update the overall plot structure (inciting incident, climax, etc.) or key events, use the \`updateProjectTool\` with the \`projectId\` and the relevant updates in the \`updates\` object (e.g., \`updates: { plotStructure: {...}, keyEvents: [...] }\`).
    *   **Brainstorm Events:** If asked to brainstorm key events, use the \`brainstormKeyEventsTool\` with the \`projectId\`.
3.  **Generate Summary:** Provide a concise \`summary\` confirming the actions taken (e.g., "Created Chapter 2", "Added a new scene to Chapter 1", "Updated the project's plot structure.", "Brainstormed 5 key events.") or explaining why no action was taken.
4.  **Set Output Fields:** Populate relevant output fields like \`createdChapterId\`, \`createdSceneId\`, \`updatedProjectId\`, \`updatedChapterId\`. Set \`requiresRefresh\` to true if creation or update occurred.

Focus ONLY on narrative structure (chapters, scenes, plot events). Do NOT create panels, dialogue, characters, or world details.
`,
});

const plotWeaverFlow = ai.defineFlow<
  typeof PlotWeaverInputSchema,
  typeof PlotWeaverOutputSchema
>(
  {
    name: 'plotWeaverFlow',
    inputSchema: PlotWeaverInputSchema,
    outputSchema: PlotWeaverOutputSchema,
  },
  async (input) => {
     const { output, toolRequests, toolResponses } = await plotWeaverPrompt(input);

    // Default response
    let summary = output?.summary ?? "Plot Weaver agent processed the request.";
    let createdChapterId = output?.createdChapterId;
    let createdSceneId = output?.createdSceneId;
    let updatedProjectId = output?.updatedProjectId;
    let updatedChapterId = output?.updatedChapterId;
    let requiresRefresh = output?.requiresRefresh ?? false;

     // Process tool results
     if (toolResponses && toolResponses.length > 0) {
        const primaryToolResponse = toolResponses[0];
        const toolName = primaryToolResponse.toolRequest.toolName;
        const toolResult = primaryToolResponse.result;

        if (toolName === 'createChapter' && typeof toolResult === 'string') {
            createdChapterId = toolResult;
            summary = output?.summary || `Successfully created new chapter (ID: ${createdChapterId}).`;
            requiresRefresh = true;
        } else if (toolName === 'createScene' && typeof toolResult === 'string') {
            createdSceneId = toolResult;
            summary = output?.summary || `Successfully created new scene (ID: ${createdSceneId}).`;
            requiresRefresh = true;
        } else if (toolName === 'updateChapter' && toolResult === true) {
            updatedChapterId = (primaryToolResponse.toolRequest.input as any)?.chapterId;
            summary = output?.summary || `Successfully updated chapter ${updatedChapterId}.`;
            requiresRefresh = true;
        } else if (toolName === 'updateProject' && toolResult === true) {
            updatedProjectId = input.projectId;
            summary = output?.summary || `Successfully updated project plot structure/events for ${updatedProjectId}.`;
            requiresRefresh = true; // Project update likely requires refresh
        } else if (toolName === 'brainstormKeyEvents' && toolResult) {
            const events = (toolResult as any).keyEvents ?? [];
            summary = output?.summary || `Brainstormed ${events.length} key event ideas.`;
            requiresRefresh = false;
        } else if (!toolResult && toolName !== 'brainstormKeyEvents') {
             summary = output?.summary || `Tool ${toolName} execution failed or returned no result.`;
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Plot Weaver: Tool requested but no response received", toolRequests);
    }

    return {
        summary,
        createdChapterId,
        createdSceneId,
        updatedProjectId,
        updatedChapterId,
        requiresRefresh
    };
  }
);