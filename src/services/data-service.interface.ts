// src/services/data-service.interface.ts
import type {
  Chapter,
  Character,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
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
  createProject(projectData: Partial<MangaProject>): Promise<MangaProject>;
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
  getChapterForContext(id: string): Promise<Chapter | null>;

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

  // ---- Manga Projects ----
  listMangaProjects(): Promise<MangaProject[]>;

  // ---- Chapters ----
  listChapters(projectId: string): Promise<Chapter[]>;

  // ---- Scenes ----
  listScenes(chapterId: string): Promise<Scene[]>;

  // ---- Panels ----
  listPanels(sceneId: string): Promise<Panel[]>;

  // ---- Panel Dialogues ----
  listPanelDialogues(panelId: string): Promise<PanelDialogue[]>;

  // ---- Characters ----
  listCharacters(projectId: string): Promise<Character[]>;

  getAllChapters(): Promise<Chapter[]>;
  getAllScenes(): Promise<Scene[]>;
  getAllPanels(): Promise<Panel[]>;
  getAllPanelDialogues(): Promise<PanelDialogue[]>;
  getAllCharacters(): Promise<Character[]>;

  // --- Utility/Initialization (Optional but good practice) ---
  initialize?(): Promise<void>; // For any setup needed
}
