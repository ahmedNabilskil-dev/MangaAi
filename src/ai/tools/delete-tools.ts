
'use server';

/**
 * @fileOverview Defines Genkit tools for deleting entities (Project, Chapter, Scene, Panel, Dialogue, Character) from the data store.
 * These tools allow the AI to remove elements, potentially cascading deletions.
 */

import ai from '@/ai/ai-instance';
import { z } from 'genkit';
// Import data service functions
import {
    deleteProject as deleteProjectService,
    deleteChapter as deleteChapterService,
    deleteScene as deleteSceneService,
    deletePanel as deletePanelService,
    deletePanelDialogue as deleteDialogueService, // Corrected import name
    deleteCharacter as deleteCharacterService,
    // Import context fetchers if needed for validation
    getProject as getProjectForContext,
    getChapterForContext,
    getSceneForContext,
    getPanelForContext,
    getPanelDialogueForContext, // Corrected import name
    getCharacterForContext,
} from '@/services/data-service';


// --- Tool: Delete Project ---
// WARNING: This is a destructive operation and cascades. Use with extreme caution.
export const deleteProjectTool = ai.defineTool({
    name: 'deleteProject',
    description: 'Deletes an entire manga project and ALL its associated data (chapters, scenes, characters, etc.). This action is IRREVERSIBLE. Requires explicit confirmation.',
    inputSchema: z.object({
        projectId: z.string().describe('The ID of the manga project to delete.'),
        // Removed refine from schema, check will happen in the executor
        confirmation: z.boolean().describe("Must be set to true to confirm deletion."),
    }),
    outputSchema: z.boolean().describe('True if deletion was successful, false otherwise.'),
}, async ({ projectId, confirmation }) => {
     // Perform confirmation check inside the executor
     if (!confirmation) {
         console.warn("Project deletion requires explicit confirmation. Deletion aborted.");
         // Optionally throw an error instead of returning false
         // throw new Error("Confirmation required to delete the entire project.");
         return false;
     }
    console.log(`Tool: Deleting project ${projectId} (Confirmation received)`);
    try {
         // Optional: Validate if project exists before attempting delete
         const exists = await getProjectForContext(projectId);
         if (!exists) {
             console.warn(`Project ${projectId} not found for deletion.`);
             return false; // Or true if not finding it means it's "deleted"
         }
        await deleteProjectService(projectId); // Service handles cascade
        return true;
    } catch (error: any) {
        console.error(`Error in deleteProjectTool for ${projectId}:`, error.message);
        return false;
    }
});

// --- Tool: Delete Chapter ---
export const deleteChapterTool = ai.defineTool({
    name: 'deleteChapter',
    description: 'Deletes a specific chapter and all its scenes, panels, and dialogues.',
    inputSchema: z.object({
        chapterId: z.string().describe('The ID of the chapter to delete.'),
    }),
    outputSchema: z.boolean().describe('True if deletion was successful, false otherwise.'),
}, async ({ chapterId }) => {
    console.log(`Tool: Deleting chapter ${chapterId}`);
    try {
         const exists = await getChapterForContext(chapterId);
         if (!exists) {
             console.warn(`Chapter ${chapterId} not found for deletion.`);
             return false;
         }
        await deleteChapterService(chapterId); // Service handles cascade
        return true;
    } catch (error: any) {
        console.error(`Error in deleteChapterTool for ${chapterId}:`, error.message);
        return false;
    }
});

// --- Tool: Delete Scene ---
export const deleteSceneTool = ai.defineTool({
    name: 'deleteScene',
    description: 'Deletes a specific scene and all its panels and dialogues.',
    inputSchema: z.object({
        sceneId: z.string().describe('The ID of the scene to delete.'),
    }),
     outputSchema: z.boolean().describe('True if deletion was successful, false otherwise.'),
}, async ({ sceneId }) => {
    console.log(`Tool: Deleting scene ${sceneId}`);
    try {
         const exists = await getSceneForContext(sceneId);
         if (!exists) {
             console.warn(`Scene ${sceneId} not found for deletion.`);
             return false;
         }
        await deleteSceneService(sceneId); // Service handles cascade
        return true;
    } catch (error: any) {
        console.error(`Error in deleteSceneTool for ${sceneId}:`, error.message);
        return false;
    }
});

// --- Tool: Delete Panel ---
export const deletePanelTool = ai.defineTool({
    name: 'deletePanel',
    description: 'Deletes a specific panel and all its associated dialogues.',
    inputSchema: z.object({
        panelId: z.string().describe('The ID of the panel to delete.'),
    }),
     outputSchema: z.boolean().describe('True if deletion was successful, false otherwise.'),
}, async ({ panelId }) => {
    console.log(`Tool: Deleting panel ${panelId}`);
     try {
          const exists = await getPanelForContext(panelId);
          if (!exists) {
              console.warn(`Panel ${panelId} not found for deletion.`);
              return false;
          }
         await deletePanelService(panelId); // Service handles cascade
         return true;
     } catch (error: any) {
         console.error(`Error in deletePanelTool for ${panelId}:`, error.message);
         return false;
     }
});

// --- Tool: Delete Dialogue ---
export const deleteDialogueTool = ai.defineTool({
    name: 'deleteDialogue',
    description: 'Deletes a specific dialogue entry.',
    inputSchema: z.object({
        dialogueId: z.string().describe('The ID of the dialogue entry to delete.'),
    }),
    outputSchema: z.boolean().describe('True if deletion was successful, false otherwise.'),
}, async ({ dialogueId }) => {
     console.log(`Tool: Deleting dialogue ${dialogueId}`);
     try {
          const exists = await getPanelDialogueForContext(dialogueId); // Use correct context getter
          if (!exists) {
              console.warn(`Dialogue ${dialogueId} not found for deletion.`);
              return false;
          }
         await deleteDialogueService(dialogueId);
         return true;
     } catch (error: any) {
         console.error(`Error in deleteDialogueTool for ${dialogueId}:`, error.message);
         return false;
     }
});

// --- Tool: Delete Character ---
export const deleteCharacterTool = ai.defineTool({
    name: 'deleteCharacter',
    description: 'Deletes a specific character and removes their references from panels and dialogues.',
    inputSchema: z.object({
        characterId: z.string().describe('The ID of the character to delete.'),
    }),
    outputSchema: z.boolean().describe('True if deletion was successful, false otherwise.'),
}, async ({ characterId }) => {
     console.log(`Tool: Deleting character ${characterId}`);
     try {
          const exists = await getCharacterForContext(characterId);
          if (!exists) {
              console.warn(`Character ${characterId} not found for deletion.`);
              return false;
          }
         await deleteCharacterService(characterId); // Service handles removing references
         return true;
     } catch (error: any) {
         console.error(`Error in deleteCharacterTool for ${characterId}:`, error.message);
         return false;
     }
});
