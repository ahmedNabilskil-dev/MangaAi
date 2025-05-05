
'use server';

import ai from './ai-instance'; // Use the configured instance
import { getDefaultModelId } from './ai-config'; // Use the configured instance and default model from config
import { z } from 'genkit';

// Define input/output for the general assistant prompt (can be simple for now)
const AssistantInputSchema = z.object({
    message: z.string(),
    projectId: z.string().optional().describe("Optional project context ID"),
});

const AssistantOutputSchema = z.object({
    reply: z.string(),
});

const assistantPrompt = ai.definePrompt({
    name: 'generalAssistantPrompt',
    model: getDefaultModelId(), // Use the configured default model from config
    input: { schema: AssistantInputSchema },
    output: { schema: AssistantOutputSchema },
    prompt: `You are a helpful Manga creation assistant using a Dexie database.
The current project context ID is {{projectId}}.
The user said: "{{message}}"

Respond helpfully. If the user asks to edit or update something, remind them to select the item in the visual editor first.
If they ask for creation or brainstorming, acknowledge you can help with that using specific commands (like 'create chapter...' or 'brainstorm characters...').
Keep your replies concise.`,
});


/**
 * Handles general user queries that don't match specific tool commands.
 *
 * @param message The user's message.
 * @param projectId Optional ID of the current project for context.
 * @returns The AI's response string.
 */
export async function askGeneralAssistant(message: string, projectId?: string | null): Promise<string> {
    console.log(`Sending to General Assistant (${getDefaultModelId()}) with project context ${projectId || 'none'}:`, message);

     // Basic hardcoded responses for quick interactions
     if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
         return "Hello there! How can I help you create or edit your manga today using the local database (Dexie)?";
     } else if (message.toLowerCase().includes('help')) {
         return "I can help create chapters, scenes, panels, characters, dialogues, or brainstorm ideas. Try 'create chapter 1 titled...' or 'brainstorm characters...'. To edit a specific item (like changing a scene's setting), please select it first in the editor.";
     }

     // Provide clearer guidance if an update-like command is used without selection
     if (['change', 'update', 'edit', 'set', 'add', 'remove'].some(keyword => message.toLowerCase().startsWith(keyword))) {
          return "To modify a specific item (e.g., change a description, add a character to a panel), please select it in the visual editor first. Otherwise, tell me what you'd like to create or brainstorm.";
     }

    // Fallback to the configured Genkit model
    try {
        const { output } = await assistantPrompt({
            message,
            projectId: projectId ?? undefined,
        });
        return output?.reply || "Sorry, I couldn't process that request.";
    } catch (error) {
        console.error('Error calling general assistant prompt:', error);
        return "Sorry, I encountered an error trying to understand that.";
    }
}
