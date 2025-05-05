
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
import { createChapterTool, createSceneTool, updateChapterTool, updateProjectTool, updateSceneTool } from '@/ai/tools/creation-tools'; // Assuming updateProject handles plotStructure, keyEvents
import { getChapterTool, getSceneTool } from '@/ai/tools/fetch-tools'; // For context
// Add brainstormKeyEventsTool import when available

const PlotWeaverInputSchema = z.object({
  prompt: z.string().describe("User's request related to plot or narrative structure (e.g., 'Create chapter 1', 'Add a scene where the hero meets the villain', 'Outline the key events', 'Add a twist to this scene')."),
  projectId: z.string().describe("The ID of the project context. Required for creating/updating chapters/scenes."),
  // Context passed from orchestrator based on selection
  currentChapterId: z.string().optional().describe("The ID of the current chapter context, if relevant."),
  currentSceneId: z.string().optional().describe("The ID of the current scene context, if relevant for updates."),
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
  updatedSceneId: z.string().optional().describe("The ID of the scene updated, if applicable."), // Added field
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
  lastToolName: z.string().optional().describe("Name of the last tool called, if any."),
  lastToolResult: z.any().optional().describe("Result of the last tool call, if any."),
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
  name: 'plotWeaverAgentPrompt_v2', // Updated version
  model: getDefaultModelId(),
  tools: [
      createChapterTool,
      createSceneTool,
      updateChapterTool, // For updating chapter summary/details
      updateSceneTool, // For updating scene details (e.g., adding a twist)
      updateProjectTool, // For updating project-level plot structure, key events
      brainstormKeyEventsTool,
      getChapterTool, // For context
      getSceneTool, // For context
    ],
  input: { schema: PlotWeaverInputSchema },
  output: { schema: PlotWeaverOutputSchema }, // Output should be the summary/result
  prompt: `You are a Plot Weaver AI Agent for a manga creation tool. Your task is to create or modify the narrative structure (chapters, scenes, plot points, key events) based on the user's prompt within the given project context.

Project ID: {{projectId}}
{{#if currentChapterId}}Current Chapter ID Context: {{currentChapterId}}{{/if}}
{{#if currentSceneId}}Current Scene ID Context: {{currentSceneId}}{{/if}}
User Prompt: "{{prompt}}"

Instructions:
1.  **Analyze Prompt:** Determine if the user wants to create a new chapter/scene, update an existing one (chapter/scene), update the overall project plot structure, or brainstorm key events.
2.  **Use Tools Appropriately:**
    *   **Create Chapter:** Use \`createChapterTool\`. Extract title, chapter number, summary, key characters, etc., from the prompt. Provide the \`projectId\`.
    *   **Create Scene:** Use \`createSceneTool\`. Extract title, order, setting, mood, characters present, etc. You MUST have a \`chapterId\` (use \`currentChapterId\` if provided and relevant, otherwise determine from prompt context or ask for clarification via the orchestrator).
    *   **Update Chapter:** If asked to modify a chapter (e.g., change summary), use \`updateChapterTool\`. Provide the \`chapterId\` (use \`currentChapterId\` if relevant) and the specific \`updates\`. Use \`getChapterTool\` first if context is needed.
    *   **Update Scene:** If asked to modify a scene (e.g., add a plot twist, change setting), use \`updateSceneTool\`. Provide the \`sceneId\` (use \`currentSceneId\` if relevant) and the specific \`updates\`. Use \`getSceneTool\` first if context is needed.
    *   **Update Project Plot:** If asked to define or update the overall project plot structure (inciting incident, climax, etc.) or key events, use the \`updateProjectTool\` with the \`projectId\` and the relevant updates in the \`updates\` object (e.g., \`updates: { plotStructure: {...}, keyEvents: [...] }\`).
    *   **Brainstorm Events:** If asked to brainstorm key events, use the \`brainstormKeyEventsTool\` with the \`projectId\`.
3.  **Generate Summary:** Provide a concise \`summary\` confirming the actions taken (e.g., "Created Chapter 2", "Added a new scene to Chapter 1", "Updated the project's plot structure.", "Brainstormed 5 key events.", "Added a plot twist to the selected scene.") or explaining why no action was taken (e.g., "Chapter context needed to create a scene.").
4.  **Set Output Fields:** Populate relevant output fields like \`createdChapterId\`, \`createdSceneId\`, \`updatedProjectId\`, \`updatedChapterId\`, \`updatedSceneId\`. Set \`requiresRefresh\` to true if creation or update occurred. Include \`lastToolName\` and \`lastToolResult\`.

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

    // Default response values
    let summary = output?.summary ?? "Plot Weaver agent processed the request.";
    let createdChapterId = output?.createdChapterId;
    let createdSceneId = output?.createdSceneId;
    let updatedProjectId = output?.updatedProjectId;
    let updatedChapterId = output?.updatedChapterId;
    let updatedSceneId = output?.updatedSceneId;
    let requiresRefresh = output?.requiresRefresh ?? false;
    let lastToolName: string | undefined = undefined;
    let lastToolResult: any = undefined;

     // Process tool results
     if (toolResponses && toolResponses.length > 0) {
        const primaryToolResponse = toolResponses[toolResponses.length - 1]; // Process last tool result
        lastToolName = primaryToolResponse.toolRequest.toolName;
        lastToolResult = primaryToolResponse.result;


        if (lastToolName === 'createChapter' && typeof lastToolResult === 'string') {
            createdChapterId = lastToolResult;
            summary = output?.summary || `Successfully created new chapter (ID: ${createdChapterId}).`;
            requiresRefresh = true;
        } else if (lastToolName === 'createScene' && typeof lastToolResult === 'string') {
            createdSceneId = lastToolResult;
            summary = output?.summary || `Successfully created new scene (ID: ${createdSceneId}).`;
            requiresRefresh = true;
        } else if (lastToolName === 'updateChapter' && lastToolResult === true) {
            updatedChapterId = (primaryToolResponse.toolRequest.input as any)?.chapterId;
            summary = output?.summary || `Successfully updated chapter ${updatedChapterId}.`;
            requiresRefresh = true;
        } else if (lastToolName === 'updateScene' && lastToolResult === true) {
            updatedSceneId = (primaryToolResponse.toolRequest.input as any)?.sceneId;
            summary = output?.summary || `Successfully updated scene ${updatedSceneId}.`;
            requiresRefresh = true;
        } else if (lastToolName === 'updateProject' && lastToolResult === true) {
            updatedProjectId = input.projectId;
            summary = output?.summary || `Successfully updated project plot structure/events for ${updatedProjectId}.`;
            requiresRefresh = true;
        } else if (lastToolName === 'brainstormKeyEvents' && lastToolResult) {
            const events = (lastToolResult as any).keyEvents ?? [];
            summary = output?.summary || `Brainstormed ${events.length} key event ideas.`;
            requiresRefresh = false;
        } else if (lastToolName === 'getChapter' && lastToolResult) {
             summary = output?.summary || `Retrieved chapter details for context.`;
             requiresRefresh = false;
        } else if (lastToolName === 'getScene' && lastToolResult) {
            summary = output?.summary || `Retrieved scene details for context.`;
            requiresRefresh = false;
        } else if (!lastToolResult && !['brainstormKeyEvents', 'getChapter', 'getScene'].includes(lastToolName)) {
             summary = output?.summary || `Tool ${lastToolName} execution failed or returned no result.`;
             requiresRefresh = false;
        } else if (output?.summary) {
             summary = output.summary;
             requiresRefresh = output.requiresRefresh ?? false;
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Plot Weaver: Tool requested but no response received", toolRequests);
         requiresRefresh = false;
    }

    return {
        summary,
        createdChapterId,
        createdSceneId,
        updatedProjectId,
        updatedChapterId,
        updatedSceneId, // Return updatedSceneId
        requiresRefresh,
        lastToolName,
        lastToolResult,
    };
  }
);

    