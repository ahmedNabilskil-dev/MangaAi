import type {
  Chapter,
  Character,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";
import type { DeepPartial } from "@/types/utils";
import type { IDataService } from "./data-service.interface";
import { dexieDataService } from "./dexie-service";

let activeDataService: IDataService;

activeDataService = dexieDataService;

// --- Project ---
export async function getAllProjects(): Promise<MangaProject[]> {
  return activeDataService.getAllProjects();
}

export async function getProject(id: string): Promise<MangaProject | null> {
  return activeDataService.getProject(id);
}

export async function createProject(
  projectData: Partial<MangaProject>
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
export async function listCharacters(projectId: string): Promise<Character[]> {
  return activeDataService.listCharacters(projectId);
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

export async function getMangaProjects(): Promise<MangaProject[]> {
  return await activeDataService.listMangaProjects();
}

export async function getChapters(projectId: string): Promise<Chapter[]> {
  return await activeDataService.listChapters(projectId);
}

export async function getScenes(chapterId: string): Promise<Scene[]> {
  return await activeDataService.listScenes(chapterId);
}

export async function getPanels(sceneId: string): Promise<Panel[]> {
  return await activeDataService.listPanels(sceneId);
}

export async function getPanelDialogues(
  panelId: string
): Promise<PanelDialogue[]> {
  return await activeDataService.listPanelDialogues(panelId);
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  if (activeDataService.initialize) {
    return activeDataService.initialize();
  }
  return Promise.resolve();
}
