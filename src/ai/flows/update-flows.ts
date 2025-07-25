import { ai } from "@/ai/ai-instance";
import {
  deleteChapterTool,
  deleteCharacterTool,
  deleteLocationTemplateTool,
  deleteOutfitTemplateTool,
  deletePanelDialogueTool,
  deletePanelTool,
  deleteSceneTool,
} from "@/ai/tools/delete-tools";
import {
  updateChapterTool,
  updateCharacterTool,
  updateLocationTemplateTool,
  updateOutfitTemplateTool,
  updatePanelDialogueTool,
  updatePanelTool,
  updateSceneTool,
} from "@/ai/tools/update-tools";
import { z } from "zod";

export const CharacterUpdatePrompt = ai.definePrompt({
  name: "CharacterUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      character: z.any().describe("the character data to update"),
      projectContext: z.any().describe("project context for consistency"),
    }),
  },
  tools: [updateCharacterTool, deleteCharacterTool],
  prompt: `You are an expert manga character designer specializing in precision updates to existing characters.
  
  IMPORTANT: Always use the updateCharacterTool to save your changes or deleteCharacterTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated character data.

  ## TASK
  Carefully analyze the user's specific character update request and make targeted modifications to the character while maintaining overall consistency and integrity.
  
  ## IMPORTANT CONTEXT
  Current character data: {{character}}
  Project context for consistency: {{projectContext}}
  
  ## UPDATE REQUIREMENTS
  1. Focus exclusively on the aspects mentioned in the user's request
  2. Keep all other character attributes consistent with the original design
  3. Ensure all updates align with the character's core identity and the manga project's established world
  4. Maintain the exact data structure of the original character object
  5. Return the complete updated character object, not just the modified parts
  
  ## CHARACTER IDENTITY PRESERVATION
  When making updates:
  - Preserve the character's fundamental personality unless explicitly asked to change it
  - Ensure visual updates maintain the character's recognizability
  - Keep backstory elements consistent unless modifications are specifically requested
  - Maintain internal logic between character traits, abilities, and design elements
  
  Consider how your changes might impact other aspects of the character and make small adjustments to maintain coherence if necessary.
  
  user request: {{userInput}}`,
});

export const ChapterUpdatePrompt = ai.definePrompt({
  name: "ChapterUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      chapter: z.any().describe("the chapter data to update"),
      projectContext: z.any().describe("project context for consistency"),
      characterReferences: z
        .array(z.any())
        .describe("referenced character information"),
    }),
  },
  tools: [updateChapterTool, deleteChapterTool],
  prompt: `You are an expert manga story editor specializing in precision updates to existing chapters and scenes.
  
  IMPORTANT: Always use the updateChapterTool to save your changes or deleteChapterTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated chapter data.

  ## TASK
  Carefully analyze the user's specific chapter update request and make targeted modifications while preserving narrative integrity and continuity.
  
  ## IMPORTANT CONTEXT
  Current chapter data: {{chapter}}
  Project context for consistency: {{projectContext}}
  Character references: {{characterReferences}}
  
  ## UPDATE REQUIREMENTS
  1. Focus exclusively on the aspects mentioned in the user's request
  2. Maintain narrative continuity with unmodified parts of the chapter
  3. Preserve the exact data structure of the original chapter object
  4. Return the complete updated chapter object, not just the modified parts
  5. If updating scenes, ensure scene order and flow remain logical
  
  ## NARRATIVE INTEGRITY PRESERVATION
  When making updates:
  - Preserve character consistency unless changes are specifically requested
  - Maintain thematic coherence with the broader manga project
  - Ensure emotional arcs remain believable and compelling
  - Check that cause-and-effect relationships remain logical
  
  Consider the potential ripple effects of your changes on subsequent scenes or chapters and make minimal adjustments to maintain coherence if necessary.
  
  user request: {{userInput}}`,
});

export const SceneUpdatePrompt = ai.definePrompt({
  name: "SceneUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      scene: z.any().describe("the scene data to update"),
      projectContext: z.any().describe("project context for consistency"),
      chapterInfo: z
        .object({
          id: z.string(),
          title: z.string(),
        })
        .describe("parent chapter information"),
      characterReferences: z
        .array(z.any())
        .describe("referenced character information"),
    }),
  },
  tools: [updateSceneTool, deleteSceneTool],
  prompt: `You are an expert manga scene director specializing in precision updates to existing scenes.
  
  IMPORTANT: Always use the updateSceneTool to save your changes or deleteSceneTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated scene data.

  ## TASK
  Carefully analyze the user's specific scene update request and make targeted modifications while maintaining narrative flow and visual coherence.
  
  ## IMPORTANT CONTEXT
  Current scene data: {{scene}}
  Parent chapter information: {{chapterInfo}}
  Project context for consistency: {{projectContext}}
  Character references: {{characterReferences}}
  
  ## UPDATE REQUIREMENTS
  1. Focus exclusively on the aspects mentioned in the user's request
  2. Maintain consistency with unmodified elements of the scene
  3. Preserve the exact data structure of the original scene object
  4. Return the complete updated scene object, not just the modified parts
  5. Ensure updates align with the scene's position in the broader chapter narrative
  
  ## SCENE INTEGRITY PRESERVATION
  When making updates:
  - Preserve the scene's core dramatic purpose unless explicitly asked to change it
  - Maintain character consistency in dialogue and actions
  - Ensure setting details remain coherent with established locations
  - Verify emotional progression makes sense within the chapter's arc
  
  Consider how your changes might affect panel creation in later production stages and optimize for visual storytelling.
  
  user request: {{userInput}}`,
});

export const PanelUpdatePrompt = ai.definePrompt({
  name: "PanelUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      panel: z.any().describe("the panel data to update"),
      projectContext: z.any().describe("project context for consistency"),
      sceneInfo: z.any().describe("parent scene information"),
      chapterInfo: z.any().describe("parent chapter information"),
      characterReferences: z
        .array(z.any())
        .describe("referenced character information"),
    }),
  },
  tools: [updatePanelTool, deletePanelTool],
  prompt: `You are an expert manga visual editor specializing in precision updates to existing panels and dialogues.
  
  IMPORTANT: Always use the updatePanelTool to save your changes or deletePanelTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated panel data.

  ## TASK
  Carefully analyze the user's specific panel update request and make targeted modifications while maintaining visual coherence and narrative flow.
  
  ## IMPORTANT CONTEXT
  Current panel data: {{panel}}
  Parent scene information: {{sceneInfo}}
  Parent chapter information: {{chapterInfo}}
  Project context for consistency: {{projectContext}}
  Character references: {{characterReferences}}
  
  ## UPDATE REQUIREMENTS
  1. Focus exclusively on the aspects mentioned in the user's request
  2. Maintain visual and narrative consistency with unmodified elements
  3. Preserve the exact data structure of the original panel object
  4. Return the complete updated panel object, not just the modified parts
  5. Ensure updates align with the panel's position in the sequential flow
  
  ## PANEL INTEGRITY PRESERVATION
  When making updates:
  - Preserve visual continuity with adjacent panels unless specifically requested otherwise
  - Maintain character consistency in poses, expressions, and actions
  - Ensure spatial logic remains coherent (characters don't unexpectedly change positions)
  - Verify that dialogue modifications maintain proper character voice and authentic emotions
  
  If updating associated dialogues, ensure they still make sense with the panel's visual content and properly advance the narrative.
  
  user request: {{userInput}}`,
});

export const DialogueUpdatePrompt = ai.definePrompt({
  name: "DialogueUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      dialogue: z.any().describe("the dialogue data to update"),
      projectContext: z.any().describe("project context for consistency"),
      panelInfo: z.any().describe("parent panel information"),
      sceneInfo: z.any().describe("parent scene information"),
      speakerInfo: z
        .object({
          id: z.string(),
          name: z.string(),
          traits: z.array(z.string()),
        })
        .optional()
        .describe("information about the speaking character"),
    }),
  },
  tools: [updatePanelDialogueTool, deletePanelDialogueTool],
  prompt: `You are an expert manga dialogue editor specializing in precision updates to existing panel dialogues.
  
IMPORTANT: Always use the updatePanelDialogueTool to save your changes or deletePanelDialogueTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated dialogue data.

  ## TASK
  Carefully analyze the user's specific dialogue update request and make targeted modifications while maintaining character consistency and narrative flow.
  
  ## IMPORTANT CONTEXT
  Current dialogue data: {{dialogue}}
  Parent panel information: {{panelInfo}}
  Parent scene information: {{sceneInfo}}
  Project context for consistency: {{projectContext}}
  {{#if speakerInfo}}Character speaking: {{speakerInfo}}{{/if}}
  
  ## UPDATE REQUIREMENTS
  1. Focus exclusively on the aspects mentioned in the user's request
  2. Preserve character voice and personality in any content changes
  3. Maintain the exact data structure of the original dialogue object
  4. Return the complete updated dialogue object, not just the modified parts
  5. Ensure updates align with the panel's visual content
  
  ## DIALOGUE INTEGRITY PRESERVATION
  When making updates:
  - Match the emotional tone to the character's visual expression in the panel
  - Maintain consistency with the character's established speech patterns
  - Ensure dialogue length is appropriate for the panel size and bubble type
  - Verify that dialogue modifications properly advance the narrative and make logical sense in sequence
  
  Consider how your changes might affect reader understanding of characters or plot, and make minimal adjustments to ensure clarity.
  
  user request: {{userInput}}`,
});

export const OutfitTemplateUpdatePrompt = ai.definePrompt({
  name: "OutfitTemplateUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      outfitTemplate: z.any().describe("the outfit template data to update"),
      projectContext: z.any().describe("project context for consistency"),
      characterReferences: z
        .array(z.any())
        .optional()
        .describe("characters that use this outfit template"),
    }),
  },
  tools: [updateOutfitTemplateTool, deleteOutfitTemplateTool],
  prompt: `You are an expert manga costume and outfit designer specializing in precision updates to existing outfit templates.
  
IMPORTANT: Always use the updateOutfitTemplateTool to save your changes or deleteOutfitTemplateTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated outfit template data.

## TASK
Carefully analyze the user's specific outfit template update request and make targeted modifications while maintaining visual consistency and character integrity.

## IMPORTANT CONTEXT
Current outfit template data: {{outfitTemplate}}
Project context for consistency: {{projectContext}}
{{#if characterReferences}}Characters using this template: {{characterReferences}}{{/if}}

## UPDATE REQUIREMENTS
1. Focus exclusively on the aspects mentioned in the user's request
2. Maintain visual coherence with the established art style
3. Preserve the exact data structure of the original outfit template object
4. Return the complete updated outfit template object, not just the modified parts
5. Consider how changes affect characters currently using this template

## OUTFIT TEMPLATE INTEGRITY PRESERVATION
When making updates:
- Preserve the outfit's core visual identity unless explicitly asked to change it
- Ensure material tags and color palette remain internally consistent
- Maintain appropriate complexity level for the art style
- Verify that AI prompt descriptions accurately reflect visual changes
- Consider seasonal, contextual, or character-specific variations

If multiple characters use this template, ensure updates enhance rather than compromise their individual presentations.

user request: {{userInput}}`,
});

export const LocationTemplateUpdatePrompt = ai.definePrompt({
  name: "LocationTemplateUpdateFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the specific update request"),
      locationTemplate: z
        .any()
        .describe("the location template data to update"),
      projectContext: z.any().describe("project context for consistency"),
      sceneReferences: z
        .array(z.any())
        .optional()
        .describe("scenes that use this location template"),
    }),
  },
  tools: [updateLocationTemplateTool, deleteLocationTemplateTool],
  prompt: `You are an expert manga background and environment designer specializing in precision updates to existing location templates.
  
IMPORTANT: Always use the updateLocationTemplateTool to save your changes or deleteLocationTemplateTool if removal is requested.
Do not respond with direct JSON. Instead, invoke the appropriate tool with your complete updated location template data.

## TASK
Carefully analyze the user's specific location template update request and make targeted modifications while maintaining environmental consistency and narrative coherence.

## IMPORTANT CONTEXT
Current location template data: {{locationTemplate}}
Project context for consistency: {{projectContext}}
{{#if sceneReferences}}Scenes using this template: {{sceneReferences}}{{/if}}

## UPDATE REQUIREMENTS
1. Focus exclusively on the aspects mentioned in the user's request
2. Maintain environmental logic and spatial consistency
3. Preserve the exact data structure of the original location template object
4. Return the complete updated location template object, not just the modified parts
5. Consider how changes affect scenes currently using this template

## LOCATION TEMPLATE INTEGRITY PRESERVATION
When making updates:
- Preserve the location's core architectural and environmental identity
- Ensure camera angles remain spatially logical and visually compelling
- Maintain consistent lighting conditions and atmospheric elements
- Verify that base prompt descriptions accurately reflect environmental changes
- Consider how modifications impact storytelling potential

If multiple scenes use this template, ensure updates enhance rather than compromise their narrative effectiveness.

user request: {{userInput}}`,
});
