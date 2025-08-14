// Frontend Data Service - NestJS Backend Integration
import { apiRequest } from "@/lib/api-client";
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

// --- Project Methods ---
export async function getAllProjects(): Promise<MangaProject[]> {
  try {
    const response = await apiRequest.get<{
      success: boolean;
      data: MangaProject[];
    }>("/manga/projects");
    return response.data;
  } catch (error: any) {
    console.error("Get all projects error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch projects"
    );
  }
}

export async function getProject(id: string): Promise<MangaProject | null> {
  try {
    const response = await apiRequest.get<{
      success: boolean;
      data: MangaProject;
    }>(`/manga/projects/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get project error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch project");
  }
}

export async function createProject(mangaIdea: string): Promise<MangaProject> {
  try {
    const response = await apiRequest.post<{
      success: boolean;
      data: MangaProject;
    }>("/manga/projects", { mangaIdea });
    return response.data;
  } catch (error: any) {
    console.error("Create project error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create project"
    );
  }
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
  try {
    await apiRequest.put(`/manga/projects/${id}`, projectData);
  } catch (error: any) {
    console.error("Update project error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update project"
    );
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/projects/${id}`);
  } catch (error: any) {
    console.error("Delete project error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete project"
    );
  }
}

export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  return getProject(id);
}

// --- Chapter Methods ---
export async function createChapter(
  chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
): Promise<Chapter> {
  try {
    const { mangaProjectId, ...data } = chapterData;
    const response = await apiRequest.post<{ success: boolean; data: Chapter }>(
      `/manga/projects/${mangaProjectId}/chapters`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Create chapter error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create chapter"
    );
  }
}

export async function updateChapter(
  id: string,
  chapterData: DeepPartial<
    Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  >
): Promise<void> {
  try {
    await apiRequest.put(`/manga/chapters/${id}`, chapterData);
  } catch (error: any) {
    console.error("Update chapter error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update chapter"
    );
  }
}

export async function deleteChapter(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/chapters/${id}`);
  } catch (error: any) {
    console.error("Delete chapter error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete chapter"
    );
  }
}

export async function getChapterForContext(
  id: string
): Promise<Chapter | null> {
  try {
    return await apiRequest.get<Chapter>(`/manga/chapters/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get chapter error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch chapter");
  }
}

export async function listChapters(projectId: string): Promise<Chapter[]> {
  try {
    const response = await apiRequest.get<{
      success: boolean;
      data: Chapter[];
    }>(`/manga/projects/${projectId}/chapters`);
    return response.data;
  } catch (error: any) {
    console.error("List chapters error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch chapters"
    );
  }
}

export async function getChapters(projectId: string): Promise<Chapter[]> {
  return listChapters(projectId);
}

// --- Scene Methods ---
export async function createScene(
  sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
): Promise<Scene> {
  try {
    const { chapterId, ...data } = sceneData;
    return await apiRequest.post<Scene>(
      `/manga/chapters/${chapterId}/scenes`,
      data
    );
  } catch (error: any) {
    console.error("Create scene error:", error);
    throw new Error(error.response?.data?.message || "Failed to create scene");
  }
}

export async function updateScene(
  id: string,
  sceneData: DeepPartial<
    Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  >
): Promise<void> {
  try {
    await apiRequest.put(`/manga/scenes/${id}`, sceneData);
  } catch (error: any) {
    console.error("Update scene error:", error);
    throw new Error(error.response?.data?.message || "Failed to update scene");
  }
}

export async function deleteScene(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/scenes/${id}`);
  } catch (error: any) {
    console.error("Delete scene error:", error);
    throw new Error(error.response?.data?.message || "Failed to delete scene");
  }
}

export async function getSceneForContext(id: string): Promise<Scene | null> {
  try {
    return await apiRequest.get<Scene>(`/manga/scenes/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get scene error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch scene");
  }
}

export async function listScenes(chapterId: string): Promise<Scene[]> {
  try {
    return await apiRequest.get<Scene[]>(`/manga/chapters/${chapterId}/scenes`);
  } catch (error: any) {
    console.error("List scenes error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch scenes");
  }
}

export async function getScenes(chapterId: string): Promise<Scene[]> {
  return listScenes(chapterId);
}

// --- Panel Methods ---
export async function createPanel(
  panelData: Omit<
    Panel,
    "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
  >
): Promise<Panel> {
  try {
    const { sceneId, ...data } = panelData;
    return await apiRequest.post<Panel>(
      `/manga/scenes/${sceneId}/panels`,
      data
    );
  } catch (error: any) {
    console.error("Create panel error:", error);
    throw new Error(error.response?.data?.message || "Failed to create panel");
  }
}

export async function updatePanel(
  id: string,
  panelData: DeepPartial<
    Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
  >
): Promise<void> {
  try {
    await apiRequest.put(`/manga/panels/${id}`, panelData);
  } catch (error: any) {
    console.error("Update panel error:", error);
    throw new Error(error.response?.data?.message || "Failed to update panel");
  }
}

export async function deletePanel(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/panels/${id}`);
  } catch (error: any) {
    console.error("Delete panel error:", error);
    throw new Error(error.response?.data?.message || "Failed to delete panel");
  }
}

export async function assignCharacterToPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  try {
    await apiRequest.post(`/manga/panels/${panelId}/characters`, {
      characterId,
    });
  } catch (error: any) {
    console.error("Assign character to panel error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to assign character to panel"
    );
  }
}

export async function removeCharacterFromPanel(
  panelId: string,
  characterId: string
): Promise<void> {
  try {
    await apiRequest.delete(
      `/manga/panels/${panelId}/characters/${characterId}`
    );
  } catch (error: any) {
    console.error("Remove character from panel error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to remove character from panel"
    );
  }
}

export async function getPanelForContext(id: string): Promise<Panel | null> {
  try {
    return await apiRequest.get<Panel>(`/manga/panels/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get panel error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch panel");
  }
}

export async function listPanels(sceneId: string): Promise<Panel[]> {
  try {
    return await apiRequest.get<Panel[]>(`/manga/scenes/${sceneId}/panels`);
  } catch (error: any) {
    console.error("List panels error:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch panels");
  }
}

// --- Dialogue Methods ---
export async function createPanelDialogue(
  dialogueData: Omit<
    PanelDialogue,
    "id" | "createdAt" | "updatedAt" | "speaker"
  >
): Promise<PanelDialogue> {
  try {
    const { panelId, ...data } = dialogueData;
    return await apiRequest.post<PanelDialogue>(
      `/manga/panels/${panelId}/dialogues`,
      data
    );
  } catch (error: any) {
    console.error("Create dialogue error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create dialogue"
    );
  }
}

export async function updatePanelDialogue(
  id: string,
  dialogueData: DeepPartial<
    Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
  >
): Promise<void> {
  try {
    await apiRequest.put(`/manga/dialogues/${id}`, dialogueData);
  } catch (error: any) {
    console.error("Update dialogue error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update dialogue"
    );
  }
}

export async function deletePanelDialogue(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/dialogues/${id}`);
  } catch (error: any) {
    console.error("Delete dialogue error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete dialogue"
    );
  }
}

export async function getPanelDialogueForContext(
  id: string
): Promise<PanelDialogue | null> {
  try {
    return await apiRequest.get<PanelDialogue>(`/manga/dialogues/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get dialogue error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch dialogue"
    );
  }
}

export async function listPanelDialogues(
  panelId: string
): Promise<PanelDialogue[]> {
  try {
    return await apiRequest.get<PanelDialogue[]>(
      `/manga/panels/${panelId}/dialogues`
    );
  } catch (error: any) {
    console.error("List dialogues error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch dialogues"
    );
  }
}

// --- Character Methods ---
export async function getCharacter(id: string): Promise<Character | null> {
  try {
    return await apiRequest.get<Character>(`/manga/characters/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get character error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch character"
    );
  }
}

export async function createCharacter(
  characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
): Promise<Character> {
  try {
    const { mangaProjectId, ...data } = characterData;
    const response = await apiRequest.post<{
      success: boolean;
      data: Character;
    }>(`/manga/projects/${mangaProjectId}/characters`, data);
    return response.data;
  } catch (error: any) {
    console.error("Create character error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create character"
    );
  }
}

export async function updateCharacter(
  id: string,
  characterData: DeepPartial<Omit<Character, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    await apiRequest.put(`/manga/characters/${id}`, characterData);
  } catch (error: any) {
    console.error("Update character error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update character"
    );
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/characters/${id}`);
  } catch (error: any) {
    console.error("Delete character error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete character"
    );
  }
}

export async function getCharacterForContext(
  id: string
): Promise<Character | null> {
  return getCharacter(id);
}

export async function listCharacters(projectId: string): Promise<Character[]> {
  try {
    const response = await apiRequest.get<{
      success: boolean;
      data: Character[];
    }>(`/manga/projects/${projectId}/characters`);
    return response.data;
  } catch (error: any) {
    console.error("List characters error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch characters"
    );
  }
}

// --- List Methods ---
export async function listMangaProjects(): Promise<MangaProject[]> {
  return getAllProjects();
}

export async function getAllChapters(): Promise<Chapter[]> {
  try {
    return await apiRequest.get<Chapter[]>("/manga/chapters");
  } catch (error: any) {
    console.error("Get all chapters error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch all chapters"
    );
  }
}

export async function getAllScenes(): Promise<Scene[]> {
  try {
    return await apiRequest.get<Scene[]>("/manga/scenes");
  } catch (error: any) {
    console.error("Get all scenes error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch all scenes"
    );
  }
}

export async function getAllPanels(): Promise<Panel[]> {
  try {
    return await apiRequest.get<Panel[]>("/manga/panels");
  } catch (error: any) {
    console.error("Get all panels error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch all panels"
    );
  }
}

export async function getAllPanelDialogues(): Promise<PanelDialogue[]> {
  try {
    return await apiRequest.get<PanelDialogue[]>("/manga/dialogues");
  } catch (error: any) {
    console.error("Get all dialogues error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch all dialogues"
    );
  }
}

export async function getAllCharacters(): Promise<Character[]> {
  try {
    return await apiRequest.get<Character[]>("/manga/characters");
  } catch (error: any) {
    console.error("Get all characters error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch all characters"
    );
  }
}

// --- Template Methods ---
export async function createOutfitTemplate(
  templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
): Promise<OutfitTemplate> {
  try {
    const { mangaProjectId, ...data } = templateData;
    return await apiRequest.post<OutfitTemplate>(
      `/manga/projects/${mangaProjectId}/outfit-templates`,
      data
    );
  } catch (error: any) {
    console.error("Create outfit template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create outfit template"
    );
  }
}

export async function getOutfitTemplate(
  id: string
): Promise<OutfitTemplate | null> {
  try {
    return await apiRequest.get<OutfitTemplate>(
      `/manga/outfit-templates/${id}`
    );
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get outfit template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch outfit template"
    );
  }
}

export async function updateOutfitTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  try {
    await apiRequest.put(`/manga/outfit-templates/${id}`, templateData);
  } catch (error: any) {
    console.error("Update outfit template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update outfit template"
    );
  }
}

export async function deleteOutfitTemplate(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/outfit-templates/${id}`);
  } catch (error: any) {
    console.error("Delete outfit template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete outfit template"
    );
  }
}

export async function listOutfitTemplates(filters?: {
  category?: string;
  gender?: string;
  ageGroup?: string;
  season?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<OutfitTemplate[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/manga/outfit-templates${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await apiRequest.get<OutfitTemplate[]>(url);
  } catch (error: any) {
    console.error("List outfit templates error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch outfit templates"
    );
  }
}

export async function createLocationTemplate(
  templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
): Promise<LocationTemplate> {
  try {
    const { mangaProjectId, ...data } = templateData;
    return await apiRequest.post<LocationTemplate>(
      `/manga/projects/${mangaProjectId}/location-templates`,
      data
    );
  } catch (error: any) {
    console.error("Create location template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create location template"
    );
  }
}

export async function getLocationTemplate(
  id: string
): Promise<LocationTemplate | null> {
  try {
    return await apiRequest.get<LocationTemplate>(
      `/manga/location-templates/${id}`
    );
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Get location template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch location template"
    );
  }
}

export async function updateLocationTemplate(
  id: string,
  templateData: DeepPartial<
    Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  try {
    await apiRequest.put(`/manga/location-templates/${id}`, templateData);
  } catch (error: any) {
    console.error("Update location template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update location template"
    );
  }
}

export async function deleteLocationTemplate(id: string): Promise<void> {
  try {
    await apiRequest.delete(`/manga/location-templates/${id}`);
  } catch (error: any) {
    console.error("Delete location template error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete location template"
    );
  }
}

export async function listLocationTemplates(filters?: {
  category?: string;
  timeOfDay?: string;
  weather?: string;
  mood?: string;
  style?: string;
  activeOnly?: boolean;
}): Promise<LocationTemplate[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/manga/location-templates${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await apiRequest.get<LocationTemplate[]>(url);
  } catch (error: any) {
    console.error("List location templates error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch location templates"
    );
  }
}

// --- Utility Functions ---
export async function cleanOrphanedData(): Promise<void> {
  // Implementation for cleanup - could be added later if backend supports it
  return Promise.resolve();
}

// --- Initialization ---
export async function initializeDataService(): Promise<void> {
  // No initialization needed for API client
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
