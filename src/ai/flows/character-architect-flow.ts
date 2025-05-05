
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
import { createCharacterTool, updateCharacterTool, findCharacterByNameTool, deleteCharacterTool } from '@/ai/tools/creation-tools'; // Import delete tool
// Import fetch tools if needed for context gathering
import { getCharacterTool } from '@/ai/tools/fetch-tools';
// Import brainstorming flow/tool
import { brainstormCharacterIdeas } from '@/ai/flows/brainstorm-character-ideas'; // Use the flow directly or wrap as tool


const CharacterArchitectInputSchema = z.object({
  prompt: z.string().describe("User's request related to characters (e.g., 'Create a stoic swordsman', 'Update Alice's backstory', 'Find Bob', 'Brainstorm villains', 'Delete Kenji')."),
  projectId: z.string().describe("The ID of the project context. Required for creating/updating/finding/deleting characters."),
  // Pass selected character ID if relevant
  selectedCharacterId: z.string().optional().describe("ID of the currently selected character, if any."),
});
export type CharacterArchitectInput = z.infer<typeof CharacterArchitectInputSchema>;

const CharacterArchitectOutputSchema = z.object({
  summary: z.string().describe("A summary of the character-related actions taken or information generated."),
  createdCharacterId: z.string().optional().describe("The ID of the character created, if applicable."),
  updatedCharacterId: z.string().optional().describe("The ID of the character updated, if applicable."),
  foundCharacterId: z.string().optional().describe("The ID of the character found, if applicable."),
  deletedCharacterId: z.string().optional().describe("The ID of the character deleted, if applicable."), // Added deleted ID
  brainstormedIdeasCount: z.number().optional().describe("Number of character ideas brainstormed."),
  requiresRefresh: z.boolean().optional().default(false).describe("Indicates if the frontend editor data should be refreshed."),
  lastToolName: z.string().optional().describe("Name of the last tool called, if any."),
  lastToolResult: z.any().optional().describe("Result of the last tool call, if any."),
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
  name: 'characterArchitectAgentPrompt_v2', // Updated version
  model: getDefaultModelId(),
  tools: [
      createCharacterTool,
      updateCharacterTool,
      findCharacterByNameTool,
      getCharacterTool, // To fetch details for context if needed before update
      deleteCharacterTool, // Added delete tool
      brainstormCharacterTool, // Use the wrapped brainstorming tool
    ],
  input: { schema: CharacterArchitectInputSchema },
  output: { schema: CharacterArchitectOutputSchema }, // Output should be the summary/result
  prompt: `You are a Character Architect AI Agent for a manga creation tool. Your task is to create, update, find, delete, or brainstorm characters based on the user's prompt within the given project context.

Project ID: {{projectId}}
{{#if selectedCharacterId}}Selected Character ID: {{selectedCharacterId}}{{/if}}
User Prompt: "{{prompt}}"

Instructions:
1.  **Analyze Prompt:** Determine the user's goal: create, update, find, delete, or brainstorm characters.
2.  **Use Context:** If \`selectedCharacterId\` is provided and the prompt refers to "this character" or similar, use that ID for update/delete/find actions.
3.  **Use Tools Appropriately:**
    *   **Create:** Use \`createCharacterTool\`. Extract name, role, description, traits, visual details, etc., from the prompt. Provide the \`projectId\`.
    *   **Update:** If asked to update an existing character (identified by name or selection), first determine the character ID. Use \`selectedCharacterId\` if applicable, otherwise use \`findCharacterByNameTool\`. If an ID is found, use \`updateCharacterTool\` with the \`characterId\` and the specific \`updates\` derived from the prompt (e.g., \`updates: { backstory: '...', personality: '...' }\`). If the character isn't found, inform the user.
    *   **Find:** If asked to find or get details about a character by name, use \`findCharacterByNameTool\`. If asked by ID (or selection), use \`getCharacterTool\`. Return the found information in the summary.
    *   **Delete:** If asked to delete a character (identified by name or selection), first determine the character ID (using \`selectedCharacterId\` or \`findCharacterByNameTool\`). If found, use \`deleteCharacterTool\` with the \`characterId\`. If not found, inform the user.
    *   **Brainstorm:** If asked to brainstorm character ideas, use the \`brainstormCharacterIdeasTool\`. Provide the \`projectId\` and relevant parts of the user prompt.
4.  **Generate Summary:** Provide a concise \`summary\` confirming the actions taken (e.g., "Created character 'Kenji'", "Updated Alice's backstory.", "Found character 'Bob' (ID: ...).", "Deleted character 'Kenji'.", "Brainstormed 3 character ideas.") or explaining why no action was taken (e.g., "Character 'X' not found for deletion.").
5.  **Set Output Fields:** Populate relevant output fields like \`createdCharacterId\`, \`updatedCharacterId\`, \`foundCharacterId\`, \`deletedCharacterId\`, \`brainstormedIdeasCount\`. Set \`requiresRefresh\` to true if creation, update, or deletion occurred. Include \`lastToolName\` and \`lastToolResult\` if a tool was called.

Focus ONLY on character creation, modification, lookup, deletion, and brainstorming. Do NOT create projects, chapters, scenes, panels, or dialogue.
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

    // Default response values
    let summary = output?.summary ?? "Character Architect agent processed the request.";
    let createdCharacterId = output?.createdCharacterId;
    let updatedCharacterId = output?.updatedCharacterId;
    let foundCharacterId = output?.foundCharacterId;
    let deletedCharacterId = output?.deletedCharacterId;
    let brainstormedIdeasCount = output?.brainstormedIdeasCount;
    let requiresRefresh = output?.requiresRefresh ?? false;
    let lastToolName: string | undefined = undefined;
    let lastToolResult: any = undefined;

     // Process tool results (potentially multiple, e.g., find then update/delete)
     if (toolResponses && toolResponses.length > 0) {
        // Keep track of found ID for subsequent actions
        let idForAction: string | undefined = input.selectedCharacterId;

        for (const response of toolResponses) {
            lastToolName = response.toolRequest.toolName;
            lastToolResult = response.result;

            if (lastToolName === 'findCharacterByName' && lastToolResult) {
                idForAction = (lastToolResult as any)?.id;
                foundCharacterId = idForAction;
                const foundName = (lastToolResult as any)?.name;
                summary = output?.summary || (foundCharacterId ? `Found character '${foundName}' (ID: ${foundCharacterId}).` : `Character not found.`);
                requiresRefresh = false; // Finding doesn't require refresh
            } else if (lastToolName === 'getCharacter' && lastToolResult) {
                 idForAction = (lastToolResult as any)?.id;
                 foundCharacterId = idForAction;
                 const foundName = (lastToolResult as any)?.name;
                 summary = output?.summary || (foundCharacterId ? `Retrieved details for character '${foundName}' (ID: ${foundCharacterId}).` : `Character ID not found.`);
                 requiresRefresh = false;
            } else if (lastToolName === 'createCharacter' && typeof lastToolResult === 'string') {
                createdCharacterId = lastToolResult;
                summary = output?.summary || `Successfully created new character (ID: ${createdCharacterId}).`;
                requiresRefresh = true;
            } else if (lastToolName === 'updateCharacter' && lastToolResult === true) {
                 // ID could be from input.selectedCharacterId or found via findCharacterByNameTool earlier
                updatedCharacterId = (response.toolRequest.input as any)?.characterId ?? idForAction;
                summary = output?.summary || `Successfully updated character ${updatedCharacterId}.`;
                requiresRefresh = true;
            } else if (lastToolName === 'deleteCharacter' && lastToolResult === true) {
                // ID could be from input.selectedCharacterId or found via findCharacterByNameTool earlier
                deletedCharacterId = (response.toolRequest.input as any)?.characterId ?? idForAction;
                summary = output?.summary || `Successfully deleted character ${deletedCharacterId}.`;
                requiresRefresh = true;
            } else if (lastToolName === 'brainstormCharacterIdeasTool' && lastToolResult) {
                 const ideas = (lastToolResult as any).characterIdeas ?? [];
                 brainstormedIdeasCount = ideas.length;
                 summary = output?.summary || `Brainstormed ${brainstormedIdeasCount} character ideas.`;
                 requiresRefresh = false;
            } else if (!lastToolResult && !['findCharacterByName', 'getCharacter', 'brainstormCharacterIdeasTool'].includes(lastToolName)) {
                 // Report failure for action tools
                 summary = output?.summary || `Tool ${lastToolName} execution failed or returned no result.`;
                 requiresRefresh = false;
            } else if (output?.summary && !lastToolName?.includes('Character')) {
                 // If LLM provided a summary without calling an action tool, use it
                 summary = output.summary;
                 requiresRefresh = output.requiresRefresh ?? false;
            }
        }
    } else if (toolRequests && toolRequests.length > 0 && (!toolResponses || toolResponses.length === 0)) {
         summary = output?.summary || `Attempted to call tool ${toolRequests[0].toolName} but received no response.`;
         console.warn("Character Architect: Tool requested but no response received", toolRequests);
         requiresRefresh = false;
    }


    return {
        summary,
        createdCharacterId,
        updatedCharacterId,
        foundCharacterId,
        deletedCharacterId, // Include deleted ID
        brainstormedIdeasCount,
        requiresRefresh,
        lastToolName,
        lastToolResult,
    };
  }
);

    