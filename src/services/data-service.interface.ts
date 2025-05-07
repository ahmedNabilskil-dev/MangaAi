// src/services/data-service.interface.ts
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

/**
 * Interface defining the contract for data storage services.
 * Any data service implementation (Dexie, In-Memory, Firebase, etc.)
 * must adhere to this interface.
 */
export interface IDataService {
  // --- Project ---
  getAllProjects(): Promise<MangaProject[]>;
  getProject(id: string): Promise<MangaProject | null>;
  createProject(
    projectData: Omit<
      MangaProject,
      "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
    >
  ): Promise<MangaProject>;
  updateProject(
    id: string,
    projectData: DeepPartial<
      Omit<
        MangaProject,
        "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
      >
    >
  ): Promise<void>;
  deleteProject(id: string): Promise<void>;
  getDefaultProject(): Promise<MangaProject | null>; // Keep default project logic

  // --- Location ---
  getAllLocations(projectId?: string): Promise<MangaLocation[]>;
  getLocation(id: string): Promise<MangaLocation | null>;
  createLocation(
    locationData: Omit<MangaLocation, "id">
  ): Promise<MangaLocation>;
  updateLocation(
    id: string,
    locationData: DeepPartial<Omit<MangaLocation, "id">>
  ): Promise<void>;
  deleteLocation(id: string): Promise<void>;
  getLocationForContext(id: string): Promise<MangaLocation | null>;

  // --- Key Event ---
  getAllKeyEvents(projectId?: string): Promise<KeyEvent[]>;
  getKeyEvent(id: string): Promise<KeyEvent | null>;
  createKeyEvent(eventData: Omit<KeyEvent, "id">): Promise<KeyEvent>;
  updateKeyEvent(
    id: string,
    eventData: DeepPartial<Omit<KeyEvent, "id">>
  ): Promise<void>;
  deleteKeyEvent(id: string): Promise<void>;
  getKeyEventForContext(id: string): Promise<KeyEvent | null>;

  // --- User ---
  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(userData: Omit<User, "id">): Promise<User>;
  updateUser(
    id: string,
    userData: DeepPartial<Omit<User, "id">>
  ): Promise<void>;
  deleteUser(id: string): Promise<void>;
  getUserForContext(id: string): Promise<User | null>;

  // --- Chapter ---
  createChapter(
    chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  ): Promise<Chapter>;
  updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void>;
  deleteChapter(id: string): Promise<void>;
  getChapterForContext(id: string): Promise<Chapter | null>; // Needed for flows

  // --- Scene ---
  createScene(
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<Scene>;
  updateScene(
    id: string,
    sceneData: DeepPartial<
      Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
    >
  ): Promise<void>;
  deleteScene(id: string): Promise<void>;
  getSceneForContext(id: string): Promise<Scene | null>; // Needed for flows

  // --- Panel ---
  createPanel(
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<Panel>;
  updatePanel(
    id: string,
    panelData: DeepPartial<
      Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
    >
  ): Promise<void>;
  deletePanel(id: string): Promise<void>;
  assignCharacterToPanel(panelId: string, characterId: string): Promise<void>;
  removeCharacterFromPanel(panelId: string, characterId: string): Promise<void>;
  getPanelForContext(id: string): Promise<Panel | null>; // Needed for flows

  // --- Dialogue ---
  createPanelDialogue(
    dialogueData: Omit<
      PanelDialogue,
      "id" | "createdAt" | "updatedAt" | "speaker"
    >
  ): Promise<PanelDialogue>;
  updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void>;
  deletePanelDialogue(id: string): Promise<void>;
  getPanelDialogueForContext(id: string): Promise<PanelDialogue | null>; // Needed for flows

  // --- Character ---
  getAllCharacters(projectId?: string): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | null>;
  createCharacter(
    characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<Character>;
  updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void>;
  deleteCharacter(id: string): Promise<void>;
  getCharacterForContext(id: string): Promise<Character | null>; // Alias

  // --- Utility/Initialization (Optional but good practice) ---
  initialize?(): Promise<void>; // For any setup needed
}
