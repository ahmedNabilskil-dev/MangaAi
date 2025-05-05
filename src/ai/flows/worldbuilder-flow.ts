
'use server';

/**
 * @fileOverview Defines the Genkit flow for the Worldbuilder AI Agent.
 * This agent focuses on creating and enriching the overall manga project world,
 * including settings, lore, and potentially locations.
 *
 * - buildWorld - The primary function for this agent.
 * - WorldBuilderInput - Input schema for the agent.
 * - WorldBuilderOutput - Output schema for the agent.
 */

import ai from '@/ai/ai-instance';
import { getDefaultModelId } from '@/ai/ai-config';
import { z } from 'genkit';
import { createProjectTool, updateProjectTool } from '@/ai/tools/creation-tools'; // Assuming updateProject handles worldDetails
// Add brainstormLocationTool import when available
import { getProjectTool } from '@/ai/tools/fetch-tools'; // Needed to get context for updates

const WorldBuilderInputSchema = z.object({
  prompt: z.string().describe("User's request related to worldbuilding (e.g., 'Create a cyberpunk city', 'Describe the magic system', 'Update the project description')."),
  projectId: z.string().optional().describe("The ID of the existing project to modify, if applicable."),
  // Add other relevant context fields if needed, e.g., existing project summary passed from orchestrator
});
export type WorldBuilderInput = z.infer<typeof WorldBuilderInputSchema>;

// Define a placeholder schema for the brainstormLocation tool if needed
const BrainstormLocationInputSchema = z.object({
  projectId: z.string().describe("The project context for brainstorming locations."),
  theme: z.string().optional().describe("Optional theme or constraints for locations."),
  count: z.number().int().positive().optional().default(3),
});
const LocationIdeaSchema = z.object({ name: z.string(), briefDescription: z.string() });
const BrainstormLocationOutputSchema = z.object({ locations: z.array(LocationIdeaSchema) });

// Placeholder for brainstormLocationTool - replace with actual import when created
const brainstormLocationTool = ai.defineTool(
    {
        name: 'brainstormLocation',
        description: 'Brainstorms interesting location ideas based on the project theme.',
        inputSchema: BrainstormLocationInputSchema,
        outputSchema: BrainstormLocationOutputSchema,
    },
    async (input) => {
        console.log("Placeholder: Brainstorming locations for project", input.projectId);
        // In a real implementation, this would call another Genkit flow or LLM
        return { locations: [{ name: "Placeholder Location", briefDescription: "A generic placeholder location." }] };
    }
);


const WorldBuilderOutputSchema = z.object({
  summary: z.string().describe("A summary of the worldbuilding actions taken or information generated."),
  createdProjectId: z.string().optional().describe("The ID of the project created, if applicable."),
  updatedProjectId: z.string().optional().describe("The ID of the project updated, if applicable."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
  lastToolName: z.string().optional().describe("Name of the last tool called, if any."),
  lastToolResult: z.any().optional().describe("Result of the last tool call, if any."),
});
export type WorldBuilderOutput = z.infer<typeof WorldBuilderOutputSchema>;

export async function buildWorld(input: WorldBuilderInput): Promise<WorldBuilderOutput> {
  console.log("Worldbuilder Agent: Processing request", input);
  // Context validation moved to orchestrator prompt
  return worldBuilderFlow(input);
}

const worldBuilderPrompt = ai.definePrompt({
  name: 'worldBuilderAgentPrompt_v2', // Updated version
  model: getDefaultModelId(),
  tools: [createProjectTool, updateProjectTool, brainstormLocationTool, getProjectTool], // Add getProjectTool for context
  input: { schema: WorldBuilderInputSchema },
  output: { schema: WorldBuilderOutputSchema }, // Output should be the summary/result
  prompt: `You are a Worldbuilding AI Agent for a manga creation tool. Your task is to generate or modify world details based on the user's prompt.

User Prompt: "{{prompt}}"
{{#if projectId}}Existing Project ID: {{projectId}}{{/if}}

Instructions:
1.  **Analyze Prompt:** Understand if the user wants to create a *new* project world or *update* an existing one (if projectId is provided).
2.  **Use Tools:**
    *   **Create Project:** If creating a new world, use the \`createProject\` tool. Extract title, description, genre, art style, world details (summary, history, society, unique systems), concept, themes, motifs, symbols, tags etc. from the prompt. Populate the tool input accordingly.
    *   **Update Project:** If updating an existing world (projectId is present), use the \`updateProject\` tool. Identify the specific fields to update (e.g., worldDetails.history, description, genre) based on the prompt and provide *only* those fields in the \`updates\` object for the tool. You might use \`getProjectTool\` first if you need existing details to inform the update, but prefer to update directly if the prompt is clear.
    *   **Brainstorm Location:** If asked to brainstorm locations, use the \`brainstormLocation\` tool (requires projectId).
3.  **Generate Summary:** After using tools (or if no tool is applicable), provide a concise \`summary\` confirming the actions taken (e.g., "Created new project 'Cyberpunk City'", "Updated the history section of the world details.", "Brainstormed 3 location ideas.") or explaining why no action was taken (e.g., "Could not determine specific fields to update from the prompt.").
4.  **Set Output Fields:** Populate \`createdProjectId\` or \`updatedProjectId\` based on the tool used. Set \`requiresRefresh\` to true if a creation or update occurred. Include \`lastToolName\` and \`lastToolResult\` if a tool was called.

Focus ONLY on world-level details (project description, world lore, locations, overall genre/style). Do NOT create chapters, scenes, characters, or panels.
`,
});

const worldBuilderFlow = ai.defineFlow<
  typeof WorldBuilderInputSchema,
  typeof WorldBuilderOutputSchema
>(
  {
    name: 'worldBuilderFlow',
    inputSchema: WorldBuilderInputSchema,
    outputSchema: WorldBuilderOutputSchema,
  },
  async (input) => {
    const { output, toolRequests, toolResponses } = await worldBuilderPrompt(input);

    // Default response values
    let summary = output?.summary ?? "Worldbuilding agent processed the request.";
    let createdProjectId = output?.createdProjectId;
    let updatedProjectId = output?.updatedProjectId;
    let requiresRefresh = output?.requiresRefresh ?? false;
    let lastToolName: string | undefined = undefined;
    let lastToolResult: any = undefined;


    // Process tool results if any
    if (toolResponses && toolResponses.length > 0) {
        const primaryToolResponse = toolResponses[toolResponses.length - 1]; // Process last tool call result mainly
        lastToolName = primaryToolResponse.toolRequest.toolName;
        lastToolResult = primaryToolResponse.result;

        if (lastToolName === 'createProject' && typeof lastToolResult === 'string') {
            createdProjectId = lastToolResult;
            summary = output?.summary || `Successfully created new project (ID: ${createdProjectId}).`;
            requiresRefresh = true;
        } else if (lastToolName === 'updateProject' && lastToolResult === true) {
            updatedProjectId = input.projectId; // The ID that was updated
            summary = output?.summary || `Successfully updated project ${updatedProjectId}.`;
            requiresRefresh = true;
        } else if (lastToolName === 'brainstormLocation' && lastToolResult) {
             const locations = (lastToolResult as any).locations ?? [];
             summary = output?.summary || `Brainstormed ${locations.length} location ideas.`;
             requiresRefresh = false;
        } else if (lastToolName === 'getProject' && lastToolResult) {
            // Getting project details usually doesn't change the final summary unless the LLM explicitly uses it.
             summary = output?.summary || `Retrieved project details for context.`; // Default summary if LLM doesn't provide one after fetch
             requiresRefresh = false;
        } else if (!lastToolResult && !['brainstormLocation', 'getProject'].includes(lastToolName)) {
            summary = output?.summary || `Tool ${lastToolName} execution failed or returned no result.`;
            requiresRefresh = false;
        } else if (output?.summary) {
            // If LLM provided a summary even after a non-action tool call or failure, use it.
            summary = output.summary;
            requiresRefresh = output.requiresRefresh ?? false; // Respect LLM's refresh flag
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Worldbuilder: Tool requested but no response received", toolRequests);
         requiresRefresh = false;
    }


    return {
        summary,
        createdProjectId,
        updatedProjectId,
        requiresRefresh,
        lastToolName,
        lastToolResult,
    };
  }
);

    