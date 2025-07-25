import { ai } from "@/ai/ai-instance";
import {
  getAllProjects,
  getChapterForContext,
  getChapters,
  getCharacter as getCharacterService,
  getLocationTemplate,
  getOutfitTemplate,
  getPanelDialogueForContext,
  getPanelDialogues,
  getPanelForContext,
  getPanels,
  getProject as getProjectService,
  getSceneForContext,
  getScenes,
  listCharacters,
  listLocationTemplates,
  listOutfitTemplates,
} from "@/services/data-service";
import {
  chapterSchema,
  characterSchema,
  locationTemplateSchema,
  mangaProjectSchema,
  outfitTemplateSchema,
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

// Template Fetch Tools

export const getOutfitTemplateTool = ai.defineTool(
  {
    name: "getOutfitTemplate",
    description: "Retrieves an outfit template by ID",
    inputSchema: z.object({
      id: z.string().describe("ID of the outfit template to retrieve"),
    }),
    outputSchema: outfitTemplateSchema
      .nullable()
      .describe("Outfit template details or null if not found"),
  },
  async ({ id }) => {
    try {
      const template = await getOutfitTemplate(id);
      return outfitTemplateSchema.nullable().parse(template);
    } catch (error) {
      console.error(`Error in getOutfitTemplateTool: ${error}`);
      return null;
    }
  }
);

export const getLocationTemplateTool = ai.defineTool(
  {
    name: "getLocationTemplate",
    description: "Retrieves a location template by ID",
    inputSchema: z.object({
      id: z.string().describe("ID of the location template to retrieve"),
    }),
    outputSchema: locationTemplateSchema
      .nullable()
      .describe("Location template details or null if not found"),
  },
  async ({ id }) => {
    try {
      const template = await getLocationTemplate(id);
      return locationTemplateSchema.nullable().parse(template);
    } catch (error) {
      console.error(`Error in getLocationTemplateTool: ${error}`);
      return null;
    }
  }
);

export const listOutfitTemplatesTool = ai.defineTool(
  {
    name: "listOutfitTemplates",
    description: "Lists all available outfit templates with optional filtering",
    inputSchema: z.object({
      category: z
        .enum([
          "casual",
          "formal",
          "traditional",
          "fantasy",
          "modern",
          "vintage",
          "futuristic",
          "seasonal",
          "special",
        ])
        .optional()
        .describe("Filter by outfit category"),
      gender: z
        .enum(["male", "female", "unisex"])
        .optional()
        .describe("Filter by target gender"),
      ageGroup: z
        .enum(["child", "teen", "adult", "elderly"])
        .optional()
        .describe("Filter by age group"),
      season: z
        .enum(["spring", "summer", "autumn", "winter", "all"])
        .optional()
        .describe("Filter by season"),
      style: z
        .enum(["anime", "realistic", "cartoon", "manga"])
        .optional()
        .describe("Filter by art style"),
      activeOnly: z
        .boolean()
        .optional()
        .describe("Only return active templates"),
    }),
    outputSchema: z
      .array(outfitTemplateSchema)
      .describe("List of outfit templates"),
  },
  async (filters) => {
    try {
      const templates = await listOutfitTemplates(filters);
      return templates.map((template) => outfitTemplateSchema.parse(template));
    } catch (error) {
      console.error(`Error in listOutfitTemplatesTool: ${error}`);
      return [];
    }
  }
);

export const listLocationTemplatesTool = ai.defineTool(
  {
    name: "listLocationTemplates",
    description:
      "Lists all available location templates with optional filtering",
    inputSchema: z.object({
      category: z
        .enum([
          "indoor",
          "outdoor",
          "urban",
          "rural",
          "fantasy",
          "futuristic",
          "historical",
          "natural",
          "architectural",
        ])
        .optional()
        .describe("Filter by location category"),
      timeOfDay: z
        .enum([
          "dawn",
          "morning",
          "noon",
          "afternoon",
          "evening",
          "night",
          "any",
        ])
        .optional()
        .describe("Filter by time of day"),
      weather: z
        .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy", "any"])
        .optional()
        .describe("Filter by weather"),
      mood: z
        .enum([
          "peaceful",
          "mysterious",
          "energetic",
          "romantic",
          "tense",
          "cheerful",
          "somber",
        ])
        .optional()
        .describe("Filter by mood"),
      style: z
        .enum(["anime", "realistic", "cartoon", "manga"])
        .optional()
        .describe("Filter by art style"),
      activeOnly: z
        .boolean()
        .optional()
        .describe("Only return active templates"),
    }),
    outputSchema: z
      .array(locationTemplateSchema)
      .describe("List of location templates"),
  },
  async (filters) => {
    try {
      const templates = await listLocationTemplates(filters);
      return templates.map((template) =>
        locationTemplateSchema.parse(template)
      );
    } catch (error) {
      console.error(`Error in listLocationTemplatesTool: ${error}`);
      return [];
    }
  }
);
