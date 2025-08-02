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
 * Client-side data service that uses API endpoints instead of direct database access
 */
export class APIDataService {
  private static instance: APIDataService;

  private constructor() {}

  public static getInstance(): APIDataService {
    if (!APIDataService.instance) {
      APIDataService.instance = new APIDataService();
    }
    return APIDataService.instance;
  }

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`/api/data${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `API call failed: ${response.status}`);
    }

    return data.data;
  }

  // --- Project Methods ---
  async getAllProjects(): Promise<MangaProject[]> {
    return this.apiCall<MangaProject[]>("/projects");
  }

  async getProject(id: string): Promise<MangaProject | null> {
    try {
      return await this.apiCall<MangaProject>(`/projects/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async createProject(
    projectData: Partial<MangaProject>
  ): Promise<MangaProject> {
    return this.apiCall<MangaProject>("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(
    id: string,
    projectData: DeepPartial<
      Omit<
        MangaProject,
        "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
      >
    >
  ): Promise<void> {
    await this.apiCall(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.apiCall(`/projects/${id}`, {
      method: "DELETE",
    });
  }

  async getProjectWithRelations(id: string): Promise<MangaProject | null> {
    try {
      return await this.apiCall<MangaProject>(`/projects/${id}/with-relations`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  // --- Chapter Methods ---
  async createChapter(
    chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  ): Promise<Chapter> {
    return this.apiCall<Chapter>("/chapters", {
      method: "POST",
      body: JSON.stringify(chapterData),
    });
  }

  async updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void> {
    await this.apiCall(`/chapters/${id}`, {
      method: "PUT",
      body: JSON.stringify(chapterData),
    });
  }

  async deleteChapter(id: string): Promise<void> {
    await this.apiCall(`/chapters/${id}`, {
      method: "DELETE",
    });
  }

  async getChapterForContext(id: string): Promise<Chapter | null> {
    try {
      return await this.apiCall<Chapter>(`/chapters/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async listChapters(projectId: string): Promise<Chapter[]> {
    return this.apiCall<Chapter[]>(`/chapters?projectId=${projectId}`);
  }

  // --- Scene Methods ---
  async createScene(
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<Scene> {
    return this.apiCall<Scene>("/scenes", {
      method: "POST",
      body: JSON.stringify(sceneData),
    });
  }

  async updateScene(
    id: string,
    sceneData: DeepPartial<
      Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
    >
  ): Promise<void> {
    await this.apiCall(`/scenes/${id}`, {
      method: "PUT",
      body: JSON.stringify(sceneData),
    });
  }

  async deleteScene(id: string): Promise<void> {
    await this.apiCall(`/scenes/${id}`, {
      method: "DELETE",
    });
  }

  async getSceneForContext(id: string): Promise<Scene | null> {
    try {
      return await this.apiCall<Scene>(`/scenes/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async listScenes(chapterId: string): Promise<Scene[]> {
    return this.apiCall<Scene[]>(`/scenes?chapterId=${chapterId}`);
  }

  // --- Panel Methods ---
  async createPanel(
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<Panel> {
    return this.apiCall<Panel>("/panels", {
      method: "POST",
      body: JSON.stringify(panelData),
    });
  }

  async updatePanel(
    id: string,
    panelData: DeepPartial<
      Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
    >
  ): Promise<void> {
    await this.apiCall(`/panels/${id}`, {
      method: "PUT",
      body: JSON.stringify(panelData),
    });
  }

  async deletePanel(id: string): Promise<void> {
    await this.apiCall(`/panels/${id}`, {
      method: "DELETE",
    });
  }

  async assignCharacterToPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await this.apiCall(`/panels/${panelId}/characters`, {
      method: "POST",
      body: JSON.stringify({ characterId }),
    });
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await this.apiCall(`/panels/${panelId}/characters/${characterId}`, {
      method: "DELETE",
    });
  }

  async getPanelForContext(id: string): Promise<Panel | null> {
    try {
      return await this.apiCall<Panel>(`/panels/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async listPanels(sceneId: string): Promise<Panel[]> {
    return this.apiCall<Panel[]>(`/panels?sceneId=${sceneId}`);
  }

  // --- Dialogue Methods ---
  async createPanelDialogue(
    dialogueData: Omit<
      PanelDialogue,
      "id" | "createdAt" | "updatedAt" | "speaker"
    >
  ): Promise<PanelDialogue> {
    return this.apiCall<PanelDialogue>("/dialogues", {
      method: "POST",
      body: JSON.stringify(dialogueData),
    });
  }

  async updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void> {
    await this.apiCall(`/dialogues/${id}`, {
      method: "PUT",
      body: JSON.stringify(dialogueData),
    });
  }

  async deletePanelDialogue(id: string): Promise<void> {
    await this.apiCall(`/dialogues/${id}`, {
      method: "DELETE",
    });
  }

  async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    try {
      return await this.apiCall<PanelDialogue>(`/dialogues/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async listPanelDialogues(panelId: string): Promise<PanelDialogue[]> {
    return this.apiCall<PanelDialogue[]>(`/dialogues?panelId=${panelId}`);
  }

  // --- Character Methods ---
  async getCharacter(id: string): Promise<Character | null> {
    try {
      return await this.apiCall<Character>(`/characters/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async createCharacter(
    characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<Character> {
    return this.apiCall<Character>("/characters", {
      method: "POST",
      body: JSON.stringify(characterData),
    });
  }

  async updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await this.apiCall(`/characters/${id}`, {
      method: "PUT",
      body: JSON.stringify(characterData),
    });
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.apiCall(`/characters/${id}`, {
      method: "DELETE",
    });
  }

  async getCharacterForContext(id: string): Promise<Character | null> {
    return this.getCharacter(id);
  }

  async listCharacters(projectId: string): Promise<Character[]> {
    return this.apiCall<Character[]>(`/characters?projectId=${projectId}`);
  }

  // --- List Methods ---
  async listMangaProjects(): Promise<MangaProject[]> {
    return this.getAllProjects();
  }

  async getAllChapters(): Promise<Chapter[]> {
    return this.apiCall<Chapter[]>("/chapters/all");
  }

  async getAllScenes(): Promise<Scene[]> {
    return this.apiCall<Scene[]>("/scenes/all");
  }

  async getAllPanels(): Promise<Panel[]> {
    return this.apiCall<Panel[]>("/panels/all");
  }

  async getAllPanelDialogues(): Promise<PanelDialogue[]> {
    return this.apiCall<PanelDialogue[]>("/dialogues/all");
  }

  async getAllCharacters(): Promise<Character[]> {
    return this.apiCall<Character[]>("/characters/all");
  }

  // --- Template Methods ---
  async createOutfitTemplate(
    templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<OutfitTemplate> {
    return this.apiCall<OutfitTemplate>("/templates/outfits", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  }

  async getOutfitTemplate(id: string): Promise<OutfitTemplate | null> {
    try {
      return await this.apiCall<OutfitTemplate>(`/templates/outfits/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async updateOutfitTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await this.apiCall(`/templates/outfits/${id}`, {
      method: "PUT",
      body: JSON.stringify(templateData),
    });
  }

  async deleteOutfitTemplate(id: string): Promise<void> {
    await this.apiCall(`/templates/outfits/${id}`, {
      method: "DELETE",
    });
  }

  async listOutfitTemplates(filters?: {
    category?: string;
    gender?: string;
    ageGroup?: string;
    season?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<OutfitTemplate[]> {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return this.apiCall<OutfitTemplate[]>(`/templates/outfits?${queryParams}`);
  }

  async createLocationTemplate(
    templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<LocationTemplate> {
    return this.apiCall<LocationTemplate>("/templates/locations", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  }

  async getLocationTemplate(id: string): Promise<LocationTemplate | null> {
    try {
      return await this.apiCall<LocationTemplate>(`/templates/locations/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async updateLocationTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await this.apiCall(`/templates/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(templateData),
    });
  }

  async deleteLocationTemplate(id: string): Promise<void> {
    await this.apiCall(`/templates/locations/${id}`, {
      method: "DELETE",
    });
  }

  async listLocationTemplates(filters?: {
    category?: string;
    timeOfDay?: string;
    weather?: string;
    mood?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<LocationTemplate[]> {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return this.apiCall<LocationTemplate[]>(
      `/templates/locations?${queryParams}`
    );
  }

  // --- Initialization ---
  async initialize(): Promise<void> {
    // No initialization needed for API client
    return Promise.resolve();
  }
}

// Export singleton instance
export const apiDataService = APIDataService.getInstance();
