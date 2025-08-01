import { panelSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createPanelHandler } from "./handlers/creation-tools";
import { deletePanelHandler } from "./handlers/delete-tools";
import {
  getPanelHandler,
  listPanelsForSceneHandler,
} from "./handlers/fetch-tools";
import { updatePanelHandler } from "./handlers/update-tools";

export const PanelTools: RegisteredTool[] = [
  {
    name: "createPanel",
    description: `Creates visually compelling, narratively precise manga panels that form the foundation of excellent manga storytelling with professional composition and character integration.

## PANEL DESIGN EXCELLENCE CRITERIA

### VISUAL COMPOSITION MASTERY (PROFESSIONAL STANDARDS):
1. PANEL FLOW: Optimize reading direction and visual progression for manga format
2. CHARACTER POSITIONING: Strategic placement for maximum narrative and emotional impact
3. CAMERA ANGLES: Dynamic perspectives that enhance storytelling and reader engagement
4. ACTION CLARITY: Clear, readable movement and gesture sequences for visual comprehension
5. EMOTIONAL FOCUS: Visual emphasis on character emotions, reactions, and development
6. ENVIRONMENTAL INTEGRATION: Seamless character-background relationships and spatial logic
7. ARTISTIC COMPOSITION: Professional manga layout and design principles

### NARRATIVE FUNCTION OPTIMIZATION (STORY SERVICE):
- STORY ADVANCEMENT: Each panel must serve clear, specific narrative purpose
- CHARACTER DEVELOPMENT: Visual representation of character growth and relationship evolution
- DIALOGUE INTEGRATION: Optimal text placement and speech flow for reading rhythm
- PACING CONTROL: Visual rhythm that supports story tempo and emotional beats
- TENSION BUILDING: Progressive visual intensity and dramatic escalation
- EMOTIONAL BEATS: Key moments designed for maximum reader impact and connection

## PANEL COMPONENTS SPECIFICATION

### CORE PANEL ELEMENTS (ALL REQUIRED):
- order: Sequential number within scene for proper visual flow and reading order
- panelContext: Modern comprehensive panel structure including all visual and narrative elements

### DETAILED PANEL CONTEXT STRUCTURE (MANDATORY COMPLETION):

**Visual Composition Elements (REQUIRED)**:
- cameraAngle: Camera perspective and framing (close-up, medium, wide, bird's eye, worm's eye, etc.)
- composition: Visual layout and element arrangement for optimal storytelling impact
- focus: Primary visual emphasis and reader attention direction for narrative clarity

**Character Integration (COMPREHENSIVE REQUIRED)**:
- characterPoses: Array of character pose specifications with complete details:
  - characterId: Character reference for consistency and recognition
  - pose: Physical positioning, stance, and body language conveying emotion and story
  - expression: Facial expression and emotion reflecting character's internal state
  - outfitId: (Optional) Specific outfit template override when needed for story
  - outfitVariationId: (Optional) Specific outfit variation for context or continuity
- actionDescription: Movement, gestures, and dynamic elements for visual translation

**Environmental and Atmospheric Elements (DETAILED)**:
- backgroundElements: Environmental and atmospheric elements supporting scene narrative
- lighting: Lighting configuration and mood affecting visual tone and character appearance
- effects: Special visual effects or techniques enhancing storytelling (speed lines, impact effects, etc.)
- props: Important objects and items in panel relevant to story and character interaction
- mood: Emotional atmosphere and visual tone supporting narrative function

**Production Notes (TECHNICAL SPECIFICATIONS)**:
- panelNotes: Additional panel-specific notes for production consistency and special requirements

### TEMPLATE INTEGRATION REQUIREMENTS (CRITICAL FOR CONSISTENCY):

**Location Template Inheritance**:
- Panels automatically inherit location context from parent scene's sceneContext
- Use location template's camera angles as reference and foundation for panel cameraAngle
- Adapt location lighting and atmospheric elements to panel-specific narrative needs
- Ensure background elements align perfectly with chosen location template specifications

**Outfit Template Management**:
- Characters inherit outfit assignments from parent scene's characterOutfits configuration
- Override with specific outfitId/outfitVariationId in characterPoses when story requires changes
- Ensure outfit consistency across panel sequences unless narrative specifically requires variation
- Consider outfit-pose compatibility (formal wear limitations vs. action scene requirements)

**Character Consistency Integration**:
- Use characterPoses array to specify each character's positioning with complete detail
- Include pose, expression, and outfit specifications for every character in panel
- Ensure character recognition through consistent outfit usage and visual identity
- Adapt character poses appropriately to location context and narrative requirements

## PANEL CREATION STANDARDS

### VISUAL EXCELLENCE (PROFESSIONAL QUALITY):
- COMPOSITION MASTERY: Professional manga layout principles and visual hierarchy
- CHARACTER ACCURACY: Consistent character representation and recognition across panels
- ENVIRONMENTAL DETAIL: Rich, contextually appropriate backgrounds enhancing story
- ARTISTIC QUALITY: High production value visual design meeting professional standards
- READER ENGAGEMENT: Compelling visual storytelling that draws and maintains attention

### NARRATIVE INTEGRATION (STORY OPTIMIZATION):
- STORY SERVICE: Every panel advances narrative effectively and purposefully
- EMOTIONAL RESONANCE: Visual impact supports and amplifies story emotions
- PACING CONTRIBUTION: Panel rhythm supports overall story flow and reading experience
- CHARACTER DEVELOPMENT: Visual representation of character growth and relationship evolution
- WORLD BUILDING: Environmental details that enrich story universe and cultural context

### TECHNICAL SPECIFICATIONS (PRODUCTION READY):
- TEMPLATE CONSISTENCY: Perfect integration with established location and outfit templates
- VISUAL CONTINUITY: Smooth panel-to-panel transitions maintaining spatial and temporal logic
- CHARACTER RECOGNITION: Consistent character appearance through proper template usage
- PRODUCTION EFFICIENCY: Panels ready for immediate artistic development and refinement
- QUALITY ASSURANCE: Professional standards for composition, character accuracy, and narrative function

Creates panels representing the pinnacle of manga visual storytelling - technically excellent, emotionally powerful, narratively essential, and fully integrated with established template systems for maximum consistency and production efficiency.`,
    inputSchema: zodSchemaToMcpSchema(
      panelSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        dialogues: true,
        characters: true,
        sceneId: true,
        imageUrl: true,
        isAiGenerated: true,
      })
    ),
    handler: createPanelHandler,
  },
  {
    name: "updatePanel",
    description:
      "Updates an existing panel's content, poses, camera angle, or visual effects.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panelId: z
          .string()
          .describe(
            "ID of the panel to modify - use getScene or listPanels to locate panels"
          ),
        updates: panelSchema
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
          .partial()
          .describe(
            "Partial panel configuration containing only fields requiring adjustment"
          ),
      })
    ),
    handler: updatePanelHandler,
  },
  {
    name: "deletePanel",
    description:
      "Deletes a panel and reassigns any dialogue to other panels in the scene.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panelId: z
          .string()
          .describe(
            "ID of the panel to remove - verify panel number and content"
          ),
      })
    ),
    handler: deletePanelHandler,
  },
  {
    name: "getPanel",
    description: "Retrieves complete details of a panel by ID.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panelId: z.string().describe("ID of the panel to retrieve"),
      })
    ),
    handler: getPanelHandler,
  },
  {
    name: "listPanels",
    description: "Lists all panels in a scene.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        sceneId: z.string().describe("ID of the scene to list panels from"),
      })
    ),
    handler: listPanelsForSceneHandler,
  },
];
