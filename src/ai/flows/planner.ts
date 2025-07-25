/**
 * Content Planner Flow
 *
 * This module handles intelligent routing and processing of user requests for existing manga projects.
 * It analyzes user input and determines the appropriate action (generate content, update content,
 * generate images, or direct response) and executes the corresponding handlers.
 *
 * Main components:
 * - ContentPlannerPrompt: AI prompt that analyzes user intent and routes to appropriate handlers
 * - ProcessMangaRequestFlow: Main flow that orchestrates the entire request processing
 * - Handler functions for different action types (content generation, updates, image generation, etc.)
 * - Context extraction utilities for preparing data for AI prompts
 */

import { ai } from "@/ai/ai-instance";
import {
  ChapterAnalysisPrompt,
  processChapterAnalysisResults,
} from "@/ai/flows/chapter-analysis";
import {
  ChapterGenerationPrompt,
  CharacterGenerationPrompt,
  DialogueGenerationPrompt,
  PanelGenerationPrompt,
  SceneGenerationPrompt,
} from "@/ai/flows/generation-flows";
import {
  GenerateCharacterImage,
  GenerateLocationImage,
  GeneratePanelImagePromptOnly,
} from "@/ai/flows/image-genration";
import {
  ChapterUpdatePrompt,
  CharacterUpdatePrompt,
  DialogueUpdatePrompt,
  PanelUpdatePrompt,
  SceneUpdatePrompt,
} from "@/ai/flows/update-flows";
import { getSceneForContext } from "@/services/data-service";
import { getProjectWithRelations } from "@/services/db";
import { MangaProject } from "@/types/entities";
import axios from "axios";
import { z } from "zod";

/**
 * Interface for the content planning result
 * Maps directly to the output schema of ContentPlannerPrompt
 */
export interface ContentPlannerResult {
  action:
    | "directResponse"
    | "generateContent"
    | "updateContent"
    | "generateImage";

  // Action-specific context objects (only one should be provided)
  directResponseContext?: {
    content: string;
  };

  generateContentContext?: {
    parentType: "project" | "chapter" | "scene" | "panel";
    parentId: string;
    contentType: "character" | "chapter" | "scene" | "panel";
    description: string;
  };

  updateContentContext?: {
    contentType: "character" | "chapter" | "scene" | "panel" | "dialog";
    contentId: string;
    description: string;
  };

  generateImageContext?: {
    contentType:
      | "character"
      | "characterWithTemplate"
      | "location"
      | "locationWithEffects"
      | "panel";
    contentId: string;
    description: string;
    imageMode?:
      | "portrait"
      | "withTemplate"
      | "location"
      | "locationWithEffects"
      | "panelPromptOnly"
      | "panelWithReferences";
    templateIds?: {
      outfitId?: string;
      poseId?: string;
      locationId?: string;
      effectIds?: string[];
    };
    panelMode?: "promptOnly" | "withReferences";
    cameraAngle?: string;
  };
}

/**
 * Interface for the result of a processing operation
 */
export interface ProcessingResult {
  type:
    | "directResponse"
    | "contentGenerated"
    | "contentUpdate"
    | "imageGenerated"
    | "error";
  message?: string;
  data?: any;
}

/**
 * Content planner prompt definition
 */
export const ContentPlannerPrompt = ai.definePrompt({
  name: "ContentPlannerFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the user prompt"),
      projectContext: z.any().optional().describe("current project context"),
      selectedNode: z
        .object({
          id: z.string().describe("ID of the selected node"),
          type: z
            .string()
            .describe(
              "Type of the selected node (character, chapter, scene, etc.)"
            ),
          data: z.any().describe("Data of the selected node"),
        })
        .optional()
        .describe("The node currently selected by the user, if any"),
      prevChats: z.array(z.any()),
    }),
  },
  output: {
    schema: z.object({
      action: z
        .enum([
          "directResponse",
          "generateContent",
          "updateContent",
          "generateImage",
        ])
        .describe("The action to take based on user intent"),

      directResponseContext: z
        .object({
          content: z.string().describe("The helpful response to the user"),
        })
        .optional()
        .describe("Context for direct response action"),

      generateContentContext: z
        .object({
          parentType: z
            .enum(["project", "chapter", "scene", "panel"])
            .describe("Type of parent container"),
          parentId: z.string().describe("ID of parent container"),
          contentType: z
            .enum(["character", "chapter", "scene", "panel"])
            .describe("Type of content to generate"),
          description: z
            .string()
            .describe("Brief description of what will be generated"),
        })
        .optional()
        .describe("Context for content generation action"),

      updateContentContext: z
        .object({
          contentType: z
            .enum(["character", "chapter", "scene", "panel", "dialog"])
            .describe("Type of content to update"),
          contentId: z.string().describe("ID of content to update"),
          description: z
            .string()
            .describe("Brief description of what will be updated"),
        })
        .optional()
        .describe("Context for content update action"),

      generateImageContext: z
        .object({
          contentType: z
            .enum([
              "character",
              "characterWithTemplate",
              "location",
              "locationWithEffects",
              "panel",
            ])
            .describe("Type of content for the image"),
          contentId: z.string().describe("ID of related content"),
          description: z
            .string()
            .describe("Brief description of the image to generate"),
          imageMode: z
            .enum([
              "portrait",
              "withTemplate",
              "location",
              "locationWithEffects",
              "panelPromptOnly",
              "panelWithReferences",
            ])
            .optional()
            .describe("Specific image generation mode"),
          templateIds: z
            .object({
              outfitId: z.string().optional(),
              poseId: z.string().optional(),
              locationId: z.string().optional(),
              effectIds: z.array(z.string()).optional(),
            })
            .optional()
            .describe("Template IDs to use for generation"),
          panelMode: z
            .enum(["promptOnly", "withReferences"])
            .optional()
            .describe(
              "Panel generation mode - prompt-only or with reference images"
            ),
          cameraAngle: z
            .string()
            .optional()
            .describe("Specific camera angle for locations"),
        })
        .optional()
        .describe("Context for image generation action"),
    }),
  },
  prompt: `You are an AI assistant that helps users develop manga projects. Your job is to analyze requests and route them to the correct handler with the appropriate context.

# ACTIONS AND REQUIRED CONTEXTS

Your task is to determine which action to take and provide the appropriate context object for that action. Every response must include an action field and exactly ONE context object corresponding to that action.

## 1. DIRECT RESPONSE (action: "directResponse")
Use when: The user is asking questions, seeking advice, or chatting.
Required context object: directResponseContext
- content: Your helpful response to the user

## 2. GENERATE CONTENT (action: "generateContent")
Use when: The user wants to create NEW manga content.
Required context object: generateContentContext
- parentType: The type of PARENT container ("project", "chapter", "scene", "panel")
- parentId: The ID of the parent entity where this content will be created
- contentType: The type of content being generated ("character", "chapter", "scene", "panel")
- description: Brief description of what will be generated

## 3. UPDATE CONTENT (action: "updateContent")
Use when: The user wants to modify EXISTING manga content.
Required context object: updateContentContext
- contentType: The type of content being updated ("character", "chapter", "scene", "panel", "dialog")
- contentId: The ID of the specific content being updated
- description: Brief description of what will be updated

## 4. GENERATE IMAGE (action: "generateImage")
Use when: The user wants to create an image using the image generation pipeline.
Required context object: generateImageContext
- contentType: The type of image to generate ("character", "characterWithTemplate", "location", "locationWithEffects", "panel")
- contentId: The ID of the relevant content
- description: Brief description of the image request
- imageMode: (Optional) Specific generation mode
- templateIds: (Optional) Specific template IDs to use
- panelMode: (Optional) For panels: "promptOnly" or "withReferences"
- cameraAngle: (Optional) For locations: specific camera angle

# ROUTING GUIDE FOR CONTENT GENERATION

For "generateContent" action, use this mapping:

1. Creating a CHARACTER:
   - parentType: "project" (characters belong to the project)
   - parentId: [project ID]
   - contentType: "character"

2. Creating a CHAPTER:
   - parentType: "project" (chapters belong to the project)
   - parentId: [project ID]
   - contentType: "chapter"

3. Creating a SCENE:
   - parentType: "chapter" (scenes belong to chapters)
   - parentId: [chapter ID]
   - contentType: "scene"

4. Creating a PANEL:
   - parentType: "scene" (panels belong to scenes)
   - parentId: [scene ID]
   - contentType: "panel"

# CRITICAL ID EXTRACTION RULES

## For "updateContent" action:
- You MUST always extract and provide the contentId
- If the user directly mentions an ID, use it
- If the user has selected a node and is referring to it, use the selectedNode.id
- If the user refers to content by name/description, determine its ID from context
- If you cannot determine a contentId with confidence, use "directResponse" instead and ask for clarification

## For "generateContent" action:
- You MUST always extract and provide the parentId
- If a parent is not explicitly mentioned but a node is selected, determine if that node should be the parent
- If you cannot determine a parentId with confidence, use "directResponse" instead and ask for clarification

# CONTEXTUAL INFORMATION

You have access to:
{{#if projectContext}}
- Current project context: {{projectContext}}
{{/if}}

{{#if selectedNode}}
- Selected node: 
  • Type: {{selectedNode.type}}
  • ID: {{selectedNode.id}}
  • Data: {{selectedNode.data}}
{{/if}}

# VALIDATION RULES - ALWAYS APPLY THESE

1. EVERY response MUST include the "action" field
2. You MUST include EXACTLY ONE context object that matches the selected action:
   - For "directResponse" → include only directResponseContext
   - For "generateContent" → include only generateContentContext
   - For "updateContent" → include only updateContentContext
   - For "generateImage" → include only generateImageContext
3. NEVER leave required fields blank in any context object
4. If you cannot determine a required ID with confidence:
   - Use "directResponse" as the action
   - Include only directResponseContext
   - Ask for clarification in the content field

5- important treat delete as exactly update (the update action is used to delete content also)

Previous chats:
{{prevChats}}

Now analyze this user input: {{userInput}}`,
});

/**
 * Mapping between content types and their generation prompts
 * Now supports all content types!
 */
const contentTypeToGenerationPrompt = {
  character: "CharacterGenerationPrompt",
  chapter: "ChapterGenerationPrompt",
  scene: "SceneGenerationPrompt",
  panel: "PanelGenerationPrompt",
  dialog: "DialogueGenerationPrompt",
} as const;
/**
 * Extracts the full context information from the project
 * Used primarily for content generation where more context is beneficial
 */
export const extractFullContexts = (project: MangaProject) => {
  const projectContext = {
    id: project.id,
    title: project.title,
    description: project.description,
    concept: project.concept,
    genre: project.genre,
    themes: project.themes,
    artStyle: project.artStyle,
    plotStructure: project.plotStructure,
    worldDetails: project.worldDetails,
  };

  const charactersContext = project.characters?.map((ch) => ({
    id: ch.id,
    name: ch.name,
    age: ch.age,
    gender: ch.gender,
    role: ch.role,
    traits: ch.traits,
    backstory: ch.backstory,
    bodyAttributes: ch.bodyAttributes,
    hairAttributes: ch.hairAttributes,
    posture: ch.posture,
    abilities: ch.abilities,
    consistencyPrompt: ch.consistencyPrompt,
    negativePrompt: ch.negativePrompt,
    imgUrl: ch.imgUrl,
  }));

  const chaptersContext = project.chapters?.map((ch) => ({
    id: ch.id,
    chapterNumber: ch.chapterNumber,
    title: ch.title,
    narrative: ch.narrative,
    keyCharacters: ch.keyCharacters,
  }));

  // Extract a specific scene context with its chapter information
  const extractSceneContext = (sceneId: string) => {
    for (const chapter of project.chapters || []) {
      const scene = chapter.scenes?.find((sc) => sc.id === sceneId);
      if (scene) {
        return {
          scene: {
            id: scene.id,
            order: scene.order,
            title: scene.title,
            description: scene.description,
            sceneContext: scene.sceneContext,
            panels: scene.panels?.map((panel) => ({
              id: panel.id,
              order: panel.order,
              panelContext: panel.panelContext,
              characters: panel.characters,
              dialogues: panel.dialogues?.map((dialogue) => ({
                id: dialogue.id,
                order: dialogue.order,
                emotion: dialogue.emotion,
                content: dialogue.content,
                speakerId: dialogue.speakerId,
              })),
            })),
          },
          chapterId: chapter.id,
        };
      }
    }
    return null; // Scene not found
  };

  const extractPanelContext = (panelId: string) => {
    for (const chapter of project.chapters || []) {
      for (const scene of chapter.scenes || []) {
        const panel = scene.panels?.find((p) => p.id == panelId);
        if (panel) {
          return {
            id: panel.id,
            order: panel.order,
            panelContext: panel.panelContext,
            characters: panel.characters,
            negativePrompt: panel.negativePrompt,
            characterNames: panel.panelContext.characterPoses?.map(
              (ch) => ch.characterName
            ),
            sceneId: scene.id,
          };
        }
      }
    }
    return null; // Scene not found
  };

  // Extract a specific chapter context
  const extractChapterContext = (chapterId: string) => {
    const chapter = project.chapters?.find((ch) => ch.id === chapterId);
    if (chapter) {
      return {
        id: chapter.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        narrative: chapter.narrative,
        keyCharacters: chapter.keyCharacters,
        scenes: chapter.scenes?.map((sc) => ({
          id: sc.id,
          order: sc.order,
          title: sc.title,
          description: sc.description,
          sceneContext: sc.sceneContext,
        })),
      };
    }
    return null; // Chapter not found
  };

  return {
    projectContext,
    charactersContext,
    chaptersContext,
    extractSceneContext,
    extractChapterContext,
    extractPanelContext,
  };
};

/**
 * Extracts minimal context information for updates
 * Optimized to include only the necessary data for updates
 */
export const extractUpdateContexts = (project: MangaProject) => {
  // Minimal project context with just essential information
  const projectContext = {
    id: project.id,
    title: project.title,
    concept: project.concept,
    artStyle: project.artStyle,
    genre: project.genre,
    themes: project.themes,
  };

  // Get a specific character with full details
  const getCharacter = (characterId: string) => {
    const character = project.characters?.find((ch) => ch.id === characterId);
    if (!character) return null;

    return {
      id: character.id,
      name: character.name,
      age: character.age,
      gender: character.gender,
      role: character.role,
      traits: character.traits,
      backstory: character.backstory,
      bodyAttributes: character.bodyAttributes,
      hairAttributes: character.hairAttributes,
      posture: character.posture,
      abilities: character.abilities,
    };
  };

  // Get character names and roles only for reference
  const getCharacterReferences = () => {
    return (
      project.characters?.map((ch) => ({
        id: ch.id,
        name: ch.name,
        role: ch.role,
      })) || []
    );
  };

  // Get a specific chapter with selective details
  const getChapter = (chapterId: string) => {
    const chapter = project.chapters?.find((ch) => ch.id === chapterId);
    if (!chapter) return null;

    return {
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      narrative: chapter.narrative,
      keyCharacters: chapter.keyCharacters,
    };
  };

  // Get a specific scene with its relevant context
  const getScene = (sceneId: string) => {
    for (const chapter of project.chapters || []) {
      const scene = chapter.scenes?.find((sc) => sc.id === sceneId);
      if (scene) {
        // Return scene without all panel details
        return {
          scene: {
            id: scene.id,
            order: scene.order,
            title: scene.title,
            description: scene.description,
            sceneContext: scene.sceneContext,
            // Include only basic panel information
            panelCount: scene.panels?.length || 0,
          },
          chapterId: chapter.id,
          chapterTitle: chapter.title,
        };
      }
    }
    return null;
  };

  // Get a specific panel with its context
  const getPanel = (panelId: string) => {
    for (const chapter of project.chapters || []) {
      for (const scene of chapter.scenes || []) {
        const panel = scene.panels?.find((p) => p.id === panelId);
        if (panel) {
          return {
            panel: {
              id: panel.id,
              order: panel.order,
              panelContext: panel.panelContext,
              characters: panel.characters,
              dialogues: panel.dialogues?.map((d) => ({
                id: d.id,
                order: d.order,
                emotion: d.emotion,
                content: d.content,
                speakerId: d.speakerId,
              })),
            },
            scene: {
              id: scene.id,
              title: scene.title,
            },
            chapter: {
              id: chapter.id,
              title: chapter.title,
            },
          };
        }
      }
    }
    return null;
  };

  // Get a dialogue with its context
  const getDialogue = (dialogueId: string) => {
    for (const chapter of project.chapters || []) {
      for (const scene of chapter.scenes || []) {
        for (const panel of scene.panels || []) {
          const dialogue = panel.dialogues?.find((d) => d.id === dialogueId);
          if (dialogue) {
            return {
              dialogue: {
                id: dialogue.id,
                order: dialogue.order,
                emotion: dialogue.emotion,
                content: dialogue.content,
                speakerId: dialogue.speakerId,
              },
              panel: {
                id: panel.id,
                order: panel.order,
              },
              scene: {
                id: scene.id,
                title: scene.title,
              },
            };
          }
        }
      }
    }
    return null;
  };

  return {
    projectContext,
    getCharacter,
    getCharacterReferences,
    getChapter,
    getScene,
    getPanel,
    getDialogue,
  };
};

/**
 * Handles direct response requests
 */
const handleDirectResponse = (
  result: ContentPlannerResult
): ProcessingResult => {
  if (!result.directResponseContext) {
    return {
      type: "error",
      message: "Missing directResponseContext in result",
    };
  }

  return {
    type: "directResponse",
    message: result.directResponseContext.content,
  };
};

/**
 * Handles content generation requests
 */
const GenerationPrompt = {
  CharacterGenerationPrompt,
  ChapterGenerationPrompt,
  SceneGenerationPrompt,
  PanelGenerationPrompt,
  DialogueGenerationPrompt,
};

/**
 * Handles content update requests
 */
const updatePrompt = {
  chapter: ChapterUpdatePrompt,
  scene: SceneUpdatePrompt,
  panel: PanelUpdatePrompt,
  dialog: DialogueUpdatePrompt,
  character: CharacterUpdatePrompt,
};

const handleGenerateContent = async (
  result: ContentPlannerResult,
  project: MangaProject,
  userInput: string
): Promise<ProcessingResult> => {
  if (!result.generateContentContext) {
    return {
      type: "error",
      message: "Missing generateContentContext in result",
    };
  }

  const { contentType, parentId, parentType } = result.generateContentContext;

  // Check which content types are currently supported
  const supportedTypes = Object.keys(contentTypeToGenerationPrompt) as Array<
    keyof typeof contentTypeToGenerationPrompt
  >;

  if (!supportedTypes.includes(contentType as any)) {
    return {
      type: "error",
      message: `Content type "${contentType}" is not supported. Supported types: ${supportedTypes.join(
        ", "
      )}`,
    };
  }

  // Map content type to appropriate generation prompt
  const promptName =
    contentTypeToGenerationPrompt[
      contentType as keyof typeof contentTypeToGenerationPrompt
    ];

  if (
    !promptName ||
    !GenerationPrompt[promptName as keyof typeof GenerationPrompt]
  ) {
    return {
      type: "error",
      message: `Unknown generation prompt for content type: ${contentType}`,
    };
  }

  try {
    // Extract full context for content generation
    const {
      projectContext,
      charactersContext,
      chaptersContext,
      extractChapterContext,
      extractSceneContext,
    } = extractFullContexts(project);

    // Get template contexts
    const locationTemplatesContext = project.locationTemplates || [];
    const outfitTemplatesContext = project.outfitTemplates || [];

    // Prepare parameters based on prompt type with targeted context
    let params: any = {
      userInput,
      projectContext,
      contentType,
      parentId,
      parentType,
      description: result.generateContentContext.description,
      existingLocationTemplates: locationTemplatesContext,
      existingOutfitTemplates: outfitTemplatesContext,
    };

    // Add context specific to each prompt type
    switch (promptName) {
      case "CharacterGenerationPrompt":
        params.existingCharacters = charactersContext;
        break;

      case "ChapterGenerationPrompt":
        params.existingCharacters = charactersContext;
        params.existingChapters = chaptersContext;
        break;

      case "SceneGenerationPrompt":
        params.chapterContext = extractChapterContext(parentId);
        params.existingCharacters = charactersContext;
        params.existingScenes = extractChapterContext(parentId)?.scenes || [];
        break;

      case "PanelGenerationPrompt":
        params.sceneContext = extractSceneContext(parentId);
        params.existingCharacters = charactersContext;
        params.existingPanels =
          extractSceneContext(parentId)?.scene.panels || [];
        break;

      case "DialogueGenerationPrompt":
        const panelContext =
          extractFullContexts(project).extractPanelContext(parentId);
        params.panelContext = panelContext;
        params.sceneContext = panelContext
          ? extractSceneContext(panelContext.sceneId)
          : null;
        params.existingCharacters = charactersContext;
        params.speakerCharacter = null; // Will be determined by the prompt based on user input
        break;
    }

    // Execute the generation prompt
    const generatedContent = await GenerationPrompt[
      promptName as keyof typeof GenerationPrompt
    ](params);

    // For chapter generation, run post-chapter template analysis
    if (promptName === "ChapterGenerationPrompt" && generatedContent.output) {
      try {
        console.log("🔍 Running chapter template analysis...");

        const analysisResult = await ChapterAnalysisPrompt({
          createdChapter: generatedContent.output,
          projectContext,
          existingOutfitTemplates: outfitTemplatesContext,
          existingLocationTemplates: locationTemplatesContext,
          existingCharacters: charactersContext || [],
          mangaProjectId: project.id,
        });

        console.log("✅ Chapter analysis complete:", analysisResult.output);

        // Process the analysis results and create templates/variations
        if (analysisResult.output?.needsNewTemplates) {
          console.log("🔧 Creating templates and variations...");

          const creationResults = await processChapterAnalysisResults(
            analysisResult.output,
            project.id
          );

          console.log("✅ Template creation complete:", {
            outfitTemplates: creationResults.createdOutfitTemplates.length,
            locationTemplates: creationResults.createdLocationTemplates.length,
            outfitVariations: creationResults.createdOutfitVariations.length,
            locationVariations:
              creationResults.createdLocationVariations.length,
            skippedDuplicates: creationResults.skippedDuplicates?.length || 0,
            errors: creationResults.errors.length,
          });

          return {
            type: "contentGenerated",
            message: creationResults.success
              ? "Chapter and templates successfully created"
              : "Chapter created, but some templates failed",
            data: {
              chapter: generatedContent.output,
              analysis: analysisResult.output?.analysis || "Analysis completed",
              templatesCreated: {
                outfitTemplates: creationResults.createdOutfitTemplates,
                locationTemplates: creationResults.createdLocationTemplates,
                outfitVariations: creationResults.createdOutfitVariations,
                locationVariations: creationResults.createdLocationVariations,
              },
              intelligentOptimizations: {
                duplicatesAvoided: creationResults.skippedDuplicates || [],
                contextAwareVariations:
                  creationResults.createdOutfitVariations.length +
                  creationResults.createdLocationVariations.length,
              },
              errors:
                creationResults.errors.length > 0
                  ? creationResults.errors
                  : undefined,
            },
          };
        } else {
          return {
            type: "contentGenerated",
            message: "Chapter created, no new templates needed",
            data: {
              chapter: generatedContent.output,
              analysis:
                analysisResult.output?.analysis || "No templates needed",
            },
          };
        }
      } catch (error: any) {
        console.error("❌ Chapter analysis failed:", error);

        // Still return the chapter even if analysis fails
        return {
          type: "contentGenerated",
          message: "Chapter generated, but template analysis failed",
          data: {
            chapter: generatedContent.output,
            analysisError: error.message,
          },
        };
      }
    }
    return {
      type: "contentGenerated",
      message: "Content successfully generated",
      data: generatedContent.output,
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Error executing ${promptName}: ${error.message}`,
    };
  }
};

const handleUpdateContent = async (
  result: ContentPlannerResult,
  project: MangaProject,
  userInput: string
): Promise<ProcessingResult> => {
  if (!result.updateContentContext) {
    return {
      type: "error",
      message: "Missing updateContentContext in result",
    };
  }

  const { contentType, contentId } = result.updateContentContext;

  // Get the appropriate update prompt based on content type
  const updatePromptFn = updatePrompt[contentType];

  if (!updatePromptFn) {
    return {
      type: "error",
      message: `Unknown update prompt for content type: ${contentType}`,
    };
  }

  try {
    // Extract minimal context needed for updates
    const {
      projectContext,
      getCharacter,
      getCharacterReferences,
      getChapter,
      getScene,
      getPanel,
      getDialogue,
    } = extractUpdateContexts(project);

    // Prepare basic parameters for all update types
    let params: any = {
      userInput,
      projectContext,
      contentType,
      contentId,
      description: result.updateContentContext.description,
    };

    // Add specific context based on content type
    switch (contentType) {
      case "character":
        const character = getCharacter(contentId);
        if (!character) {
          return {
            type: "error",
            message: `Character with ID ${contentId} not found`,
          };
        }
        params.character = character;
        break;

      case "chapter":
        const chapter = getChapter(contentId);
        if (!chapter) {
          return {
            type: "error",
            message: `Chapter with ID ${contentId} not found`,
          };
        }
        params.chapter = chapter;
        // Include minimal character references
        params.characterReferences = getCharacterReferences();
        break;

      case "scene":
        const sceneContext = getScene(contentId);
        if (!sceneContext) {
          return {
            type: "error",
            message: `Scene with ID ${contentId} not found`,
          };
        }
        params.scene = sceneContext.scene;
        params.chapterInfo = {
          id: sceneContext.chapterId,
          title: sceneContext.chapterTitle,
        };
        // Include minimal character references
        params.characterReferences = getCharacterReferences();
        break;

      case "panel":
        const panelContext = getPanel(contentId);
        if (!panelContext) {
          return {
            type: "error",
            message: `Panel with ID ${contentId} not found`,
          };
        }
        params.panel = panelContext.panel;
        params.sceneInfo = panelContext.scene;
        params.chapterInfo = panelContext.chapter;
        // Include character references for dialogue
        params.characterReferences = getCharacterReferences();
        break;

      case "dialog":
        const dialogueContext = getDialogue(contentId);
        if (!dialogueContext) {
          return {
            type: "error",
            message: `Dialogue with ID ${contentId} not found`,
          };
        }
        params.dialogue = dialogueContext.dialogue;
        params.panelInfo = dialogueContext.panel;
        params.sceneInfo = dialogueContext.scene;
        // Include character info for speaker reference
        const speakerChar = dialogueContext.dialogue.speakerId
          ? getCharacter(dialogueContext.dialogue.speakerId)
          : undefined;
        if (speakerChar) {
          params.speakerInfo = {
            id: speakerChar.id,
            name: speakerChar.name,
            traits: speakerChar.traits,
          };
        }
        break;
    }

    // Execute the update prompt
    const updateResult = await updatePromptFn(params);

    return {
      type: "contentUpdate",
      message: updateResult.output,
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Error updating ${contentType}: ${error.message}`,
    };
  }
};

/**
 * Handles image generation requests
 */
const handleGenerateImage = async (
  result: ContentPlannerResult,
  project: MangaProject
): Promise<ProcessingResult> => {
  if (!result.generateImageContext) {
    return {
      type: "error",
      message: "Missing generateImageContext in result",
    };
  }

  const imageContext = result.generateImageContext;

  try {
    // Extract project context
    const projectContext = {
      id: project.id,
      title: project.title,
      artStyle: project.artStyle,
      concept: project.concept,
    };

    const charactersContext = project.characters?.map((ch) => ({
      id: ch.id,
      name: ch.name,
      age: ch.age,
      gender: ch.gender,
      role: ch.role,
      traits: ch.traits,
      backstory: ch.backstory,
      bodyAttributes: ch.bodyAttributes,
      hairAttributes: ch.hairAttributes,
      posture: ch.posture,
      abilities: ch.abilities,
      consistencyPrompt: ch.consistencyPrompt,
      negativePrompt: ch.negativePrompt,
      imgUrl: ch.imgUrl,
    }));

    const extractPanelContext = (panelId: string) => {
      for (const chapter of project.chapters || []) {
        for (const scene of chapter.scenes || []) {
          const panel = scene.panels?.find((p) => p.id == panelId);
          if (panel) {
            return {
              id: panel.id,
              order: panel.order,
              panelContext: panel.panelContext,
              characters: panel.characters,
              negativePrompt: panel.negativePrompt,
              characterNames: panel.panelContext.characterPoses?.map(
                (ch: any) => ch.characterName
              ),
              sceneId: scene.id,
            };
          }
        }
      }
      return null;
    };

    let generated: any = null;

    switch (imageContext.contentType) {
      case "character":
        const character = charactersContext?.find(
          (el: any) => el.id === imageContext.contentId
        );
        if (!character) {
          return {
            type: "error",
            message: `Character with ID ${imageContext.contentId} not found`,
          };
        }

        generated = await GenerateCharacterImage({
          character: character,
        });
        break;

      case "location":
        const location = project.locationTemplates?.find(
          (el: any) => el.id === imageContext.contentId
        );
        if (!location) {
          return {
            type: "error",
            message: `Location with ID ${imageContext.contentId} not found`,
          };
        }

        generated = await GenerateLocationImage({
          locationTemplate: location,
          cameraAngle: imageContext.cameraAngle,
        });
        break;

      case "panel":
        const panel = extractPanelContext(imageContext.contentId);
        if (!panel) {
          return {
            type: "error",
            message: `Panel with ID ${imageContext.contentId} not found`,
          };
        }

        // Get related characters
        const charactersInPanel = charactersContext?.filter((ch: any) => {
          return panel.panelContext.characterPoses?.some(
            (pose: any) =>
              pose.characterName === ch.name || pose.characterId === ch.id
          );
        });

        // Run panel generation
        generated = await GeneratePanelImagePromptOnly({
          panel: panel,
          scene: await getSceneForContext(panel.sceneId),
          characters: charactersInPanel || [],
          availableTemplates: {
            outfits: project.outfitTemplates || [],
            locations: project.locationTemplates || [],
            poses: [],
            effects: [],
          },
        });
        break;

      default:
        return {
          type: "error",
          message: `Unsupported content type: ${imageContext.contentType}`,
        };
    }

    return {
      type: "imageGenerated",
      message: `${imageContext.contentType} image successfully generated`,
      data: generated,
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Error generating ${imageContext.contentType} image: ${error.message}`,
    };
  }
};

/**
 * Main flow to process manga requests
 *
 * Supports:
 * 1. Direct responses (chat/questions)
 * 2. Content generation for existing projects (characters, chapters, scenes, panels, dialogues)
 * 3. Content updates for existing projects
 * 4. Image generation for existing content
 */
export const ProcessMangaRequestFlow = ai.defineFlow(
  {
    name: "Simplified Process Manga Request",
    inputSchema: z.object({
      userInput: z.string(),
      selectedNode: z.any().nullable().optional(),
      projectId: z.string().optional(),
      prevChats: z.array(z.any()),
    }),
    outputSchema: z.object({
      type: z.string(),
      message: z.string().optional(),
      data: z.any().optional(),
    }),
  },
  async ({ userInput, selectedNode, projectId, prevChats }) => {
    try {
      // Get project context if projectId is provided
      let project: MangaProject | null = null;

      if (projectId) {
        project = await getProjectWithRelations(projectId);
      }

      // Plan the content operation using simplified ContentPlannerPrompt
      const planningResponse = await ContentPlannerPrompt({
        userInput,
        projectContext: project
          ? {
              id: project.id,
              title: project.title,
              concept: project.concept,
              plotStructure: project.plotStructure,
              chapters: project.chapters?.map((chapter) => ({
                id: chapter.id,
                chapterNumber: chapter.chapterNumber,
                title: chapter.title,
                scenes: chapter.scenes?.map((scene) => ({
                  id: scene.id,
                  order: scene.order,
                  title: scene.title,
                  panels: scene.panels?.map((panel) => ({
                    id: panel.id,
                    order: panel.order,
                  })),
                })),
              })),
              characters: project.characters?.map((character) => ({
                id: character.id,
                name: character.name,
                role: character.role,
              })),
            }
          : null,
        selectedNode,
        prevChats,
      });

      const plannerResult = planningResponse.output!;

      // Execute the appropriate handler based on action type
      switch (plannerResult.action) {
        case "directResponse":
          return handleDirectResponse(plannerResult);

        case "generateContent":
          if (!project) {
            return {
              type: "error",
              message: "Project context required for content generation",
            };
          }
          return await handleGenerateContent(plannerResult, project, userInput);

        case "updateContent":
          if (!project) {
            return {
              type: "error",
              message: "Project context required for content updates",
            };
          }
          return await handleUpdateContent(plannerResult, project, userInput);

        case "generateImage":
          if (!project) {
            return {
              type: "error",
              message: "Project context required for image generation",
            };
          }
          return await handleGenerateImage(plannerResult, project);

        default:
          return {
            type: "error",
            message: `Unknown action type: ${plannerResult.action}`,
          };
      }
    } catch (error: any) {
      return {
        type: "error",
        message: `An unexpected error occurred: ${error.message}`,
      };
    }
  }
);

async function imageUrlToBase64WithMime(url: string) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        Referer: "https://i.ibb.co/",
      },
      timeout: 10000,
    });

    const mimeType = response.headers["content-type"];
    const base64 = Buffer.from(response.data, "binary").toString("base64");

    return {
      mimeType,
      base64,
    };
  } catch (error) {
    console.error("Failed to fetch image from URL:", url, error);
    throw new Error(
      `Failed to fetch image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
