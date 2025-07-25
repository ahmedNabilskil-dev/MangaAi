// src/services/data-service.interface.ts
import type {
  Chapter,
  Character,
  LocationTemplate,
  MangaProject,
  OutfitTemplate,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";
import type { DeepPartial } from "@/types/utils";

/**
 * Interface defining the contract for data storage services.
 * Any data service implementation (SQLite, In-Memory, Firebase, etc.)
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

  // ---- Template Management ----

  // --- Outfit Templates ---
  createOutfitTemplate(
    templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<OutfitTemplate>;
  getOutfitTemplate(id: string): Promise<OutfitTemplate | null>;
  updateOutfitTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void>;
  deleteOutfitTemplate(id: string): Promise<void>;
  listOutfitTemplates(filters?: {
    category?: string;
    gender?: string;
    ageGroup?: string;
    season?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<OutfitTemplate[]>;

  // --- Location Templates ---
  createLocationTemplate(
    templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<LocationTemplate>;
  getLocationTemplate(id: string): Promise<LocationTemplate | null>;
  updateLocationTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void>;
  deleteLocationTemplate(id: string): Promise<void>;
  listLocationTemplates(filters?: {
    category?: string;
    timeOfDay?: string;
    weather?: string;
    mood?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<LocationTemplate[]>;

  // --- Utility/Initialization (Optional but good practice) ---
  initialize?(): Promise<void>; // For any setup needed
}
