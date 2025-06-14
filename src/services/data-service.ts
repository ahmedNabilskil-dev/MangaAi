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
  const chapters = await activeDataService.listChapters(id);
  for (const chapter of chapters) {
    await deleteChapter(chapter.id); // will cascade
  }
  await activeDataService.deleteProject(id);
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
  const scenes = await activeDataService.listScenes(id);
  for (const scene of scenes) {
    await deleteScene(scene.id); // will cascade
  }
  await activeDataService.deleteChapter(id);
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
  const panels = await activeDataService.listPanels(id);
  for (const panel of panels) {
    await deletePanel(panel.id); // will cascade
  }
  await activeDataService.deleteScene(id);
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
  const dialogues = await activeDataService.listPanelDialogues(id);
  for (const dialogue of dialogues) {
    await deletePanelDialogue(dialogue.id);
  }
  await activeDataService.deletePanel(id);
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

//////////////////////////////////////////////////////////////////

export async function cleanOrphanedData(): Promise<void> {
  // --- Clean Chapters with missing Projects ---
  const projects = await getAllProjects();
  const projectIds = new Set(projects.map((p) => p.id));
  const allChaptersRaw = await activeDataService.getAllChapters(); // Add this method if not exists

  for (const chapter of allChaptersRaw) {
    if (!projectIds.has(chapter.mangaProjectId)) {
      await deleteChapter(chapter.id);
    }
  }

  // --- Clean Scenes with missing Chapters ---
  const chapterIds = new Set(
    (await activeDataService.getAllChapters()).map((c) => c.id)
  );
  const allScenes = await activeDataService.getAllScenes(); // Add this method if not exists

  for (const scene of allScenes) {
    if (!chapterIds.has(scene.chapterId)) {
      await deleteScene(scene.id);
    }
  }

  // --- Clean Panels with missing Scenes ---
  const sceneIds = new Set(allScenes.map((s) => s.id));
  const allPanels = await activeDataService.getAllPanels(); // Add this method if not exists

  for (const panel of allPanels) {
    if (!sceneIds.has(panel.sceneId)) {
      await deletePanel(panel.id);
    }
  }

  // --- Clean Dialogues with missing Panels ---
  const panelIds = new Set(allPanels.map((p) => p.id));
  const allDialogues = await activeDataService.getAllPanelDialogues(); // Add this method if not exists

  for (const dialogue of allDialogues) {
    if (!panelIds.has(dialogue.panelId)) {
      await deletePanelDialogue(dialogue.id);
    }
  }

  // --- Clean Characters not linked to any Project  ---
  const characterList = await activeDataService.getAllCharacters(); // Add this if needed
  for (const character of characterList) {
    if (!projectIds.has(character.mangaProjectId)) {
      await deleteCharacter(character.id);
    }
  }
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  if (activeDataService.initialize) {
    return activeDataService.initialize();
  }
  return Promise.resolve();
}
