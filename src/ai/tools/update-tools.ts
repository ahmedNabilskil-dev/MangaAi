
'use server';
/**
 * @fileOverview Defines Genkit tools for updating existing manga entities (Project, Chapter, Scene, Panel, Dialogue, Character) in the data store.
 * These tools allow the AI to modify specific fields of an entity based on user requests.
 */

import ai from '@/ai/ai-instance';
import { z } from 'genkit';
import type { DeepPartial } from '@/types/utils';
// Import data service functions
import {
    updateProject as updateProjectService,
    updateChapter as updateChapterService,
    updateScene as updateSceneService,
    updatePanel as updatePanelService,
    updatePanelDialogue as updatePanelDialogueService,
    updateCharacter as updateCharacterService,
    assignCharacterToPanel as assignCharacterToPanelService, // Needed for panel character list updates
    removeCharacterFromPanel as removeCharacterFromPanelService, // Needed for panel character list updates
    // Import context fetchers if needed for validation or lookups
    getProject as getProjectForContext,
    getChapterForContext,
    getSceneForContext,
    getPanelForContext,
    getCharacterForContext,
    getAllCharacters, // Needed to find characters by name
} from '@/services/data-service';
// Import Zod schemas to define the *shape of the updates* the AI can provide.
// Use .partial() to indicate that only a subset of fields might be provided.
import { mangaProjectSchema, chapterSchema, sceneSchema, panelSchema, panelDialogueSchema, characterSchema } from '@/types/schemas';

// --- Helper to get projectId for context (if not directly provided) ---
// Replicated from creation-tools.ts for consistency
async function getProjectIdForContext(context: { chapterId?: string, sceneId?: string, panelId?: string, characterId?: string }): Promise<string | undefined> {
     if (context.chapterId) {
         const chapter = await getChapterForContext(context.chapterId);
         return chapter?.mangaProjectId;
     }
     if (context.sceneId) {
         const scene = await getSceneForContext(context.sceneId);
         if (scene) {
            const chapter = await getChapterForContext(scene.chapterId);
            return chapter?.mangaProjectId;
         }
     }
      if (context.panelId) {
         const panel = await getPanelForContext(context.panelId);
         if (panel) {
            const scene = await getSceneForContext(panel.sceneId);
             if (scene) {
                const chapter = await getChapterForContext(scene.chapterId);
                return chapter?.mangaProjectId;
             }
         }
     }
       if (context.characterId) {
         const character = await getCharacterForContext(context.characterId);
         return character?.mangaProjectId;
     }
    console.warn("Could not determine projectId from context in getProjectIdForContext helper.");
    return undefined;
}


// --- Base Schemas for Update Data (Partial and Omitting Readonly Fields) ---
const UpdateProjectDataSchema = mangaProjectSchema.omit({ id: true, createdAt: true, updatedAt: true, chapters: true, characters: true }).partial()
    .describe("Fields to update for a Manga Project.");
const UpdateChapterDataSchema = chapterSchema.omit({ id: true, createdAt: true, updatedAt: true, scenes: true, mangaProjectId: true }).partial()
    .describe("Fields to update for a Chapter.");
const UpdateSceneDataSchema = sceneSchema.omit({ id: true, createdAt: true, updatedAt: true, panels: true, chapterId: true }).partial()
    .describe("Fields to update for a Scene.");
// Panel updates handle characterIds via assign/remove tools.
const UpdatePanelDataSchema = panelSchema.omit({ id: true, createdAt: true, updatedAt: true, dialogues: true, characters: true, sceneId: true, characterIds: true }).partial()
    .describe("Fields to update for a Panel (excluding character list). Use assign/remove tools for characters.");
const UpdatePanelDialogueDataSchema = panelDialogueSchema.omit({ id: true, createdAt: true, updatedAt: true, speaker: true, panelId: true }).partial()
     // Allow speakerId update separately via speakerName lookup
    .extend({ speakerId: z.string().nullable().optional().describe("The ID of the character speaking (optional, set via speakerName if provided).")})
    .describe("Fields to update for Panel Dialogue.");
const UpdateCharacterDataSchema = characterSchema.omit({ id: true, createdAt: true, updatedAt: true, mangaProjectId: true }).partial()
    .describe("Fields to update for a Character.");


// --- Tool: Update Project ---
export const updateProjectTool = ai.defineTool({
    name: 'updateProject',
    description: 'Updates specific fields of an existing Manga Project.',
    inputSchema: z.object({
        projectId: z.string().describe("The ID of the project to update."),
        updates: UpdateProjectDataSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded, false otherwise."),
}, async ({ projectId, updates }) => {
    console.log(`Tool: Updating project ${projectId}`, updates);
    try {
         // Optional: Validate if project exists
         const exists = await getProjectForContext(projectId);
         if (!exists) throw new Error(`Project ${projectId} not found.`);

         // Handle potential JSON string fields if they are part of the update
         const processedUpdates = { ...updates };
         if (typeof updates.worldDetails === 'string') processedUpdates.worldDetails = JSON.parse(updates.worldDetails);
         if (typeof updates.locations === 'string') processedUpdates.locations = JSON.parse(updates.locations);
         if (typeof updates.plotStructure === 'string') processedUpdates.plotStructure = JSON.parse(updates.plotStructure);
         if (typeof updates.keyEvents === 'string') processedUpdates.keyEvents = JSON.parse(updates.keyEvents);
         if (typeof updates.themes === 'string') processedUpdates.themes = updates.themes.split(',').map(t => t.trim());
         if (typeof updates.motifs === 'string') processedUpdates.motifs = updates.motifs.split(',').map(t => t.trim());
         if (typeof updates.symbols === 'string') processedUpdates.symbols = updates.symbols.split(',').map(t => t.trim());
         if (typeof updates.tags === 'string') processedUpdates.tags = updates.tags.split(',').map(t => t.trim());


        await updateProjectService(projectId, processedUpdates as DeepPartial<Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>);
        return true;
    } catch (e: any) {
        console.error("updateProjectTool Error:", e.message);
        return false; // Indicate failure
    }
});

// --- Tool: Update Chapter ---
export const updateChapterTool = ai.defineTool({
    name: 'updateChapter',
    description: 'Updates specific fields of an existing Chapter.',
    inputSchema: z.object({
        chapterId: z.string().describe("The ID of the chapter to update."),
        updates: UpdateChapterDataSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded, false otherwise."),
}, async ({ chapterId, updates }) => {
     console.log(`Tool: Updating chapter ${chapterId}`, updates);
     try {
          // Optional: Validate if chapter exists
         const exists = await getChapterForContext(chapterId);
         if (!exists) throw new Error(`Chapter ${chapterId} not found.`);

          // Handle potential array string fields
         const processedUpdates = { ...updates };
         if (typeof updates.keyCharacters === 'string') processedUpdates.keyCharacters = updates.keyCharacters.split(',').map(t => t.trim());


         await updateChapterService(chapterId, processedUpdates as DeepPartial<Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'scenes' | 'mangaProjectId'>>);
         return true;
     } catch (e: any) {
         console.error("updateChapterTool Error:", e.message);
         return false;
     }
});

// --- Tool: Update Scene ---
export const updateSceneTool = ai.defineTool({
    name: 'updateScene',
    description: 'Updates specific fields of an existing Scene.',
    inputSchema: z.object({
        sceneId: z.string().describe("The ID of the scene to update."),
        updates: UpdateSceneDataSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded, false otherwise."),
}, async ({ sceneId, updates }) => {
     console.log(`Tool: Updating scene ${sceneId}`, updates);
     try {
          // Optional: Validate if scene exists
         const exists = await getSceneForContext(sceneId);
         if (!exists) throw new Error(`Scene ${sceneId} not found.`);

         // Handle potential JSON/array fields
          const processedUpdates = { ...updates };
         if (typeof updates.sceneContext === 'string') processedUpdates.sceneContext = JSON.parse(updates.sceneContext);
         // dialogueOutline might be complex, handle parsing if needed


         await updateSceneService(sceneId, processedUpdates as DeepPartial<Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'panels' | 'chapterId'>>);
         return true;
     } catch (e: any) {
         console.error("updateSceneTool Error:", e.message);
         return false;
     }
});

// --- Tool: Update Panel ---
export const updatePanelTool = ai.defineTool({
    name: 'updatePanel',
    description: 'Updates specific fields of an existing Panel. Use assign/remove tools for character list changes.',
    inputSchema: z.object({
        panelId: z.string().describe("The ID of the panel to update."),
        updates: UpdatePanelDataSchema.describe("The fields and new values to update (excluding character list)."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded, false otherwise."),
}, async ({ panelId, updates }) => {
      console.log(`Tool: Updating panel ${panelId}`, updates);
      try {
           // Optional: Validate if panel exists
         const exists = await getPanelForContext(panelId);
         if (!exists) throw new Error(`Panel ${panelId} not found.`);

         // Handle potential JSON/array fields
         const processedUpdates = { ...updates };
         if (typeof updates.panelContext === 'string') processedUpdates.panelContext = JSON.parse(updates.panelContext);


         await updatePanelService(panelId, processedUpdates as DeepPartial<Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters' | 'sceneId' | 'characterIds'>>);
         return true;
      } catch (e: any) {
          console.error("updatePanelTool Error:", e.message);
          return false;
      }
});


// --- Tool: Update Panel Dialogue ---
// Allows updating content, style, emotion, AND potentially the speaker via name lookup.
export const updatePanelDialogueTool = ai.defineTool({
    name: 'updatePanelDialogue',
    description: 'Updates specific fields of an existing Panel Dialogue, including optionally changing the speaker by name.',
    inputSchema: z.object({
        dialogueId: z.string().describe("The ID of the dialogue entry to update."),
        updates: UpdatePanelDialogueDataSchema.omit({speakerId: true}).describe("The fields and new values to update (excluding speakerId)."), // Exclude speakerId from direct updates
        speakerName: z.string().optional().describe("If provided, update the speaker to the character with this name. Requires project context."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded, false otherwise."),
}, async ({ dialogueId, updates, speakerName }) => {
    console.log(`Tool: Updating dialogue ${dialogueId}`, updates, `Speaker change requested: ${speakerName ?? 'No'}`);
    try {
         // Optional: Validate if dialogue exists
         const exists = await getDialogueService(dialogueId);
         if (!exists) throw new Error(`Dialogue ${dialogueId} not found.`);

         let speakerIdToSet: string | null | undefined = undefined; // undefined means don't change, null means remove speaker

         // Handle speaker change request
         if (speakerName !== undefined) { // If speakerName is explicitly provided (even if empty string)
             if (speakerName === "" || speakerName === null) {
                 speakerIdToSet = null; // Request to remove speaker
             } else {
                 // Find character ID by name
                 const projectId = await getProjectIdForContext({ panelId: exists.panelId });
                 if (!projectId) {
                     throw new Error("Project context could not be determined to find speaker by name.");
                 }
                 const characters = await getAllCharacters(projectId);
                 const foundSpeaker = characters.find(c => c.name.toLowerCase() === speakerName.toLowerCase());
                 if (!foundSpeaker) {
                     console.warn(`Speaker "${speakerName}" not found in project ${projectId}. Speaker will not be changed.`);
                      // Optionally throw an error here if speaker *must* be found
                      // throw new Error(`Speaker "${speakerName}" not found.`);
                      speakerIdToSet = undefined; // Indicate no change due to not found
                 } else {
                     speakerIdToSet = foundSpeaker.id;
                 }
             }
         }

          // Handle potential JSON/array fields in updates
          const processedUpdates = { ...updates };
         if (typeof updates.style === 'string') processedUpdates.style = JSON.parse(updates.style);

         // Add speakerId to updates if it needs changing
         if (speakerIdToSet !== undefined) {
             (processedUpdates as any).speakerId = speakerIdToSet;
         }


         await updatePanelDialogueService(dialogueId, processedUpdates as DeepPartial<Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'speaker' | 'panelId'>>);
         return true;
    } catch (e: any) {
        console.error("updatePanelDialogueTool Error:", e.message);
        return false;
    }
});

// --- Tool: Update Character ---
export const updateCharacterTool = ai.defineTool({
    name: 'updateCharacter',
    description: 'Updates specific fields of an existing Character.',
    inputSchema: z.object({
        characterId: z.string().describe("The ID of the character to update."),
        updates: UpdateCharacterDataSchema.describe("The fields and new values to update."),
    }),
    outputSchema: z.boolean().describe("True if update succeeded, false otherwise."),
}, async ({ characterId, updates }) => {
     console.log(`Tool: Updating character ${characterId}`, updates);
     try {
          // Optional: Validate if character exists
         const exists = await getCharacterForContext(characterId);
         if (!exists) throw new Error(`Character ${characterId} not found.`);

          // Handle potential JSON string fields
          const processedUpdates = { ...updates };
         if (typeof updates.bodyAttributes === 'string') processedUpdates.bodyAttributes = JSON.parse(updates.bodyAttributes);
         if (typeof updates.facialAttributes === 'string') processedUpdates.facialAttributes = JSON.parse(updates.facialAttributes);
         if (typeof updates.hairAttributes === 'string') processedUpdates.hairAttributes = JSON.parse(updates.hairAttributes);
         if (typeof updates.expressionStyle === 'string') processedUpdates.expressionStyle = JSON.parse(updates.expressionStyle);
         if (typeof updates.style === 'string') processedUpdates.style = JSON.parse(updates.style);
         if (typeof updates.styleGuide === 'string') processedUpdates.styleGuide = JSON.parse(updates.styleGuide);
         if (typeof updates.visualIdentityAnchors === 'string') processedUpdates.visualIdentityAnchors = JSON.parse(updates.visualIdentityAnchors);
         if (typeof updates.expressionImages === 'string') processedUpdates.expressionImages = JSON.parse(updates.expressionImages);
         // Handle simple arrays
         if (typeof updates.distinctiveFeatures === 'string') processedUpdates.distinctiveFeatures = updates.distinctiveFeatures.split(',').map(t => t.trim());
         if (typeof updates.physicalMannerisms === 'string') processedUpdates.physicalMannerisms = updates.physicalMannerisms.split(',').map(t => t.trim());
         if (typeof updates.referenceImageUrls === 'string') processedUpdates.referenceImageUrls = updates.referenceImageUrls.split(',').map(t => t.trim());
         if (typeof updates.traits === 'string') processedUpdates.traits = updates.traits.split(',').map(t => t.trim());
         if (typeof updates.arcs === 'string') processedUpdates.arcs = updates.arcs.split(',').map(t => t.trim());


         await updateCharacterService(characterId, processedUpdates as DeepPartial<Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'mangaProjectId'>>);
         return true;
     } catch (e: any) {
         console.error("updateCharacterTool Error:", e.message);
         return false;
     }
});

// --- Tool: Assign Character to Panel ---
// Uses the existing data service function, wrapped as a tool.
export const assignCharacterToPanelTool = ai.defineTool({
    name: 'assignCharacterToPanel',
    description: 'Assigns an *existing* character to a specific panel. Use findCharacterByName first if you only have the name.',
    inputSchema: z.object({
        panelId: z.string().describe("The ID of the panel."),
        characterId: z.string().describe("The ID of the *existing* character to assign."),
    }),
    outputSchema: z.boolean().describe("True if assignment was successful."),
}, async (input) => {
     console.log(`Tool: Assigning character ${input.characterId} to panel ${input.panelId}`);
    try {
        // Optional validation: Check if panel and character exist
        const panelExists = await getPanelForContext(input.panelId);
        if (!panelExists) throw new Error(`Panel ${input.panelId} not found.`);
        const charExists = await getCharacterForContext(input.characterId);
        if (!charExists) throw new Error(`Character ${input.characterId} not found.`);

        await assignCharacterToPanelService(input.panelId, input.characterId);
        return true;
    } catch (error: any) {
        console.error(`Failed to assign character ${input.characterId} to panel ${input.panelId}:`, error.message);
        return false;
    }
});

// --- Tool: Remove Character from Panel ---
// Uses the existing data service function, wrapped as a tool.
export const removeCharacterFromPanelTool = ai.defineTool({
    name: 'removeCharacterFromPanel',
    description: 'Removes a character from a specific panel. Requires the character\'s ID.',
     inputSchema: z.object({
        panelId: z.string().describe("The ID of the panel."),
        characterId: z.string().describe("The ID of the character to remove."),
    }),
    outputSchema: z.boolean().describe("True if removal was successful."),
}, async (input) => {
     console.log(`Tool: Removing character ${input.characterId} from panel ${input.panelId}`);
    try {
        // Optional validation: Check if panel exists
         const panelExists = await getPanelForContext(input.panelId);
         if (!panelExists) throw new Error(`Panel ${input.panelId} not found.`);
         // Check if character is actually assigned? (Optional)
         // if (!panelExists.characterIds?.includes(input.characterId)) {
         //     console.warn(`Character ${input.characterId} was not assigned to panel ${input.panelId}.`);
         //     return true; // Or false depending on desired behavior
         // }

        await removeCharacterFromPanelService(input.panelId, input.characterId);
        return true;
    } catch (error: any) {
        console.error(`Failed to remove character ${input.characterId} from panel ${input.panelId}:`, error.message);
        return false;
    }
});
