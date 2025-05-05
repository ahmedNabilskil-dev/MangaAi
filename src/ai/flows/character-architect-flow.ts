'use server';

/**
 * @fileOverview Defines the Genkit flow for the Character Architect AI Agent.
 * This agent is responsible for creating, developing, and managing characters.
 *
 * - manageCharacter - The primary function for this agent.
 * - CharacterArchitectInput - Input schema for the agent.
 * - CharacterArchitectOutput - Output schema for the agent.
 */

import ai from '@/ai/ai-instance';
import { getDefaultModelId } from '@/ai/ai-config';
import { z } from 'genkit';
import { createCharacterTool, updateCharacterTool, findCharacterByNameTool } from '@/ai/tools/creation-tools';
// Import fetch tools if needed for context gathering
import { getCharacterTool } from '@/ai/tools/fetch-tools';
// Import brainstorming flow/tool
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas'; // Use the flow directly or wrap as tool


const CharacterArchitectInputSchema = z.object({
  prompt: z.string().describe("User's request related to characters (e.g., 'Create a stoic swordsman', 'Update Alice's backstory', 'Find Bob', 'Brainstorm villains')."),
  projectId: z.string().describe("The ID of the project context. Required for creating/updating/finding characters."),
  // Add other relevant context fields if needed, e.g., existing character details for update
});
export type CharacterArchitectInput = z.infer<typeof CharacterArchitectInputSchema>;

const CharacterArchitectOutputSchema = z.object({
  summary: z.string().describe("A summary of the character-related actions taken or information generated."),
  createdCharacterId: z.string().optional().describe("The ID of the character created, if applicable."),
  updatedCharacterId: z.string().optional().describe("The ID of the character updated, if applicable."),
  foundCharacterId: z.string().optional().describe("The ID of the character found, if applicable."),
  brainstormedIdeasCount: z.number().optional().describe("Number of character ideas brainstormed."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
});
export type CharacterArchitectOutput = z.infer<typeof CharacterArchitectOutputSchema>;

// Tool wrapper for brainstorming flow
const brainstormCharacterTool = ai.defineTool({
    name: 'brainstormCharacterIdeasTool',
    description: 'Use this tool to brainstorm new character ideas based on a theme or description.',
    inputSchema: z.object({ // Define input specifically for the tool wrapper
        projectId: z.string(),
        prompt: z.string().optional(),
        // genre: z.string().optional(), // Add if needed
        numberOfIdeas: z.number().int().positive().optional().default(3),
    }),
    outputSchema: z.object({ // Define output specifically for the tool wrapper
        characterIdeas: z.array(z.object({ name: z.string(), briefDescription: z.string(), role: z.string().optional() }))
    }),
 }, async (input) => {
    // Call the actual brainstorming flow
    const result = await brainstormCharacterIdeas(input);
    return { characterIdeas: result.characterIdeas }; // Adapt output if needed
});


export async function manageCharacter(input: CharacterArchitectInput): Promise<CharacterArchitectOutput> {
  console.log("Character Architect Agent: Processing request", input);
   if (!input.projectId) {
     throw new Error("Character Architect Agent requires a valid projectId.");
   }
  return characterArchitectFlow(input);
}

const characterArchitectPrompt = ai.definePrompt({
  name: 'characterArchitectAgentPrompt',
  model: getDefaultModelId(),
  tools: [
      createCharacterTool,
      updateCharacterTool,
      findCharacterByNameTool,
      getCharacterTool, // To fetch details for context if needed before update
      brainstormCharacterTool, // Use the wrapped brainstorming tool
    ],
  input: { schema: CharacterArchitectInputSchema },
  output: { schema: CharacterArchitectOutputSchema }, // Output should be the summary/result
  prompt: `You are a Character Architect AI Agent for a manga creation tool. Your task is to create, update, find, or brainstorm characters based on the user's prompt within the given project context.

Project ID: {{projectId}}
User Prompt: "{{prompt}}"

Instructions:
1.  **Analyze Prompt:** Determine the user's goal: create, update, find, or brainstorm characters.
2.  **Use Tools Appropriately:**
    *   **Create:** If asked to create a character, use \`createCharacterTool\`. Extract name, role, description, traits, visual details, etc., from the prompt. Provide the \`projectId\`.
    *   **Update:** If asked to update an existing character (often identified by name), first use \`findCharacterByNameTool\` to get their ID. Then, use \`updateCharacterTool\` with the character ID and the specific \`updates\` derived from the prompt (e.g., \`updates: { backstory: '...', personality: '...' }\`). If the character name isn't found, inform the user.
    *   **Find:** If asked to find or get details about a character by name, use \`findCharacterByNameTool\` and return the found information in the summary. If asked by ID, use \`getCharacterTool\`.
    *   **Brainstorm:** If asked to brainstorm character ideas, use the \`brainstormCharacterIdeasTool\`. Provide the \`projectId\` and relevant parts of the user prompt.
3.  **Generate Summary:** Provide a concise \`summary\` confirming the actions taken (e.g., "Created character 'Kenji'", "Updated Alice's backstory.", "Found character 'Bob' (ID: ...).", "Brainstormed 3 character ideas.") or explaining why no action was taken (e.g., "Character 'X' not found.").
4.  **Set Output Fields:** Populate relevant output fields like \`createdCharacterId\`, \`updatedCharacterId\`, \`foundCharacterId\`, \`brainstormedIdeasCount\`. Set \`requiresRefresh\` to true if creation or update occurred.

Focus ONLY on character creation, modification, lookup, and brainstorming. Do NOT create projects, chapters, scenes, panels, or dialogue.
`,
});

const characterArchitectFlow = ai.defineFlow<
  typeof CharacterArchitectInputSchema,
  typeof CharacterArchitectOutputSchema
>(
  {
    name: 'characterArchitectFlow',
    inputSchema: CharacterArchitectInputSchema,
    outputSchema: CharacterArchitectOutputSchema,
  },
  async (input) => {
     const { output, toolRequests, toolResponses } = await characterArchitectPrompt(input);

    // Default response
    let summary = output?.summary ?? "Character Architect agent processed the request.";
    let createdCharacterId = output?.createdCharacterId;
    let updatedCharacterId = output?.updatedCharacterId;
    let foundCharacterId = output?.foundCharacterId;
    let brainstormedIdeasCount = output?.brainstormedIdeasCount;
    let requiresRefresh = output?.requiresRefresh ?? false;

     // Process tool results
     if (toolResponses && toolResponses.length > 0) {
        // Handle potentially multiple tool calls (e.g., find then update)
        for (const response of toolResponses) {
            const toolName = response.toolRequest.toolName;
            const toolResult = response.result;

            if (toolName === 'createCharacter' && typeof toolResult === 'string') {
                createdCharacterId = toolResult;
                summary = output?.summary || `Successfully created new character (ID: ${createdCharacterId}).`;
                requiresRefresh = true;
            } else if (toolName === 'updateCharacter' && toolResult === true) {
                updatedCharacterId = (response.toolRequest.input as any)?.characterId;
                summary = output?.summary || `Successfully updated character ${updatedCharacterId}.`;
                requiresRefresh = true;
            } else if (toolName === 'findCharacterByName' && toolResult) {
                foundCharacterId = (toolResult as any)?.id;
                const foundName = (toolResult as any)?.name;
                summary = output?.summary || (foundCharacterId ? `Found character '${foundName}' (ID: ${foundCharacterId}).` : `Character not found.`);
            } else if (toolName === 'getCharacter' && toolResult) {
                 foundCharacterId = (toolResult as any)?.id;
                 const foundName = (toolResult as any)?.name;
                 summary = output?.summary || (foundCharacterId ? `Retrieved details for character '${foundName}' (ID: ${foundCharacterId}).` : `Character ID not found.`);
            } else if (toolName === 'brainstormCharacterIdeasTool' && toolResult) {
                 const ideas = (toolResult as any).characterIdeas ?? [];
                 brainstormedIdeasCount = ideas.length;
                 summary = output?.summary || `Brainstormed ${brainstormedIdeasCount} character ideas.`;
                 requiresRefresh = false;
            } else if (!toolResult && toolName !== 'brainstormCharacterIdeasTool') {
                 summary = output?.summary || `Tool ${toolName} execution failed or returned no result.`;
            }
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Character Architect: Tool requested but no response received", toolRequests);
    }

    return {
        summary,
        createdCharacterId,
        updatedCharacterId,
        foundCharacterId,
        brainstormedIdeasCount,
        requiresRefresh
    };
  }
);