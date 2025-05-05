// src/services/dexie-service.ts
'use server'; // Keep if Dexie operations are primarily server-side (or remove if used client-side)

import { db } from '@/db/dexie'; // Assuming dexie instance is here
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils';
import { v4 as uuidv4 } from 'uuid';
import type { IDataService } from './data-service.interface';

// --- Dexie Implementation of IDataService ---

class DexieDataService implements IDataService {

    // --- Project ---
    async getAllProjects(): Promise<MangaProject[]> {
        console.log('DexieService: Fetching all projects');
        return await db.projects.toArray();
    }

    async getProject(id: string): Promise<MangaProject | null> {
        console.log(`DexieService: Fetching project ${id} and related data`);
        const project = await db.projects.get(id);
        if (!project) return null;

        const [chaptersData, charactersData] = await Promise.all([
            db.chapters.where('mangaProjectId').equals(id).sortBy('chapterNumber'),
            db.characters.where('mangaProjectId').equals(id).toArray()
        ]);

        project.chapters = chaptersData;
        project.characters = charactersData;

        for (const chapter of project.chapters) {
            chapter.scenes = await db.scenes.where('chapterId').equals(chapter.id).sortBy('order');
            for (const scene of chapter.scenes) {
                scene.panels = await db.panels.where('sceneId').equals(scene.id).sortBy('order');
                for (const panel of scene.panels) {
                    const dialoguesData = await db.dialogues.where('panelId').equals(panel.id).sortBy('order');
                    const speakerIds = dialoguesData.map(d => d.speakerId).filter((id): id is string => !!id);
                    const speakers = speakerIds.length > 0 ? await db.characters.bulkGet(speakerIds) : [];
                    const speakerMap = new Map(speakers.filter((s): s is Character => !!s).map(s => [s!.id, s]));

                    panel.dialogues = dialoguesData.map(d => ({
                        ...d,
                        speaker: d.speakerId ? speakerMap.get(d.speakerId) ?? null : null
                    }));

                    panel.characters = panel.characterIds && panel.characterIds.length > 0
                        ? (await db.characters.bulkGet(panel.characterIds)).filter((c): c is Character => !!c)
                        : [];
                }
            }
        }
        return project;
    }

    async createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>): Promise<MangaProject> {
        console.log('DexieService: Creating project:', projectData);
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

    async updateProject(id: string, projectData: DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters'>>): Promise<void> {
        console.log(`DexieService: Updating project ${id}:`, projectData);
        await db.projects.update(id, { ...projectData, updatedAt: new Date() });
    }

    async deleteProject(id: string): Promise<void> {
        console.log(`DexieService: Deleting project ${id} and sub-data`);
        await db.transaction('rw', db.projects, db.chapters, db.scenes, db.panels, db.dialogues, db.characters, async () => {
            const projectChapters = await db.chapters.where('mangaProjectId').equals(id).toArray();
            for (const chapter of projectChapters) {
                await this.deleteChapter(chapter.id);
            }
            const projectCharacters = await db.characters.where('mangaProjectId').equals(id).toArray();
            for (const character of projectCharacters) {
                await this.deleteCharacter(character.id);
            }
            await db.projects.delete(id);
        });
        console.log(`DexieService: Project ${id} deleted successfully.`);
    }

     async getDefaultProject(): Promise<MangaProject | null> {
         console.log("DexieService: Attempting to fetch default project (proj-initial-1)");
         let project = await this.getProject('proj-initial-1');

         if (!project) {
             console.log("DexieService: Initial project not found, fetching first available project...");
             const allProjects = await this.getAllProjects();
             if (allProjects.length > 0) {
                 console.log(`DexieService: Found ${allProjects.length} projects, using the first one: ${allProjects[0].id}`);
                 project = await this.getProject(allProjects[0].id);
             } else {
                 console.log("DexieService: No projects found. Creating initial project.");
                 try {
                     project = await this.createProject({
                         title: 'My First Manga Project',
                         description: 'Start creating your manga here!',
                         status: 'draft',
                         viewCount: 0,
                         likeCount: 0,
                         published: false,
                     });
                     // Manually set the ID for consistency if needed, though createProject handles it
                     // Or adjust createProject to allow ID override for this specific case
                     console.log("DexieService: Initial project created with ID:", project.id);

                     // Now, try to fetch it again to ensure it has the expected ID structure if createProject assigned one
                     // This part might be tricky if createProject uses UUID. We might need a fixed ID.
                     // Let's assume createProject assigns the ID 'proj-initial-1' if possible, or adjust getDefaultProject logic
                     // For simplicity, let's assume createProject worked and returned the new project
                     project = await this.getProject(project.id); // Fetch again to get relations if any were added

                 } catch (error) {
                      console.error("DexieService: Error creating initial project:", error);
                      return null;
                 }
             }
         }

         if (!project) {
              console.error("DexieService: Failed to get or create a default project.");
              return null;
         }

         console.log("DexieService: Default project fetched:", project.id);
         return project;
     }


    // --- Chapter ---
    async createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Promise<Chapter> {
        console.log('DexieService: Creating chapter:', chapterData);
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

    async updateChapter(id: string, chapterData: DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>): Promise<void> {
        console.log(`DexieService: Updating chapter ${id}:`, chapterData);
        await db.chapters.update(id, { ...chapterData, updatedAt: new Date() });
    }

    async deleteChapter(id: string): Promise<void> {
        console.log(`DexieService: Deleting chapter ${id} and sub-data`);
        await db.transaction('rw', db.chapters, db.scenes, db.panels, db.dialogues, async () => {
            const chapterScenes = await db.scenes.where('chapterId').equals(id).toArray();
            for (const scene of chapterScenes) {
                await this.deleteScene(scene.id);
            }
            await db.chapters.delete(id);
        });
        console.log(`DexieService: Chapter ${id} deleted successfully.`);
    }

    async getChapterForContext(id: string): Promise<Chapter | null> {
        const chapter = await db.chapters.get(id);
        return chapter ?? null;
    }

    // --- Scene ---
    async createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>): Promise<Scene> {
        console.log('DexieService: Creating scene:', sceneData);
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

    async updateScene(id: string, sceneData: DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>): Promise<void> {
        console.log(`DexieService: Updating scene ${id}:`, sceneData);
        await db.scenes.update(id, { ...sceneData, updatedAt: new Date() });
    }

    async deleteScene(id: string): Promise<void> {
        console.log(`DexieService: Deleting scene ${id} and sub-data`);
        await db.transaction('rw', db.scenes, db.panels, db.dialogues, async () => {
            const scenePanels = await db.panels.where('sceneId').equals(id).toArray();
            for (const panel of scenePanels) {
                await this.deletePanel(panel.id);
            }
            await db.scenes.delete(id);
        });
        console.log(`DexieService: Scene ${id} deleted successfully.`);
    }

    async getSceneForContext(id: string): Promise<Scene | null> {
        const scene = await db.scenes.get(id);
        return scene ?? null;
    }

    // --- Panel ---
    async createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>): Promise<Panel> {
        console.log('DexieService: Creating panel:', panelData);
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
        return newPanel;
    }

    async updatePanel(id: string, panelData: DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>): Promise<void> {
        console.log(`DexieService: Updating panel ${id}:`, panelData);
        const updatePayload = { ...panelData, updatedAt: new Date() };
        if (panelData.characterIds !== undefined) {
            updatePayload.characterIds = Array.isArray(panelData.characterIds) ? panelData.characterIds : [];
        }
        await db.panels.update(id, updatePayload);
    }

    async deletePanel(id: string): Promise<void> {
        console.log(`DexieService: Deleting panel ${id} and sub-data`);
        await db.transaction('rw', db.panels, db.dialogues, async () => {
            await db.dialogues.where('panelId').equals(id).delete();
            await db.panels.delete(id);
        });
        console.log(`DexieService: Panel ${id} deleted successfully.`);
    }

     async assignCharacterToPanel(panelId: string, characterId: string): Promise<void> {
        console.log(`DexieService: Assigning character ${characterId} to panel ${panelId}`);
        await db.transaction('rw', db.panels, db.characters, async () => {
            const panel = await db.panels.get(panelId);
            if (!panel) throw new Error(`Panel ${panelId} not found.`);
            const charExists = await db.characters.get(characterId);
            if (!charExists) throw new Error(`Character ${characterId} not found.`);
            const updatedIds = Array.from(new Set([...(panel.characterIds || []), characterId]));
            await db.panels.update(panelId, { characterIds: updatedIds, updatedAt: new Date() });
        });
    }

    async removeCharacterFromPanel(panelId: string, characterId: string): Promise<void> {
        console.log(`DexieService: Removing character ${characterId} from panel ${panelId}`);
        await db.transaction('rw', db.panels, async () => {
            const panel = await db.panels.get(panelId);
            if (!panel) throw new Error(`Panel ${panelId} not found.`);
            const updatedIds = (panel.characterIds || []).filter(id => id !== characterId);
            await db.panels.update(panelId, { characterIds: updatedIds, updatedAt: new Date() });
        });
    }

    async getPanelForContext(id: string): Promise<Panel | null> {
        const panel = await db.panels.get(id);
        return panel ?? null;
    }

    // --- Dialogue ---
    async createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>): Promise<PanelDialogue> {
        console.log('DexieService: Creating dialogue:', dialogueData);
        const newId = uuidv4();
        const newDialogue: PanelDialogue = {
            ...dialogueData,
            id: newId,
            speaker: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.dialogues.add(newDialogue);
        return newDialogue;
    }

    async updatePanelDialogue(id: string, dialogueData: DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>): Promise<void> {
        console.log(`DexieService: Updating dialogue ${id}:`, dialogueData);
        await db.dialogues.update(id, { ...dialogueData, updatedAt: new Date() });
    }

    async deletePanelDialogue(id: string): Promise<void> {
        console.log(`DexieService: Deleting dialogue ${id}`);
        await db.dialogues.delete(id);
    }

    async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
        const dialogue = await db.dialogues.get(id);
        return dialogue ?? null;
    }

    // --- Character ---
    async getAllCharacters(projectId?: string): Promise<Character[]> {
        console.log(`DexieService: Fetching all characters${projectId ? ` for project ${projectId}` : ''}`);
        if (projectId) {
            return await db.characters.where('mangaProjectId').equals(projectId).toArray();
        }
        return await db.characters.toArray();
    }

    async getCharacter(id: string): Promise<Character | null> {
        console.log(`DexieService: Fetching character ${id}`);
        const character = await db.characters.get(id);
        return character ?? null;
    }
    getCharacterForContext = this.getCharacter; // Alias

    async createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
        console.log('DexieService: Creating character:', characterData);
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

    async updateCharacter(id: string, characterData: DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
        console.log(`DexieService: Updating character ${id}:`, characterData);
        await db.characters.update(id, { ...characterData, updatedAt: new Date() });
    }

    async deleteCharacter(id: string): Promise<void> {
        console.log(`DexieService: Deleting character ${id} and references`);
        await db.transaction('rw', db.characters, db.panels, db.dialogues, async () => {
            const panelsToUpdate = await db.panels.where('characterIds').equals(id).toArray();
            await Promise.all(panelsToUpdate.map(panel =>
                db.panels.update(panel.id, {
                    characterIds: panel.characterIds.filter(charId => charId !== id),
                    updatedAt: new Date()
                })
            ));
            await db.dialogues.where('speakerId').equals(id).modify({ speakerId: null, updatedAt: new Date() });
            await db.characters.delete(id);
        });
        console.log(`DexieService: Character ${id} deleted.`);
    }

     async initialize(): Promise<void> {
        // Populate initial data if necessary (optional, Dexie handles this via 'populate' event)
        // await populateInitialData(); // You might call Dexie's populate manually here if needed
        console.log("DexieDataService initialized.");
    }
}

// Export an instance of the Dexie service implementation
export const dexieDataService = new DexieDataService();
