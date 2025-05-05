
'use server';

import ai from './ai-instance'; // Use the configured instance
import { getDefaultModelId } from './ai-config';
import { z } from 'genkit';

// Define input/output for the general assistant prompt
const AssistantInputSchema = z.object({
    message: z.string(),
    projectId: z.string().optional().describe("Optional project context ID"),
    selectedItemId: z.string().optional().describe("Optional selected item ID"),
    selectedItemType: z.string().optional().describe("Optional selected item type"),
});

const AssistantOutputSchema = z.object({
    reply: z.string(),
});

const assistantPrompt = ai.definePrompt({
    name: 'generalAssistantFallbackPrompt', // More specific name
    model: getDefaultModelId(),
    input: { schema: AssistantInputSchema },
    output: { schema: AssistantOutputSchema },
    prompt: `You are a helpful Manga creation assistant. The user's request did not match any specific tool or action.

User's message: "{{message}}"

Context:
- Project ID: {{projectId Mappin "Not Set"}}
- Selected Item ID: {{selectedItemId Mappin "None"}}
- Selected Item Type: {{selectedItemType Mappin "None"}}

Respond helpfully and concisely to the user's general query. Acknowledge the context if relevant. If the user seems to be asking for an action (create, update, delete, fetch, brainstorm, summarize), gently guide them to phrase their request more clearly or remind them to select an item if necessary for modification/summarization. Avoid performing actions directly; your role here is general assistance or clarification.
`,
});


/**
 * Handles general user queries that don't match specific tool commands via the orchestrator.
 * Acts as a fallback LLM call.
 *
 * @param message The user's original message.
 * @param projectId Optional ID of the current project for context.
 * @param selectedItemId Optional ID of selected item.
 * @param selectedItemType Optional type of selected item.
 * @returns The AI's helpful, non-action-oriented response string.
 */
export async function askGeneralAssistant(
    message: string,
    projectId?: string | null,
    selectedItemId?: string | null,
    selectedItemType?: string | null,
): Promise<string> {
    console.log(`Sending to General Assistant Fallback (${getDefaultModelId()}):`, { message, projectId, selectedItemId, selectedItemType });

    // Basic hardcoded conversational replies can still be useful
     if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
         return "Hello there! How can I help you with your manga project today?";
     } else if (message.toLowerCase().includes('thank')) {
         return "You're welcome! Let me know if there's anything else.";
     }

    // Fallback to the configured Genkit model using the dedicated prompt
    try {
        const { output } = await assistantPrompt({
            message,
            projectId: projectId ?? undefined,
            selectedItemId: selectedItemId ?? undefined,
            selectedItemType: selectedItemType ?? undefined,
        });
        return output?.reply || "Sorry, I couldn't process that request right now.";
    } catch (error) {
        console.error('Error calling general assistant fallback prompt:', error);
        return "Sorry, I encountered an error trying to understand that. Could you try rephrasing?";
    }
}
