import { db, getProjectWithRelations } from "@/services/db";
import type {
  Chapter,
  Character,
  EffectTemplate,
  LocationTemplate,
  MangaProject,
  OutfitTemplate,
  Panel,
  PanelDialogue,
  PoseTemplate,
  Scene,
} from "@/types/entities";
import type { DeepPartial } from "@/types/utils";
import { v4 as uuidv4 } from "uuid";
import type { IDataService } from "./data-service.interface";

class DexieDataService implements IDataService {
  // --- Project ---
  async getAllProjects(): Promise<MangaProject[]> {
    return await db.projects.toArray();
  }

  async getProject(id: string): Promise<MangaProject | null> {
    return getProjectWithRelations(id);
  }

  async createProject(
    projectData: Omit<
      MangaProject,
      "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
    >
  ): Promise<MangaProject> {
    const newId = uuidv4();
    const newProject: MangaProject = {
      ...projectData,
      id: newId,
      chapters: [],
      characters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.projects.add(newProject);
    return newProject;
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
    await db.projects.update(id, { ...projectData, updatedAt: new Date() });
  }

  async deleteProject(id: string): Promise<any> {
    const project = await getProjectWithRelations(id);

    await Promise.all(
      (project?.chapters || []).map(async (chapter) => {
        (chapter.scenes || []).map(async (scene) => {
          (scene.panels || []).map(async (panel) => {
            (panel.dialogues || []).map(async (dialog) => {
              return await db.dialogues.delete(dialog.id);
            });
            return await db.panels.delete(panel.id);
          });
          return await db.scenes.delete(scene.id);
        });
        return await db.chapters.delete(chapter.id);
      })
    );
    return await db.projects.delete(id);
  }

  // --- Chapter ---
  async createChapter(
    chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  ): Promise<Chapter> {
    const newId = uuidv4();
    const newChapter: Chapter = {
      ...chapterData,
      id: newId,
      scenes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.chapters.add(newChapter);
    return newChapter;
  }

  async updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void> {
    await db.chapters.update(id, { ...chapterData, updatedAt: new Date() });
  }

  async deleteChapter(id: string): Promise<void> {
    await db.transaction(
      "rw",
      db.chapters,
      db.scenes,
      db.panels,
      db.dialogues,
      async () => {
        const scenes = await db.scenes.where("chapterId").equals(id).toArray();
        await Promise.all([
          ...scenes.map((scene) => this.deleteScene(scene.id)),
          db.chapters.delete(id),
        ]);
      }
    );
  }

  async getChapterForContext(id: string): Promise<Chapter | null> {
    return (await db.chapters.get(id)) || null;
  }

  // --- Scene ---
  async createScene(
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<Scene> {
    const newId = uuidv4();
    const newScene: Scene = {
      ...sceneData,
      id: newId,
      panels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.scenes.add(newScene);
    return newScene;
  }

  async updateScene(
    id: string,
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<void> {
    await db.scenes.update(id, {
      ...sceneData,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  }

  async deleteScene(id: string): Promise<void> {
    await db.transaction("rw", db.scenes, db.panels, db.dialogues, async () => {
      const panels = await db.panels.where("sceneId").equals(id).toArray();
      await Promise.all([
        ...panels.map((panel) => this.deletePanel(panel.id)),
        db.scenes.delete(id),
      ]);
    });
  }

  async getSceneForContext(id: string): Promise<Scene | null> {
    return (await db.scenes.get(id)) || null;
  }

  // --- Panel ---
  async createPanel(
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<Panel> {
    const newId = uuidv4();
    const newPanel: Panel = {
      ...panelData,
      id: newId,
      dialogues: [],
      characters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.panels.add(newPanel);
    return newPanel;
  }

  async updatePanel(
    id: string,
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<void> {
    const updatePayload = {
      ...panelData,
      updatedAt: new Date(),
    };
    await db.panels.update(id, updatePayload);
  }

  async deletePanel(id: string): Promise<void> {
    await db.transaction("rw", db.panels, db.dialogues, async () => {
      await db.dialogues.where("panelId").equals(id).delete();
      await db.panels.delete(id);
    });
  }

  async assignCharacterToPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await db.transaction("rw", db.panels, db.characters, async () => {
      const panel = await db.panels.get(panelId);
      if (!panel) throw new Error(`Panel ${panelId} not found`);

      const character = await db.characters.get(characterId);
      if (!character) throw new Error(`Character ${characterId} not found`);

      // Check if character is already assigned to this panel
      const isAlreadyAssigned = panel.characters?.some(
        (c) => c.id === characterId
      );
      if (!isAlreadyAssigned) {
        const updatedCharacters = [...(panel.characters || []), character];
        await db.panels.update(panelId, {
          characters: updatedCharacters,
          updatedAt: new Date(),
        });
      }
    });
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await db.transaction("rw", db.panels, async () => {
      const panel = await db.panels.get(panelId);
      if (!panel) throw new Error(`Panel ${panelId} not found`);

      const updatedCharacters = (panel.characters || []).filter(
        (character) => character.id !== characterId
      );
      await db.panels.update(panelId, {
        characters: updatedCharacters,
        updatedAt: new Date(),
      });
    });
  }

  async getPanelForContext(id: string): Promise<Panel | null> {
    return (await db.panels.get(id)) || null;
  }

  // --- Dialogue ---
  async createPanelDialogue(
    dialogueData: Omit<
      PanelDialogue,
      "id" | "createdAt" | "updatedAt" | "speaker"
    >
  ): Promise<PanelDialogue> {
    const newId = uuidv4();
    const newDialogue: PanelDialogue = {
      ...dialogueData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.dialogues.add(newDialogue);
    return newDialogue;
  }

  async updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void> {
    await db.dialogues.update(id, { ...dialogueData, updatedAt: new Date() });
  }

  async deletePanelDialogue(id: string): Promise<void> {
    await db.dialogues.delete(id);
  }

  async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    return (await db.dialogues.get(id)) || null;
  }

  // --- Character ---
  async listCharacters(projectId?: string): Promise<Character[]> {
    if (projectId) {
      return await db.characters
        .where("mangaProjectId")
        .equals(projectId)
        .toArray();
    }
    return await db.characters.toArray();
  }

  async getCharacter(id: string): Promise<Character | null> {
    return (await db.characters.get(id)) || null;
  }

  async createCharacter(
    characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<Character> {
    const newId = uuidv4();
    const newCharacter: Character = {
      ...characterData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.characters.add(newCharacter);
    return newCharacter;
  }

  async updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await db.characters.update(id, { ...characterData, updatedAt: new Date() });
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.transaction(
      "rw",
      db.characters,
      db.panels,
      db.dialogues,
      async () => {
        // Remove character from all panels where they appear
        const allPanels = await db.panels.toArray();
        const panelsWithCharacter = allPanels.filter((panel) =>
          panel.characters?.some((char) => char.id === id)
        );

        await Promise.all(
          panelsWithCharacter.map((panel) =>
            db.panels.update(panel.id, {
              characters: (panel.characters || []).filter(
                (character) => character.id !== id
              ),
              updatedAt: new Date(),
            })
          )
        );

        await db.dialogues.where("speakerId").equals(id).modify({
          speakerId: null,
          updatedAt: new Date(),
        });

        await db.characters.delete(id);
      }
    );
  }

  getCharacterForContext = this.getCharacter;

  // MangaProject
  async listMangaProjects(): Promise<MangaProject[]> {
    return await db.projects.toArray();
  }

  // Chapters by Project ID
  async listChapters(projectId: string): Promise<Chapter[]> {
    return await db.chapters
      .where("mangaProjectId")
      .equals(projectId)
      .toArray();
  }

  // Scenes by Chapter ID
  async listScenes(chapterId: string): Promise<Scene[]> {
    return await db.scenes.where("chapterId").equals(chapterId).toArray();
  }

  // Panels by Scene ID
  async listPanels(sceneId: string): Promise<Panel[]> {
    return await db.panels.where("sceneId").equals(sceneId).toArray();
  }

  // Dialogues by Panel ID
  async listPanelDialogues(panelId: string): Promise<PanelDialogue[]> {
    return await db.dialogues.where("panelId").equals(panelId).toArray();
  }

  async getAllChapters(): Promise<Chapter[]> {
    return db.chapters.toArray();
  }

  async getAllScenes(): Promise<Scene[]> {
    return db.scenes.toArray();
  }

  async getAllPanels(): Promise<Panel[]> {
    return db.panels.toArray();
  }

  async getAllPanelDialogues(): Promise<PanelDialogue[]> {
    return db.dialogues.toArray();
  }

  async getAllCharacters(): Promise<Character[]> {
    return db.characters.toArray();
  }

  // --- Template Methods ---

  // --- Outfit Templates ---
  async createOutfitTemplate(
    templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<OutfitTemplate> {
    const newId = uuidv4();
    const newTemplate: OutfitTemplate = {
      ...templateData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.outfitTemplates.add(newTemplate);
    return newTemplate;
  }

  async getOutfitTemplate(id: string): Promise<OutfitTemplate | null> {
    return (await db.outfitTemplates.get(id)) || null;
  }

  async updateOutfitTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const existingTemplate = await db.outfitTemplates.get(id);
    if (!existingTemplate) return;

    // Create update object with only the fields that are provided
    const updateData: any = {
      ...templateData,
      updatedAt: new Date(),
    };

    // If components are provided, ensure they have the correct structure
    if (templateData.components) {
      updateData.components = templateData.components.map((comp: any) => ({
        type: comp.type || "top",
        item: comp.item || "",
        color: comp.color,
        material: comp.material,
        pattern: comp.pattern,
      }));
    }

    await db.outfitTemplates.update(id, updateData);
  }

  async deleteOutfitTemplate(id: string): Promise<void> {
    await db.outfitTemplates.delete(id);
  }

  async listOutfitTemplates(filters?: {
    category?: string;
    gender?: string;
    ageGroup?: string;
    season?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<OutfitTemplate[]> {
    let query = db.outfitTemplates.toCollection();

    if (filters?.activeOnly) {
      query = query.filter((template) => template.isActive);
    }
    if (filters?.category) {
      query = query.filter(
        (template) => template.category === filters.category
      );
    }
    if (filters?.gender) {
      query = query.filter((template) => template.gender === filters.gender);
    }
    if (filters?.ageGroup) {
      query = query.filter(
        (template) => template.ageGroup === filters.ageGroup
      );
    }
    if (filters?.season) {
      query = query.filter((template) => template.season === filters.season);
    }
    if (filters?.style) {
      query = query.filter((template) => template.style === filters.style);
    }

    return await query.toArray();
  }

  // --- Location Templates ---
  async createLocationTemplate(
    templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<LocationTemplate> {
    const newId = uuidv4();
    const newTemplate: LocationTemplate = {
      ...templateData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.locationTemplates.add(newTemplate);
    return newTemplate;
  }

  async getLocationTemplate(id: string): Promise<LocationTemplate | null> {
    return (await db.locationTemplates.get(id)) || null;
  }

  async updateLocationTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const updateData: any = {
      ...templateData,
      updatedAt: new Date(),
    };

    await db.locationTemplates.update(id, updateData);
  }

  async deleteLocationTemplate(id: string): Promise<void> {
    await db.locationTemplates.delete(id);
  }

  async listLocationTemplates(filters?: {
    category?: string;
    timeOfDay?: string;
    weather?: string;
    mood?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<LocationTemplate[]> {
    let query = db.locationTemplates.toCollection();

    if (filters?.activeOnly) {
      query = query.filter((template) => template.isActive);
    }
    if (filters?.category) {
      query = query.filter(
        (template) => template.category === filters.category
      );
    }
    if (filters?.timeOfDay) {
      query = query.filter(
        (template) => template.timeOfDay === filters.timeOfDay
      );
    }
    if (filters?.weather) {
      query = query.filter((template) => template.weather === filters.weather);
    }
    if (filters?.mood) {
      query = query.filter((template) => template.mood === filters.mood);
    }
    if (filters?.style) {
      query = query.filter((template) => template.style === filters.style);
    }

    return await query.toArray();
  }

  // --- Pose Templates ---
  async createPoseTemplate(
    templateData: Omit<PoseTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<PoseTemplate> {
    const newId = uuidv4();
    const newTemplate: PoseTemplate = {
      ...templateData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.poseTemplates.add(newTemplate);
    return newTemplate;
  }

  async getPoseTemplate(id: string): Promise<PoseTemplate | null> {
    return (await db.poseTemplates.get(id)) || null;
  }

  async updatePoseTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<PoseTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const updateData: any = {
      ...templateData,
      updatedAt: new Date(),
    };

    await db.poseTemplates.update(id, updateData);
  }

  async deletePoseTemplate(id: string): Promise<void> {
    await db.poseTemplates.delete(id);
  }

  async listPoseTemplates(filters?: {
    category?: string;
    emotion?: string;
    difficulty?: string;
    gender?: string;
    ageGroup?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<PoseTemplate[]> {
    let query = db.poseTemplates.toCollection();

    if (filters?.activeOnly) {
      query = query.filter((template) => template.isActive);
    }
    if (filters?.category) {
      query = query.filter(
        (template) => template.category === filters.category
      );
    }
    if (filters?.emotion) {
      query = query.filter((template) => template.emotion === filters.emotion);
    }
    if (filters?.difficulty) {
      query = query.filter(
        (template) => template.difficulty === filters.difficulty
      );
    }
    if (filters?.gender) {
      query = query.filter((template) => template.gender === filters.gender);
    }
    if (filters?.ageGroup) {
      query = query.filter(
        (template) => template.ageGroup === filters.ageGroup
      );
    }
    if (filters?.style) {
      query = query.filter((template) => template.style === filters.style);
    }

    return await query.toArray();
  }

  // --- Effect Templates ---
  async createEffectTemplate(
    templateData: Omit<EffectTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<EffectTemplate> {
    const newId = uuidv4();
    const newTemplate: EffectTemplate = {
      ...templateData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.effectTemplates.add(newTemplate);
    return newTemplate;
  }

  async getEffectTemplate(id: string): Promise<EffectTemplate | null> {
    return (await db.effectTemplates.get(id)) || null;
  }

  async updateEffectTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<EffectTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const updateData: any = {
      ...templateData,
      updatedAt: new Date(),
    };

    await db.effectTemplates.update(id, updateData);
  }

  async deleteEffectTemplate(id: string): Promise<void> {
    await db.effectTemplates.delete(id);
  }

  async listEffectTemplates(filters?: {
    category?: string;
    intensity?: string;
    duration?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<EffectTemplate[]> {
    let query = db.effectTemplates.toCollection();

    if (filters?.activeOnly) {
      query = query.filter((template) => template.isActive);
    }
    if (filters?.category) {
      query = query.filter(
        (template) => template.category === filters.category
      );
    }
    if (filters?.intensity) {
      query = query.filter(
        (template) => template.intensity === filters.intensity
      );
    }
    if (filters?.duration) {
      query = query.filter(
        (template) => template.duration === filters.duration
      );
    }
    if (filters?.style) {
      query = query.filter((template) => template.style === filters.style);
    }

    return await query.toArray();
  }

  // --- Initialization ---
  async initialize(): Promise<void> {
    try {
      await db.open();
    } catch (error) {
      console.error("Failed to initialize Dexie database:", error);
      throw error;
    }
  }
}

export const dexieDataService = new DexieDataService();
dexieDataService.initialize();
