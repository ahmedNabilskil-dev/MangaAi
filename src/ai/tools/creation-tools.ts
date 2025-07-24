import { ai } from "@/ai/ai-instance";
import {
  assignCharacterToPanel,
  createChapter as createChapterService,
  createCharacter as createCharacterService,
  createEffectTemplate as createEffectTemplateService,
  createLocationTemplate as createLocationTemplateService,
  createOutfitTemplate as createOutfitTemplateService,
  createPanelDialogue as createPanelDialogueService,
  createPanel as createPanelService,
  createPoseTemplate as createPoseTemplateService,
  createProject as createProjectService,
  createScene as createSceneService,
  getChapterForContext,
  getCharacter as getCharacterForContext,
  getPanelForContext,
  getProject as getProjectForContext,
  getSceneForContext,
  listCharacters,
} from "@/services/data-service";
import { Character } from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import {
  chapterSchema,
  characterSchema,
  effectTemplateSchema,
  locationTemplateSchema,
  mangaProjectSchema,
  outfitTemplateSchema,
  panelDialogueSchema,
  panelSchema,
  poseTemplateSchema,
  sceneSchema,
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
      chapters: true,
      characters: true,
      outfitTemplates: true,
      locationTemplates: true,
      coverImageUrl: true,
      status: true,
      tags: true,
      creatorId: true,
      initialPrompt: true,
      createdAt: true,
      updatedAt: true,
    }),
    outputSchema: z.object({
      createdProject: z.string().describe("created project data"),
    }),
  },
  async (input) => {
    try {
      // Convert string dates to Date objects if needed and add required fields
      const processedInput = {
        ...input,
        status: MangaStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const project = await createProjectService(processedInput);
      localStorage.setItem("currentProjectId", project.id);
      return { createdProject: JSON.stringify(project) };
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
        coverImageUrl: true,
        isAiGenerated: true,
        isPublished: true,
        viewCount: true,
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
        isAiGenerated: true,
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
        isAiGenerated: true,
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
        order: input.order,
        title: input.title,
        description: input.description,
        sceneContext: input.sceneContext,
        chapterId: input.chapterId,
        isAiGenerated: true,
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
        imageUrl: true,
        isAiGenerated: true,
        sceneId: true,
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
        const charactersInProject = await listCharacters(projectId);
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
        isAiGenerated: true,
      });

      // Assign characters to the panel if provided
      if (characterIds.length > 0) {
        const { assignCharacterToPanel } = await import(
          "@/services/data-service"
        );
        await Promise.all(
          characterIds.map((characterId) =>
            assignCharacterToPanel(panel.id, characterId)
          )
        );
      }

      return panel.id;
    } catch (error: any) {
      throw new Error(`Failed to create panel: ${error.message}`);
    }
  }
);

// --- Create Panel Dialogue Tool ---
export const createPanelDialoguesTool = ai.defineTool(
  {
    name: "createPanelDialogues",
    description:
      "Creates multiple dialogue entries associated with a specific panel.",
    inputSchema: z.object({
      panelId: z.string().describe("The ID of the parent panel."),
      dialogues: z
        .array(
          panelDialogueSchema
            .omit({
              id: true,
              createdAt: true,
              updatedAt: true,
              isAiGenerated: true,
              panelId: true,
              speaker: true,
            })
            .extend({
              speakerName: z
                .string()
                .optional()
                .describe("Name of the character speaking."),
            })
        )
        .describe("Array of dialogues to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created dialogues."),
  },
  async (input) => {
    try {
      const { panelId, dialogues } = input;

      // Verify panel exists
      const panelExists = await getPanelForContext(panelId);
      if (!panelExists) {
        throw new Error(`Parent panel ${panelId} not found.`);
      }

      // Get project and characters once (optimization)
      const projectId = await getProjectIdForContext({ panelId });
      let characters: Character[] = [];
      if (projectId) {
        characters = await listCharacters(projectId);
      }

      // Process all dialogues
      const createdIds = await Promise.all(
        dialogues.map(async (dialogueInput) => {
          let speakerId: string | undefined | null = null;

          // Find speaker if name was provided
          if (dialogueInput.speakerName && projectId) {
            const found = characters.find(
              (c) =>
                c.name.toLowerCase() ===
                dialogueInput.speakerName?.toLowerCase()
            );
            speakerId = found?.id;
          }

          // Create the dialogue
          const dialogue = await createPanelDialogueService({
            ...dialogueInput,
            panelId,
            speakerId,
            isAiGenerated: true,
          });

          return dialogue.id;
        })
      );

      return createdIds;
    } catch (error: any) {
      throw new Error(`Failed to create dialogues: ${error.message}`);
    }
  }
);

export const createPanelDialogueTool = ai.defineTool(
  {
    name: "createPanelDialogue",
    description: "Creates a dialogue entry associated with a specific panel.",
    inputSchema: panelDialogueSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        isAiGenerated: true,
        panelId: true,
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
        const characters = await listCharacters(projectId);
        const found = characters.find(
          (c) => c.name.toLowerCase() === input.speakerName?.toLowerCase()
        );
        speakerId = found?.id;
      }

      const dialogue = await createPanelDialogueService({
        ...input,
        speakerId,
        isAiGenerated: true,
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
        isAiGenerated: true,
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
        isAiGenerated: true,
      });
      return character.id;
    } catch (error: any) {
      throw new Error(`Failed to create character: ${error.message}`);
    }
  }
);

// --- Create Multiple Chapters Tool ---
export const createMultipleChaptersTool = ai.defineTool(
  {
    name: "createMultipleChapters",
    description:
      "Creates multiple chapters within a specified manga project at once.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      chapters: z
        .array(
          chapterSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            scenes: true,
            coverImageUrl: true,
            isAiGenerated: true,
            isPublished: true,
            viewCount: true,
            mangaProjectId: true,
          })
        )
        .describe("Array of chapter data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created chapters."),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      const chapterIds = [];
      for (const chapterData of input.chapters) {
        const chapter = await createChapterService({
          ...chapterData,
          mangaProjectId: input.mangaProjectId,
        });
        chapterIds.push(chapter.id);
      }

      return chapterIds;
    } catch (error: any) {
      throw new Error(`Failed to create multiple chapters: ${error.message}`);
    }
  }
);

// --- Create Chapter with Scenes Tool ---
export const createChapterWithScenesTool = ai.defineTool(
  {
    name: "createChapterWithScenes",
    description: "Creates a new chapter with multiple scenes in one operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      chapterData: chapterSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        scenes: true,
        coverImageUrl: true,
        isAiGenerated: true,
        isPublished: true,
        viewCount: true,
        mangaProjectId: true,
      }),
      scenes: z
        .array(
          sceneSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            panels: true,
            isAiGenerated: true,
            chapterId: true,
          })
        )
        .describe("Array of scene data to create within this chapter"),
    }),
    outputSchema: z.object({
      chapterId: z.string().describe("The ID of the newly created chapter"),
      sceneIds: z
        .array(z.string())
        .describe("The IDs of the newly created scenes"),
    }),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      // First create the chapter
      const chapter = await createChapterService({
        ...input.chapterData,
        mangaProjectId: input.mangaProjectId,
      });

      // Then create all scenes within that chapter
      const sceneIds = [];
      for (const sceneData of input.scenes) {
        const scene = await createSceneService({
          order: sceneData.order,
          title: sceneData.title,
          description: sceneData.description,
          sceneContext: sceneData.sceneContext,
          chapterId: chapter.id,
          isAiGenerated: true,
        });
        sceneIds.push(scene.id);
      }

      return {
        chapterId: chapter.id,
        sceneIds,
      };
    } catch (error: any) {
      throw new Error(`Failed to create chapter with scenes: ${error.message}`);
    }
  }
);

// --- Create multiple scene Tool ---
export const createMultipleScenesTool = ai.defineTool(
  {
    name: "createMultipleScenesTool",
    description: "Creates multiple scenes in one operation.",
    inputSchema: z.object({
      chapterId: z.string().describe("The ID of the parent chapter."),
      scenes: z
        .array(
          sceneSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            panels: true,
            isAiGenerated: true,
            chapterId: true,
          })
        )
        .describe("Array of scene data to create within this chapter"),
    }),
    outputSchema: z.object({
      sceneIds: z
        .array(z.string())
        .describe("The IDs of the newly created scenes"),
    }),
  },
  async (input) => {
    try {
      const existedChapter = await getChapterForContext(input.chapterId);
      if (!existedChapter) {
        throw new Error(`Parent chapter ${input.chapterId} not found.`);
      }

      // Then create all scenes within that chapter
      const sceneIds = [];
      for (const sceneData of input.scenes) {
        const scene = await createSceneService({
          order: sceneData.order,
          title: sceneData.title,
          description: sceneData.description,
          sceneContext: sceneData.sceneContext,
          chapterId: existedChapter.id,
          isAiGenerated: true,
        });
        sceneIds.push(scene.id);
      }

      return {
        sceneIds,
      };
    } catch (error: any) {
      throw new Error(`Failed to create scenes: ${error.message}`);
    }
  }
);

// --- Create Multiple Chapters with Scenes Tool ---
export const createMultipleChaptersWithScenesTool = ai.defineTool(
  {
    name: "createMultipleChaptersWithScenes",
    description:
      "Creates multiple chapters each with its own scenes in a single operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      chaptersWithScenes: z
        .array(
          z.object({
            chapterData: chapterSchema.omit({
              id: true,
              createdAt: true,
              updatedAt: true,
              scenes: true,
              coverImageUrl: true,
              isAiGenerated: true,
              isPublished: true,
              viewCount: true,
              mangaProjectId: true,
            }),
            scenes: z
              .array(
                sceneSchema.omit({
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  panels: true,
                  isAiGenerated: true,
                  chapterId: true,
                })
              )
              .describe("Array of scene data to create within this chapter"),
          })
        )
        .describe("Array of chapters with their scenes"),
    }),
    outputSchema: z
      .array(
        z.object({
          chapterId: z.string().describe("The ID of the created chapter"),
          sceneIds: z
            .array(z.string())
            .describe("The IDs of the scenes created within this chapter"),
        })
      )
      .describe("The IDs of all newly created chapters and their scenes"),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      const result = [];

      for (const { chapterData, scenes } of input.chaptersWithScenes) {
        // Create the chapter
        const chapter = await createChapterService({
          ...chapterData,
          mangaProjectId: input.mangaProjectId,
        });

        // Create all scenes for this chapter
        const sceneIds = [];
        for (const sceneData of scenes) {
          const scene = await createSceneService({
            order: sceneData.order,
            title: sceneData.title,
            description: sceneData.description,
            sceneContext: sceneData.sceneContext,
            chapterId: chapter.id,
            isAiGenerated: true,
          });
          sceneIds.push(scene.id);
        }

        result.push({
          chapterId: chapter.id,
          sceneIds,
        });
      }

      return result;
    } catch (error: any) {
      throw new Error(
        `Failed to create multiple chapters with scenes: ${error.message}`
      );
    }
  }
);

// --- Create Panel with Dialogues Tool ---
export const createPanelWithDialoguesTool = ai.defineTool(
  {
    name: "createPanelWithDialogues",
    description:
      "Creates a new panel with multiple dialogues in one operation.",
    inputSchema: z.object({
      sceneId: z.string().describe("The ID of the parent scene."),
      panelData: panelSchema
        .omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          dialogues: true,
          characters: true,
          imageUrl: true,
          isAiGenerated: true,
          sceneId: true,
        })
        .extend({
          characterNames: z
            .array(z.string())
            .optional()
            .describe("Names of characters present in this panel."),
        }),
      dialogues: z
        .array(
          panelDialogueSchema
            .omit({
              id: true,
              createdAt: true,
              updatedAt: true,
              isAiGenerated: true,
              panelId: true,
              speaker: true,
              config: true,
            })
            .extend({
              speakerName: z
                .string()
                .optional()
                .describe("Name of the character speaking."),
            })
        )
        .describe("Array of dialogue data to create within this panel"),
    }),
    outputSchema: z.object({
      panelId: z.string().describe("The ID of the newly created panel"),
      dialogueIds: z
        .array(z.string())
        .describe("The IDs of the newly created dialogues"),
    }),
  },
  async (input) => {
    try {
      const sceneExists = await getSceneForContext(input.sceneId);
      if (!sceneExists) {
        throw new Error(`Parent scene ${input.sceneId} not found.`);
      }

      // Resolve character IDs
      let characterIds: string[] = [];
      const projectId = await getProjectIdForContext({
        sceneId: input.sceneId,
      });

      if (
        input.panelData.characterNames &&
        input.panelData.characterNames.length > 0 &&
        projectId
      ) {
        const charactersInProject = await listCharacters(projectId);
        characterIds = input.panelData.characterNames
          .map(
            (name) =>
              charactersInProject.find(
                (c) => c.name.toLowerCase() === name.toLowerCase()
              )?.id
          )
          .filter((id): id is string => !!id);
      }

      // Create the panel first
      const panel = await createPanelService({
        ...input.panelData,
        sceneId: input.sceneId,
        isAiGenerated: true,
      });

      // Assign characters to the panel if provided
      if (characterIds.length > 0) {
        await Promise.all(
          characterIds.map((characterId) =>
            assignCharacterToPanel(panel.id, characterId)
          )
        );
      }

      // Then create all dialogues within that panel
      const dialogueIds = [];
      for (const dialogueData of input.dialogues) {
        // Resolve speaker ID if provided
        let speakerId: string | undefined | null = null;
        if (dialogueData.speakerName && projectId) {
          const characters = await listCharacters(projectId);
          const found = characters.find(
            (c) =>
              c.name.toLowerCase() === dialogueData.speakerName?.toLowerCase()
          );
          speakerId = found?.id;
        }

        const dialogue = await createPanelDialogueService({
          ...dialogueData,
          panelId: panel.id,
          speakerId,
          isAiGenerated: true,
        });
        dialogueIds.push(dialogue.id);
      }

      return {
        panelId: panel.id,
        dialogueIds,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to create panel with dialogues: ${error.message}`
      );
    }
  }
);

// --- Create Multiple Panels Tool ---
export const createMultiplePanelsTool = ai.defineTool(
  {
    name: "createMultiplePanels",
    description:
      "Creates multiple panels within a specific scene in one operation.",
    inputSchema: z.object({
      sceneId: z.string().describe("The ID of the parent scene."),
      panels: z
        .array(
          panelSchema
            .omit({
              id: true,
              createdAt: true,
              updatedAt: true,
              dialogues: true,
              characters: true,
              imageUrl: true,
              isAiGenerated: true,
              sceneId: true,
            })
            .extend({
              characterNames: z
                .array(z.string())
                .optional()
                .describe("Names of characters present in this panel."),
            })
        )
        .describe("Array of panel data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created panels."),
  },
  async (input) => {
    try {
      const sceneExists = await getSceneForContext(input.sceneId);
      if (!sceneExists) {
        throw new Error(`Parent scene ${input.sceneId} not found.`);
      }

      const projectId = await getProjectIdForContext({
        sceneId: input.sceneId,
      });

      const charactersInProject = projectId
        ? await listCharacters(projectId)
        : [];

      const panelIds = [];
      for (const panelData of input.panels) {
        // Resolve character IDs
        let characterIds: string[] = [];
        if (
          panelData.characterNames &&
          panelData.characterNames.length > 0 &&
          projectId
        ) {
          characterIds = panelData.characterNames
            .map(
              (name) =>
                charactersInProject.find(
                  (c) => c.name.toLowerCase() === name.toLowerCase()
                )?.id
            )
            .filter((id): id is string => !!id);
        }

        const panel = await createPanelService({
          ...panelData,
          sceneId: input.sceneId,
          isAiGenerated: true,
        });

        // Assign characters to the panel if provided
        if (characterIds.length > 0) {
          await Promise.all(
            characterIds.map((characterId) =>
              assignCharacterToPanel(panel.id, characterId)
            )
          );
        }

        panelIds.push(panel.id);
      }

      return panelIds;
    } catch (error: any) {
      throw new Error(`Failed to create multiple panels: ${error.message}`);
    }
  }
);

// --- Create Multiple Panels with Dialogues Tool ---
export const createMultiplePanelsWithDialoguesTool = ai.defineTool(
  {
    name: "createMultiplePanelsWithDialogues",
    description:
      "Creates multiple panels each with its own dialogues in a single operation.",
    inputSchema: z.object({
      sceneId: z.string().describe("The ID of the parent scene."),
      panelsWithDialogues: z
        .array(
          z.object({
            panelData: panelSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                dialogues: true,
                characters: true,
                imageUrl: true,
                isAiGenerated: true,
                sceneId: true,
              })
              .extend({
                characterNames: z
                  .array(z.string())
                  .optional()
                  .describe("Names of characters present in this panel."),
              }),
            dialogues: z
              .array(
                panelDialogueSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    isAiGenerated: true,
                    panelId: true,
                    speaker: true,
                    config: true,
                  })
                  .extend({
                    speakerName: z
                      .string()
                      .optional()
                      .describe("Name of the character speaking."),
                  })
              )
              .describe("Array of dialogue data to create within this panel"),
          })
        )
        .describe("Array of panels with their dialogues"),
    }),
    outputSchema: z
      .array(
        z.object({
          panelId: z.string().describe("The ID of the created panel"),
          dialogueIds: z
            .array(z.string())
            .describe("The IDs of the dialogues created within this panel"),
        })
      )
      .describe("The IDs of all newly created panels and their dialogues"),
  },
  async (input) => {
    try {
      const sceneExists = await getSceneForContext(input.sceneId);
      if (!sceneExists) {
        throw new Error(`Parent scene ${input.sceneId} not found.`);
      }

      const projectId = await getProjectIdForContext({
        sceneId: input.sceneId,
      });

      const charactersInProject = projectId
        ? await listCharacters(projectId)
        : [];

      const result = [];

      for (const { panelData, dialogues } of input.panelsWithDialogues) {
        // Resolve character IDs for the panel
        let characterIds: string[] = [];
        if (
          panelData.characterNames &&
          panelData.characterNames.length > 0 &&
          projectId
        ) {
          characterIds = panelData.characterNames
            .map(
              (name) =>
                charactersInProject.find(
                  (c) => c.name.toLowerCase() === name.toLowerCase()
                )?.id
            )
            .filter((id): id is string => !!id);
        }

        // Create the panel
        const panel = await createPanelService({
          ...panelData,
          sceneId: input.sceneId,
          isAiGenerated: true,
        });

        // Assign characters to the panel if provided
        if (characterIds.length > 0) {
          await Promise.all(
            characterIds.map((characterId) =>
              assignCharacterToPanel(panel.id, characterId)
            )
          );
        }

        // Create all dialogues for this panel
        const dialogueIds = [];
        for (const dialogueData of dialogues) {
          // Resolve speaker ID if provided
          let speakerId: string | undefined | null = null;
          if (dialogueData.speakerName && projectId) {
            const found = charactersInProject.find(
              (c) =>
                c.name.toLowerCase() === dialogueData.speakerName?.toLowerCase()
            );
            speakerId = found?.id;
          }

          const dialogue = await createPanelDialogueService({
            ...dialogueData,
            panelId: panel.id,
            speakerId,
            isAiGenerated: true,
          });
          dialogueIds.push(dialogue.id);
        }

        result.push({
          panelId: panel.id,
          dialogueIds,
        });
      }

      return result;
    } catch (error: any) {
      throw new Error(
        `Failed to create multiple panels with dialogues: ${error.message}`
      );
    }
  }
);

// --- Create Multiple Characters Tool ---
export const createMultipleCharactersTool = ai.defineTool(
  {
    name: "createMultipleCharacters",
    description:
      "Creates multiple character profiles within a project in one operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      characters: z
        .array(
          characterSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            isAiGenerated: true,
            mangaProjectId: true,
          })
        )
        .describe("Array of character data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created characters."),
  },
  async (input) => {
    try {
      const projectExists = await getProjectForContext(input.mangaProjectId);
      if (!projectExists) {
        throw new Error(`Parent project ${input.mangaProjectId} not found.`);
      }

      const characterIds = [];
      for (const characterData of input.characters) {
        const character = await createCharacterService({
          ...characterData,
          mangaProjectId: input.mangaProjectId,
          isAiGenerated: true,
        });
        characterIds.push(character.id);
      }

      return characterIds;
    } catch (error: any) {
      throw new Error(`Failed to create multiple characters: ${error.message}`);
    }
  }
);

// --- Create Outfit Template Tool ---
export const createOutfitTemplateTool = ai.defineTool(
  {
    name: "createOutfitTemplate",
    description:
      "Creates a new outfit template for a character with detailed specifications.",
    inputSchema: outfitTemplateSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
      .extend({
        mangaProjectId: z.string().describe("The ID of the parent project."),
      }),
    outputSchema: z
      .string()
      .describe("The ID of the newly created outfit template."),
  },
  async (input) => {
    try {
      const template = await createOutfitTemplateService(input);
      return template.id;
    } catch (error: any) {
      throw new Error(`Failed to create outfit template: ${error.message}`);
    }
  }
);

// --- Create Location Template Tool ---
export const createLocationTemplateTool = ai.defineTool(
  {
    name: "createLocationTemplate",
    description: "Creates a new location template with multiple camera angles.",
    inputSchema: locationTemplateSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
      .extend({
        mangaProjectId: z.string().describe("The ID of the parent project."),
      }),
    outputSchema: z
      .string()
      .describe("The ID of the newly created location template."),
  },
  async (input) => {
    try {
      const template = await createLocationTemplateService(input);
      return template.id;
    } catch (error: any) {
      throw new Error(`Failed to create location template: ${error.message}`);
    }
  }
);

// --- Create Multiple Outfit Templates Tool ---
export const createMultipleOutfitTemplatesTool = ai.defineTool(
  {
    name: "createMultipleOutfitTemplates",
    description:
      "Creates multiple outfit templates for characters in one operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      outfitTemplates: z
        .array(
          outfitTemplateSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
          })
        )
        .describe("Array of outfit template data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created outfit templates."),
  },
  async (input) => {
    try {
      const outfitIds = [];

      for (const outfitData of input.outfitTemplates) {
        const template = await createOutfitTemplateService({
          ...outfitData,
          mangaProjectId: input.mangaProjectId,
        });
        outfitIds.push(template.id);
      }

      return outfitIds;
    } catch (error: any) {
      throw new Error(
        `Failed to create multiple outfit templates: ${error.message}`
      );
    }
  }
);

// --- Create Multiple Location Templates Tool ---
export const createMultipleLocationTemplatesTool = ai.defineTool(
  {
    name: "createMultipleLocationTemplates",
    description: "Creates multiple location templates in one operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      locationTemplates: z
        .array(
          locationTemplateSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
          })
        )
        .describe("Array of location template data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created location templates."),
  },
  async (input) => {
    try {
      const locationIds = [];

      for (const locationData of input.locationTemplates) {
        const template = await createLocationTemplateService({
          ...locationData,
          mangaProjectId: input.mangaProjectId,
        });
        locationIds.push(template.id);
      }

      return locationIds;
    } catch (error: any) {
      throw new Error(
        `Failed to create multiple location templates: ${error.message}`
      );
    }
  }
);

// --- Create Pose Template Tool ---
export const createPoseTemplateTool = ai.defineTool(
  {
    name: "createPoseTemplate",
    description:
      "Creates a new pose template for character positioning and body language.",
    inputSchema: poseTemplateSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
      .extend({
        mangaProjectId: z.string().describe("The ID of the parent project."),
      }),
    outputSchema: z
      .string()
      .describe("The ID of the newly created pose template."),
  },
  async (input) => {
    try {
      const template = await createPoseTemplateService(input);
      return template.id;
    } catch (error: any) {
      throw new Error(`Failed to create pose template: ${error.message}`);
    }
  }
);

// --- Create Effect Template Tool ---
export const createEffectTemplateTool = ai.defineTool(
  {
    name: "createEffectTemplate",
    description:
      "Creates a new effect template for visual effects and stylistic elements.",
    inputSchema: effectTemplateSchema
      .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
      .extend({
        mangaProjectId: z.string().describe("The ID of the parent project."),
      }),
    outputSchema: z
      .string()
      .describe("The ID of the newly created effect template."),
  },
  async (input) => {
    try {
      const template = await createEffectTemplateService(input);
      return template.id;
    } catch (error: any) {
      throw new Error(`Failed to create effect template: ${error.message}`);
    }
  }
);

// --- Create Multiple Pose Templates Tool ---
export const createMultiplePoseTemplatesTool = ai.defineTool(
  {
    name: "createMultiplePoseTemplates",
    description: "Creates multiple pose templates in one operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      poseTemplates: z
        .array(
          poseTemplateSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
          })
        )
        .describe("Array of pose template data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created pose templates."),
  },
  async (input) => {
    try {
      const poseIds = [];

      for (const poseData of input.poseTemplates) {
        const template = await createPoseTemplateService({
          ...poseData,
          mangaProjectId: input.mangaProjectId,
        });
        poseIds.push(template.id);
      }

      return poseIds;
    } catch (error: any) {
      throw new Error(
        `Failed to create multiple pose templates: ${error.message}`
      );
    }
  }
);

// --- Create Multiple Effect Templates Tool ---
export const createMultipleEffectTemplatesTool = ai.defineTool(
  {
    name: "createMultipleEffectTemplates",
    description: "Creates multiple effect templates in one operation.",
    inputSchema: z.object({
      mangaProjectId: z.string().describe("The ID of the parent project."),
      effectTemplates: z
        .array(
          effectTemplateSchema.omit({
            id: true,
            createdAt: true,
            updatedAt: true,
          })
        )
        .describe("Array of effect template data to create"),
    }),
    outputSchema: z
      .array(z.string())
      .describe("The IDs of the newly created effect templates."),
  },
  async (input) => {
    try {
      const effectIds = [];

      for (const effectData of input.effectTemplates) {
        const template = await createEffectTemplateService({
          ...effectData,
          mangaProjectId: input.mangaProjectId,
        });
        effectIds.push(template.id);
      }

      return effectIds;
    } catch (error: any) {
      throw new Error(
        `Failed to create multiple effect templates: ${error.message}`
      );
    }
  }
);
