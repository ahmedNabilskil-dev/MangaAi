import { ai } from "@/ai/ai-instance";
import {
  getAllProjects,
  getChapterForContext,
  getChapters,
  getCharacter as getCharacterService,
  getPanelDialogueForContext,
  getPanelDialogues,
  getPanelForContext,
  getPanels,
  getProject as getProjectService,
  getSceneForContext,
  getScenes,
  listCharacters,
} from "@/services/data-service";
import {
  chapterSchema,
  characterSchema,
  mangaProjectSchema,
  panelDialogueSchema,
  panelSchema,
  sceneSchema,
} from "@/types/schemas";
import { z } from "zod";

// --- Individual Fetch Tools ---

export const getProjectTool = ai.defineTool(
  {
    name: "getProject",
    description: "Retrieves complete details of a manga project by ID.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the manga project to retrieve"),
    }),
    outputSchema: mangaProjectSchema
      .nullable()
      .describe("Full project details or null if not found"),
  },
  async ({ projectId }) => {
    try {
      const project = await getProjectService(projectId);
      return mangaProjectSchema.nullable().parse(project);
    } catch (error) {
      console.error(`Error in getProjectTool: ${error}`);
      return null;
    }
  }
);

export const getChapterTool = ai.defineTool(
  {
    name: "getChapter",
    description: "Retrieves complete details of a chapter by ID.",
    inputSchema: z.object({
      chapterId: z.string().describe("ID of the chapter to retrieve"),
    }),
    outputSchema: chapterSchema
      .nullable()
      .describe("Full chapter details or null if not found"),
  },
  async ({ chapterId }) => {
    try {
      const chapter = await getChapterForContext(chapterId);
      return chapterSchema.nullable().parse(chapter);
    } catch (error) {
      console.error(`Error in getChapterTool: ${error}`);
      return null;
    }
  }
);

export const getSceneTool = ai.defineTool(
  {
    name: "getScene",
    description: "Retrieves complete details of a scene by ID.",
    inputSchema: z.object({
      sceneId: z.string().describe("ID of the scene to retrieve"),
    }),
    outputSchema: sceneSchema
      .nullable()
      .describe("Full scene details or null if not found"),
  },
  async ({ sceneId }) => {
    try {
      const scene = await getSceneForContext(sceneId);
      return sceneSchema.nullable().parse(scene);
    } catch (error) {
      console.error(`Error in getSceneTool: ${error}`);
      return null;
    }
  }
);

export const getPanelTool = ai.defineTool(
  {
    name: "getPanel",
    description: "Retrieves complete details of a panel by ID.",
    inputSchema: z.object({
      panelId: z.string().describe("ID of the panel to retrieve"),
    }),
    outputSchema: panelSchema
      .nullable()
      .describe("Full panel details or null if not found"),
  },
  async ({ panelId }) => {
    try {
      const panel = await getPanelForContext(panelId);
      return panelSchema.nullable().parse(panel);
    } catch (error) {
      console.error(`Error in getPanelTool: ${error}`);
      return null;
    }
  }
);

export const getPanelDialogueTool = ai.defineTool(
  {
    name: "getPanelDialogue",
    description: "Retrieves complete details of a panel dialogue by ID.",
    inputSchema: z.object({
      dialogueId: z.string().describe("ID of the dialogue to retrieve"),
    }),
    outputSchema: panelDialogueSchema
      .nullable()
      .describe("Full dialogue details or null if not found"),
  },
  async ({ dialogueId }) => {
    try {
      const dialogue = await getPanelDialogueForContext(dialogueId);
      return panelDialogueSchema.nullable().parse(dialogue);
    } catch (error) {
      console.error(`Error in getPanelDialogueTool: ${error}`);
      return null;
    }
  }
);

export const getCharacterTool = ai.defineTool(
  {
    name: "getCharacter",
    description: "Retrieves complete details of a character by ID.",
    inputSchema: z.object({
      characterId: z.string().describe("ID of the character to retrieve"),
    }),
    outputSchema: characterSchema
      .nullable()
      .describe("Full character details or null if not found"),
  },
  async ({ characterId }) => {
    try {
      const character = await getCharacterService(characterId);
      return characterSchema.nullable().parse(character);
    } catch (error) {
      console.error(`Error in getCharacterTool: ${error}`);
      return null;
    }
  }
);

// --- List/Batch Fetch Tools ---

export const listProjectsTool = ai.defineTool(
  {
    name: "listProjects",
    description: "Retrieves a list of all manga projects.",
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum number of projects to return"),
      offset: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Number of projects to skip"),
    }),
    outputSchema: z
      .array(
        mangaProjectSchema.pick({
          id: true,
          title: true,
          status: true,
          genre: true,
          coverImageUrl: true,
        })
      )
      .describe("Array of basic project information"),
  },
  async ({ limit, offset }) => {
    try {
      const projects = await getAllProjects();
      return projects
        .slice(offset ?? 0, limit ? (offset ?? 0) + limit : undefined)
        .map((project) =>
          mangaProjectSchema
            .pick({
              id: true,
              title: true,
              status: true,
              genre: true,
              coverImageUrl: true,
            })
            .parse(project)
        );
    } catch (error) {
      console.error(`Error in listProjectsTool: ${error}`);
      return [];
    }
  }
);

export const listChaptersForProjectTool = ai.defineTool(
  {
    name: "listChaptersForProject",
    description: "Retrieves all chapters belonging to a specific project.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the parent project"),
      publishedOnly: z
        .boolean()
        .optional()
        .describe("Only return published chapters"),
    }),
    outputSchema: z
      .array(
        chapterSchema.pick({
          id: true,
          chapterNumber: true,
          title: true,
          isPublished: true,
          coverImageUrl: true,
          narrative: true,
        })
      )
      .describe("Array of chapter summaries"),
  },
  async ({ projectId, publishedOnly }) => {
    try {
      const chapters = await getChapters(projectId);
      return chapters
        .filter((chapter) => !publishedOnly || chapter.isPublished)
        .map((chapter) =>
          chapterSchema
            .pick({
              id: true,
              chapterNumber: true,
              title: true,
              narrative: true,
              isPublished: true,
              coverImageUrl: true,
            })
            .parse(chapter)
        );
    } catch (error) {
      console.error(`Error in listChaptersForProjectTool: ${error}`);
      return [];
    }
  }
);

export const listScenesForChapterTool = ai.defineTool(
  {
    name: "listScenesForChapter",
    description: "Retrieves all scenes belonging to a specific chapter.",
    inputSchema: z.object({
      chapterId: z.string().describe("ID of the parent chapter"),
    }),
    outputSchema: z
      .array(
        sceneSchema.pick({
          id: true,
          order: true,
          title: true,
        })
      )
      .describe("Array of scene summaries"),
  },
  async ({ chapterId }) => {
    try {
      const scenes = await getScenes(chapterId);
      return scenes.map((scene) =>
        sceneSchema
          .pick({
            id: true,
            order: true,
            title: true,
          })
          .parse(scene)
      );
    } catch (error) {
      console.error(`Error in listScenesForChapterTool: ${error}`);
      return [];
    }
  }
);

export const listPanelsForSceneTool = ai.defineTool(
  {
    name: "listPanelsForScene",
    description: "Retrieves all panels belonging to a specific scene.",
    inputSchema: z.object({
      sceneId: z.string().describe("ID of the parent scene"),
    }),
    outputSchema: z
      .array(
        panelSchema.pick({
          id: true,
          order: true,
          imageUrl: true,
          panelContext: true,
        })
      )
      .describe("Array of panel summaries"),
  },
  async ({ sceneId }) => {
    try {
      const panels = await getPanels(sceneId);
      return panels.map((panel) =>
        panelSchema
          .pick({
            id: true,
            order: true,
            imageUrl: true,
            panelContext: true,
          })
          .parse(panel)
      );
    } catch (error) {
      console.error(`Error in listPanelsForSceneTool: ${error}`);
      return [];
    }
  }
);

export const listDialoguesForPanelTool = ai.defineTool(
  {
    name: "listDialoguesForPanel",
    description: "Retrieves all dialogues belonging to a specific panel.",
    inputSchema: z.object({
      panelId: z.string().describe("ID of the parent panel"),
    }),
    outputSchema: z
      .array(
        panelDialogueSchema.pick({
          id: true,
          order: true,
          content: true,
          speakerId: true,
          emotion: true,
        })
      )
      .describe("Array of dialogue items"),
  },
  async ({ panelId }) => {
    try {
      const dialogues = await getPanelDialogues(panelId);
      return dialogues.map((dialogue) =>
        panelDialogueSchema
          .pick({
            id: true,
            order: true,
            content: true,
            speakerId: true,
            emotion: true,
          })
          .parse(dialogue)
      );
    } catch (error) {
      console.error(`Error in listDialoguesForPanelTool: ${error}`);
      return [];
    }
  }
);

export const listCharactersForProjectTool = ai.defineTool(
  {
    name: "listCharactersForProject",
    description: "Retrieves all characters belonging to a specific project.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the parent project"),
      role: z
        .enum(["protagonist", "antagonist", "supporting", "minor"])
        .optional()
        .describe("Filter by character role"),
    }),
    outputSchema: z
      .array(
        characterSchema.pick({
          id: true,
          name: true,
          role: true,
          briefDescription: true,
          imgUrl: true,
        })
      )
      .describe("Array of character summaries"),
  },
  async ({ projectId, role }) => {
    try {
      const characters = await listCharacters(projectId);
      return characters
        .filter((character) => !role || character.role === role)
        .map((character) =>
          characterSchema
            .pick({
              id: true,
              name: true,
              role: true,
              briefDescription: true,
              imgUrl: true,
            })
            .parse(character)
        );
    } catch (error) {
      console.error(`Error in listCharactersForProjectTool: ${error}`);
      return [];
    }
  }
);

export const findCharacterByNameTool = ai.defineTool(
  {
    name: "findCharacterByName",
    description: "Finds a character by name within a specific project.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the project to search within"),
      name: z.string().describe("Name of the character to find"),
      exactMatch: z
        .boolean()
        .optional()
        .default(true)
        .describe("Require exact name match"),
    }),
    outputSchema: characterSchema
      .pick({
        id: true,
        name: true,
        role: true,
        briefDescription: true,
        imgUrl: true,
      })
      .nullable()
      .describe("Character details if found, otherwise null"),
  },
  async ({ projectId, name, exactMatch }) => {
    try {
      const characters = await listCharacters(projectId);
      const found = characters.find((character) =>
        exactMatch
          ? character.name === name
          : character.name.toLowerCase().includes(name.toLowerCase())
      );
      return found
        ? characterSchema
            .pick({
              id: true,
              name: true,
              role: true,
              briefDescription: true,
              imgUrl: true,
            })
            .parse(found)
        : null;
    } catch (error) {
      console.error(`Error in findCharacterByNameTool: ${error}`);
      return null;
    }
  }
);
