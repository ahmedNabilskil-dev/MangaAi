// src/services/in-memory-service.ts
// Removed 'use server' - This service's functions are typically called by other server-side code (like flows),
// and the non-async 'clearInMemoryStore' caused build issues with the directive.

import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils';
import { v4 as uuidv4 } from 'uuid';
import type { IDataService } from './data-service.interface';

// --- In-Memory Store ---
interface InMemoryStore {
    projects: Map<string, MangaProject>;
    chapters: Map<string, Chapter>;
    scenes: Map<string, Scene>;
    panels: Map<string, Panel>;
    dialogues: Map<string, PanelDialogue>;
    characters: Map<string, Character>;
}

let store: InMemoryStore = {
    projects: new Map(),
    chapters: new Map(),
    scenes: new Map(),
    panels: new Map(),
    dialogues: new Map(),
    characters: new Map(),
};

// --- Helper Function to Deep Clone (to simulate immutability) ---
function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // Handle Date objects
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }
    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as any;
    }
    // Handle Objects
    const clonedObj = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}


// --- In-Memory Implementation of IDataService ---

class InMemoryDataService implements IDataService {

    // --- Initialization ---
    async initialize(): Promise<void> {
        // Check if the default project already exists
        if (!store.projects.has('proj-initial-1')) {
            console.log("InMemoryService: Initializing with default project...");
            const initialProjectId = 'proj-initial-1';
            const newProject: MangaProject = {
                id: initialProjectId,
                title: 'My First Manga Project',
                description: 'Start creating your manga here!',
                status: 'draft',
                viewCount: 0,
                likeCount: 0,
                published: false,
                chapters: [], // Initialize as empty arrays
                characters: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store.projects.set(initialProjectId, newProject);
        }
        console.log("InMemoryService initialized.");
    }

    // --- Helper to get Project with relations ---
    private _getProjectWithRelations(id: string): MangaProject | null {
        const project = store.projects.get(id);
        if (!project) return null;

        const clonedProject = deepClone(project); // Clone to avoid modifying store directly

        // Filter and sort chapters
        clonedProject.chapters = Array.from(store.chapters.values())
            .filter(c => c.mangaProjectId === id)
            .sort((a, b) => a.chapterNumber - b.chapterNumber)
            .map(c => deepClone(c)); // Clone chapters

        // Filter characters
        clonedProject.characters = Array.from(store.characters.values())
            .filter(char => char.mangaProjectId === id)
            .map(char => deepClone(char)); // Clone characters

        // Fetch nested data for chapters
        for (const chapter of clonedProject.chapters) {
            chapter.scenes = Array.from(store.scenes.values())
                .filter(s => s.chapterId === chapter.id)
                .sort((a, b) => a.order - b.order)
                .map(s => deepClone(s)); // Clone scenes

            for (const scene of chapter.scenes) {
                scene.panels = Array.from(store.panels.values())
                    .filter(p => p.sceneId === scene.id)
                    .sort((a, b) => a.order - b.order)
                    .map(p => deepClone(p)); // Clone panels

                for (const panel of scene.panels) {
                    panel.dialogues = Array.from(store.dialogues.values())
                        .filter(d => d.panelId === panel.id)
                        .sort((a, b) => a.order - b.order)
                        .map(d => {
                            const clonedDialogue = deepClone(d);
                            clonedDialogue.speaker = d.speakerId ? deepClone(store.characters.get(d.speakerId) ?? null) : null;
                            return clonedDialogue;
                        }); // Clone dialogues and speaker

                    panel.characters = (panel.characterIds ?? [])
                        .map(charId => store.characters.get(charId))
                        .filter((c): c is Character => !!c)
                        .map(c => deepClone(c)); // Clone characters
                }
            }
        }
        return clonedProject;
    }

    // --- Project ---
    async getAllProjects(): Promise<MangaProject[]> {
        console.log('InMemoryService: Fetching all projects');
        // Return shallow clones to prevent direct modification of store objects
        return Array.from(store.projects.values()).map(p => ({ ...p }));
    }

    async getProject(id: string): Promise<MangaProject | null> {
        console.log(`InMemoryService: Fetching project ${id}`);
        return this._getProjectWithRelations(id);
    }

    async createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>): Promise<MangaProject> {
        console.log('InMemoryService: Creating project:', projectData);
        const newId = uuidv4();
        const newProject: MangaProject = {
            ...projectData,
            id: newId,
            chapters: [],
            characters: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        store.projects.set(newId, deepClone(newProject)); // Store a clone
        return deepClone(newProject); // Return a clone
    }

    async updateProject(id: string, projectData: DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>): Promise<void> {
        console.log(`InMemoryService: Updating project ${id}:`, projectData);
        const existingProject = store.projects.get(id);
        if (existingProject) {
            // Apply partial updates carefully
            const updatedProject = { ...existingProject, ...projectData, updatedAt: new Date() };
            store.projects.set(id, deepClone(updatedProject)); // Store updated clone
        } else {
            console.warn(`InMemoryService: Project ${id} not found for update.`);
        }
    }

    async deleteProject(id: string): Promise<void> {
        console.log(`InMemoryService: Deleting project ${id} and sub-data`);
        const chaptersToDelete = Array.from(store.chapters.values()).filter(c => c.mangaProjectId === id);
        const charactersToDelete = Array.from(store.characters.values()).filter(c => c.mangaProjectId === id);

        // Cascade delete
        for (const chapter of chaptersToDelete) {
            await this.deleteChapter(chapter.id);
        }
        for (const character of charactersToDelete) {
            await this.deleteCharacter(character.id);
        }

        const deleted = store.projects.delete(id);
        if (deleted) {
            console.log(`InMemoryService: Project ${id} deleted successfully.`);
        } else {
             console.warn(`InMemoryService: Project ${id} not found for deletion.`);
        }
    }

     async getDefaultProject(): Promise<MangaProject | null> {
        console.log("InMemoryService: Attempting to fetch default project (proj-initial-1)");
        let project = this._getProjectWithRelations('proj-initial-1');

        if (!project) {
            console.log("InMemoryService: Initial project not found, checking if any project exists...");
            const allProjects = Array.from(store.projects.values());
            if (allProjects.length > 0) {
                 console.log(`InMemoryService: Found ${allProjects.length} projects, using the first one: ${allProjects[0].id}`);
                 project = this._getProjectWithRelations(allProjects[0].id);
            } else {
                 console.log("InMemoryService: No projects found. Initializing default project.");
                 // Initialize if store is empty
                 await this.initialize();
                 project = this._getProjectWithRelations('proj-initial-1');
            }
        }

         if (!project) {
              console.error("InMemoryService: Failed to get or initialize a default project.");
              return null;
         }

         console.log("InMemoryService: Default project fetched:", project.id);
         return project;
     }


    // --- Chapter ---
    async createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Promise<Chapter> {
        console.log('InMemoryService: Creating chapter:', chapterData);
        if (!store.projects.has(chapterData.mangaProjectId)) {
            throw new Error(`Project ${chapterData.mangaProjectId} not found.`);
        }
        const newId = uuidv4();
        const newChapter: Chapter = {
            ...chapterData,
            id: newId,
            scenes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        store.chapters.set(newId, deepClone(newChapter));
        return deepClone(newChapter);
    }

    async updateChapter(id: string, chapterData: DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>): Promise<void> {
        console.log(`InMemoryService: Updating chapter ${id}:`, chapterData);
        const existing = store.chapters.get(id);
        if (existing) {
            store.chapters.set(id, deepClone({ ...existing, ...chapterData, updatedAt: new Date() }));
        }
    }

    async deleteChapter(id: string): Promise<void> {
        console.log(`InMemoryService: Deleting chapter ${id} and sub-data`);
        const scenesToDelete = Array.from(store.scenes.values()).filter(s => s.chapterId === id);
        for (const scene of scenesToDelete) {
            await this.deleteScene(scene.id);
        }
        store.chapters.delete(id);
    }

    async getChapterForContext(id: string): Promise<Chapter | null> {
        const chapter = store.chapters.get(id);
        return chapter ? deepClone(chapter) : null;
    }

    // --- Scene ---
    async createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>): Promise<Scene> {
        console.log('InMemoryService: Creating scene:', sceneData);
         if (!store.chapters.has(sceneData.chapterId)) {
            throw new Error(`Chapter ${sceneData.chapterId} not found.`);
        }
        const newId = uuidv4();
        const newScene: Scene = {
            ...sceneData,
            id: newId,
            panels: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        store.scenes.set(newId, deepClone(newScene));
        return deepClone(newScene);
    }

    async updateScene(id: string, sceneData: DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>): Promise<void> {
        console.log(`InMemoryService: Updating scene ${id}:`, sceneData);
        const existing = store.scenes.get(id);
        if (existing) {
             store.scenes.set(id, deepClone({ ...existing, ...sceneData, updatedAt: new Date() }));
        }
    }

    async deleteScene(id: string): Promise<void> {
        console.log(`InMemoryService: Deleting scene ${id} and sub-data`);
        const panelsToDelete = Array.from(store.panels.values()).filter(p => p.sceneId === id);
        for (const panel of panelsToDelete) {
            await this.deletePanel(panel.id);
        }
        store.scenes.delete(id);
    }

    async getSceneForContext(id: string): Promise<Scene | null> {
        const scene = store.scenes.get(id);
        return scene ? deepClone(scene) : null;
    }


    // --- Panel ---
    async createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>): Promise<Panel> {
        console.log('InMemoryService: Creating panel:', panelData);
        if (!store.scenes.has(panelData.sceneId)) {
            throw new Error(`Scene ${panelData.sceneId} not found.`);
        }
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
        store.panels.set(newId, deepClone(newPanel));
        return deepClone(newPanel);
    }

    async updatePanel(id: string, panelData: DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>): Promise<void> {
        console.log(`InMemoryService: Updating panel ${id}:`, panelData);
        const existing = store.panels.get(id);
        if (existing) {
             const updatePayload = { ...existing, ...panelData, updatedAt: new Date() };
             if (panelData.characterIds !== undefined) {
                updatePayload.characterIds = Array.isArray(panelData.characterIds) ? panelData.characterIds : [];
             }
             store.panels.set(id, deepClone(updatePayload));
        }
    }

    async deletePanel(id: string): Promise<void> {
        console.log(`InMemoryService: Deleting panel ${id} and sub-data`);
        const dialoguesToDelete = Array.from(store.dialogues.values()).filter(d => d.panelId === id);
        for (const dialogue of dialoguesToDelete) {
            store.dialogues.delete(dialogue.id);
        }
        store.panels.delete(id);
    }

     async assignCharacterToPanel(panelId: string, characterId: string): Promise<void> {
        console.log(`InMemoryService: Assigning character ${characterId} to panel ${panelId}`);
        const panel = store.panels.get(panelId);
        if (!panel) throw new Error(`Panel ${panelId} not found.`);
        if (!store.characters.has(characterId)) throw new Error(`Character ${characterId} not found.`);

        const updatedIds = Array.from(new Set([...(panel.characterIds || []), characterId]));
        store.panels.set(panelId, deepClone({ ...panel, characterIds: updatedIds, updatedAt: new Date() }));
    }

    async removeCharacterFromPanel(panelId: string, characterId: string): Promise<void> {
         console.log(`InMemoryService: Removing character ${characterId} from panel ${panelId}`);
         const panel = store.panels.get(panelId);
         if (!panel) throw new Error(`Panel ${panelId} not found.`);
         const updatedIds = (panel.characterIds || []).filter(id => id !== characterId);
         store.panels.set(panelId, deepClone({ ...panel, characterIds: updatedIds, updatedAt: new Date() }));
    }

    async getPanelForContext(id: string): Promise<Panel | null> {
        const panel = store.panels.get(id);
        return panel ? deepClone(panel) : null;
    }


    // --- Dialogue ---
    async createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>): Promise<PanelDialogue> {
        console.log('InMemoryService: Creating dialogue:', dialogueData);
         if (!store.panels.has(dialogueData.panelId)) {
            throw new Error(`Panel ${dialogueData.panelId} not found.`);
        }
        if (dialogueData.speakerId && !store.characters.has(dialogueData.speakerId)) {
             console.warn(`Speaker character ${dialogueData.speakerId} not found.`);
             // Optionally throw error or proceed with null speaker
        }
        const newId = uuidv4();
        const newDialogue: PanelDialogue = {
            ...dialogueData,
            id: newId,
            speaker: null, // Relations handled separately
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        store.dialogues.set(newId, deepClone(newDialogue));
        return deepClone(newDialogue);
    }

    async updatePanelDialogue(id: string, dialogueData: DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>): Promise<void> {
        console.log(`InMemoryService: Updating dialogue ${id}:`, dialogueData);
        const existing = store.dialogues.get(id);
        if (existing) {
             store.dialogues.set(id, deepClone({ ...existing, ...dialogueData, updatedAt: new Date() }));
        }
    }

    async deletePanelDialogue(id: string): Promise<void> {
        console.log(`InMemoryService: Deleting dialogue ${id}`);
        store.dialogues.delete(id);
    }

    async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
        const dialogue = store.dialogues.get(id);
        if (!dialogue) return null;
        const cloned = deepClone(dialogue);
        cloned.speaker = dialogue.speakerId ? deepClone(store.characters.get(dialogue.speakerId) ?? null) : null;
        return cloned;
    }

    // --- Character ---
    async getAllCharacters(projectId?: string): Promise<Character[]> {
        console.log(`InMemoryService: Fetching all characters${projectId ? ` for project ${projectId}` : ''}`);
        const characters = Array.from(store.characters.values());
        const filtered = projectId ? characters.filter(c => c.mangaProjectId === projectId) : characters;
        return filtered.map(c => deepClone(c)); // Return clones
    }

    async getCharacter(id: string): Promise<Character | null> {
        console.log(`InMemoryService: Fetching character ${id}`);
        const character = store.characters.get(id);
        return character ? deepClone(character) : null;
    }
    getCharacterForContext = this.getCharacter; // Alias

    async createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
        console.log('InMemoryService: Creating character:', characterData);
         if (!store.projects.has(characterData.mangaProjectId)) {
            throw new Error(`Project ${characterData.mangaProjectId} not found.`);
        }
        const newId = uuidv4();
        const newCharacter: Character = {
            ...characterData,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        store.characters.set(newId, deepClone(newCharacter));
        return deepClone(newCharacter);
    }

    async updateCharacter(id: string, characterData: DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
        console.log(`InMemoryService: Updating character ${id}:`, characterData);
        const existing = store.characters.get(id);
        if (existing) {
            store.characters.set(id, deepClone({ ...existing, ...characterData, updatedAt: new Date() }));
        }
    }

    async deleteCharacter(id: string): Promise<void> {
        console.log(`InMemoryService: Deleting character ${id} and references`);
        // Remove from panels
        store.panels.forEach(panel => {
            if (panel.characterIds?.includes(id)) {
                panel.characterIds = panel.characterIds.filter(charId => charId !== id);
                panel.updatedAt = new Date();
            }
        });
        // Remove speaker from dialogues
        store.dialogues.forEach(dialogue => {
            if (dialogue.speakerId === id) {
                dialogue.speakerId = null;
                dialogue.updatedAt = new Date();
            }
        });
        store.characters.delete(id);
        console.log(`InMemoryService: Character ${id} deleted.`);
    }
}

// Export an instance of the in-memory service implementation
export const inMemoryDataService = new InMemoryDataService();

// Initialize the service on module load (for server or client)
inMemoryDataService.initialize();

// Function to clear the in-memory store (useful for testing)
// Not marked with 'use server' as it's a utility, not a Server Action
export function clearInMemoryStore() {
    store = {
        projects: new Map(),
        chapters: new Map(),
        scenes: new Map(),
        panels: new Map(),
        dialogues: new Map(),
        characters: new Map(),
    };
     console.log("In-memory store cleared.");
     // Re-initialize with default project after clearing
     inMemoryDataService.initialize();
}
