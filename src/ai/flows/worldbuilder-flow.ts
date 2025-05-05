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

const WorldBuilderInputSchema = z.object({
  prompt: z.string().describe("User's request related to worldbuilding (e.g., 'Create a cyberpunk city', 'Describe the magic system')."),
  projectId: z.string().optional().describe("The ID of the existing project to modify, if applicable."),
  // Add other relevant context fields if needed, e.g., existing project summary
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
});
export type WorldBuilderOutput = z.infer<typeof WorldBuilderOutputSchema>;

export async function buildWorld(input: WorldBuilderInput): Promise<WorldBuilderOutput> {
  console.log("Worldbuilder Agent: Processing request", input);
  return worldBuilderFlow(input);
}

const worldBuilderPrompt = ai.definePrompt({
  name: 'worldBuilderAgentPrompt',
  model: getDefaultModelId(),
  tools: [createProjectTool, updateProjectTool, brainstormLocationTool], // Add brainstormLocationTool later
  input: { schema: WorldBuilderInputSchema },
  output: { schema: WorldBuilderOutputSchema }, // Output should be the summary/result
  prompt: `You are a Worldbuilding AI Agent for a manga creation tool. Your task is to generate or modify world details based on the user's prompt.

User Prompt: "{{prompt}}"
{{#if projectId}}Existing Project ID: {{projectId}}{{/if}}

Instructions:
1.  **Analyze Prompt:** Understand if the user wants to create a *new* project world or *update* an existing one (if projectId is provided).
2.  **Use Tools:**
    *   If creating a new world, use the \`createProject\` tool. Extract title, description, genre, art style, world details (summary, history, society, unique systems), concept, themes, motifs, symbols, tags etc. from the prompt. Populate the tool input accordingly.
    *   If updating an existing world (projectId is present), use the \`updateProject\` tool. Identify the specific fields to update (e.g., worldDetails.history, description, genre) based on the prompt and provide *only* those fields in the \`updates\` object for the tool.
    *   If asked to brainstorm locations, use the \`brainstormLocation\` tool (requires projectId).
3.  **Generate Summary:** After using tools (or if no tool is applicable), provide a concise \`summary\` confirming the actions taken (e.g., "Created new project 'Cyberpunk City'", "Updated the history section of the world details.", "Brainstormed 3 location ideas.") or explaining why no action was taken.
4.  **Set Output Fields:** Populate \`createdProjectId\` or \`updatedProjectId\` based on the tool used. Set \`requiresRefresh\` to true if a creation or update occurred.

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

    // Default response if LLM doesn't provide structured output
    let summary = output?.summary ?? "Worldbuilding agent processed the request.";
    let createdProjectId = output?.createdProjectId;
    let updatedProjectId = output?.updatedProjectId;
    let requiresRefresh = output?.requiresRefresh ?? false;

    // Process tool results if any
    if (toolResponses && toolResponses.length > 0) {
        const primaryToolResponse = toolResponses[0]; // Assume one main action for now
        const toolName = primaryToolResponse.toolRequest.toolName;
        const toolResult = primaryToolResponse.result;

        if (toolName === 'createProject' && typeof toolResult === 'string') {
            createdProjectId = toolResult;
            summary = output?.summary || `Successfully created new project (ID: ${createdProjectId}).`; // Add ID for context if missing summary
            requiresRefresh = true;
        } else if (toolName === 'updateProject' && toolResult === true) {
            updatedProjectId = input.projectId; // The ID that was updated
            summary = output?.summary || `Successfully updated project ${updatedProjectId}.`;
            requiresRefresh = true;
        } else if (toolName === 'brainstormLocation' && toolResult) {
             // Assuming toolResult has a 'locations' array
             const locations = (toolResult as any).locations ?? [];
             summary = output?.summary || `Brainstormed ${locations.length} location ideas.`;
             requiresRefresh = false; // Brainstorming might not require immediate refresh
        } else if (!toolResult && toolName !== 'brainstormLocation') {
            summary = output?.summary || `Tool ${toolName} execution failed or returned no result.`;
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Worldbuilder: Tool requested but no response received", toolRequests);
    }


    return {
        summary,
        createdProjectId,
        updatedProjectId,
        requiresRefresh
    };
  }
);