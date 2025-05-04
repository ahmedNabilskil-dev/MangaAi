
'use server';

import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils';
import { MangaStatus } from '@/types/enums';

// --- In-Memory Data Store ---
let projects = new Map<string, MangaProject>();
let chapters = new Map<string, Chapter>();
let scenes = new Map<string, Scene>();
let panels = new Map<string, Panel>();
let dialogues = new Map<string, PanelDialogue>();
let characters = new Map<string, Character>();

let nextProjectId = 1;
let nextChapterId = 1;
let nextSceneId = 1;
let nextPanelId = 1;
let nextDialogueId = 1;
let nextCharacterId = 1;

// --- Initial Dummy Data ---
function initializeDefaultProject() {
    projects.clear();
    chapters.clear();
    scenes.clear();
    panels.clear();
    dialogues.clear();
    characters.clear();
    nextProjectId = 1;
    nextChapterId = 1;
    nextSceneId = 1;
    nextPanelId = 1;
    nextDialogueId = 1;
    nextCharacterId = 1;

    const defaultProjectId = `proj-${nextProjectId++}`;
    const defaultProject: MangaProject = {
        id: defaultProjectId,
        title: 'My First Manga Project',
        description: 'A sample project using the in-memory store.',
        status: MangaStatus.DRAFT,
        initialPrompt: 'Create a simple manga story.',
        genre: 'Slice of Life',
        artStyle: 'Simple',
        creatorId: 'user-1', // Placeholder
        viewCount: 0,
        likeCount: 0,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: [],
        characters: [],
    };
    projects.set(defaultProjectId, defaultProject);
    console.log("Initialized in-memory store with default project:", defaultProjectId);
}

// Initialize on server start (or first import)
initializeDefaultProject();
const DEFAULT_PROJECT_ID = 'proj-1';

// --- Helper Functions ---
function generateId(prefix: 'proj' | 'chap' | 'scene' | 'panel' | 'dlg' | 'char'): string {
    switch (prefix) {
        case 'proj': return `proj-${nextProjectId++}`;
        case 'chap': return `chap-${nextChapterId++}`;
        case 'scene': return `scene-${nextSceneId++}`;
        case 'panel': return `panel-${nextPanelId++}`;
        case 'dlg': return `dlg-${nextDialogueId++}`;
        case 'char': return `char-${nextCharacterId++}`;
    }
}

// Deep copy helper to prevent accidental mutation
function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// --- MangaProject Functions ---

export async function getAllProjects(): Promise<MangaProject[]> {
    console.log('Fetching all projects from memory');
    return deepCopy(Array.from(projects.values()));
}

export async function getProject(id: string): Promise<MangaProject | null> {
    console.log(`Fetching project ${id} from memory`);
    const project = projects.get(id);
    if (!project) return null;

    const projectCopy = deepCopy(project);

    // Fetch related data
    projectCopy.chapters = Array.from(chapters.values())
        .filter(c => c.mangaProjectId === id)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);

    projectCopy.characters = Array.from(characters.values())
        .filter(c => c.mangaProjectId === id);

    // Fetch nested data
    for (const chapter of projectCopy.chapters) {
        chapter.scenes = Array.from(scenes.values())
            .filter(s => s.chapterId === chapter.id)
            .sort((a, b) => a.order - b.order);

        for (const scene of chapter.scenes) {
            scene.panels = Array.from(panels.values())
                .filter(p => p.sceneId === scene.id)
                .sort((a, b) => a.order - b.order);

            for (const panel of scene.panels) {
                panel.dialogues = Array.from(dialogues.values())
                    .filter(d => d.panelId === panel.id)
                    .sort((a, b) => a.order - b.order);

                for (const dialogue of panel.dialogues) {
                    if (dialogue.speakerId) {
                        dialogue.speaker = deepCopy(characters.get(dialogue.speakerId) || null);
                    }
                }

                panel.characters = (panel.characterIds || [])
                    .map(charId => deepCopy(characters.get(charId)))
                    .filter((c): c is Character => !!c);
            }
        }
    }

    return projectCopy;
}

export async function createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>): Promise<MangaProject & { id: string }> {
    console.log('Creating project in memory:', projectData);
    const newId = generateId('proj');
    const newProject: MangaProject = {
        ...deepCopy(projectData),
        id: newId,
        chapters: [],
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    projects.set(newId, newProject);
    return deepCopy(newProject);
}

export async function updateProject(id: string, projectData: DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>): Promise<void> {
    console.log(`Updating project ${id} in memory:`, projectData);
    const existingProject = projects.get(id);
    if (!existingProject) {
        throw new Error(`Project with ID ${id} not found.`);
    }
    // Simple merge, might need deeper merging logic depending on needs
    const updatedProject = {
        ...existingProject,
        ...deepCopy(projectData),
        updatedAt: new Date(),
    };
    projects.set(id, updatedProject);
}

export async function deleteProject(id: string): Promise<void> {
    console.log(`Deleting project ${id} and sub-data from memory`);
    if (!projects.has(id)) return;

    // Delete chapters and their children
    const projectChapters = Array.from(chapters.values()).filter(c => c.mangaProjectId === id);
    for (const chapter of projectChapters) {
        await deleteChapter(chapter.id); // Cascading delete
    }

    // Delete characters associated with the project
    const projectCharacters = Array.from(characters.values()).filter(c => c.mangaProjectId === id);
    for (const character of projectCharacters) {
        await deleteCharacter(character.id); // Also handles panel refs removal
    }


    projects.delete(id);
    console.log(`Project ${id} deleted successfully.`);
}

// --- Chapter Functions ---

export async function createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Promise<Chapter & { id: string }> {
    console.log('Creating chapter in memory:', chapterData);
    const newId = generateId('chap');
    const newChapter: Chapter = {
        ...deepCopy(chapterData),
        id: newId,
        scenes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    chapters.set(newId, newChapter);
    return deepCopy(newChapter);
}

export async function updateChapter(id: string, chapterData: DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>): Promise<void> {
    console.log(`Updating chapter ${id} in memory:`, chapterData);
    const existingChapter = chapters.get(id);
    if (!existingChapter) {
        throw new Error(`Chapter with ID ${id} not found.`);
    }
    const updatedChapter = {
        ...existingChapter,
        ...deepCopy(chapterData),
        updatedAt: new Date(),
    };
    chapters.set(id, updatedChapter);
}

export async function deleteChapter(id: string): Promise<void> {
    console.log(`Deleting chapter ${id} and sub-data from memory`);
    if (!chapters.has(id)) return;

    // Delete scenes and their children
    const chapterScenes = Array.from(scenes.values()).filter(s => s.chapterId === id);
    for (const scene of chapterScenes) {
        await deleteScene(scene.id); // Cascading delete
    }

    chapters.delete(id);
    console.log(`Chapter ${id} deleted successfully.`);
}

// --- Scene Functions ---

export async function createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>): Promise<Scene & { id: string }> {
    console.log('Creating scene in memory:', sceneData);
    const newId = generateId('scene');
    const newScene: Scene = {
        ...deepCopy(sceneData),
        id: newId,
        panels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    scenes.set(newId, newScene);
    return deepCopy(newScene);
}

export async function updateScene(id: string, sceneData: DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>): Promise<void> {
    console.log(`Updating scene ${id} in memory:`, sceneData);
    const existingScene = scenes.get(id);
    if (!existingScene) {
        throw new Error(`Scene with ID ${id} not found.`);
    }
    const updatedScene = {
        ...existingScene,
        ...deepCopy(sceneData),
        updatedAt: new Date(),
    };
    scenes.set(id, updatedScene);
}

export async function deleteScene(id: string): Promise<void> {
    console.log(`Deleting scene ${id} and sub-data from memory`);
    if (!scenes.has(id)) return;

    // Delete panels and their children
    const scenePanels = Array.from(panels.values()).filter(p => p.sceneId === id);
    for (const panel of scenePanels) {
        await deletePanel(panel.id); // Cascading delete
    }

    scenes.delete(id);
    console.log(`Scene ${id} deleted successfully.`);
}


// --- Panel Functions ---

export async function createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>): Promise<Panel & { id: string }> {
    console.log('Creating panel in memory:', panelData);
    const newId = generateId('panel');
    const newPanel: Panel = {
        ...deepCopy(panelData),
        id: newId,
        characterIds: Array.isArray(panelData.characterIds) ? panelData.characterIds : [],
        dialogues: [],
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    panels.set(newId, newPanel);
    // Simulate populating characters immediately after creation
    newPanel.characters = newPanel.characterIds
        .map(charId => deepCopy(characters.get(charId)))
        .filter((c): c is Character => !!c);
    return deepCopy(newPanel);
}

export async function updatePanel(id: string, panelData: DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>): Promise<void> {
    console.log(`Updating panel ${id} in memory:`, panelData);
    const existingPanel = panels.get(id);
    if (!existingPanel) {
        throw new Error(`Panel with ID ${id} not found.`);
    }
    const updatedPanel = {
        ...existingPanel,
        ...deepCopy(panelData),
        updatedAt: new Date(),
    };
    // Ensure characterIds is an array if updated
    if (panelData.characterIds !== undefined) {
        updatedPanel.characterIds = Array.isArray(panelData.characterIds) ? panelData.characterIds : [];
    }

    panels.set(id, updatedPanel);
}

export async function deletePanel(id: string): Promise<void> {
    console.log(`Deleting panel ${id} and sub-data from memory`);
    if (!panels.has(id)) return;

    // Delete dialogues
    const panelDialogues = Array.from(dialogues.values()).filter(d => d.panelId === id);
    for (const dialogue of panelDialogues) {
        await deletePanelDialogue(dialogue.id);
    }

    panels.delete(id);
    console.log(`Panel ${id} deleted successfully.`);
}

// --- PanelDialogue Functions ---

export async function createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>): Promise<PanelDialogue & { id: string }> {
    console.log('Creating panel dialogue in memory:', dialogueData);
    const newId = generateId('dlg');
    const newDialogue: PanelDialogue = {
        ...deepCopy(dialogueData),
        id: newId,
        speaker: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    if (newDialogue.speakerId) {
        newDialogue.speaker = deepCopy(characters.get(newDialogue.speakerId) || null);
    }
    dialogues.set(newId, newDialogue);
    return deepCopy(newDialogue);
}

export async function updatePanelDialogue(id: string, dialogueData: DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>): Promise<void> {
    console.log(`Updating panel dialogue ${id} in memory:`, dialogueData);
    const existingDialogue = dialogues.get(id);
    if (!existingDialogue) {
        throw new Error(`Dialogue with ID ${id} not found.`);
    }
    const updatedDialogue = {
        ...existingDialogue,
        ...deepCopy(dialogueData),
        updatedAt: new Date(),
    };
    // Update speaker object if speakerId changes
    if (dialogueData.speakerId !== undefined) {
        updatedDialogue.speaker = deepCopy(characters.get(dialogueData.speakerId as string) || null);
    }
    dialogues.set(id, updatedDialogue);
}

export async function deletePanelDialogue(id: string): Promise<void> {
    console.log(`Deleting dialogue ${id} from memory`);
    if (!dialogues.has(id)) return;
    dialogues.delete(id);
    console.log(`Dialogue ${id} deleted successfully.`);
}

// --- Character Functions ---

export async function getAllCharacters(projectId?: string): Promise<Character[]> {
    console.log(`Fetching all characters${projectId ? ` for project ${projectId}` : ''} from memory`);
    const all = deepCopy(Array.from(characters.values()));
    if (projectId) {
        return all.filter(c => c.mangaProjectId === projectId);
    }
    return all;
}

export async function getCharacter(id: string): Promise<Character | null> {
    console.log(`Fetching character ${id} from memory`);
    const character = characters.get(id);
    return character ? deepCopy(character) : null;
}

export async function createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character & { id: string }> {
    console.log('Creating character in memory:', characterData);
    const newId = generateId('char');
    const newCharacter: Character = {
        ...deepCopy(characterData),
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    characters.set(newId, newCharacter);
    return deepCopy(newCharacter);
}

export async function updateCharacter(id: string, characterData: DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    console.log(`Updating character ${id} in memory:`, characterData);
    const existingCharacter = characters.get(id);
    if (!existingCharacter) {
        throw new Error(`Character with ID ${id} not found.`);
    }
    const updatedCharacter = {
        ...existingCharacter,
        ...deepCopy(characterData),
        updatedAt: new Date(),
    };
    characters.set(id, updatedCharacter);
}

export async function deleteCharacter(id: string): Promise<void> {
    console.log(`Deleting character ${id} from memory and removing panel/dialogue references`);
    if (!characters.has(id)) return;

    // Remove references from panels
    panels.forEach((panel, panelId) => {
        if (panel.characterIds?.includes(id)) {
            const updatedCharacterIds = panel.characterIds.filter(charId => charId !== id);
            panels.set(panelId, { ...panel, characterIds: updatedCharacterIds, updatedAt: new Date() });
        }
    });

    // Remove references from dialogues (set speakerId to null)
    dialogues.forEach((dialogue, dialogueId) => {
        if (dialogue.speakerId === id) {
            dialogues.set(dialogueId, { ...dialogue, speakerId: null, speaker: null, updatedAt: new Date() });
        }
    });

    characters.delete(id);
    console.log(`Character ${id} deleted and references removed successfully.`);
}

// --- Utility Function for Panel-Character Assignment ---

export async function assignCharacterToPanel(panelId: string, characterId: string): Promise<void> {
    console.log(`Assigning character ${characterId} to panel ${panelId} in memory`);
    const panel = panels.get(panelId);
    if (!panel) {
        throw new Error(`Panel with ID ${panelId} not found.`);
    }
    if (!characters.has(characterId)) {
         throw new Error(`Character with ID ${characterId} not found.`);
    }

    const existingCharacterIds = panel.characterIds || [];
    const updatedCharacterIds = Array.from(new Set([...existingCharacterIds, characterId]));
    panels.set(panelId, { ...panel, characterIds: updatedCharacterIds, updatedAt: new Date() });
    console.log(`Character ${characterId} assigned to panel ${panelId}.`);
}

export async function removeCharacterFromPanel(panelId: string, characterId: string): Promise<void> {
    console.log(`Removing character ${characterId} from panel ${panelId} in memory`);
    const panel = panels.get(panelId);
    if (!panel) {
        throw new Error(`Panel with ID ${panelId} not found.`);
    }

    const updatedCharacterIds = (panel.characterIds || []).filter(id => id !== characterId);
    panels.set(panelId, { ...panel, characterIds: updatedCharacterIds, updatedAt: new Date() });
    console.log(`Character ${characterId} removed from panel ${panelId}.`);
}

// --- Get Functions needed for context ---

export async function getChapterForContext(id: string): Promise<Chapter | null> {
    const chapter = chapters.get(id);
    return chapter ? deepCopy(chapter) : null;
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
    const scene = scenes.get(id);
    return scene ? deepCopy(scene) : null;
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
    const panel = panels.get(id);
    return panel ? deepCopy(panel) : null;
}

export async function getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    const dialogue = dialogues.get(id);
    return dialogue ? deepCopy(dialogue) : null;
}

// Export the default project ID for use in the UI
export { DEFAULT_PROJECT_ID };
