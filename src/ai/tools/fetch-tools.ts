
'use server';

/**
 * @fileOverview Defines Genkit tools for fetching entities (Project, Chapter, Scene, Panel, Dialogue, Character) from the data store.
 * These tools allow the AI to retrieve specific data based on IDs or other criteria.
 */

import ai from '@/ai/ai-instance';
import { z } from 'genkit';
// Import data service functions
import {
    getProject as getProjectService,
    getChapterForContext as getChapterService,
    getSceneForContext as getSceneService,
    getPanelForContext as getPanelService,
    getPanelDialogueForContext as getDialogueService,
    getCharacterForContext as getCharacterService,
    getAllCharacters as getAllCharactersService, // For listing/finding by name
    // Import other list functions if needed (e.g., getAllChaptersForProject)
} from '@/services/data-service';
// Import Zod schemas for precise output types
import { mangaProjectSchema, chapterSchema, sceneSchema, panelSchema, panelDialogueSchema, characterSchema } from '@/types/schemas'; // Ensure these schemas exist and match entities


// --- Tool: Get Project Details ---
export const getProjectTool = ai.defineTool({
    name: 'getProject',
    description: 'Retrieves the full details of a specific manga project by its ID.',
    inputSchema: z.object({
        projectId: z.string().describe('The ID of the manga project to retrieve.'),
    }),
    outputSchema: mangaProjectSchema.nullable().describe('The requested project details, or null if not found.'), // Use Zod schema
}, async ({ projectId }) => {
    console.log(`Tool: Fetching project ${projectId}`);
    try {
        const project = await getProjectService(projectId);
        // Basic validation against schema before returning (optional but good practice)
        const parsed = mangaProjectSchema.nullable().safeParse(project);
        if (!parsed.success) {
            console.error(`Project data validation failed for ${projectId}:`, parsed.error);
            return null; // Or throw error if strict validation needed
        }
        return parsed.data;
    } catch (error: any) {
        console.error(`Error in getProjectTool for ${projectId}:`, error.message);
        return null; // Return null on error
    }
});

// --- Tool: Get Chapter Details ---
export const getChapterTool = ai.defineTool({
    name: 'getChapter',
    description: 'Retrieves the details of a specific chapter by its ID.',
    inputSchema: z.object({
        chapterId: z.string().describe('The ID of the chapter to retrieve.'),
    }),
    outputSchema: chapterSchema.nullable().describe('The requested chapter details, or null if not found.'), // Use Zod schema
}, async ({ chapterId }) => {
    console.log(`Tool: Fetching chapter ${chapterId}`);
    try {
        const chapter = await getChapterService(chapterId);
        const parsed = chapterSchema.nullable().safeParse(chapter);
         if (!parsed.success) {
             console.error(`Chapter data validation failed for ${chapterId}:`, parsed.error);
             return null;
         }
        return parsed.data;
    } catch (error: any) {
        console.error(`Error in getChapterTool for ${chapterId}:`, error.message);
        return null;
    }
});

// --- Tool: Get Scene Details ---
export const getSceneTool = ai.defineTool({
    name: 'getScene',
    description: 'Retrieves the details of a specific scene by its ID.',
    inputSchema: z.object({
        sceneId: z.string().describe('The ID of the scene to retrieve.'),
    }),
     outputSchema: sceneSchema.nullable().describe('The requested scene details, or null if not found.'), // Use Zod schema
}, async ({ sceneId }) => {
     console.log(`Tool: Fetching scene ${sceneId}`);
     try {
         const scene = await getSceneService(sceneId);
          const parsed = sceneSchema.nullable().safeParse(scene);
          if (!parsed.success) {
              console.error(`Scene data validation failed for ${sceneId}:`, parsed.error);
              return null;
          }
         return parsed.data;
     } catch (error: any) {
         console.error(`Error in getSceneTool for ${sceneId}:`, error.message);
         return null;
     }
});

// --- Tool: Get Panel Details ---
export const getPanelTool = ai.defineTool({
    name: 'getPanel',
    description: 'Retrieves the details of a specific panel by its ID.',
    inputSchema: z.object({
        panelId: z.string().describe('The ID of the panel to retrieve.'),
    }),
     outputSchema: panelSchema.nullable().describe('The requested panel details, or null if not found.'), // Use Zod schema
}, async ({ panelId }) => {
    console.log(`Tool: Fetching panel ${panelId}`);
     try {
         const panel = await getPanelService(panelId);
         const parsed = panelSchema.nullable().safeParse(panel);
          if (!parsed.success) {
              console.error(`Panel data validation failed for ${panelId}:`, parsed.error);
              return null;
          }
         return parsed.data;
     } catch (error: any) {
         console.error(`Error in getPanelTool for ${panelId}:`, error.message);
         return null;
     }
});

// --- Tool: Get Dialogue Details ---
export const getDialogueTool = ai.defineTool({
    name: 'getDialogue',
    description: 'Retrieves the details of a specific dialogue entry by its ID.',
    inputSchema: z.object({
        dialogueId: z.string().describe('The ID of the dialogue entry to retrieve.'),
    }),
    outputSchema: panelDialogueSchema.nullable().describe('The requested dialogue details, or null if not found.'), // Use Zod schema
}, async ({ dialogueId }) => {
    console.log(`Tool: Fetching dialogue ${dialogueId}`);
     try {
         const dialogue = await getDialogueService(dialogueId);
         const parsed = panelDialogueSchema.nullable().safeParse(dialogue);
           if (!parsed.success) {
               console.error(`Dialogue data validation failed for ${dialogueId}:`, parsed.error);
               return null;
           }
         return parsed.data;
     } catch (error: any) {
         console.error(`Error in getDialogueTool for ${dialogueId}:`, error.message);
         return null;
     }
});

// --- Tool: Get Character Details ---
export const getCharacterTool = ai.defineTool({
    name: 'getCharacter',
    description: 'Retrieves the details of a specific character by their ID.',
    inputSchema: z.object({
        characterId: z.string().describe('The ID of the character to retrieve.'),
    }),
    outputSchema: characterSchema.nullable().describe('The requested character details, or null if not found.'), // Use Zod schema
}, async ({ characterId }) => {
    console.log(`Tool: Fetching character ${characterId}`);
     try {
         const character = await getCharacterService(characterId);
          const parsed = characterSchema.nullable().safeParse(character);
           if (!parsed.success) {
               console.error(`Character data validation failed for ${characterId}:`, parsed.error);
               return null;
           }
         return parsed.data;
     } catch (error: any) {
         console.error(`Error in getCharacterTool for ${characterId}:`, error.message);
         return null;
     }
});

// --- Tool: Find Character by Name (Example of a 'list' or 'find' tool) ---
// This is crucial for mapping names mentioned in prompts to actual character IDs.
export const findCharacterByNameTool = ai.defineTool({
    name: 'findCharacterByName',
    description: 'Finds the ID and basic details of an existing character given their name within a specific project context.',
    inputSchema: z.object({
        characterName: z.string().describe("The exact name of the character to find."),
        projectId: z.string().describe("The ID of the current project context. REQUIRED for lookup."),
    }),
    // Return a subset or the full character schema, including the ID
    outputSchema: characterSchema.pick({ id: true, name: true, briefDescription: true }).nullable() // Return ID, name, description
        .describe("Basic details of the found character (including ID), or null if not found."),
}, async ({ characterName, projectId }) => {
    if (!projectId) {
         console.warn("findCharacterByNameTool requires projectId for context.");
          return null;
    }
    try {
        console.log(`Tool: Finding character "${characterName}" in project ${projectId}`);
        const characters = await getAllCharactersService(projectId); // Use data service function
        const found = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase());
        if (!found) {
             console.log(`Character "${characterName}" not found in project ${projectId}.`);
             return null;
        }
        console.log(`Found character: ${found.id} - ${found.name}`);
        // Validate subset before returning
         const parsed = characterSchema.pick({ id: true, name: true, briefDescription: true }).nullable().safeParse(found);
          if (!parsed.success) {
              console.error(`Character subset validation failed for ${found.id}:`, parsed.error);
              return null;
          }
        return parsed.data;
    } catch (error: any) {
        console.error(`Error finding character "${characterName}" in project ${projectId}:`, error.message);
        return null;
    }
});


// --- Potentially add more list tools ---
// e.g., listChaptersForProject, listScenesForChapter, listPanelsForScene, listDialoguesForPanel
// Example:
// export const listChaptersForProjectTool = ai.defineTool({
//     name: 'listChaptersForProject',
//     description: 'Lists all chapters belonging to a specific project.',
//     inputSchema: z.object({ projectId: z.string() }),
//     outputSchema: z.array(chapterSchema.pick({ id: true, title: true, chapterNumber: true })).describe('A list of chapters with their ID, title, and number.'),
// }, async ({ projectId }) => {
//     // Implementation using data service...
// });
