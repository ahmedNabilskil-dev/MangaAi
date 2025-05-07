// src/services/in-memory-service.ts
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
import { MangaStatus } from "@/types/enums";
import type { DeepPartial } from "@/types/utils";
import { v4 as uuidv4 } from "uuid";
import type { IDataService } from "./data-service.interface";

// --- In-Memory Store ---
interface InMemoryStore {
  projects: Map<string, MangaProject>;
  chapters: Map<string, Chapter>;
  scenes: Map<string, Scene>;
  panels: Map<string, Panel>;
  dialogues: Map<string, PanelDialogue>;
  characters: Map<string, Character>;
  locations: Map<string, Location>;
  keyEvents: Map<string, KeyEvent>;
  users: Map<string, User>;
}

let store: InMemoryStore = {
  projects: new Map(),
  chapters: new Map(),
  scenes: new Map(),
  panels: new Map(),
  dialogues: new Map(),
  characters: new Map(),
  locations: new Map(),
  keyEvents: new Map(),
  users: new Map(),
};

// --- Helper Function to Deep Clone ---
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }
  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

class InMemoryDataService implements IDataService {
  getAllLocations(projectId?: string): Promise<MangaLocation[]> {
    throw new Error("Method not implemented.");
  }
  getLocation(id: string): Promise<MangaLocation | null> {
    throw new Error("Method not implemented.");
  }
  createLocation(
    locationData: Omit<MangaLocation, "id">
  ): Promise<MangaLocation> {
    throw new Error("Method not implemented.");
  }
  // --- Initialization ---
  async initialize(): Promise<void> {
    if (!store.projects.has("proj-initial-1")) {
      const initialProjectId = "proj-initial-1";
      const newProject: MangaProject = {
        id: initialProjectId,
        title: "My First Manga Project",
        description: "Start creating your manga here!",
        status: MangaStatus.DRAFT,
        viewCount: 0,
        likeCount: 0,
        published: false,
        chapters: [],
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.projects.set(initialProjectId, newProject);
    }
  }

  // --- Project ---
  async getAllProjects(): Promise<MangaProject[]> {
    return Array.from(store.projects.values()).map((p) => deepClone(p));
  }

  async getProject(id: string): Promise<MangaProject | null> {
    const project = store.projects.get(id);
    if (!project) return null;

    const clonedProject = deepClone(project);
    clonedProject.chapters = Array.from(store.chapters.values())
      .filter((c) => c.mangaProjectId === id)
      .sort((a, b) => a.chapterNumber - b.chapterNumber)
      .map((c) => deepClone(c));

    clonedProject.characters = Array.from(store.characters.values())
      .filter((char) => char.mangaProjectId === id)
      .map((char) => deepClone(char));

    return clonedProject;
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
    store.projects.set(newId, deepClone(newProject));
    return deepClone(newProject);
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
    const existing = store.projects.get(id);
    if (existing) {
      store.projects.set(
        id,
        deepClone({ ...existing, ...projectData, updatedAt: new Date() })
      );
    }
  }

  async deleteProject(id: string): Promise<void> {
    const [chapters, characters, keyEvents] = await Promise.all([
      Array.from(store.chapters.values()).filter(
        (c) => c.mangaProjectId === id
      ),
      Array.from(store.characters.values()).filter(
        (c) => c.mangaProjectId === id
      ),
      Array.from(store.keyEvents.values()).filter((k) => k.projectId === id),
    ]);

    await Promise.all([
      ...chapters.map((chapter) => this.deleteChapter(chapter.id)),
      ...characters.map((character) => this.deleteCharacter(character.id)),
      ...keyEvents.map((event) => this.deleteKeyEvent(event.id)),
    ]);

    store.projects.delete(id);
  }

  async getDefaultProject(): Promise<MangaProject | null> {
    let project = store.projects.get("proj-initial-1");
    if (!project) {
      const allProjects = Array.from(store.projects.values());
      if (allProjects.length > 0) {
        project = allProjects[0];
      } else {
        await this.initialize();
        project = store.projects.get("proj-initial-1");
      }
    }
    return project ? this.getProject(project.id) : null;
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
    store.chapters.set(newId, deepClone(newChapter));
    return deepClone(newChapter);
  }

  async updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void> {
    const existing = store.chapters.get(id);
    if (existing) {
      store.chapters.set(
        id,
        deepClone({ ...existing, ...chapterData, updatedAt: new Date() })
      );
    }
  }

  async deleteChapter(id: string): Promise<void> {
    const scenes = Array.from(store.scenes.values()).filter(
      (s) => s.chapterId === id
    );
    await Promise.all(scenes.map((scene) => this.deleteScene(scene.id)));
    store.chapters.delete(id);
  }

  async getChapterForContext(id: string): Promise<Chapter | null> {
    const chapter = store.chapters.get(id);
    return chapter ? deepClone(chapter) : null;
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
    store.scenes.set(newId, deepClone(newScene));
    return deepClone(newScene);
  }

  async updateScene(
    id: string,
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<void> {
    const existing = store.scenes.get(id);
    if (existing) {
      store.scenes.set(
        id,
        deepClone({ ...existing, ...sceneData, updatedAt: new Date() })
      );
    }
  }

  async deleteScene(id: string): Promise<void> {
    const panels = Array.from(store.panels.values()).filter(
      (p) => p.sceneId === id
    );
    await Promise.all(panels.map((panel) => this.deletePanel(panel.id)));
    store.scenes.delete(id);
  }

  async getSceneForContext(id: string): Promise<Scene | null> {
    const scene = store.scenes.get(id);
    return scene ? deepClone(scene) : null;
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
    store.panels.set(newId, deepClone(newPanel));
    return deepClone(newPanel);
  }

  async updatePanel(
    id: string,
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<void> {
    const existing = store.panels.get(id);
    if (existing) {
      const updatePayload = {
        ...existing,
        ...panelData,
        updatedAt: new Date(),
        characterIds:
          panelData.characterIds !== undefined
            ? Array.isArray(panelData.characterIds)
              ? panelData.characterIds
              : []
            : existing.characterIds,
      };
      store.panels.set(id, deepClone(updatePayload));
    }
  }

  async deletePanel(id: string): Promise<void> {
    const dialogues = Array.from(store.dialogues.values()).filter(
      (d) => d.panelId === id
    );
    await Promise.all(
      dialogues.map((dialogue) => this.deletePanelDialogue(dialogue.id))
    );
    store.panels.delete(id);
  }

  async assignCharacterToPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    const panel = store.panels.get(panelId);
    if (!panel) throw new Error(`Panel ${panelId} not found`);

    const character = store.characters.get(characterId);
    if (!character) throw new Error(`Character ${characterId} not found`);

    const updatedIds = Array.from(
      new Set([...(panel.characterIds || []), characterId])
    );
    store.panels.set(
      panelId,
      deepClone({
        ...panel,
        characterIds: updatedIds,
        updatedAt: new Date(),
      })
    );
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    const panel = store.panels.get(panelId);
    if (!panel) throw new Error(`Panel ${panelId} not found`);

    const updatedIds = (panel.characterIds || []).filter(
      (id) => id !== characterId
    );
    store.panels.set(
      panelId,
      deepClone({
        ...panel,
        characterIds: updatedIds,
        updatedAt: new Date(),
      })
    );
  }

  async getPanelForContext(id: string): Promise<Panel | null> {
    const panel = store.panels.get(id);
    return panel ? deepClone(panel) : null;
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
    store.dialogues.set(newId, deepClone(newDialogue));
    return deepClone(newDialogue);
  }

  async updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void> {
    const existing = store.dialogues.get(id);
    if (existing) {
      store.dialogues.set(
        id,
        deepClone({ ...existing, ...dialogueData, updatedAt: new Date() })
      );
    }
  }

  async deletePanelDialogue(id: string): Promise<void> {
    store.dialogues.delete(id);
  }

  async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    const dialogue = store.dialogues.get(id);
    if (!dialogue) return null;
    const cloned = deepClone(dialogue);
    cloned.speaker = dialogue.speakerId
      ? deepClone(store.characters.get(dialogue.speakerId) ?? null)
      : null;
    return cloned;
  }

  // --- Character ---
  async getAllCharacters(projectId?: string): Promise<Character[]> {
    const characters = Array.from(store.characters.values());
    const filtered = projectId
      ? characters.filter((c) => c.mangaProjectId === projectId)
      : characters;
    return filtered.map((c) => deepClone(c));
  }

  async getCharacter(id: string): Promise<Character | null> {
    const character = store.characters.get(id);
    return character ? deepClone(character) : null;
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
    store.characters.set(newId, deepClone(newCharacter));
    return deepClone(newCharacter);
  }

  async updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const existing = store.characters.get(id);
    if (existing) {
      store.characters.set(
        id,
        deepClone({ ...existing, ...characterData, updatedAt: new Date() })
      );
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    // Remove from panels
    Array.from(store.panels.values()).forEach((panel) => {
      if (panel.characterIds?.includes(id)) {
        const updatedIds = panel.characterIds.filter((charId) => charId !== id);
        store.panels.set(
          panel.id,
          deepClone({
            ...panel,
            characterIds: updatedIds,
            updatedAt: new Date(),
          })
        );
      }
    });

    // Remove as speaker from dialogues
    Array.from(store.dialogues.values()).forEach((dialogue) => {
      if (dialogue.speakerId === id) {
        store.dialogues.set(
          dialogue.id,
          deepClone({
            ...dialogue,
            speakerId: null,
            updatedAt: new Date(),
          })
        );
      }
    });

    store.characters.delete(id);
  }

  getCharacterForContext = this.getCharacter;

  async updateLocation(
    id: string,
    locationData: DeepPartial<Omit<MangaLocation, "id">>
  ): Promise<void> {
    const existing = store.locations.get(id);
    if (existing) {
      store.locations.set(id, deepClone({ ...existing, ...locationData }));
    }
  }

  async deleteLocation(id: string): Promise<void> {
    store.locations.delete(id);
  }

  async getLocationForContext(id: string): Promise<MangaLocation | null> {
    return this.getLocation(id);
  }

  // --- Key Event ---
  async getAllKeyEvents(projectId?: string): Promise<KeyEvent[]> {
    const events = Array.from(store.keyEvents.values());
    const filtered = projectId
      ? events.filter((e) => e.projectId === projectId)
      : events;
    return filtered.map((e) => deepClone(e));
  }

  async getKeyEvent(id: string): Promise<KeyEvent | null> {
    const event = store.keyEvents.get(id);
    return event ? deepClone(event) : null;
  }

  async createKeyEvent(eventData: Omit<KeyEvent, "id">): Promise<KeyEvent> {
    const newId = uuidv4();
    const newEvent: KeyEvent = {
      ...eventData,
      id: newId,
    };
    store.keyEvents.set(newId, deepClone(newEvent));
    return deepClone(newEvent);
  }

  async updateKeyEvent(
    id: string,
    eventData: DeepPartial<Omit<KeyEvent, "id">>
  ): Promise<void> {
    const existing = store.keyEvents.get(id);
    if (existing) {
      store.keyEvents.set(id, deepClone({ ...existing, ...eventData }));
    }
  }

  async deleteKeyEvent(id: string): Promise<void> {
    store.keyEvents.delete(id);
  }

  async getKeyEventForContext(id: string): Promise<KeyEvent | null> {
    return this.getKeyEvent(id);
  }

  // --- User ---
  async getAllUsers(): Promise<User[]> {
    return Array.from(store.users.values()).map((u) => deepClone(u));
  }

  async getUser(id: string): Promise<User | null> {
    const user = store.users.get(id);
    return user ? deepClone(user) : null;
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const newId = uuidv4();
    const newUser: User = {
      ...userData,
      id: newId,
    };
    store.users.set(newId, deepClone(newUser));
    return deepClone(newUser);
  }

  async updateUser(
    id: string,
    userData: DeepPartial<Omit<User, "id">>
  ): Promise<void> {
    const existing = store.users.get(id);
    if (existing) {
      store.users.set(id, deepClone({ ...existing, ...userData }));
    }
  }

  async deleteUser(id: string): Promise<void> {
    store.users.delete(id);
  }

  async getUserForContext(id: string): Promise<User | null> {
    return this.getUser(id);
  }
}

export const inMemoryDataService = new InMemoryDataService();
inMemoryDataService.initialize();

// Utility function for testing
export function clearInMemoryStore() {
  store = {
    projects: new Map(),
    chapters: new Map(),
    scenes: new Map(),
    panels: new Map(),
    dialogues: new Map(),
    characters: new Map(),
    locations: new Map(),
    keyEvents: new Map(),
    users: new Map(),
  };
  inMemoryDataService.initialize();
}
