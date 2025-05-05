// src/services/data-service.ts
'use server'; // Mark this module as potentially running server-side

import type { IDataService } from './data-service.interface';
import { dexieDataService } from './dexie-service';
import { inMemoryDataService } from './in-memory-service';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils';


// --- Configuration ---
// Change this variable to switch between data service implementations.
// Use environment variables in a real application.
const ACTIVE_SERVICE_TYPE: 'dexie' | 'in-memory' = 'dexie'; // or 'in-memory'

// --- Service Instance (Internal) ---
// This instance is NOT exported directly when 'use server' is active.
let activeDataService: IDataService;

if (ACTIVE_SERVICE_TYPE === 'dexie') {
    activeDataService = dexieDataService;
    console.log("Using DexieDataService");
} else {
    activeDataService = inMemoryDataService;
    console.log("Using InMemoryDataService");
}


// --- Export individual async functions ---
// This ensures compliance with the 'use server' directive.

// --- Project ---
export async function getAllProjects(): Promise<MangaProject[]> {
    return activeDataService.getAllProjects();
}
export async function getProject(id: string): Promise<MangaProject | null> {
    return activeDataService.getProject(id);
}
export async function createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>): Promise<MangaProject> {
    return activeDataService.createProject(projectData);
}
export async function updateProject(id: string, projectData: DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>): Promise<void> {
    return activeDataService.updateProject(id, projectData);
}
export async function deleteProject(id: string): Promise<void> {
    return activeDataService.deleteProject(id);
}
export async function getDefaultProject(): Promise<MangaProject | null> {
    return activeDataService.getDefaultProject();
}

// --- Chapter ---
export async function createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Promise<Chapter> {
    return activeDataService.createChapter(chapterData);
}
export async function updateChapter(id: string, chapterData: DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>): Promise<void> {
    return activeDataService.updateChapter(id, chapterData);
}
export async function deleteChapter(id: string): Promise<void> {
    return activeDataService.deleteChapter(id);
}
export async function getChapterForContext(id: string): Promise<Chapter | null> {
    return activeDataService.getChapterForContext(id);
}

// --- Scene ---
export async function createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>): Promise<Scene> {
    return activeDataService.createScene(sceneData);
}
export async function updateScene(id: string, sceneData: DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>): Promise<void> {
    return activeDataService.updateScene(id, sceneData);
}
export async function deleteScene(id: string): Promise<void> {
    return activeDataService.deleteScene(id);
}
export async function getSceneForContext(id: string): Promise<Scene | null> {
    return activeDataService.getSceneForContext(id);
}

// --- Panel ---
export async function createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>): Promise<Panel> {
    return activeDataService.createPanel(panelData);
}
export async function updatePanel(id: string, panelData: DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>): Promise<void> {
    return activeDataService.updatePanel(id, panelData);
}
export async function deletePanel(id: string): Promise<void> {
    return activeDataService.deletePanel(id);
}
export async function assignCharacterToPanel(panelId: string, characterId: string): Promise<void> {
    return activeDataService.assignCharacterToPanel(panelId, characterId);
}
export async function removeCharacterFromPanel(panelId: string, characterId: string): Promise<void> {
    return activeDataService.removeCharacterFromPanel(panelId, characterId);
}
export async function getPanelForContext(id: string): Promise<Panel | null> {
    return activeDataService.getPanelForContext(id);
}

// --- Dialogue ---
export async function createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>): Promise<PanelDialogue> {
    return activeDataService.createPanelDialogue(dialogueData);
}
export async function updatePanelDialogue(id: string, dialogueData: DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>): Promise<void> {
    return activeDataService.updatePanelDialogue(id, dialogueData);
}
export async function deletePanelDialogue(id: string): Promise<void> {
    return activeDataService.deletePanelDialogue(id);
}
export async function getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    return activeDataService.getPanelDialogueForContext(id);
}

// --- Character ---
export async function getAllCharacters(projectId?: string): Promise<Character[]> {
    return activeDataService.getAllCharacters(projectId);
}
export async function getCharacter(id: string): Promise<Character | null> {
    return activeDataService.getCharacter(id);
}
export async function createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    return activeDataService.createCharacter(characterData);
}
export async function updateCharacter(id: string, characterData: DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    return activeDataService.updateCharacter(id, characterData);
}
export async function deleteCharacter(id: string): Promise<void> {
    return activeDataService.deleteCharacter(id);
}
export async function getCharacterForContext(id: string): Promise<Character | null> {
    return activeDataService.getCharacterForContext(id);
}

// --- Initialization (call if needed, depends on service) ---
export async function initializeDataService(): Promise<void> {
    if (activeDataService.initialize) {
        return activeDataService.initialize();
    }
    return Promise.resolve();
}
// Example: Call initializeDataService() at application startup if required by the active service.
