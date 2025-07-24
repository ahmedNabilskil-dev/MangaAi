import { ai } from "@/ai/ai-instance";
import {
  assignCharacterToPanel as assignCharacterToPanelService,
  getChapterForContext,
  getCharacter as getCharacterForContext,
  getPanelDialogueForContext,
  getPanelForContext,
  getProject as getProjectForContext,
  getSceneForContext,
  listCharacters,
  removeCharacterFromPanel as removeCharacterFromPanelService,
  updateChapter as updateChapterService,
  updateCharacter as updateCharacterService,
  updateEffectTemplate as updateEffectTemplateService,
  updateLocationTemplate as updateLocationTemplateService,
  updateOutfitTemplate as updateOutfitTemplateService,
  updatePanelDialogue as updatePanelDialogueService,
  updatePanel as updatePanelService,
  updatePoseTemplate as updatePoseTemplateService,
  updateProject as updateProjectService,
  updateScene as updateSceneService,
} from "@/services/data-service";
import { Character, MangaProject } from "@/types/entities";
import {
  chapterSchema,
  characterSchema,
  mangaProjectSchema,
  panelDialogueSchema,
  panelSchema,
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

// --- Update Schemas ---
const UpdateProjectDataSchema = mangaProjectSchema
  .omit({
    id: true,
    chapters: true,
    characters: true,
    coverImageUrl: true,
    initialPrompt: true,
    status: true,
  })
  .partial();

const UpdateChapterDataSchema = chapterSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    scenes: true,
    mangaProjectId: true,
    coverImageUrl: true,
    isAiGenerated: true,
    isPublished: true,
    viewCount: true,
  })
  .partial();

const UpdateSceneDataSchema = sceneSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    panels: true,
    chapterId: true,
    isAiGenerated: true,
  })
  .partial();

const UpdatePanelDataSchema = panelSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    dialogues: true,
    characters: true,
    sceneId: true,
    imageUrl: true,
    isAiGenerated: true,
  })
  .partial();

const UpdatePanelDialogueDataSchema = panelDialogueSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    speaker: true,
    panelId: true,
    isAiGenerated: true,
  })
  .partial();

const UpdateCharacterDataSchema = characterSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    mangaProjectId: true,
    isAiGenerated: true,
  })
  .partial();

// --- Update Tools ---

export const updateProjectTool = ai.defineTool(
  {
    name: "updateProject",
    description: "Updates fields of an existing manga project.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the project to update"),
      updates: UpdateProjectDataSchema.describe("Fields to update"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async ({ projectId, updates }) => {
    try {
      const exists = await getProjectForContext(projectId);
      if (!exists) throw new Error("Project not found");

      const processedUpdates = { ...updates };
      if (typeof updates.worldDetails === "string") {
        processedUpdates.worldDetails = JSON.parse(updates.worldDetails);
      }
      if (typeof updates.plotStructure === "string") {
        processedUpdates.plotStructure = JSON.parse(updates.plotStructure);
      }

      if (typeof updates.themes === "string") {
        processedUpdates.themes = (updates.themes as string)
          .split(",")
          .map((t) => t.trim());
      }
      if (typeof updates.motifs === "string") {
        processedUpdates.motifs = (updates.motifs as string)
          .split(",")
          .map((t) => t.trim());
      }
      if (typeof updates.symbols === "string") {
        processedUpdates.symbols = (updates.symbols as string)
          .split(",")
          .map((t) => t.trim());
      }
      if (typeof updates.tags === "string") {
        processedUpdates.tags = (updates.tags as string)
          .split(",")
          .map((t) => t.trim());
      }

      await updateProjectService(projectId, processedUpdates as MangaProject);
      return true;
    } catch (error) {
      console.error(`Error in updateProjectTool: ${error}`);
      return false;
    }
  }
);

export const updateChapterTool = ai.defineTool(
  {
    name: "updateChapter",
    description: "Updates fields of an existing chapter.",
    inputSchema: z.object({
      chapterId: z.string().describe("ID of the chapter to update"),
      updates: UpdateChapterDataSchema.describe("Fields to update"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async ({ chapterId, updates }) => {
    try {
      const exists = await getChapterForContext(chapterId);
      if (!exists) throw new Error("Chapter not found");

      const processedUpdates = { ...updates };
      if (typeof updates.keyCharacters === "string") {
        processedUpdates.keyCharacters = (updates.keyCharacters as string)
          .split(",")
          .map((t) => t.trim());
      }

      await updateChapterService(chapterId, processedUpdates);
      return true;
    } catch (error) {
      console.error(`Error in updateChapterTool: ${error}`);
      return false;
    }
  }
);

export const updateSceneTool = ai.defineTool(
  {
    name: "updateScene",
    description: "Updates fields of an existing scene.",
    inputSchema: z.object({
      sceneId: z.string().describe("ID of the scene to update"),
      updates: UpdateSceneDataSchema.describe("Fields to update"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async ({ sceneId, updates }) => {
    try {
      const exists = await getSceneForContext(sceneId);
      if (!exists) throw new Error("Scene not found");

      const processedUpdates = { ...updates };
      if (typeof updates.sceneContext === "string") {
        processedUpdates.sceneContext = JSON.parse(updates.sceneContext);
      }

      await updateSceneService(sceneId, processedUpdates);
      return true;
    } catch (error) {
      console.error(`Error in updateSceneTool: ${error}`);
      return false;
    }
  }
);

export const updatePanelTool = ai.defineTool(
  {
    name: "updatePanel",
    description:
      "Updates fields of an existing panel (excluding character list).",
    inputSchema: z.object({
      panelId: z.string().describe("ID of the panel to update"),
      updates: UpdatePanelDataSchema.describe("Fields to update"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async ({ panelId, updates }) => {
    try {
      const exists = await getPanelForContext(panelId);
      if (!exists) throw new Error("Panel not found");

      const processedUpdates = { ...updates };
      if (typeof updates.panelContext === "string") {
        processedUpdates.panelContext = JSON.parse(updates.panelContext);
      }

      await updatePanelService(panelId, processedUpdates);
      return true;
    } catch (error) {
      console.error(`Error in updatePanelTool: ${error}`);
      return false;
    }
  }
);

export const updatePanelDialogueTool = ai.defineTool(
  {
    name: "updatePanelDialogue",
    description: "Updates fields of an existing panel dialogue.",
    inputSchema: z.object({
      dialogueId: z.string().describe("ID of the dialogue to update"),
      updates: UpdatePanelDialogueDataSchema.describe("Fields to update"),
      speakerName: z
        .string()
        .optional()
        .describe("Name of new speaker if changing"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async ({ dialogueId, updates, speakerName }) => {
    try {
      const exists = await getPanelDialogueForContext(dialogueId);
      if (!exists) throw new Error("Dialogue not found");

      let speakerIdToSet: string | null | undefined = undefined;

      if (speakerName !== undefined) {
        if (speakerName === "" || speakerName === null) {
          speakerIdToSet = null;
        } else {
          const projectId = await getProjectIdForContext({
            panelId: exists.panelId,
          });
          if (!projectId) throw new Error("Could not determine project");

          const characters = await listCharacters(projectId);
          const foundSpeaker = characters.find(
            (c) => c.name.toLowerCase() === speakerName.toLowerCase()
          );
          if (!foundSpeaker) {
            console.warn(`Speaker "${speakerName}" not found`);
          } else {
            speakerIdToSet = foundSpeaker.id;
          }
        }
      }

      const processedUpdates = { ...updates };
      if (typeof updates.style === "string") {
        processedUpdates.style = JSON.parse(updates.style);
      }
      if (speakerIdToSet !== undefined) {
        (processedUpdates as any).speakerId = speakerIdToSet;
      }

      await updatePanelDialogueService(dialogueId, processedUpdates);
      return true;
    } catch (error) {
      console.error(`Error in updatePanelDialogueTool: ${error}`);
      return false;
    }
  }
);

export const updateCharacterTool = ai.defineTool(
  {
    name: "updateCharacter",
    description: "Updates fields of an existing character.",
    inputSchema: z.object({
      characterId: z.string().describe("ID of the character to update"),
      updates: UpdateCharacterDataSchema.describe("Fields to update"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async ({ characterId, updates }) => {
    try {
      const exists = await getCharacterForContext(characterId);
      if (!exists) throw new Error("Character not found");

      const processedUpdates = { ...updates };
      if (typeof updates.bodyAttributes === "string") {
        processedUpdates.bodyAttributes = JSON.parse(updates.bodyAttributes);
      }
      if (typeof updates.facialAttributes === "string") {
        processedUpdates.facialAttributes = JSON.parse(
          updates.facialAttributes
        );
      }
      if (typeof updates.hairAttributes === "string") {
        processedUpdates.hairAttributes = JSON.parse(updates.hairAttributes);
      }
      if (typeof updates.styleGuide === "string") {
        processedUpdates.styleGuide = JSON.parse(updates.styleGuide);
      }

      if (typeof updates.distinctiveFeatures === "string") {
        processedUpdates.distinctiveFeatures = (
          updates.distinctiveFeatures as string
        )
          .split(",")
          .map((t) => t.trim());
      }
      if (typeof updates.physicalMannerisms === "string") {
        processedUpdates.physicalMannerisms = (
          updates.physicalMannerisms as string
        )
          .split(",")
          .map((t) => t.trim());
      }

      if (typeof updates.traits === "string") {
        processedUpdates.traits = (updates.traits as string)
          .split(",")
          .map((t) => t.trim());
      }
      if (typeof updates.arcs === "string") {
        processedUpdates.arcs = (updates.arcs as string)
          .split(",")
          .map((t) => t.trim());
      }

      await updateCharacterService(characterId, processedUpdates as Character);
      return true;
    } catch (error) {
      console.error(`Error in updateCharacterTool: ${error}`);
      return false;
    }
  }
);

export const assignCharacterToPanelTool = ai.defineTool(
  {
    name: "assignCharacterToPanel",
    description: "Assigns a character to a panel.",
    inputSchema: z.object({
      panelId: z.string().describe("ID of the panel"),
      characterId: z.string().describe("ID of the character to assign"),
    }),
    outputSchema: z.boolean().describe("True if assignment succeeded"),
  },
  async ({ panelId, characterId }) => {
    try {
      const panelExists = await getPanelForContext(panelId);
      if (!panelExists) throw new Error("Panel not found");

      const charExists = await getCharacterForContext(characterId);
      if (!charExists) throw new Error("Character not found");

      await assignCharacterToPanelService(panelId, characterId);
      return true;
    } catch (error) {
      console.error(`Error in assignCharacterToPanelTool: ${error}`);
      return false;
    }
  }
);

export const removeCharacterFromPanelTool = ai.defineTool(
  {
    name: "removeCharacterFromPanel",
    description: "Removes a character from a panel.",
    inputSchema: z.object({
      panelId: z.string().describe("ID of the panel"),
      characterId: z.string().describe("ID of the character to remove"),
    }),
    outputSchema: z.boolean().describe("True if removal succeeded"),
  },
  async ({ panelId, characterId }) => {
    try {
      const panelExists = await getPanelForContext(panelId);
      if (!panelExists) throw new Error("Panel not found");

      await removeCharacterFromPanelService(panelId, characterId);
      return true;
    } catch (error) {
      console.error(`Error in removeCharacterFromPanelTool: ${error}`);
      return false;
    }
  }
);

// Template Update Tools

export const updateOutfitTemplateTool = ai.defineTool(
  {
    name: "updateOutfitTemplate",
    description: "Update an existing outfit template",
    inputSchema: z.object({
      id: z.string().describe("ID of the outfit template to update"),
      name: z.string().optional().describe("Name of the outfit template"),
      description: z.string().optional().describe("Description of the outfit"),
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
        .describe("Category of the outfit"),
      subCategory: z
        .string()
        .optional()
        .describe("Subcategory for more specific outfit type"),
      gender: z
        .enum(["male", "female", "unisex"])
        .optional()
        .describe("Target gender for the outfit"),
      ageGroup: z
        .enum(["child", "teen", "adult", "elderly"])
        .optional()
        .describe("Target age group"),
      season: z
        .enum(["spring", "summer", "autumn", "winter", "all"])
        .optional()
        .describe("Appropriate season"),
      style: z
        .enum(["anime", "realistic", "cartoon", "manga"])
        .optional()
        .describe("Art style"),
      components: z
        .array(
          z.object({
            type: z.enum([
              "top",
              "bottom",
              "shoes",
              "accessories",
              "outerwear",
            ]),
            item: z.string(),
            color: z.string().optional(),
            material: z.string().optional(),
            pattern: z.string().optional(),
          })
        )
        .optional()
        .describe("Outfit components"),
      colors: z.array(z.string()).optional().describe("Primary colors"),
      materials: z.array(z.string()).optional().describe("Materials used"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
      imagePrompt: z
        .string()
        .optional()
        .describe("Prompt for generating outfit image"),
      imageUrl: z.string().optional().describe("URL of the outfit image"),
      isActive: z
        .boolean()
        .optional()
        .describe("Whether the template is active"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async (updateData) => {
    try {
      const { id, ...templateData } = updateData;
      await updateOutfitTemplateService(id, templateData);
      return true;
    } catch (error) {
      console.error(`Error in updateOutfitTemplateTool: ${error}`);
      return false;
    }
  }
);

export const updateLocationTemplateTool = ai.defineTool(
  {
    name: "updateLocationTemplate",
    description: "Update an existing location template",
    inputSchema: z.object({
      id: z.string().describe("ID of the location template to update"),
      name: z.string().optional().describe("Name of the location"),
      description: z
        .string()
        .optional()
        .describe("Description of the location"),
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
        .describe("Category of the location"),
      subCategory: z
        .string()
        .optional()
        .describe("Subcategory for more specific location type"),
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
        .describe("Time of day"),
      weather: z
        .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy", "any"])
        .optional()
        .describe("Weather condition"),
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
        .describe("Mood of the location"),
      style: z
        .enum(["anime", "realistic", "cartoon", "manga"])
        .optional()
        .describe("Art style"),
      lighting: z
        .object({
          type: z.enum(["natural", "artificial", "mixed"]).optional(),
          intensity: z.enum(["dim", "moderate", "bright"]).optional(),
          color: z.string().optional(),
        })
        .optional()
        .describe("Lighting characteristics"),
      cameraAngles: z
        .array(
          z.enum([
            "wide-shot",
            "medium-shot",
            "close-up",
            "birds-eye",
            "worms-eye",
            "dutch-angle",
            "over-shoulder",
          ])
        )
        .optional()
        .describe("Recommended camera angles"),
      props: z
        .array(z.string())
        .optional()
        .describe("Common props in this location"),
      colors: z.array(z.string()).optional().describe("Dominant colors"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
      imagePrompt: z
        .string()
        .optional()
        .describe("Prompt for generating location image"),
      imageUrl: z.string().optional().describe("URL of the location image"),
      isActive: z
        .boolean()
        .optional()
        .describe("Whether the template is active"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async (updateData) => {
    try {
      const { id, ...templateData } = updateData;
      await updateLocationTemplateService(id, templateData);
      return true;
    } catch (error) {
      console.error(`Error in updateLocationTemplateTool: ${error}`);
      return false;
    }
  }
);

export const updatePoseTemplateTool = ai.defineTool(
  {
    name: "updatePoseTemplate",
    description: "Update an existing pose template",
    inputSchema: z.object({
      id: z.string().describe("ID of the pose template to update"),
      name: z.string().optional().describe("Name of the pose"),
      description: z.string().optional().describe("Description of the pose"),
      category: z
        .enum([
          "standing",
          "sitting",
          "lying",
          "walking",
          "running",
          "action",
          "emotional",
          "interaction",
          "combat",
          "dance",
        ])
        .optional()
        .describe("Category of the pose"),
      subCategory: z
        .string()
        .optional()
        .describe("Subcategory for more specific pose type"),
      emotion: z
        .enum([
          "neutral",
          "happy",
          "sad",
          "angry",
          "surprised",
          "fearful",
          "disgusted",
          "excited",
          "calm",
          "intense",
        ])
        .optional()
        .describe("Emotion conveyed by the pose"),
      difficulty: z
        .enum(["easy", "medium", "hard"])
        .optional()
        .describe("Difficulty to draw"),
      gender: z
        .enum(["male", "female", "unisex"])
        .optional()
        .describe("Target gender"),
      ageGroup: z
        .enum(["child", "teen", "adult", "elderly"])
        .optional()
        .describe("Target age group"),
      style: z
        .enum(["anime", "realistic", "cartoon", "manga"])
        .optional()
        .describe("Art style"),
      bodyParts: z
        .object({
          head: z.string().optional(),
          arms: z.string().optional(),
          hands: z.string().optional(),
          torso: z.string().optional(),
          legs: z.string().optional(),
          feet: z.string().optional(),
        })
        .optional()
        .describe("Position of body parts"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
      imagePrompt: z
        .string()
        .optional()
        .describe("Prompt for generating pose image"),
      imageUrl: z.string().optional().describe("URL of the pose image"),
      isActive: z
        .boolean()
        .optional()
        .describe("Whether the template is active"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async (updateData) => {
    try {
      const { id, ...templateData } = updateData;
      await updatePoseTemplateService(id, templateData);
      return true;
    } catch (error) {
      console.error(`Error in updatePoseTemplateTool: ${error}`);
      return false;
    }
  }
);

export const updateEffectTemplateTool = ai.defineTool(
  {
    name: "updateEffectTemplate",
    description: "Update an existing effect template",
    inputSchema: z.object({
      id: z.string().describe("ID of the effect template to update"),
      name: z.string().optional().describe("Name of the effect"),
      description: z.string().optional().describe("Description of the effect"),
      category: z
        .enum([
          "speed",
          "impact",
          "emotion",
          "magic",
          "weather",
          "explosion",
          "energy",
          "transformation",
          "sound",
          "motion",
        ])
        .optional()
        .describe("Category of the effect"),
      subCategory: z
        .string()
        .optional()
        .describe("Subcategory for more specific effect type"),
      intensity: z
        .enum(["low", "medium", "high", "extreme"])
        .optional()
        .describe("Effect intensity"),
      duration: z
        .enum(["instant", "short", "medium", "long", "persistent"])
        .optional()
        .describe("Effect duration"),
      style: z
        .enum(["anime", "realistic", "cartoon", "manga"])
        .optional()
        .describe("Art style"),
      colors: z.array(z.string()).optional().describe("Effect colors"),
      shapes: z.array(z.string()).optional().describe("Shapes used in effect"),
      patterns: z
        .array(z.string())
        .optional()
        .describe("Patterns used in effect"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
      imagePrompt: z
        .string()
        .optional()
        .describe("Prompt for generating effect image"),
      imageUrl: z.string().optional().describe("URL of the effect image"),
      isActive: z
        .boolean()
        .optional()
        .describe("Whether the template is active"),
    }),
    outputSchema: z.boolean().describe("True if update succeeded"),
  },
  async (updateData) => {
    try {
      const { id, ...templateData } = updateData;
      await updateEffectTemplateService(id, templateData);
      return true;
    } catch (error) {
      console.error(`Error in updateEffectTemplateTool: ${error}`);
      return false;
    }
  }
);
