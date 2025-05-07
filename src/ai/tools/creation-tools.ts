"use server";

import ai from "@/ai/ai-instance";
import {
  createChapter as createChapterService,
  createCharacter as createCharacterService,
  createPanelDialogue as createPanelDialogueService,
  createPanel as createPanelService,
  createProject as createProjectService,
  createScene as createSceneService,
  getAllCharacters,
  getChapterForContext,
  getCharacter as getCharacterForContext,
  getPanelForContext,
  getProject as getProjectForContext,
  getSceneForContext,
} from "@/services/data-service";
import {
  chapterSchema,
  characterSchema,
  mangaProjectSchema,
  panelDialogueSchema,
  panelSchema,
  sceneSchema,
  schemas,
} from "@/types/schemas";
import { z } from "zod";

// --- Helper Functions ---
async function getProjectIdForContext(context: {
  chapterId?: string;
  sceneId?: string;
  panelId?: string;
  characterId?: string;
}): Promise<string | undefined> {
  if (context.chapterId) {
    const chapter = await getChapterForContext(context.chapterId);
    return chapter?.mangaProjectId;
  }
  if (context.sceneId) {
    const scene = await getSceneForContext(context.sceneId);
    if (scene) {
      const chapter = await getChapterForContext(scene.chapterId);
      return chapter?.mangaProjectId;
    }
  }
  if (context.panelId) {
    const panel = await getPanelForContext(context.panelId);
    if (panel) {
      const scene = await getSceneForContext(panel.sceneId);
      if (scene) {
        const chapter = await getChapterForContext(scene.chapterId);
        return chapter?.mangaProjectId;
      }
    }
  }
  if (context.characterId) {
    const character = await getCharacterForContext(context.characterId);
    return character?.mangaProjectId;
  }
  return undefined;
}

// --- Create Manga Project Tool ---
export const createProjectTool = ai.defineTool(
  {
    name: "createProject",
    description: "Creates a new manga project with initial details.",
    inputSchema: mangaProjectSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      chapters: true,
      characters: true,
      viewCount: true,
      likeCount: true,
      published: true,
    }),
    outputSchema: z.string().describe("The ID of the newly created project."),
  },
  async (input) => {
    try {
      const project = await createProjectService({
        ...input,
        status: input.status ?? "draft",
      });
      return project.id;
    } catch (error: any) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }
);

// --- Create Chapter Tool ---
export const createChapterTool = ai.defineTool(
  {
    name: "createChapter",
    description: "Creates a new chapter within a specified manga project.",
    inputSchema: chapterSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        scenes: true,
      })
      .extend({
        mangaProjectId: z.string().describe("The ID of the parent project."),
      }),
    outputSchema: z.string().describe("The ID of the newly created chapter."),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      const chapter = await createChapterService({
        ...input,
        isAiGenerated: input.isAiGenerated ?? true,
        isPublished: input.isPublished ?? false,
        viewCount: input.viewCount ?? 0,
      });
      return chapter.id;
    } catch (error: any) {
      throw new Error(`Failed to create chapter: ${error.message}`);
    }
  }
);

// --- Create Scene Tool ---
export const createSceneTool = ai.defineTool(
  {
    name: "createScene",
    description: "Creates a new scene within a specific chapter.",
    inputSchema: sceneSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        panels: true,
      })
      .extend({
        chapterId: z.string().describe("The ID of the parent chapter."),
      }),
    outputSchema: z.string().describe("The ID of the newly created scene."),
  },
  async (input) => {
    try {
      const chapterExists = await getChapterForContext(input.chapterId);
      if (!chapterExists) {
        throw new Error(`Parent chapter ${input.chapterId} not found.`);
      }

      const scene = await createSceneService({
        ...input,
        isAiGenerated: input.isAiGenerated ?? true,
      });
      return scene.id;
    } catch (error: any) {
      throw new Error(`Failed to create scene: ${error.message}`);
    }
  }
);

// --- Create Panel Tool ---
export const createPanelTool = ai.defineTool(
  {
    name: "createPanel",
    description: "Creates a new panel within a specific scene.",
    inputSchema: panelSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        dialogues: true,
        characters: true,
      })
      .extend({
        sceneId: z.string().describe("The ID of the parent scene."),
        characterNames: z
          .array(z.string())
          .optional()
          .describe("Names of characters present in this panel."),
      }),
    outputSchema: z.string().describe("The ID of the newly created panel."),
  },
  async (input) => {
    try {
      const sceneExists = await getSceneForContext(input.sceneId);
      if (!sceneExists) {
        throw new Error(`Parent scene ${input.sceneId} not found.`);
      }

      let characterIds: string[] = [];
      const projectId = await getProjectIdForContext({
        sceneId: input.sceneId,
      });
      if (
        input.characterNames &&
        input.characterNames.length > 0 &&
        projectId
      ) {
        const charactersInProject = await getAllCharacters(projectId);
        characterIds = input.characterNames
          .map(
            (name) =>
              charactersInProject.find(
                (c) => c.name.toLowerCase() === name.toLowerCase()
              )?.id
          )
          .filter((id): id is string => !!id);
      }

      const panel = await createPanelService({
        ...input,
        characterIds,
        isAiGenerated: input.isAiGenerated ?? true,
      });
      return panel.id;
    } catch (error: any) {
      throw new Error(`Failed to create panel: ${error.message}`);
    }
  }
);

// --- Create Panel Dialogue Tool ---
export const createPanelDialogueTool = ai.defineTool(
  {
    name: "createPanelDialogue",
    description: "Creates a dialogue entry associated with a specific panel.",
    inputSchema: panelDialogueSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        speaker: true,
      })
      .extend({
        panelId: z.string().describe("The ID of the parent panel."),
        speakerName: z
          .string()
          .optional()
          .describe("Name of the character speaking."),
      }),
    outputSchema: z.string().describe("The ID of the newly created dialogue."),
  },
  async (input) => {
    try {
      const panelExists = await getPanelForContext(input.panelId);
      if (!panelExists) {
        throw new Error(`Parent panel ${input.panelId} not found.`);
      }

      let speakerId: string | undefined | null = null;
      const projectId = await getProjectIdForContext({
        panelId: input.panelId,
      });
      if (input.speakerName && projectId) {
        const characters = await getAllCharacters(projectId);
        const found = characters.find(
          (c) => c.name.toLowerCase() === input.speakerName?.toLowerCase()
        );
        speakerId = found?.id;
      }

      const dialogue = await createPanelDialogueService({
        ...input,
        speakerId,
        isAiGenerated: input.isAiGenerated ?? true,
      });
      return dialogue.id;
    } catch (error: any) {
      throw new Error(`Failed to create dialogue: ${error.message}`);
    }
  }
);

// --- Create Character Tool ---
export const createCharacterTool = ai.defineTool(
  {
    name: "createCharacter",
    description:
      "Creates a new character profile within the specified project.",
    inputSchema: characterSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
      .extend({
        mangaProjectId: z
          .string()
          .describe("The project the character belongs to."),
      }),
    outputSchema: z.string().describe("The ID of the newly created character."),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      const character = await createCharacterService({
        ...input,
        isAiGenerated: input.isAiGenerated ?? true,
      });
      return character.id;
    } catch (error: any) {
      throw new Error(`Failed to create character: ${error.message}`);
    }
  }
);

// --- Create Location Tool ---
export const createLocationTool = ai.defineTool(
  {
    name: "createLocation",
    description: "Creates a new location entry for a manga project.",
    inputSchema: schemas.location.extend({
      mangaProjectId: z
        .string()
        .describe("The project the location belongs to."),
    }),
    outputSchema: z.string().describe("The ID of the newly created location."),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      // Implementation would depend on your location service
      // const location = await createLocationService(input);
      // return location.id;
      throw new Error("Location service not implemented");
    } catch (error: any) {
      throw new Error(`Failed to create location: ${error.message}`);
    }
  }
);

// --- Create Key Event Tool ---
export const createKeyEventTool = ai.defineTool(
  {
    name: "createKeyEvent",
    description: "Creates a new key plot event for a manga project.",
    inputSchema: schemas.keyEvent.extend({
      mangaProjectId: z.string().describe("The project the event belongs to."),
    }),
    outputSchema: z.string().describe("The ID of the newly created key event."),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      // Implementation would depend on your key event service
      // const event = await createKeyEventService(input);
      // return event.id;
      throw new Error("Key event service not implemented");
    } catch (error: any) {
      throw new Error(`Failed to create key event: ${error.message}`);
    }
  }
);
