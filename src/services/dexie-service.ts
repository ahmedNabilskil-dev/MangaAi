import {
  db,
  getDefaultProject as getDefaultProjectFromDb,
  getProjectWithRelations,
} from "@/services/db";
import type {
  Chapter,
  Character,
  KeyEvent,
  MangaLocation,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
  User,
} from "@/types/entities";
import type { DeepPartial } from "@/types/utils";
import { v4 as uuidv4 } from "uuid";
import type { IDataService } from "./data-service.interface";

class DexieDataService implements IDataService {
  deleteProject(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  // --- Project ---
  async getAllProjects(): Promise<MangaProject[]> {
    return await db.projects.toArray();
  }

  async getProject(id: string): Promise<MangaProject | null> {
    return getProjectWithRelations(id);
  }

  async createProject(
    projectData: Omit<
      MangaProject,
      "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
    >
  ): Promise<MangaProject> {
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

  async updateProject(
    id: string,
    projectData: DeepPartial<
      Omit<
        MangaProject,
        "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
      >
    >
  ): Promise<void> {
    await db.projects.update(id, { ...projectData, updatedAt: new Date() });
  }

  async getDefaultProject(): Promise<MangaProject | null> {
    return getDefaultProjectFromDb();
  }

  // --- Chapter ---
  async createChapter(
    chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  ): Promise<Chapter> {
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

  async updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void> {
    await db.chapters.update(id, { ...chapterData, updatedAt: new Date() });
  }

  async deleteChapter(id: string): Promise<void> {
    await db.transaction(
      "rw",
      db.chapters,
      db.scenes,
      db.panels,
      db.dialogues,
      async () => {
        const scenes = await db.scenes.where("chapterId").equals(id).toArray();
        await Promise.all([
          ...scenes.map((scene) => this.deleteScene(scene.id)),
          db.chapters.delete(id),
        ]);
      }
    );
  }

  async getChapterForContext(id: string): Promise<Chapter | null> {
    return (await db.chapters.get(id)) || null;
  }

  // --- Scene ---
  async createScene(
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<Scene> {
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

  async updateScene(
    id: string,
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<void> {
    await db.scenes.update(id, {
      ...sceneData,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  }

  async deleteScene(id: string): Promise<void> {
    await db.transaction("rw", db.scenes, db.panels, db.dialogues, async () => {
      const panels = await db.panels.where("sceneId").equals(id).toArray();
      await Promise.all([
        ...panels.map((panel) => this.deletePanel(panel.id)),
        db.scenes.delete(id),
      ]);
    });
  }

  async getSceneForContext(id: string): Promise<Scene | null> {
    return (await db.scenes.get(id)) || null;
  }

  // --- Panel ---
  async createPanel(
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<Panel> {
    const newId = uuidv4();
    const newPanel: Panel = {
      ...panelData,
      id: newId,
      characterIds: Array.isArray(panelData.characterIds)
        ? panelData.characterIds
        : [],
      dialogues: [],
      characters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.panels.add(newPanel);
    return newPanel;
  }

  async updatePanel(
    id: string,
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<void> {
    const updatePayload = {
      ...panelData,
      updatedAt: new Date(),
      characterIds:
        panelData.characterIds !== undefined
          ? Array.isArray(panelData.characterIds)
            ? panelData.characterIds
            : []
          : undefined,
    };
    await db.panels.update(id, updatePayload);
  }

  async deletePanel(id: string): Promise<void> {
    await db.transaction("rw", db.panels, db.dialogues, async () => {
      await db.dialogues.where("panelId").equals(id).delete();
      await db.panels.delete(id);
    });
  }

  async assignCharacterToPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await db.transaction("rw", db.panels, db.characters, async () => {
      const panel = await db.panels.get(panelId);
      if (!panel) throw new Error(`Panel ${panelId} not found`);

      const character = await db.characters.get(characterId);
      if (!character) throw new Error(`Character ${characterId} not found`);

      const updatedIds = Array.from(
        new Set([...(panel.characterIds || []), characterId])
      );
      await db.panels.update(panelId, {
        characterIds: updatedIds,
        updatedAt: new Date(),
      });
    });
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await db.transaction("rw", db.panels, async () => {
      const panel = await db.panels.get(panelId);
      if (!panel) throw new Error(`Panel ${panelId} not found`);

      const updatedIds = (panel.characterIds || []).filter(
        (id) => id !== characterId
      );
      await db.panels.update(panelId, {
        characterIds: updatedIds,
        updatedAt: new Date(),
      });
    });
  }

  async getPanelForContext(id: string): Promise<Panel | null> {
    return (await db.panels.get(id)) || null;
  }

  // --- Dialogue ---
  async createPanelDialogue(
    dialogueData: Omit<
      PanelDialogue,
      "id" | "createdAt" | "updatedAt" | "speaker"
    >
  ): Promise<PanelDialogue> {
    const newId = uuidv4();
    const newDialogue: PanelDialogue = {
      ...dialogueData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.dialogues.add(newDialogue);
    return newDialogue;
  }

  async updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void> {
    await db.dialogues.update(id, { ...dialogueData, updatedAt: new Date() });
  }

  async deletePanelDialogue(id: string): Promise<void> {
    await db.dialogues.delete(id);
  }

  async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    return (await db.dialogues.get(id)) || null;
  }

  // --- Character ---
  async getAllCharacters(projectId?: string): Promise<Character[]> {
    if (projectId) {
      return await db.characters
        .where("mangaProjectId")
        .equals(projectId)
        .toArray();
    }
    return await db.characters.toArray();
  }

  async getCharacter(id: string): Promise<Character | null> {
    return (await db.characters.get(id)) || null;
  }

  async createCharacter(
    characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<Character> {
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

  async updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await db.characters.update(id, { ...characterData, updatedAt: new Date() });
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.transaction(
      "rw",
      db.characters,
      db.panels,
      db.dialogues,
      async () => {
        const panels = await db.panels
          .where("characterIds")
          .equals(id)
          .toArray();
        await Promise.all(
          panels.map((panel) =>
            db.panels.update(panel.id, {
              characterIds: panel.characterIds.filter(
                (charId) => charId !== id
              ),
              updatedAt: new Date(),
            })
          )
        );

        await db.dialogues.where("speakerId").equals(id).modify({
          speakerId: null,
          updatedAt: new Date(),
        });

        await db.characters.delete(id);
      }
    );
  }

  getCharacterForContext = this.getCharacter;

  // --- Location ---
  async getAllLocations(projectId?: string): Promise<MangaLocation[]> {
    if (projectId) {
      return (
        (await db.locations.where("projectId").equals(projectId).toArray()) ||
        []
      );
    }
    return (await db.locations.toArray()) || [];
  }

  async getLocation(id: string): Promise<MangaLocation | null> {
    return (await db.locations.get(id)) || null;
  }

  async createLocation(
    locationData: Omit<MangaLocation, "id">
  ): Promise<MangaLocation> {
    const newId = uuidv4();
    const newLocation: MangaLocation = {
      ...locationData,
      id: newId,
    };
    await db.locations.add(newLocation);
    return newLocation;
  }

  async updateLocation(
    id: string,
    locationData: DeepPartial<Omit<MangaLocation, "id">>
  ): Promise<void> {
    await db.locations.update(id, locationData);
  }

  async deleteLocation(id: string): Promise<void> {
    await db.locations.delete(id);
  }

  async getLocationForContext(id: string): Promise<MangaLocation | null> {
    return (await db.locations.get(id)) || null;
  }

  // --- Key Event ---
  async getAllKeyEvents(projectId?: string): Promise<KeyEvent[]> {
    if (projectId) {
      return await db.keyEvents.where("projectId").equals(projectId).toArray();
    }
    return await db.keyEvents.toArray();
  }

  async getKeyEvent(id: string): Promise<KeyEvent | null> {
    return (await db.keyEvents.get(id)) || null;
  }

  async createKeyEvent(eventData: Omit<KeyEvent, "id">): Promise<KeyEvent> {
    const newId = uuidv4();
    const newEvent: KeyEvent = {
      ...eventData,
      id: newId,
    };
    await db.keyEvents.add(newEvent);
    return newEvent;
  }

  async updateKeyEvent(
    id: string,
    eventData: DeepPartial<Omit<KeyEvent, "id">>
  ): Promise<void> {
    await db.keyEvents.update(id, eventData);
  }

  async deleteKeyEvent(id: string): Promise<void> {
    await db.keyEvents.delete(id);
  }

  async getKeyEventForContext(id: string): Promise<KeyEvent | null> {
    return (await db.keyEvents.get(id)) || null;
  }

  // --- User ---
  async getAllUsers(): Promise<User[]> {
    return await db.users.toArray();
  }

  async getUser(id: string): Promise<User | null> {
    return (await db.users.get(id)) || null;
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const newId = uuidv4();
    const newUser: User = {
      ...userData,
      id: newId,
    };
    await db.users.add(newUser);
    return newUser;
  }

  async updateUser(
    id: string,
    userData: DeepPartial<Omit<User, "id">>
  ): Promise<void> {
    await db.users.update(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await db.users.delete(id);
  }

  async getUserForContext(id: string): Promise<User | null> {
    return (await db.users.get(id)) || null;
  }

  // --- Initialization ---
  async initialize(): Promise<void> {
    try {
      await db.open();
      console.log("Dexie database initialized");
    } catch (error) {
      console.error("Failed to initialize Dexie database:", error);
      throw error;
    }
  }
}

export const dexieDataService = new DexieDataService();
dexieDataService.initialize();
