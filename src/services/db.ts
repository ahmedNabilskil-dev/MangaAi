
'use server';

import { db } from '@/db/dexie';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils';
import { v4 as uuidv4 } from 'uuid';

// --- MangaProject Functions ---

export async function getAllProjects(): Promise<MangaProject[]> {
    console.log('Fetching all projects from Dexie');
    return await db.projects.toArray();
}

export async function getProject(id: string): Promise<MangaProject | null> {
    console.log(`Fetching project ${id} and related data from Dexie`);
    const project = await db.projects.get(id);
    if (!project) return null;

    // Fetch related data in parallel
    const [chaptersData, charactersData] = await Promise.all([
        db.chapters.where('mangaProjectId').equals(id).sortBy('chapterNumber'),
        db.characters.where('mangaProjectId').equals(id).toArray()
    ]);

    project.chapters = chaptersData;
    project.characters = charactersData;

    // Fetch nested data for chapters
    for (const chapter of project.chapters) {
        chapter.scenes = await db.scenes.where('chapterId').equals(chapter.id).sortBy('order');
        for (const scene of chapter.scenes) {
            scene.panels = await db.panels.where('sceneId').equals(scene.id).sortBy('order');
            for (const panel of scene.panels) {
                // Fetch dialogues and their speakers
                const dialoguesData = await db.dialogues.where('panelId').equals(panel.id).sortBy('order');
                const speakerIds = dialoguesData.map(d => d.speakerId).filter(id => id) as string[];
                const speakers = speakerIds.length > 0 ? await db.characters.bulkGet(speakerIds) : [];
                const speakerMap = new Map(speakers.filter(s => s).map(s => [s!.id, s]));

                panel.dialogues = dialoguesData.map(d => ({
                    ...d,
                    speaker: d.speakerId ? speakerMap.get(d.speakerId) ?? null : null
                }));

                // Fetch characters assigned to the panel
                panel.characters = panel.characterIds && panel.characterIds.length > 0
                    ? (await db.characters.bulkGet(panel.characterIds)).filter((c): c is Character => !!c)
                    : [];
            }
        }
    }

    return project;
}

export async function createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>): Promise<MangaProject & { id: string }> {
    console.log('Creating project in Dexie:', projectData);
    const newId = uuidv4();
    const newProject: MangaProject = {
        ...projectData,
        id: newId,
        chapters: [],
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.projects.add(newProject);
    return newProject;
}

export async function updateProject(id: string, projectData: DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>): Promise<void> {
    console.log(`Updating project ${id} in Dexie:`, projectData);
    // Dexie's update handles partial updates
    await db.projects.update(id, { ...projectData, updatedAt: new Date() });
}

export async function deleteProject(id: string): Promise<void> {
    console.log(`Deleting project ${id} and sub-data from Dexie`);
    // Use transaction for atomicity
    await db.transaction('rw', db.projects, db.chapters, db.scenes, db.panels, db.dialogues, db.characters, async () => {
        const projectChapters = await db.chapters.where('mangaProjectId').equals(id).toArray();
        for (const chapter of projectChapters) {
            await deleteChapter(chapter.id); // Recursive delete (handles scenes, panels, dialogues)
        }

        const projectCharacters = await db.characters.where('mangaProjectId').equals(id).toArray();
        for (const character of projectCharacters) {
            await deleteCharacter(character.id); // Also handles panel/dialogue refs
        }

        await db.projects.delete(id);
    });
    console.log(`Project ${id} deleted successfully from Dexie.`);
}


// --- Chapter Functions ---

export async function createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Promise<Chapter & { id: string }> {
    console.log('Creating chapter in Dexie:', chapterData);
    const newId = uuidv4();
    const newChapter: Chapter = {
        ...chapterData,
        id: newId,
        scenes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.chapters.add(newChapter);
    return newChapter;
}

export async function updateChapter(id: string, chapterData: DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>): Promise<void> {
    console.log(`Updating chapter ${id} in Dexie:`, chapterData);
    await db.chapters.update(id, { ...chapterData, updatedAt: new Date() });
}

export async function deleteChapter(id: string): Promise<void> {
    console.log(`Deleting chapter ${id} and sub-data from Dexie`);
    await db.transaction('rw', db.chapters, db.scenes, db.panels, db.dialogues, async () => {
        const chapterScenes = await db.scenes.where('chapterId').equals(id).toArray();
        for (const scene of chapterScenes) {
            await deleteScene(scene.id); // Recursive delete
        }
        await db.chapters.delete(id);
    });
    console.log(`Chapter ${id} deleted successfully from Dexie.`);
}

// --- Scene Functions ---

export async function createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>): Promise<Scene & { id: string }> {
    console.log('Creating scene in Dexie:', sceneData);
    const newId = uuidv4();
    const newScene: Scene = {
        ...sceneData,
        id: newId,
        panels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.scenes.add(newScene);
    return newScene;
}

export async function updateScene(id: string, sceneData: DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>): Promise<void> {
    console.log(`Updating scene ${id} in Dexie:`, sceneData);
    await db.scenes.update(id, { ...sceneData, updatedAt: new Date() });
}

export async function deleteScene(id: string): Promise<void> {
    console.log(`Deleting scene ${id} and sub-data from Dexie`);
    await db.transaction('rw', db.scenes, db.panels, db.dialogues, async () => {
        const scenePanels = await db.panels.where('sceneId').equals(id).toArray();
        for (const panel of scenePanels) {
            await deletePanel(panel.id); // Recursive delete
        }
        await db.scenes.delete(id);
    });
    console.log(`Scene ${id} deleted successfully from Dexie.`);
}

// --- Panel Functions ---

export async function createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>): Promise<Panel & { id: string }> {
    console.log('Creating panel in Dexie:', panelData);
    const newId = uuidv4();
    const newPanel: Panel = {
        ...panelData,
        id: newId,
        characterIds: Array.isArray(panelData.characterIds) ? panelData.characterIds : [],
        dialogues: [],
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.panels.add(newPanel);
    // Note: We don't populate relations here, getProject handles that
    return newPanel;
}

export async function updatePanel(id: string, panelData: DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>): Promise<void> {
    console.log(`Updating panel ${id} in Dexie:`, panelData);
    const updatePayload = { ...panelData, updatedAt: new Date() };
    // Ensure characterIds is an array if provided
    if (panelData.characterIds !== undefined) {
        updatePayload.characterIds = Array.isArray(panelData.characterIds) ? panelData.characterIds : [];
    }
    await db.panels.update(id, updatePayload);
}

export async function deletePanel(id: string): Promise<void> {
    console.log(`Deleting panel ${id} and sub-data from Dexie`);
    await db.transaction('rw', db.panels, db.dialogues, async () => {
        await db.dialogues.where('panelId').equals(id).delete();
        await db.panels.delete(id);
    });
    console.log(`Panel ${id} deleted successfully from Dexie.`);
}

// --- PanelDialogue Functions ---

export async function createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>): Promise<PanelDialogue & { id: string }> {
    console.log('Creating panel dialogue in Dexie:', dialogueData);
    const newId = uuidv4();
    const newDialogue: PanelDialogue = {
        ...dialogueData,
        id: newId,
        speaker: null, // Relations handled by getProject
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.dialogues.add(newDialogue);
    return newDialogue;
}

export async function updatePanelDialogue(id: string, dialogueData: DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>): Promise<void> {
    console.log(`Updating panel dialogue ${id} in Dexie:`, dialogueData);
    await db.dialogues.update(id, { ...dialogueData, updatedAt: new Date() });
}

export async function deletePanelDialogue(id: string): Promise<void> {
    console.log(`Deleting dialogue ${id} from Dexie`);
    await db.dialogues.delete(id);
    console.log(`Dialogue ${id} deleted successfully from Dexie.`);
}

// --- Character Functions ---

export async function getAllCharacters(projectId?: string): Promise<Character[]> {
    console.log(`Fetching all characters${projectId ? ` for project ${projectId}` : ''} from Dexie`);
    if (projectId) {
        return await db.characters.where('mangaProjectId').equals(projectId).toArray();
    }
    return await db.characters.toArray();
}

export async function getCharacter(id: string): Promise<Character | null> {
    console.log(`Fetching character ${id} from Dexie`);
    const character = await db.characters.get(id);
    return character ?? null;
}

export async function createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character & { id: string }> {
    console.log('Creating character in Dexie:', characterData);
    const newId = uuidv4();
    const newCharacter: Character = {
        ...characterData,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.characters.add(newCharacter);
    return newCharacter;
}

export async function updateCharacter(id: string, characterData: DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    console.log(`Updating character ${id} in Dexie:`, characterData);
    await db.characters.update(id, { ...characterData, updatedAt: new Date() });
}

export async function deleteCharacter(id: string): Promise<void> {
    console.log(`Deleting character ${id} from Dexie and updating references`);
    await db.transaction('rw', db.characters, db.panels, db.dialogues, async () => {
        // Remove from panels
        const panelsToUpdate = await db.panels.where('characterIds').equals(id).toArray();
        await Promise.all(panelsToUpdate.map(panel =>
            db.panels.update(panel.id, {
                characterIds: panel.characterIds.filter(charId => charId !== id),
                updatedAt: new Date()
            })
        ));

        // Remove speaker from dialogues
        await db.dialogues.where('speakerId').equals(id).modify({ speakerId: null, updatedAt: new Date() });

        await db.characters.delete(id);
    });
    console.log(`Character ${id} deleted and references updated in Dexie.`);
}


// --- Utility Function for Panel-Character Assignment ---

export async function assignCharacterToPanel(panelId: string, characterId: string): Promise<void> {
    console.log(`Assigning character ${characterId} to panel ${panelId} in Dexie`);
    await db.transaction('rw', db.panels, db.characters, async () => {
        const panel = await db.panels.get(panelId);
        if (!panel) {
            throw new Error(`Panel with ID ${panelId} not found.`);
        }
        const characterExists = await db.characters.get(characterId);
         if (!characterExists) {
            throw new Error(`Character with ID ${characterId} not found.`);
         }

        const existingCharacterIds = panel.characterIds || [];
        const updatedCharacterIds = Array.from(new Set([...existingCharacterIds, characterId]));
        await db.panels.update(panelId, { characterIds: updatedCharacterIds, updatedAt: new Date() });
    });
    console.log(`Character ${characterId} assigned to panel ${panelId} in Dexie.`);
}

export async function removeCharacterFromPanel(panelId: string, characterId: string): Promise<void> {
    console.log(`Removing character ${characterId} from panel ${panelId} in Dexie`);
     await db.transaction('rw', db.panels, async () => {
        const panel = await db.panels.get(panelId);
        if (!panel) {
            throw new Error(`Panel with ID ${panelId} not found.`);
        }
        const updatedCharacterIds = (panel.characterIds || []).filter(id => id !== characterId);
        await db.panels.update(panelId, { characterIds: updatedCharacterIds, updatedAt: new Date() });
    });
    console.log(`Character ${characterId} removed from panel ${panelId} in Dexie.`);
}


// --- Get Functions needed for context (used by updateEntity flow) ---
// These simply get the raw entity without populating relations

export async function getChapterForContext(id: string): Promise<Chapter | null> {
    const chapter = await db.chapters.get(id);
    return chapter ?? null;
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
    const scene = await db.scenes.get(id);
    return scene ?? null;
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
    const panel = await db.panels.get(id);
    return panel ?? null;
}

export async function getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    const dialogue = await db.dialogues.get(id);
    return dialogue ?? null;
}

// getCharacter function already defined serves this purpose.
export { getCharacter as getCharacterForContext };

// --- Function to get the default project ---
// We assume a single project scenario or a known default ID for now.
// In a real app, you might list projects and let the user select one.
export async function getDefaultProject(): Promise<MangaProject | null> {
    console.log("Attempting to fetch default project (proj-initial-1) from Dexie");
    // Try fetching the known initial project ID
    let project = await getProject('proj-initial-1');

    if (!project) {
        // If the initial project wasn't found (e.g., cleared storage), try fetching the first available project
        console.log("Initial project not found, fetching first available project...");
        const allProjects = await getAllProjects();
        if (allProjects.length > 0) {
            console.log(`Found ${allProjects.length} projects, using the first one: ${allProjects[0].id}`);
            project = await getProject(allProjects[0].id); // Fetch relations for the first project
        } else {
            console.log("No projects found in Dexie. Creating initial project.");
            // If no projects exist at all, create the initial one.
            // Note: populateInitialData should handle this, but this is a fallback.
            await populateInitialData(); // Ensure initial data exists
            project = await getProject('proj-initial-1'); // Try fetching again
        }
    }

    if (!project) {
         console.error("Failed to get or create a default project in Dexie.");
         return null; // Return null if still no project found
    }

    console.log("Default project fetched:", project.id);
    return project;
}
