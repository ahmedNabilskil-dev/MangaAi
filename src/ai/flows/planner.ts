import { ai } from "@/ai/ai-instance";
import {
  ChapterGenerationPrompt,
  CharacterGenerationPrompt,
  EffectTemplateGenerationPrompt,
  LocationTemplateGenerationPrompt,
  OutfitTemplateGenerationPrompt,
  PanelGenerationPrompt,
  PoseTemplateGenerationPrompt,
  SceneGenerationPrompt,
} from "@/ai/flows/generation-flows";
import {
  GenerateCharacterImage,
  GenerateCharacterWithTemplates,
  GenerateLocationImage,
  GenerateLocationWithEffects,
  GeneratePanelImagePromptOnly,
  GeneratePanelImageWithReferences,
} from "@/ai/flows/image-genration";
import {
  ChapterUpdatePrompt,
  CharacterUpdatePrompt,
  DialogueUpdatePrompt,
  EffectTemplateUpdatePrompt,
  LocationTemplateUpdatePrompt,
  OutfitTemplateUpdatePrompt,
  PanelUpdatePrompt,
  PoseTemplateUpdatePrompt,
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
    | "generateImage"
    | "generateTemplate"
    | "updateTemplate";

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

  generateTemplateContext?: {
    templateType: "outfit" | "location" | "pose" | "effect";
    parentType: "project";
    parentId: string;
    description: string;
  };

  updateTemplateContext?: {
    templateType: "outfit" | "location" | "pose" | "effect";
    templateId: string;
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
    | "templateGenerated"
    | "templateUpdated"
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
          "generateTemplate",
          "updateTemplate",
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

      generateTemplateContext: z
        .object({
          templateType: z
            .enum(["outfit", "location", "pose", "effect"])
            .describe("Type of template to generate"),
          parentType: z
            .enum(["project"])
            .describe(
              "Type of parent container (templates belong to projects)"
            ),
          parentId: z.string().describe("ID of parent project"),
          description: z
            .string()
            .describe("Brief description of the template to generate"),
        })
        .optional()
        .describe("Context for template generation action"),

      updateTemplateContext: z
        .object({
          templateType: z
            .enum(["outfit", "location", "pose", "effect"])
            .describe("Type of template to update"),
          templateId: z.string().describe("ID of template to update"),
          description: z
            .string()
            .describe("Brief description of what will be updated"),
        })
        .optional()
        .describe("Context for template update action"),
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
Use when: The user wants to create an image using the 5-stage image generation pipeline.
Required context object: generateImageContext
- contentType: The type of image to generate ("character", "characterWithTemplate", "location", "locationWithEffects", "panel")
- contentId: The ID of the relevant content
- description: Brief description of the image request
- imageMode: (Optional) Specific generation mode
- templateIds: (Optional) Specific template IDs to use
- panelMode: (Optional) For panels: "promptOnly" or "withReferences"
- cameraAngle: (Optional) For locations: specific camera angle

### Image Generation Stages:
1. **"character"** - Stage 1: Generate character portrait for reference
2. **"characterWithTemplate"** - Stage 2: Generate character with outfit/pose templates
3. **"location"** - Stage 3: Generate location reference from template
4. **"locationWithEffects"** - Stage 4: Generate location with atmospheric effects
5. **"panel"** - Stage 5: Generate complete panel (two modes available)

### Panel Generation Modes:
- **panelMode: "promptOnly"** - Fast generation using only text prompts
- **panelMode: "withReferences"** - High-quality generation using character and location references

## 5. GENERATE TEMPLATE (action: "generateTemplate")
Use when: The user wants to create NEW template content (outfit, location, pose, effect templates).
Required context object: generateTemplateContext
- templateType: The type of template being generated ("outfit", "location", "pose", "effect")
- parentType: Always "project" (templates belong to projects)
- parentId: The ID of the project where this template will be created
- description: Brief description of the template to generate

## 6. UPDATE TEMPLATE (action: "updateTemplate")
Use when: The user wants to modify EXISTING template content.
Required context object: updateTemplateContext
- templateType: The type of template being updated ("outfit", "location", "pose", "effect")
- templateId: The ID of the specific template being updated
- description: Brief description of what will be updated

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

# ROUTING GUIDE FOR TEMPLATE GENERATION

For "generateTemplate" action, use this mapping:

1. Creating an OUTFIT TEMPLATE:
   - templateType: "outfit"
   - parentType: "project" (templates belong to the project)
   - parentId: [project ID]

2. Creating a LOCATION TEMPLATE:
   - templateType: "location"
   - parentType: "project" (templates belong to the project)
   - parentId: [project ID]

3. Creating a POSE TEMPLATE:
   - templateType: "pose"
   - parentType: "project" (templates belong to the project)
   - parentId: [project ID]

4. Creating an EFFECT TEMPLATE:
   - templateType: "effect"
   - parentType: "project" (templates belong to the project)
   - parentId: [project ID]


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

## Example 8: Generate outfit template
User input: "Create a school uniform template for my characters"
Selected node: {type: "project", id: "proj_789"}
Correct output:
{
  "action": "generateTemplate",
  "generateTemplateContext": {
    "templateType": "outfit",
    "parentType": "project",
    "parentId": "proj_789",
    "description": "Generating a school uniform outfit template for character use."
  }
}

## Example 9: Update location template
User input: "Update the classroom template to add more detail"
Selected node: {type: "locationTemplate", id: "loc_template_123"}
Correct output:
{
  "action": "updateTemplate",
  "updateTemplateContext": {
    "templateType": "location",
    "templateId": "loc_template_123",
    "description": "Adding more detail to the classroom location template."
  }
}

## Example 10: Generate pose template
User input: "Create action poses for fight scenes"
Selected node: {type: "project", id: "proj_456"}
Correct output:
{
  "action": "generateTemplate",
  "generateTemplateContext": {
    "templateType": "pose",
    "parentType": "project",
    "parentId": "proj_456",
    "description": "Generating action pose templates for fight scenes."
  }
}

## Example 11: Generate character portrait (Stage 1)
User input: "Create a portrait for this character"
Selected node: {type: "character", id: "char_123"}
Correct output:
{
  "action": "generateImage",
  "generateImageContext": {
    "contentType": "character",
    "contentId": "char_123",
    "description": "Generating character portrait for reference.",
    "imageMode": "portrait"
  }
}

## Example 12: Generate character with outfit (Stage 2)
User input: "Generate this character wearing the school uniform"
Selected node: {type: "character", id: "char_456"}
Correct output:
{
  "action": "generateImage",
  "generateImageContext": {
    "contentType": "characterWithTemplate",
    "contentId": "char_456",
    "description": "Generating character with school uniform template.",
    "imageMode": "withTemplate",
    "templateIds": {
      "outfitId": "outfit_school_uniform_01"
    }
  }
}

## Example 13: Generate location reference (Stage 3)
User input: "Create an image of the classroom from the main angle"
Selected node: {type: "locationTemplate", id: "loc_classroom_01"}
Correct output:
{
  "action": "generateImage",
  "generateImageContext": {
    "contentType": "location",
    "contentId": "loc_classroom_01",
    "description": "Generating classroom location reference image.",
    "imageMode": "location",
    "cameraAngle": "main_view"
  }
}

## Example 14: Generate panel with references (Stage 5)
User input: "Generate this panel using character and location references"
Selected node: {type: "panel", id: "panel_789"}
Correct output:
{
  "action": "generateImage",
  "generateImageContext": {
    "contentType": "panel",
    "contentId": "panel_789",
    "description": "Generating panel with character and location references.",
    "panelMode": "withReferences"
  }
}

## Example 15: Generate panel prompt-only (Stage 5)
User input: "Quick generate this panel"
Selected node: {type: "panel", id: "panel_101"}
Correct output:
{
  "action": "generateImage",
  "generateImageContext": {
    "contentType": "panel",
    "contentId": "panel_101",
    "description": "Generating panel using prompt-only mode for speed.",
    "panelMode": "promptOnly"
  }
}

# VALIDATION RULES - ALWAYS APPLY THESE

1. EVERY response MUST include the "action" field
2. You MUST include EXACTLY ONE context object that matches the selected action:
   - For "directResponse" → include only directResponseContext
   - For "generateContent" → include only generateContentContext
   - For "updateContent" → include only updateContentContext
   - For "generateImage" → include only generateImageContext
   - For "generateTemplate" → include only generateTemplateContext
   - For "updateTemplate" → include only updateTemplateContext
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
  panel: "PanelGenerationPrompt",
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

      case "PanelGenerationPrompt":
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
 * Handles image generation requests with support for all 5 stages
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

  try {
    switch (imageContext.contentType) {
      // STAGE 1: Character Portrait Generation
      case "character":
        const characterContext = charactersContext?.find(
          (el) => el.id === imageContext.contentId
        );

        if (!characterContext) {
          return {
            type: "error",
            message: `Character with ID ${imageContext.contentId} not found`,
          };
        }

        res = await GenerateCharacterImage({
          character: characterContext,
        });
        break;

      // STAGE 2: Character with Template Generation
      case "characterWithTemplate":
        const characterForTemplate = charactersContext?.find(
          (el) => el.id === imageContext.contentId
        );

        if (!characterForTemplate) {
          return {
            type: "error",
            message: `Character with ID ${imageContext.contentId} not found`,
          };
        }

        // Get outfit and pose templates from project with validation
        const outfitTemplate = imageContext.templateIds?.outfitId
          ? project.outfitTemplates?.find(
              (t) => t.id === imageContext.templateIds?.outfitId
            )
          : undefined;

        const poseTemplate = imageContext.templateIds?.poseId
          ? project.poseTemplates?.find(
              (t) => t.id === imageContext.templateIds?.poseId
            )
          : undefined;

        // Validate template existence if IDs were provided
        if (imageContext.templateIds?.outfitId && !outfitTemplate) {
          return {
            type: "error",
            message: `Outfit template with ID ${imageContext.templateIds.outfitId} not found`,
          };
        }

        if (imageContext.templateIds?.poseId && !poseTemplate) {
          return {
            type: "error",
            message: `Pose template with ID ${imageContext.templateIds.poseId} not found`,
          };
        }

        res = await GenerateCharacterWithTemplates({
          character: characterForTemplate,
          outfitTemplate,
          poseTemplate,
          context: {
            mood: imageContext.description?.includes("happy")
              ? "happy"
              : imageContext.description?.includes("sad")
              ? "sad"
              : imageContext.description?.includes("angry")
              ? "angry"
              : "neutral",
            lighting: imageContext.description?.includes("dark")
              ? "dramatic lighting"
              : imageContext.description?.includes("bright")
              ? "bright lighting"
              : "soft studio lighting",
            location: imageContext.description?.includes("outdoor")
              ? "outdoor setting"
              : imageContext.description?.includes("indoor")
              ? "indoor setting"
              : undefined,
          },
        });
        break;

      // STAGE 3: Location Generation
      case "location":
        const locationTemplate = project.locationTemplates?.find(
          (t) => t.id === imageContext.contentId
        );

        if (!locationTemplate) {
          return {
            type: "error",
            message: `Location template with ID ${imageContext.contentId} not found`,
          };
        }

        // Find the specific camera angle or use default
        let cameraAngleData = imageContext.cameraAngle;
        if (imageContext.cameraAngle && locationTemplate.cameraAngles) {
          const foundAngle = locationTemplate.cameraAngles.find(
            (angle: any) => angle.name === imageContext.cameraAngle
          );
          if (foundAngle) {
            cameraAngleData = foundAngle;
          }
        }

        res = await GenerateLocationImage({
          locationTemplate,
          cameraAngle: cameraAngleData,
        });
        break;

      // STAGE 4: Location with Effects Generation
      case "locationWithEffects":
        const locationForEffects = project.locationTemplates?.find(
          (t) => t.id === imageContext.contentId
        );

        if (!locationForEffects) {
          return {
            type: "error",
            message: `Location template with ID ${imageContext.contentId} not found`,
          };
        }

        // Get effect templates with validation
        const effectTemplates =
          imageContext.templateIds?.effectIds
            ?.map((effectId) => {
              const template = project.effectTemplates?.find(
                (t) => t.id === effectId
              );
              if (!template) {
                console.warn(`Effect template with ID ${effectId} not found`);
              }
              return template;
            })
            .filter(Boolean) || [];

        // Validate that all requested effect templates were found
        const requestedEffectIds = imageContext.templateIds?.effectIds || [];
        const foundEffectIds = effectTemplates.map((t: any) => t.id);
        const missingEffectIds = requestedEffectIds.filter(
          (id) => !foundEffectIds.includes(id)
        );

        if (missingEffectIds.length > 0) {
          return {
            type: "error",
            message: `Effect templates not found: ${missingEffectIds.join(
              ", "
            )}`,
          };
        }

        res = await GenerateLocationWithEffects({
          locationTemplate: locationForEffects,
          effectTemplates,
          cameraAngle: imageContext.cameraAngle,
          atmosphere: {
            timeOfDay: "day",
            weather: "clear",
            mood: "neutral",
            lighting: "natural",
          },
        });
        break;

      // STAGE 5: Panel Generation (Two Modes)
      case "panel":
        const panelContext = extractPanelContext(imageContext.contentId);

        if (!panelContext) {
          return {
            type: "error",
            message: `Panel with ID ${imageContext.contentId} not found`,
          };
        }

        // Get characters in panel with improved matching
        const charactersInPanel =
          charactersContext?.filter((ch) => {
            // Check if character is mentioned in panel context
            const isInPanel = panelContext?.panelContext.characterPoses?.some(
              (pose) =>
                // Try multiple matching strategies
                pose.characterName.toLowerCase() === ch.name.toLowerCase() ||
                pose.characterName
                  .toLowerCase()
                  .includes(ch.name.toLowerCase()) ||
                ch.name
                  .toLowerCase()
                  .includes(pose.characterName.toLowerCase()) ||
                // Check by character ID if available
                pose.characterId === ch.id
            );

            if (isInPanel) {
              console.log(
                `Character ${ch.name} matched for panel ${imageContext.contentId}`
              );
            }

            return isInPanel;
          }) || [];

        console.log(
          `Found ${charactersInPanel.length} characters for panel generation`
        );

        if (charactersInPanel.length === 0) {
          console.warn(
            `No characters found for panel ${imageContext.contentId}. Panel context:`,
            panelContext?.panelContext.characterPoses
          );
        }

        // Get scene context
        const scene = await getSceneForContext(panelContext?.sceneId!);

        // Prepare available templates
        const availableTemplates = {
          outfits: project.outfitTemplates || [],
          locations: project.locationTemplates || [],
          poses: project.poseTemplates || [],
          effects: project.effectTemplates || [],
        };

        // Determine panel generation mode
        const panelMode = imageContext.panelMode || "promptOnly";

        if (panelMode === "promptOnly") {
          // Mode 1: Prompt-only generation
          res = await GeneratePanelImagePromptOnly({
            panel: panelContext,
            scene,
            characters: charactersInPanel,
            availableTemplates,
          });
        } else {
          // Mode 2: With reference images

          // Prepare characters with image data
          const charactersInPanelWithImage = await Promise.all(
            charactersInPanel.map(async (ch) => {
              if (ch.imgUrl) {
                try {
                  const image = await imageUrlToBase64WithMime(ch.imgUrl);
                  return {
                    ...ch,
                    imageData: {
                      data: image.base64,
                      mimeType: image.mimeType,
                    },
                  };
                } catch (error) {
                  console.warn(
                    `Failed to load image for character ${ch.name}:`,
                    error
                  );
                  return ch;
                }
              }
              return ch;
            })
          );

          // Get location reference if available
          const locationReference = panelContext.panelContext.locationId
            ? project.locationTemplates?.find(
                (t) => t.id === panelContext.panelContext.locationId
              )
            : undefined;

          res = await GeneratePanelImageWithReferences({
            panel: panelContext,
            scene,
            characters: charactersInPanelWithImage,
            locationReference,
            availableTemplates,
          });
        }
        break;

      default:
        return {
          type: "error",
          message: `Unsupported content type for image generation: ${imageContext.contentType}`,
        };
    }

    return {
      type: "imageGenerated",
      message: res?.text || "Image generated successfully",
      data: {
        contentType: imageContext.contentType,
        contentId: imageContext.contentId,
        description: imageContext.description,
        imageMode: imageContext.imageMode,
        panelMode: imageContext.panelMode,
        result: res,
        metadata: {
          templateIds: imageContext.templateIds,
          cameraAngle: imageContext.cameraAngle,
          generationType: imageContext.contentType,
        },
      },
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Error generating image: ${error.message}`,
    };
  }
};

/**
 * Handles template generation requests
 */
const handleGenerateTemplate = async (
  result: ContentPlannerResult,
  project: MangaProject
): Promise<ProcessingResult> => {
  if (!result.generateTemplateContext) {
    return {
      type: "error",
      message: "Missing generateTemplateContext in result",
    };
  }

  const templateContext = result.generateTemplateContext!;
  const { projectContext } = extractFullContexts(project);

  try {
    let generatedTemplate;
    const userInput = `Create a ${templateContext.templateType} template. ${templateContext.description}`;

    switch (templateContext.templateType) {
      case "outfit":
        generatedTemplate = await OutfitTemplateGenerationPrompt({
          userInput,
          projectContext,
          existingCharacters: project.characters || [],
          existingOutfits: project.outfitTemplates || [],
          locationTemplates: project.locationTemplates || [],
        });
        break;

      case "location":
        generatedTemplate = await LocationTemplateGenerationPrompt({
          userInput,
          projectContext,
          existingLocations: project.locationTemplates || [],
        });
        break;

      case "pose":
        generatedTemplate = await PoseTemplateGenerationPrompt({
          userInput,
          projectContext,
          characterTypes:
            (project.characters
              ?.map((c) => c.role)
              .filter(Boolean) as string[]) || [],
          storyGenres: project.genre ? [project.genre] : [],
        });
        break;

      case "effect":
        generatedTemplate = await EffectTemplateGenerationPrompt({
          userInput,
          projectContext,
          storyGenres: project.genre ? [project.genre] : [],
          sceneTypes:
            project.chapters?.flatMap(
              (ch) =>
                ch.scenes?.map((sc) => sc.sceneContext?.setting || "general") ||
                []
            ) || [],
        });
        break;

      default:
        return {
          type: "error",
          message: `Unsupported template type: ${templateContext.templateType}`,
        };
    }

    return {
      type: "templateGenerated",
      message: `${templateContext.templateType} template successfully generated`,
      data: {
        templateType: templateContext.templateType,
        parentId: templateContext.parentId,
        description: templateContext.description,
        output: generatedTemplate.output,
      },
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Failed to generate ${templateContext.templateType} template: ${error.message}`,
    };
  }
};

/**
 * Handles template update requests
 */
const handleUpdateTemplate = async (
  result: ContentPlannerResult,
  project: MangaProject
): Promise<ProcessingResult> => {
  if (!result.updateTemplateContext) {
    return {
      type: "error",
      message: "Missing updateTemplateContext in result",
    };
  }

  const templateContext = result.updateTemplateContext!;
  const { projectContext } = extractUpdateContexts(project);

  try {
    let updatedTemplate;
    const userInput = `Update the ${templateContext.templateType} template. ${templateContext.description}`;

    // Fetch the actual template data based on type
    let templateData: any = null;

    switch (templateContext.templateType) {
      case "outfit":
        templateData = project.outfitTemplates?.find(
          (t) => t.id === templateContext.templateId
        );
        if (!templateData) {
          return {
            type: "error",
            message: `Outfit template with ID ${templateContext.templateId} not found`,
          };
        }
        break;

      case "location":
        templateData = project.locationTemplates?.find(
          (t) => t.id === templateContext.templateId
        );
        if (!templateData) {
          return {
            type: "error",
            message: `Location template with ID ${templateContext.templateId} not found`,
          };
        }
        break;

      case "pose":
        templateData = project.poseTemplates?.find(
          (t) => t.id === templateContext.templateId
        );
        if (!templateData) {
          return {
            type: "error",
            message: `Pose template with ID ${templateContext.templateId} not found`,
          };
        }
        break;

      case "effect":
        templateData = project.effectTemplates?.find(
          (t) => t.id === templateContext.templateId
        );
        if (!templateData) {
          return {
            type: "error",
            message: `Effect template with ID ${templateContext.templateId} not found`,
          };
        }
        break;
    }

    switch (templateContext.templateType) {
      case "outfit":
        updatedTemplate = await OutfitTemplateUpdatePrompt({
          userInput,
          outfitTemplate: templateData,
          projectContext,
          characterReferences:
            project.characters?.map((c) => ({
              id: c.id,
              name: c.name,
              role: c.role,
            })) || [],
        });
        break;

      case "location":
        updatedTemplate = await LocationTemplateUpdatePrompt({
          userInput,
          locationTemplate: templateData,
          projectContext,
          sceneReferences:
            project.chapters?.flatMap(
              (ch) =>
                ch.scenes
                  ?.filter(
                    (sc) =>
                      sc.sceneContext?.locationId === templateContext.templateId
                  )
                  .map((sc) => ({
                    id: sc.id,
                    title: sc.title,
                    chapterTitle: ch.title,
                  })) || []
            ) || [],
        });
        break;

      case "pose":
        updatedTemplate = await PoseTemplateUpdatePrompt({
          userInput,
          poseTemplate: templateData,
          projectContext,
          characterReferences:
            project.characters?.map((c) => ({
              id: c.id,
              name: c.name,
              role: c.role,
            })) || [],
        });
        break;

      case "effect":
        updatedTemplate = await EffectTemplateUpdatePrompt({
          userInput,
          effectTemplate: templateData,
          projectContext,
          usageReferences:
            project.chapters?.flatMap(
              (ch) =>
                ch.scenes?.flatMap(
                  (sc) =>
                    sc.panels
                      ?.filter((p) =>
                        p.panelContext?.effects?.includes(
                          templateContext.templateId
                        )
                      )
                      .map((p) => ({
                        panelId: p.id,
                        sceneTitle: sc.title,
                        chapterTitle: ch.title,
                      })) || []
                ) || []
            ) || [],
        });
        break;

      default:
        return {
          type: "error",
          message: `Unsupported template type: ${templateContext.templateType}`,
        };
    }

    return {
      type: "templateUpdated",
      message: `${templateContext.templateType} template successfully updated`,
      data: {
        templateType: templateContext.templateType,
        templateId: templateContext.templateId,
        description: templateContext.description,
        output: updatedTemplate.output,
      },
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Failed to update ${templateContext.templateType} template: ${error.message}`,
    };
  }
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
 *
 * ENHANCED IMAGE GENERATION FEATURES:
 * - Stage 1: Character Portrait Generation with GenerateCharacterImage
 * - Stage 2: Character with Templates using GenerateCharacterWithTemplates
 * - Stage 3: Location Generation with camera angle support
 * - Stage 4: Location with Effects including multiple effect templates
 * - Stage 5: Panel Generation with two modes (promptOnly/withReferences)
 *
 * IMPROVEMENTS MADE:
 * - Enhanced template validation and error handling
 * - Better character matching for panel generation
 * - Context-aware character generation (mood, lighting, location)
 * - Improved template fetching with actual project data
 * - Enhanced template update operations with usage tracking
 * - Better error handling for missing templates/content
 * - Added metadata in image generation responses
 * - Improved image URL to base64 conversion with timeout
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

        case "generateTemplate":
          return await handleGenerateTemplate(plannerResult, project);

        case "updateTemplate":
          return await handleUpdateTemplate(plannerResult, project);

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
      timeout: 10000, // 10 second timeout
    });

    const mimeType = response.headers["content-type"];
    const base64 = Buffer.from(response.data, "binary").toString("base64");

    return {
      mimeType,
      base64, // No "data:mime;base64," prefix
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

/**
 * Helper function to get available templates for a project
 */
function getAvailableTemplatesSummary(project: MangaProject) {
  return {
    outfits: project.outfitTemplates?.length || 0,
    locations: project.locationTemplates?.length || 0,
    poses: project.poseTemplates?.length || 0,
    effects: project.effectTemplates?.length || 0,
    outfitList:
      project.outfitTemplates?.map((t) => ({ id: t.id, name: t.name })) || [],
    locationList:
      project.locationTemplates?.map((t) => ({ id: t.id, name: t.name })) || [],
    poseList:
      project.poseTemplates?.map((t) => ({ id: t.id, name: t.name })) || [],
    effectList:
      project.effectTemplates?.map((t) => ({ id: t.id, name: t.name })) || [],
  };
}
