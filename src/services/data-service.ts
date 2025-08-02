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
import { apiDataService } from "./api-data.service";

// --- Project ---
export async function getAllProjects(): Promise<MangaProject[]> {
  return apiDataService.getAllProjects();
}

export async function getProject(id: string): Promise<MangaProject | null> {
  return apiDataService.getProject(id);
}

export async function createProject(
  projectData: Partial<MangaProject>
): Promise<MangaProject> {
  return apiDataService.createProject(projectData);
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
  return apiDataService.updateProject(id, projectData);
}

export async function deleteProject(id: string): Promise<void> {
  return apiDataService.deleteProject(id);
}

export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  return apiDataService.getProjectWithRelations(id);
}

// --- Chapter ---
export async function createChapter(
  chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
): Promise<Chapter> {
  return apiDataService.createChapter(chapterData);
}

export async function updateChapter(
  id: string,
  chapterData: DeepPartial<
    Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  >
): Promise<void> {
  return apiDataService.updateChapter(id, chapterData);
}

export async function deleteChapter(id: string): Promise<void> {
  return apiDataService.deleteChapter(id);
}

export async function getChapterForContext(
  id: string
): Promise<Chapter | null> {
  return apiDataService.getChapterForContext(id);
}

export async function listChapters(projectId: string): Promise<Chapter[]> {
  return apiDataService.listChapters(projectId);
}

// --- Scene ---
export async function createScene(
  sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
): Promise<Scene> {
  return apiDataService.createScene(sceneData);
}

export async function updateScene(
  id: string,
  sceneData: DeepPartial<
    Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  >
): Promise<void> {
  return apiDataService.updateScene(id, sceneData);
}

export async function deleteScene(id: string): Promise<void> {
  return apiDataService.deleteScene(id);
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
  return apiDataService.getSceneForContext(id);
}

export async function listScenes(chapterId: string): Promise<Scene[]> {
  return apiDataService.listScenes(chapterId);
}

// --- Panel ---
export async function createPanel(
  panelData: Omit<
    Panel,
    "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
  >
): Promise<Panel> {
  return apiDataService.createPanel(panelData);
}

export async function updatePanel(
  id: string,
  panelData: DeepPartial<
    Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
  >
): Promise<void> {
  return apiDataService.updatePanel(id, panelData);
}

export async function deletePanel(id: string): Promise<void> {
  return apiDataService.deletePanel(id);
}

export async function assignCharacterToPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  return apiDataService.assignCharacterToPanel(panelId, characterId);
}

export async function removeCharacterFromPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  return apiDataService.removeCharacterFromPanel(panelId, characterId);
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
  return apiDataService.getPanelForContext(id);
}

export async function listPanels(sceneId: string): Promise<Panel[]> {
  return apiDataService.listPanels(sceneId);
}

// --- Dialogue ---
export async function createPanelDialogue(
  dialogueData: Omit<
    PanelDialogue,
    "id" | "createdAt" | "updatedAt" | "speaker"
  >
): Promise<PanelDialogue> {
  return apiDataService.createPanelDialogue(dialogueData);
}

export async function updatePanelDialogue(
  id: string,
  dialogueData: DeepPartial<
    Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
  >
): Promise<void> {
  return apiDataService.updatePanelDialogue(id, dialogueData);
}

export async function deletePanelDialogue(id: string): Promise<void> {
  return apiDataService.deletePanelDialogue(id);
}

export async function getPanelDialogueForContext(
  id: string
): Promise<PanelDialogue | null> {
  return apiDataService.getPanelDialogueForContext(id);
}

export async function listPanelDialogues(
  panelId: string
): Promise<PanelDialogue[]> {
  return apiDataService.listPanelDialogues(panelId);
}

// --- Character ---
export async function getCharacter(id: string): Promise<Character | null> {
  return apiDataService.getCharacter(id);
}

export async function createCharacter(
  characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
): Promise<Character> {
  return apiDataService.createCharacter(characterData);
}

export async function updateCharacter(
  id: string,
  characterData: DeepPartial<Omit<Character, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  return apiDataService.updateCharacter(id, characterData);
}

export async function deleteCharacter(id: string): Promise<void> {
  return apiDataService.deleteCharacter(id);
}

export async function getCharacterForContext(
  id: string
): Promise<Character | null> {
  return apiDataService.getCharacterForContext(id);
}

export async function listCharacters(projectId: string): Promise<Character[]> {
  return apiDataService.listCharacters(projectId);
}

// --- List Methods ---
export async function listMangaProjects(): Promise<MangaProject[]> {
  return apiDataService.listMangaProjects();
}

export async function getAllChapters(): Promise<Chapter[]> {
  return apiDataService.getAllChapters();
}

export async function getAllScenes(): Promise<Scene[]> {
  return apiDataService.getAllScenes();
}

export async function getAllPanels(): Promise<Panel[]> {
  return apiDataService.getAllPanels();
}

export async function getAllPanelDialogues(): Promise<PanelDialogue[]> {
  return apiDataService.getAllPanelDialogues();
}

export async function getAllCharacters(): Promise<Character[]> {
  return apiDataService.getAllCharacters();
}

// --- Template Methods ---
export async function createOutfitTemplate(
  templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
): Promise<OutfitTemplate> {
  return apiDataService.createOutfitTemplate(templateData);
}

export async function getOutfitTemplate(
  id: string
): Promise<OutfitTemplate | null> {
  return apiDataService.getOutfitTemplate(id);
}

export async function updateOutfitTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  return apiDataService.updateOutfitTemplate(id, templateData);
}

export async function deleteOutfitTemplate(id: string): Promise<void> {
  return apiDataService.deleteOutfitTemplate(id);
}

export async function listOutfitTemplates(filters?: {
  category?: string;
  gender?: string;
  ageGroup?: string;
  season?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<OutfitTemplate[]> {
  return apiDataService.listOutfitTemplates(filters);
}

export async function createLocationTemplate(
  templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
): Promise<LocationTemplate> {
  return apiDataService.createLocationTemplate(templateData);
}

export async function getLocationTemplate(
  id: string
): Promise<LocationTemplate | null> {
  return apiDataService.getLocationTemplate(id);
}

export async function updateLocationTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  return apiDataService.updateLocationTemplate(id, templateData);
}

export async function deleteLocationTemplate(id: string): Promise<void> {
  return apiDataService.deleteLocationTemplate(id);
}

export async function listLocationTemplates(filters?: {
  category?: string;
  timeOfDay?: string;
  weather?: string;
  mood?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<LocationTemplate[]> {
  return apiDataService.listLocationTemplates(filters);
}

// --- Utility Functions ---
export async function cleanOrphanedData(): Promise<void> {
  // This would clean up orphaned data - for now, just return
  // Implementation could be added to call specific cleanup APIs
  return Promise.resolve();
}

export async function getChapters(projectId: string): Promise<Chapter[]> {
  return apiDataService.listChapters(projectId);
}

export async function getScenes(chapterId: string): Promise<Scene[]> {
  return apiDataService.listScenes(chapterId);
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  // API client doesn't need initialization
  console.log("✅ API Data Service initialized (client-side)");
}

// Legacy compatibility - maintain the dataService object export
export const dataService = {
  createOutfitTemplate,
  createLocationTemplate,
  updateOutfitTemplate,
  updateLocationTemplate,
  deleteOutfitTemplate,
  deleteLocationTemplate,
  getOutfitTemplate,
  getLocationTemplate,
};
