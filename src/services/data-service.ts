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
import type { IDataService } from "./data-service.interface";
import { dexieDataService } from "./dexie-service";
import { inMemoryDataService } from "./in-memory-service";

const ACTIVE_SERVICE_TYPE: "dexie" | "in-memory" = "dexie";
let activeDataService: IDataService;

if (ACTIVE_SERVICE_TYPE === "dexie") {
  activeDataService = dexieDataService;
} else {
  activeDataService = inMemoryDataService;
}

// --- Project ---
export async function getAllProjects(): Promise<MangaProject[]> {
  return activeDataService.getAllProjects();
}

export async function getProject(id: string): Promise<MangaProject | null> {
  return activeDataService.getProject(id);
}

export async function createProject(
  projectData: Omit<
    MangaProject,
    "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
  >
): Promise<MangaProject> {
  return activeDataService.createProject(projectData);
}

export async function updateProject(
  id: string,
  projectData: DeepPartial<
    Omit<
      MangaProject,
      "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
    >
  >
): Promise<void> {
  return activeDataService.updateProject(id, projectData);
}

export async function deleteProject(id: string): Promise<void> {
  return activeDataService.deleteProject(id);
}

export async function getDefaultProject(): Promise<MangaProject | null> {
  return activeDataService.getDefaultProject();
}

// --- Chapter ---
export async function createChapter(
  chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
): Promise<Chapter> {
  return activeDataService.createChapter(chapterData);
}

export async function updateChapter(
  id: string,
  chapterData: DeepPartial<
    Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  >
): Promise<void> {
  return activeDataService.updateChapter(id, chapterData);
}

export async function deleteChapter(id: string): Promise<void> {
  return activeDataService.deleteChapter(id);
}

export async function getChapterForContext(
  id: string
): Promise<Chapter | null> {
  return activeDataService.getChapterForContext(id);
}

// --- Scene ---
export async function createScene(
  sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
): Promise<Scene> {
  return activeDataService.createScene(sceneData);
}

export async function updateScene(
  id: string,
  sceneData: DeepPartial<
    Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  >
): Promise<void> {
  return activeDataService.updateScene(id, sceneData);
}

export async function deleteScene(id: string): Promise<void> {
  return activeDataService.deleteScene(id);
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
  return activeDataService.getSceneForContext(id);
}

// --- Panel ---
export async function createPanel(
  panelData: Omit<
    Panel,
    "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
  >
): Promise<Panel> {
  return activeDataService.createPanel(panelData);
}

export async function updatePanel(
  id: string,
  panelData: DeepPartial<
    Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
  >
): Promise<void> {
  return activeDataService.updatePanel(id, panelData);
}

export async function deletePanel(id: string): Promise<void> {
  return activeDataService.deletePanel(id);
}

export async function assignCharacterToPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  return activeDataService.assignCharacterToPanel(panelId, characterId);
}

export async function removeCharacterFromPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  return activeDataService.removeCharacterFromPanel(panelId, characterId);
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
  return activeDataService.getPanelForContext(id);
}

// --- Dialogue ---
export async function createPanelDialogue(
  dialogueData: Omit<
    PanelDialogue,
    "id" | "createdAt" | "updatedAt" | "speaker"
  >
): Promise<PanelDialogue> {
  return activeDataService.createPanelDialogue(dialogueData);
}

export async function updatePanelDialogue(
  id: string,
  dialogueData: DeepPartial<
    Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
  >
): Promise<void> {
  return activeDataService.updatePanelDialogue(id, dialogueData);
}

export async function deletePanelDialogue(id: string): Promise<void> {
  return activeDataService.deletePanelDialogue(id);
}

export async function getPanelDialogueForContext(
  id: string
): Promise<PanelDialogue | null> {
  return activeDataService.getPanelDialogueForContext(id);
}

// --- Character ---
export async function getAllCharacters(
  projectId?: string
): Promise<Character[]> {
  return activeDataService.getAllCharacters(projectId);
}

export async function getCharacter(id: string): Promise<Character | null> {
  return activeDataService.getCharacter(id);
}

export async function createCharacter(
  characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
): Promise<Character> {
  return activeDataService.createCharacter(characterData);
}

export async function updateCharacter(
  id: string,
  characterData: DeepPartial<Omit<Character, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  return activeDataService.updateCharacter(id, characterData);
}

export async function deleteCharacter(id: string): Promise<void> {
  return activeDataService.deleteCharacter(id);
}

export async function getCharacterForContext(
  id: string
): Promise<Character | null> {
  return activeDataService.getCharacterForContext(id);
}

// --- Location ---
export async function getAllLocations(
  projectId?: string
): Promise<MangaLocation[]> {
  return activeDataService.getAllLocations(projectId);
}

export async function getLocation(id: string): Promise<MangaLocation | null> {
  return activeDataService.getLocation(id);
}

export async function createLocation(
  locationData: Omit<MangaLocation, "id">
): Promise<MangaLocation> {
  return activeDataService.createLocation(locationData);
}

export async function updateLocation(
  id: string,
  locationData: DeepPartial<Omit<MangaLocation, "id">>
): Promise<void> {
  return activeDataService.updateLocation(id, locationData);
}

export async function deleteLocation(id: string): Promise<void> {
  return activeDataService.deleteLocation(id);
}

export async function getLocationForContext(
  id: string
): Promise<MangaLocation | null> {
  return activeDataService.getLocationForContext(id);
}

// --- Key Event ---
export async function getAllKeyEvents(projectId?: string): Promise<KeyEvent[]> {
  return activeDataService.getAllKeyEvents(projectId);
}

export async function getKeyEvent(id: string): Promise<KeyEvent | null> {
  return activeDataService.getKeyEvent(id);
}

export async function createKeyEvent(
  eventData: Omit<KeyEvent, "id">
): Promise<KeyEvent> {
  return activeDataService.createKeyEvent(eventData);
}

export async function updateKeyEvent(
  id: string,
  eventData: DeepPartial<Omit<KeyEvent, "id">>
): Promise<void> {
  return activeDataService.updateKeyEvent(id, eventData);
}

export async function deleteKeyEvent(id: string): Promise<void> {
  return activeDataService.deleteKeyEvent(id);
}

export async function getKeyEventForContext(
  id: string
): Promise<KeyEvent | null> {
  return activeDataService.getKeyEventForContext(id);
}

// --- User ---
export async function getAllUsers(): Promise<User[]> {
  return activeDataService.getAllUsers();
}

export async function getUser(id: string): Promise<User | null> {
  return activeDataService.getUser(id);
}

export async function createUser(userData: Omit<User, "id">): Promise<User> {
  return activeDataService.createUser(userData);
}

export async function updateUser(
  id: string,
  userData: DeepPartial<Omit<User, "id">>
): Promise<void> {
  return activeDataService.updateUser(id, userData);
}

export async function deleteUser(id: string): Promise<void> {
  return activeDataService.deleteUser(id);
}

export async function getUserForContext(id: string): Promise<User | null> {
  return activeDataService.getUserForContext(id);
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  if (activeDataService.initialize) {
    return activeDataService.initialize();
  }
  return Promise.resolve();
}
