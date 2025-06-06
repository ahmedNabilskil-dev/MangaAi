import { db, getProjectWithRelations } from "@/services/db";
import type {
  Chapter,
  Character,
  MangaProject,
  Panel,
  PanelDialogue,
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
      characterIds: Array.isArray(panelData.characterIds)
        ? panelData.characterIds
        : [],
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
      characterIds:
        panelData.characterIds !== undefined
          ? Array.isArray(panelData.characterIds)
            ? panelData.characterIds
            : []
          : undefined,
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

      const updatedIds = Array.from(
        new Set([...(panel.characterIds || []), characterId])
      );
      await db.panels.update(panelId, {
        characterIds: updatedIds,
        updatedAt: new Date(),
      });
    });
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await db.transaction("rw", db.panels, async () => {
      const panel = await db.panels.get(panelId);
      if (!panel) throw new Error(`Panel ${panelId} not found`);

      const updatedIds = (panel.characterIds || []).filter(
        (id) => id !== characterId
      );
      await db.panels.update(panelId, {
        characterIds: updatedIds,
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
        const panels = await db.panels
          .where("characterIds")
          .equals(id)
          .toArray();
        await Promise.all(
          panels.map((panel) =>
            db.panels.update(panel.id, {
              characterIds: panel.characterIds.filter(
                (charId) => charId !== id
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
