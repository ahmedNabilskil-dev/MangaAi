"use server";

import ai from "@/ai/ai-instance";
import {
  getAllCharacters,
  getAllKeyEvents,
  getAllLocations,
  getAllProjects,
  getChapterForContext,
  getCharacter as getCharacterService,
  getKeyEvent as getKeyEventService,
  getLocation as getLocationService,
  getPanelDialogueForContext,
  getPanelForContext,
  getProject as getProjectService,
  getSceneForContext,
  getUser as getUserService,
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

export const getLocationTool = ai.defineTool(
  {
    name: "getLocation",
    description: "Retrieves complete details of a location by ID.",
    inputSchema: z.object({
      locationId: z.string().describe("ID of the location to retrieve"),
    }),
    outputSchema: schemas.location
      .nullable()
      .describe("Full location details or null if not found"),
  },
  async ({ locationId }) => {
    try {
      const location = await getLocationService(locationId);
      return schemas.location.nullable().parse(location);
    } catch (error) {
      console.error(`Error in getLocationTool: ${error}`);
      return null;
    }
  }
);

export const getKeyEventTool = ai.defineTool(
  {
    name: "getKeyEvent",
    description: "Retrieves complete details of a key event by ID.",
    inputSchema: z.object({
      eventId: z.string().describe("ID of the key event to retrieve"),
    }),
    outputSchema: schemas.keyEvent
      .nullable()
      .describe("Full event details or null if not found"),
  },
  async ({ eventId }) => {
    try {
      const event = await getKeyEventService(eventId);
      return schemas.keyEvent.nullable().parse(event);
    } catch (error) {
      console.error(`Error in getKeyEventTool: ${error}`);
      return null;
    }
  }
);

export const getUserTool = ai.defineTool(
  {
    name: "getUser",
    description: "Retrieves complete details of a user by ID.",
    inputSchema: z.object({
      userId: z.string().describe("ID of the user to retrieve"),
    }),
    outputSchema: schemas.user
      .nullable()
      .describe("Full user details or null if not found"),
  },
  async ({ userId }) => {
    try {
      const user = await getUserService(userId);
      return schemas.user.nullable().parse(user);
    } catch (error) {
      console.error(`Error in getUserTool: ${error}`);
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
          summary: true,
          isPublished: true,
          coverImageUrl: true,
        })
      )
      .describe("Array of chapter summaries"),
  },
  async ({ projectId, publishedOnly }) => {
    try {
      const chapters = await getAllChapters(projectId);
      return chapters
        .filter((chapter) => !publishedOnly || chapter.isPublished)
        .map((chapter) =>
          chapterSchema
            .pick({
              id: true,
              chapterNumber: true,
              title: true,
              summary: true,
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
          description: true,
        })
      )
      .describe("Array of scene summaries"),
  },
  async ({ chapterId }) => {
    try {
      const scenes = await getAllScenes(chapterId);
      return scenes.map((scene) =>
        sceneSchema
          .pick({
            id: true,
            order: true,
            title: true,
            description: true,
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
      const panels = await getAllPanels(sceneId);
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
      const dialogues = await getAllPanelDialogues(panelId);
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
      const characters = await getAllCharacters(projectId);
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
      const characters = await getAllCharacters(projectId);
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

export const listLocationsForProjectTool = ai.defineTool(
  {
    name: "listLocationsForProject",
    description: "Retrieves all locations belonging to a specific project.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the parent project"),
    }),
    outputSchema: z
      .array(
        schemas.location.pick({
          name: true,
          description: true,
          significance: true,
        })
      )
      .describe("Array of location summaries"),
  },
  async ({ projectId }) => {
    try {
      const locations = await getAllLocations(projectId);
      return locations.map((location) =>
        schemas.location
          .pick({
            name: true,
            description: true,
            significance: true,
          })
          .parse(location)
      );
    } catch (error) {
      console.error(`Error in listLocationsForProjectTool: ${error}`);
      return [];
    }
  }
);

export const listKeyEventsForProjectTool = ai.defineTool(
  {
    name: "listKeyEventsForProject",
    description: "Retrieves all key events belonging to a specific project.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the parent project"),
      sortBySequence: z
        .boolean()
        .optional()
        .default(true)
        .describe("Sort events by sequence number"),
    }),
    outputSchema: z
      .array(
        schemas.keyEvent.pick({
          name: true,
          description: true,
          sequence: true,
        })
      )
      .describe("Array of key event summaries"),
  },
  async ({ projectId, sortBySequence }) => {
    try {
      let events = await getAllKeyEvents(projectId);
      if (sortBySequence) {
        events = events.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      }
      return events.map((event) =>
        schemas.keyEvent
          .pick({
            name: true,
            description: true,
            sequence: true,
          })
          .parse(event)
      );
    } catch (error) {
      console.error(`Error in listKeyEventsForProjectTool: ${error}`);
      return [];
    }
  }
);
