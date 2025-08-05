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

// Import the Supabase service directly for server-side usage
let supabaseDataService: any = null;

async function getSupabaseService() {
  if (!supabaseDataService) {
    const { supabaseDataService: service } = await import(
      "@/backend/services/supabase.service"
    );
    await service.initialize();
    supabaseDataService = service;
  }
  return supabaseDataService;
}

// --- Project ---
export async function getAllProjects(): Promise<MangaProject[]> {
  const service = await getSupabaseService();
  return service.getAllProjects();
}

export async function getProject(id: string): Promise<MangaProject | null> {
  const service = await getSupabaseService();
  return service.getProject(id);
}

export async function createProject(
  projectData: Partial<MangaProject>
): Promise<MangaProject> {
  const service = await getSupabaseService();
  return service.createProject(projectData);
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
  const service = await getSupabaseService();
  return service.updateProject(id, projectData);
}

export async function deleteProject(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deleteProject(id);
}

export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  const service = await getSupabaseService();
  return service.getProjectWithRelations(id);
}

// --- Chapter ---
export async function createChapter(
  chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
): Promise<Chapter> {
  const service = await getSupabaseService();
  return service.createChapter(chapterData);
}

export async function updateChapter(
  id: string,
  chapterData: DeepPartial<
    Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  >
): Promise<void> {
  const service = await getSupabaseService();
  return service.updateChapter(id, chapterData);
}

export async function deleteChapter(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deleteChapter(id);
}

export async function getChapterForContext(
  id: string
): Promise<Chapter | null> {
  const service = await getSupabaseService();
  return service.getChapterForContext(id);
}

export async function listChapters(projectId: string): Promise<Chapter[]> {
  const service = await getSupabaseService();
  return service.listChapters(projectId);
}

// --- Scene ---
export async function createScene(
  sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
): Promise<Scene> {
  const service = await getSupabaseService();
  return service.createScene(sceneData);
}

export async function updateScene(
  id: string,
  sceneData: DeepPartial<
    Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  >
): Promise<void> {
  const service = await getSupabaseService();
  return service.updateScene(id, sceneData);
}

export async function deleteScene(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deleteScene(id);
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
  const service = await getSupabaseService();
  return service.getSceneForContext(id);
}

export async function listScenes(chapterId: string): Promise<Scene[]> {
  const service = await getSupabaseService();
  return service.listScenes(chapterId);
}

// --- Panel ---
export async function createPanel(
  panelData: Omit<
    Panel,
    "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
  >
): Promise<Panel> {
  const service = await getSupabaseService();
  return service.createPanel(panelData);
}

export async function updatePanel(
  id: string,
  panelData: DeepPartial<
    Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
  >
): Promise<void> {
  const service = await getSupabaseService();
  return service.updatePanel(id, panelData);
}

export async function deletePanel(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deletePanel(id);
}

export async function assignCharacterToPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  const service = await getSupabaseService();
  return service.assignCharacterToPanel(panelId, characterId);
}

export async function removeCharacterFromPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  const service = await getSupabaseService();
  return service.removeCharacterFromPanel(panelId, characterId);
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
  const service = await getSupabaseService();
  return service.getPanelForContext(id);
}

export async function listPanels(sceneId: string): Promise<Panel[]> {
  const service = await getSupabaseService();
  return service.listPanels(sceneId);
}

// --- Dialogue ---
export async function createPanelDialogue(
  dialogueData: Omit<
    PanelDialogue,
    "id" | "createdAt" | "updatedAt" | "speaker"
  >
): Promise<PanelDialogue> {
  const service = await getSupabaseService();
  return service.createPanelDialogue(dialogueData);
}

export async function updatePanelDialogue(
  id: string,
  dialogueData: DeepPartial<
    Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
  >
): Promise<void> {
  const service = await getSupabaseService();
  return service.updatePanelDialogue(id, dialogueData);
}

export async function deletePanelDialogue(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deletePanelDialogue(id);
}

export async function getPanelDialogueForContext(
  id: string
): Promise<PanelDialogue | null> {
  const service = await getSupabaseService();
  return service.getPanelDialogueForContext(id);
}

export async function listPanelDialogues(
  panelId: string
): Promise<PanelDialogue[]> {
  const service = await getSupabaseService();
  return service.listPanelDialogues(panelId);
}

// --- Character ---
export async function getCharacter(id: string): Promise<Character | null> {
  const service = await getSupabaseService();
  return service.getCharacter(id);
}

export async function createCharacter(
  characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
): Promise<Character> {
  const service = await getSupabaseService();
  const character = await service.createCharacter(characterData);
  console.log({ character });
  return character;
}

export async function updateCharacter(
  id: string,
  characterData: DeepPartial<Omit<Character, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const service = await getSupabaseService();
  return service.updateCharacter(id, characterData);
}

export async function deleteCharacter(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deleteCharacter(id);
}

export async function getCharacterForContext(
  id: string
): Promise<Character | null> {
  const service = await getSupabaseService();
  return service.getCharacterForContext(id);
}

export async function listCharacters(projectId: string): Promise<Character[]> {
  const service = await getSupabaseService();
  return service.listCharacters(projectId);
}

// --- List Methods ---
export async function listMangaProjects(): Promise<MangaProject[]> {
  const service = await getSupabaseService();
  return service.listMangaProjects();
}

export async function getAllChapters(): Promise<Chapter[]> {
  const service = await getSupabaseService();
  return service.getAllChapters();
}

export async function getAllScenes(): Promise<Scene[]> {
  const service = await getSupabaseService();
  return service.getAllScenes();
}

export async function getAllPanels(): Promise<Panel[]> {
  const service = await getSupabaseService();
  return service.getAllPanels();
}

export async function getAllPanelDialogues(): Promise<PanelDialogue[]> {
  const service = await getSupabaseService();
  return service.getAllPanelDialogues();
}

export async function getAllCharacters(): Promise<Character[]> {
  const service = await getSupabaseService();
  return service.getAllCharacters();
}

// --- Template Methods ---
export async function createOutfitTemplate(
  templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
): Promise<OutfitTemplate> {
  const service = await getSupabaseService();
  return service.createOutfitTemplate(templateData);
}

export async function getOutfitTemplate(
  id: string
): Promise<OutfitTemplate | null> {
  const service = await getSupabaseService();
  return service.getOutfitTemplate(id);
}

export async function updateOutfitTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  const service = await getSupabaseService();
  return service.updateOutfitTemplate(id, templateData);
}

export async function deleteOutfitTemplate(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deleteOutfitTemplate(id);
}

export async function listOutfitTemplates(filters?: {
  category?: string;
  gender?: string;
  ageGroup?: string;
  season?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<OutfitTemplate[]> {
  const service = await getSupabaseService();
  return service.listOutfitTemplates(filters);
}

export async function createLocationTemplate(
  templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
): Promise<LocationTemplate> {
  const service = await getSupabaseService();
  return service.createLocationTemplate(templateData);
}

export async function getLocationTemplate(
  id: string
): Promise<LocationTemplate | null> {
  const service = await getSupabaseService();
  return service.getLocationTemplate(id);
}

export async function updateLocationTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  const service = await getSupabaseService();
  return service.updateLocationTemplate(id, templateData);
}

export async function deleteLocationTemplate(id: string): Promise<void> {
  const service = await getSupabaseService();
  return service.deleteLocationTemplate(id);
}

export async function listLocationTemplates(filters?: {
  category?: string;
  timeOfDay?: string;
  weather?: string;
  mood?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<LocationTemplate[]> {
  const service = await getSupabaseService();
  return service.listLocationTemplates(filters);
}

// --- Utility Functions ---
export async function cleanOrphanedData(): Promise<void> {
  // This would clean up orphaned data - for now, just return
  // Implementation could be added to call specific cleanup APIs
  return Promise.resolve();
}

export async function getChapters(projectId: string): Promise<Chapter[]> {
  const service = await getSupabaseService();
  return service.listChapters(projectId);
}

export async function getScenes(chapterId: string): Promise<Scene[]> {
  const service = await getSupabaseService();
  return service.listScenes(chapterId);
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  // Supabase service handles its own initialization
  console.log("✅ Data Service initialized (using Supabase service directly)");
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
