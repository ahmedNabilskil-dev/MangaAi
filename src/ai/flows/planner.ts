import { ai } from "@/ai/ai-instance";
import {
  ChapterGenerationPrompt,
  CharacterGenerationPrompt,
  PanelsDialogsGenerationPrompt,
  SceneGenerationPrompt,
} from "@/ai/flows/generation-flows";
import {
  GenerateCharacterImage,
  GeneratePanelImage,
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
    contentType: "character" | "chapter" | "scene" | "panel";
    contentId: string;
    description: string;
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
    | "error"
    | "notImplemented";
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

      // Action-specific context objects
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
            .enum(["character", "chapter", "scene", "panel"])
            .describe("Type of content for the image"),
          contentId: z.string().describe("ID of related content"),
          description: z
            .string()
            .describe("Brief description of the image to generate"),
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
Use when: The user wants to create an image.
Required context object: generateImageContext
- contentType: The type of content for the image ("character", "chapter", "scene", "panel")
- contentId: The ID of the relevant content
- description: Brief description of the image request

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

# EXAMPLES

## Example 1: Update with selected node
User input: "Update this character's backstory"
Selected node: {type: "character", id: "char_123"}
Correct output:
{
  "action": "updateContent",
  "updateContentContext": {
    "contentType": "character",
    "contentId": "char_123",
    "description": "Updating the backstory for this character."
  }
}

## Example 2: Update with explicit reference
User input: "Revise chapter 2 to make it more dramatic"
Correct output:
{
  "action": "updateContent",
  "updateContentContext": {
    "contentType": "chapter",
    "contentId": "[ID of chapter 2]",  // You MUST extract this ID from context
    "description": "Updating chapter 2 to increase dramatic tension."
  }
}

## Example 3: Generate content with parent
User input: "Create scenes for chapter 3"
Correct output:
{
  "action": "generateContent",
  "generateContentContext": {
    "parentType": "chapter",
    "parentId": "[ID of chapter 3]",  // You MUST extract this ID from context
    "contentType": "scene",
    "description": "Generating new scenes for chapter 3."
  }
}

## Example 4: Direct response
User input: "What makes a good manga character?"
Correct output:
{
  "action": "directResponse",
  "directResponseContext": {
    "content": "A good manga character typically has depth, clear motivations, and distinctive visual traits. They should feel authentic and relatable while also being memorable. Strong characters often have internal conflicts and growth opportunities throughout the story..."
  }
}

## Example 5: Unclear ID situation
User input: "Update the forest scene"
(No selectedNode, no context about forest scene ID)
Correct output:
{
  "action": "directResponse",
  "directResponseContext": {
    "content": "I'd be happy to update the forest scene. Could you please select that scene first or provide its ID so I can make the changes correctly?"
  }
}

## Example 6: Create new character for project
User input: "Create a new villain character for my manga"
Selected node: {type: "project", id: "proj_123"}
Correct output:
{
  "action": "generateContent",
  "generateContentContext": {
    "parentType": "project",
    "parentId": "proj_123",
    "contentType": "character",
    "description": "Generating a new villain character for your manga project."
  }
}

## Example 7: Create new chapter in project
User input: "Create a new chapter about a space battle"
Selected node: {type: "project", id: "proj_456"}
Correct output:
{
  "action": "generateContent",
  "generateContentContext": {
    "parentType": "project",
    "parentId": "proj_456",
    "contentType": "chapter",
    "description": "Generating a new chapter about a space battle for your manga project."
  }
}

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
 */
const contentTypeToGenerationPrompt = {
  character: "CharacterGenerationPrompt",
  chapter: "ChapterGenerationPrompt",
  scene: "SceneGenerationPrompt",
  panel: "PanelsDialogsGenerationPrompt",
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
            visualSequence: scene.visualSequence,
            sceneContext: scene.sceneContext,
            panels: scene.panels?.map((panel) => ({
              id: panel.id,
              order: panel.order,
              panelContext: panel.panelContext,
              characterIds: panel.characterIds,
              consistencyElements: panel.consistencyElements,
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
            characterIds: panel.characterIds,
            consistencyElements: panel.consistencyElements,
            aiPrompt: panel.aiPrompt,
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
          visualSequence: sc.visualSequence,
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
            visualSequence: scene.visualSequence,
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
              characterIds: panel.characterIds,
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
  PanelsDialogsGenerationPrompt,
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

  // Map content type to appropriate generation prompt
  const promptName = contentTypeToGenerationPrompt[contentType];

  if (!promptName || !GenerationPrompt[promptName]) {
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

    // Prepare parameters based on prompt type with targeted context
    let params: any = {
      userInput,
      projectContext,
      contentType,
      parentId,
      parentType,
      description: result.generateContentContext.description,
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
        params.existingCharacters = charactersContext;
        params.chapterContext = extractChapterContext(parentId);
        break;

      case "PanelsDialogsGenerationPrompt":
        params.characters = charactersContext;
        params.sceneContext = extractSceneContext(parentId);
        break;
    }

    // Execute the generation prompt
    const generatedContent = await GenerationPrompt[promptName](params);

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

  const imageContext = result.generateImageContext!;

  const {
    charactersContext,
    extractPanelContext,
    projectContext,
    extractSceneContext,
  } = extractFullContexts(project);

  let res;
  switch (imageContext.contentType) {
    case "character":
      const characterContext = charactersContext?.find(
        (el) => el.id == imageContext.contentId
      );
      res = await GenerateCharacterImage({
        character: characterContext,
      });
      break;

    case "panel":
      const panelContext = extractPanelContext(imageContext.contentId);
      const charactersInPanel = charactersContext?.filter((ch) =>
        panelContext?.characterNames?.includes(ch.name)
      );

      const charactersInPanelWithImage = await Promise.all(
        charactersInPanel?.map(async (ch) => {
          const image = await imageUrlToBase64WithMime(ch.imgUrl!);
          return {
            ...ch,
            imageData: {
              data: image.base64,
              mimeType: image.mimeType,
            },
          };
        }) ?? []
      );

      (projectContext as any).characters = charactersInPanelWithImage;

      const scene = await getSceneForContext(panelContext?.sceneId!);

      res = await GeneratePanelImage({
        panel: panelContext,
        projectContext: projectContext,
        scene,
      });
      break;
  }

  return {
    type: "imageGenerated",
    message: res || "generate image successfully",
    data: {
      contentType: result.generateImageContext.contentType,
      contentId: result.generateImageContext.contentId,
      description: result.generateImageContext.description,
    },
  };
};

/**
 * Creates a slimmed-down version of the project for context
 */
export function extractSlimProject(fullProject: MangaProject) {
  if (!fullProject) return null;

  const slimProject: any = {
    id: fullProject.id,
    title: fullProject.title,
    concept: fullProject.concept,
    plotStructure: fullProject.plotStructure,
  };

  // Extract slim chapters
  if (fullProject.chapters) {
    slimProject.chapters = fullProject.chapters.map((chapter) => ({
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
    }));
  }

  // Extract slim characters
  if (fullProject.characters) {
    slimProject.characters = fullProject.characters.map((character) => ({
      id: character.id,
      name: character.name,
      role: character.role,
    }));
  }

  return slimProject;
}

/**
 * Main flow to process manga requests
 */
export const ProcessMangaRequestFlow = ai.defineFlow(
  {
    name: "Process Manga Request",
    inputSchema: z.object({
      userInput: z.string(),
      selectedNode: z.any().nullable().optional(),
      projectId: z.string(),
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
      // Get the project with all its relations
      const project = await getProjectWithRelations(projectId);
      if (!project) {
        return {
          type: "error",
          message: `Project with ID ${projectId} not found`,
        };
      }

      // Get slim project for context planning (to reduce token usage)
      const slimProject = extractSlimProject(project);

      // Plan the content operation using ContentPlannerPrompt
      const planningResponse = await ContentPlannerPrompt({
        userInput,
        projectContext: slimProject,
        selectedNode,
        prevChats,
      });

      // Parse the result
      const plannerResult = planningResponse.output!;

      // Execute the appropriate handler based on action type
      switch (plannerResult.action) {
        case "directResponse":
          return handleDirectResponse(plannerResult);

        case "generateContent":
          return await handleGenerateContent(plannerResult, project, userInput);

        case "updateContent":
          return await handleUpdateContent(plannerResult, project, userInput);

        case "generateImage":
          return handleGenerateImage(plannerResult, project);

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
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      Referer: "https://i.ibb.co/",
    },
  });

  const mimeType = response.headers["content-type"];
  const base64 = Buffer.from(response.data, "binary").toString("base64");

  return {
    mimeType,
    base64, // No "data:mime;base64," prefix
  };
}
