import type {
  Chapter,
  Character,
  LocationTemplate,
  LocationVariation,
  MangaProject,
  OutfitTemplate,
  OutfitVariation,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";
import type { DeepPartial } from "@/types/utils";
import type { IDataService } from "./data-service.interface";

let activeDataService: IDataService;

// Function to get the appropriate data service
export async function getDataService(): Promise<IDataService> {
  if (!activeDataService) {
    await initializeDataService();
  }
  return activeDataService;
}

// --- Project ---
export async function getAllProjects(): Promise<MangaProject[]> {
  return (await getDataService()).getAllProjects();
}

export async function getProject(id: string): Promise<MangaProject | null> {
  return (await getDataService()).getProject(id);
}

export async function createProject(
  projectData: Partial<MangaProject>
): Promise<MangaProject> {
  return (await getDataService()).createProject(projectData);
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
  return (await getDataService()).updateProject(id, projectData);
}

export async function deleteProject(id: string): Promise<void> {
  const chapters = await (await getDataService()).listChapters(id);
  for (const chapter of chapters) {
    await deleteChapter(chapter.id); // will cascade
  }
  await (await getDataService()).deleteProject(id);
}

export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  const project = await (await getDataService()).getProject(id);
  if (!project) return null;

  // Load chapters with their scenes and panels
  const chapters = await (await getDataService()).listChapters(id);
  for (const chapter of chapters) {
    const scenes = await (await getDataService()).listScenes(chapter.id);
    for (const scene of scenes) {
      const panels = await (await getDataService()).listPanels(scene.id);
      for (const panel of panels) {
        const dialogues = await (
          await getDataService()
        ).listPanelDialogues(panel.id);
        panel.dialogues = dialogues;
      }
      scene.panels = panels;
    }
    chapter.scenes = scenes;
  }

  // Load characters
  const characters = await (await getDataService()).listCharacters(id);

  return {
    ...project,
    chapters,
    characters,
  };
}

// --- Chapter ---
export async function createChapter(
  chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
): Promise<Chapter> {
  return (await getDataService()).createChapter(chapterData);
}

export async function updateChapter(
  id: string,
  chapterData: DeepPartial<
    Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  >
): Promise<void> {
  return (await getDataService()).updateChapter(id, chapterData);
}

export async function deleteChapter(id: string): Promise<void> {
  const scenes = await (await getDataService()).listScenes(id);
  for (const scene of scenes) {
    await deleteScene(scene.id); // will cascade
  }
  await (await getDataService()).deleteChapter(id);
}

export async function getChapterForContext(
  id: string
): Promise<Chapter | null> {
  return (await getDataService()).getChapterForContext(id);
}

// --- Scene ---
export async function createScene(
  sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
): Promise<Scene> {
  return (await getDataService()).createScene(sceneData);
}

export async function updateScene(
  id: string,
  sceneData: DeepPartial<
    Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  >
): Promise<void> {
  return (await getDataService()).updateScene(id, sceneData);
}

export async function deleteScene(id: string): Promise<void> {
  const panels = await (await getDataService()).listPanels(id);
  for (const panel of panels) {
    await deletePanel(panel.id); // will cascade
  }
  await (await getDataService()).deleteScene(id);
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
  return (await getDataService()).getSceneForContext(id);
}

// --- Panel ---
export async function createPanel(
  panelData: Omit<
    Panel,
    "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
  >
): Promise<Panel> {
  return (await getDataService()).createPanel(panelData);
}

export async function updatePanel(
  id: string,
  panelData: DeepPartial<
    Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
  >
): Promise<void> {
  return (await getDataService()).updatePanel(id, panelData);
}

export async function deletePanel(id: string): Promise<void> {
  const dialogues = await (await getDataService()).listPanelDialogues(id);
  for (const dialogue of dialogues) {
    await deletePanelDialogue(dialogue.id);
  }
  await (await getDataService()).deletePanel(id);
}

export async function assignCharacterToPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  return (await getDataService()).assignCharacterToPanel(panelId, characterId);
}

export async function removeCharacterFromPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  return (await getDataService()).removeCharacterFromPanel(
    panelId,
    characterId
  );
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
  return (await getDataService()).getPanelForContext(id);
}

// --- Dialogue ---
export async function createPanelDialogue(
  dialogueData: Omit<
    PanelDialogue,
    "id" | "createdAt" | "updatedAt" | "speaker"
  >
): Promise<PanelDialogue> {
  return (await getDataService()).createPanelDialogue(dialogueData);
}

export async function updatePanelDialogue(
  id: string,
  dialogueData: DeepPartial<
    Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
  >
): Promise<void> {
  return (await getDataService()).updatePanelDialogue(id, dialogueData);
}

export async function deletePanelDialogue(id: string): Promise<void> {
  return (await getDataService()).deletePanelDialogue(id);
}

export async function getPanelDialogueForContext(
  id: string
): Promise<PanelDialogue | null> {
  return (await getDataService()).getPanelDialogueForContext(id);
}

// --- Character ---
export async function listCharacters(projectId: string): Promise<Character[]> {
  return (await getDataService()).listCharacters(projectId);
}

export async function getCharacter(id: string): Promise<Character | null> {
  return (await getDataService()).getCharacter(id);
}

export async function createCharacter(
  characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
): Promise<Character> {
  return (await getDataService()).createCharacter(characterData);
}

export async function updateCharacter(
  id: string,
  characterData: DeepPartial<Omit<Character, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  return (await getDataService()).updateCharacter(id, characterData);
}

export async function deleteCharacter(id: string): Promise<void> {
  return (await getDataService()).deleteCharacter(id);
}

export async function getCharacterForContext(
  id: string
): Promise<Character | null> {
  return (await getDataService()).getCharacterForContext(id);
}

export async function getMangaProjects(): Promise<MangaProject[]> {
  return await (await getDataService()).listMangaProjects();
}

export async function getChapters(projectId: string): Promise<Chapter[]> {
  return await (await getDataService()).listChapters(projectId);
}

export async function getScenes(chapterId: string): Promise<Scene[]> {
  return await (await getDataService()).listScenes(chapterId);
}

export async function getPanels(sceneId: string): Promise<Panel[]> {
  return await (await getDataService()).listPanels(sceneId);
}

export async function getPanelDialogues(
  panelId: string
): Promise<PanelDialogue[]> {
  return await (await getDataService()).listPanelDialogues(panelId);
}

//////////////////////////////////////////////////////////////////

export async function cleanOrphanedData(): Promise<void> {
  // --- Clean Chapters with missing Projects ---
  const projects = await getAllProjects();
  const projectIds = new Set(projects.map((p) => p.id));
  const allChaptersRaw = await (await getDataService()).getAllChapters(); // Add this method if not exists

  for (const chapter of allChaptersRaw) {
    if (!projectIds.has(chapter.mangaProjectId)) {
      await deleteChapter(chapter.id);
    }
  }

  // --- Clean Scenes with missing Chapters ---
  const chapterIds = new Set(
    (await (await getDataService()).getAllChapters()).map((c: any) => c.id)
  );
  const allScenes = await (await getDataService()).getAllScenes(); // Add this method if not exists

  for (const scene of allScenes) {
    if (!chapterIds.has(scene.chapterId)) {
      await deleteScene(scene.id);
    }
  }

  // --- Clean Panels with missing Scenes ---
  const sceneIds = new Set(allScenes.map((s: any) => s.id));
  const allPanels = await (await getDataService()).getAllPanels(); // Add this method if not exists

  for (const panel of allPanels) {
    if (!sceneIds.has(panel.sceneId)) {
      await deletePanel(panel.id);
    }
  }

  // --- Clean Dialogues with missing Panels ---
  const panelIds = new Set(allPanels.map((p: any) => p.id));
  const allDialogues = await (await getDataService()).getAllPanelDialogues(); // Add this method if not exists

  for (const dialogue of allDialogues) {
    if (!panelIds.has(dialogue.panelId)) {
      await deletePanelDialogue(dialogue.id);
    }
  }

  // --- Clean Characters not linked to any Project  ---
  const characterList = await (await getDataService()).getAllCharacters(); // Add this if needed
  for (const character of characterList) {
    if (!projectIds.has(character.mangaProjectId)) {
      await deleteCharacter(character.id);
    }
  }
}

// --- Template Functions ---

// --- Outfit Templates ---
export async function createOutfitTemplate(
  templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
): Promise<OutfitTemplate> {
  return (await getDataService()).createOutfitTemplate(templateData);
}

export async function getOutfitTemplate(
  id: string
): Promise<OutfitTemplate | null> {
  return (await getDataService()).getOutfitTemplate(id);
}

export async function updateOutfitTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  return (await getDataService()).updateOutfitTemplate(id, templateData);
}

export async function deleteOutfitTemplate(id: string): Promise<void> {
  return (await getDataService()).deleteOutfitTemplate(id);
}

export async function listOutfitTemplates(filters?: {
  category?: string;
  gender?: string;
  ageGroup?: string;
  season?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<OutfitTemplate[]> {
  return (await getDataService()).listOutfitTemplates(filters);
}

// --- Location Templates ---
export async function createLocationTemplate(
  templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
): Promise<LocationTemplate> {
  return (await getDataService()).createLocationTemplate(templateData);
}

export async function getLocationTemplate(
  id: string
): Promise<LocationTemplate | null> {
  return (await getDataService()).getLocationTemplate(id);
}

export async function updateLocationTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  return (await getDataService()).updateLocationTemplate(id, templateData);
}

export async function deleteLocationTemplate(id: string): Promise<void> {
  return (await getDataService()).deleteLocationTemplate(id);
}

export async function listLocationTemplates(filters?: {
  category?: string;
  timeOfDay?: string;
  weather?: string;
  mood?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<LocationTemplate[]> {
  return (await getDataService()).listLocationTemplates(filters);
}

// --- Outfit Variations ---
export async function createOutfitVariation(
  baseOutfitId: string,
  variationData: Omit<
    OutfitVariation,
    "id" | "createdAt" | "updatedAt" | "usageCount" | "lastUsed"
  >
): Promise<OutfitVariation> {
  // Create the variation
  const variation: OutfitVariation = {
    ...variationData,
    id: crypto.randomUUID(),
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Get the base outfit template and add the variation to it
  const baseOutfit = await (
    await getDataService()
  ).getOutfitTemplate(baseOutfitId);
  if (!baseOutfit) {
    throw new Error(`Base outfit template with ID ${baseOutfitId} not found`);
  }

  // Add variation to the base outfit
  const updatedOutfit = {
    ...baseOutfit,
    variations: [...(baseOutfit.variations || []), variation],
    updatedAt: new Date(),
  };

  await (
    await getDataService()
  ).updateOutfitTemplate(baseOutfitId, updatedOutfit);
  return variation;
}

export async function getOutfitVariation(
  outfitId: string,
  variationId: string
): Promise<OutfitVariation | null> {
  const outfit = await (await getDataService()).getOutfitTemplate(outfitId);
  if (!outfit || !outfit.variations) return null;

  return (
    outfit.variations.find((v: OutfitVariation) => v.id === variationId) || null
  );
}

// --- Location Variations ---
export async function createLocationVariation(
  baseLocationId: string,
  variationData: Omit<
    LocationVariation,
    "id" | "createdAt" | "updatedAt" | "usageCount" | "lastUsed"
  >
): Promise<LocationVariation> {
  // Create the variation
  const variation: LocationVariation = {
    ...variationData,
    id: crypto.randomUUID(),
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Get the base location template and add the variation to it
  const baseLocation = await (
    await getDataService()
  ).getLocationTemplate(baseLocationId);
  if (!baseLocation) {
    throw new Error(
      `Base location template with ID ${baseLocationId} not found`
    );
  }

  // Add variation to the base location
  const updatedLocation = {
    ...baseLocation,
    variations: [...(baseLocation.variations || []), variation],
    updatedAt: new Date(),
  };

  await (
    await getDataService()
  ).updateLocationTemplate(baseLocationId, updatedLocation);
  return variation;
}

export async function getLocationVariation(
  locationId: string,
  variationId: string
): Promise<LocationVariation | null> {
  const location = await (
    await getDataService()
  ).getLocationTemplate(locationId);
  if (!location || !location.variations) return null;

  return (
    location.variations.find((v: LocationVariation) => v.id === variationId) ||
    null
  );
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  // Always use Supabase for all environments
  try {
    const { supabaseDataService } = await import("./supabase.service");
    activeDataService = supabaseDataService;
    await supabaseDataService.initialize();
    console.log("✅ Supabase data service initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Supabase data service:", error);
    throw error;
  }
}

// Export a convenient dataService object with template methods
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
