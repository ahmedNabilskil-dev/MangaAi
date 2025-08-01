import { sceneSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createSceneHandler } from "./handlers/creation-tools";
import { deleteSceneHandler } from "./handlers/delete-tools";
import {
  getSceneHandler,
  listScenesForChapterHandler,
} from "./handlers/fetch-tools";
import { updateSceneHandler } from "./handlers/update-tools";

export const sceneTools: RegisteredTool[] = [
  {
    name: "createScene",
    description: `Creates compelling manga scenes with complete narrative structure, character development, and visual storytelling optimization that translate perfectly to manga panels.

## SCENE DESIGN EXCELLENCE CRITERIA

### NARRATIVE STRUCTURE REQUIREMENTS (MANDATORY):
1. DRAMATIC PURPOSE: Every scene must serve clear, specific story function
2. EMOTIONAL PROGRESSION: Scenes must build emotional momentum and character development
3. CHARACTER DEVELOPMENT: Advance character arcs, relationships, and growth meaningfully
4. VISUAL STORYTELLING: Design scenes optimized for manga panel composition and flow
5. PACING MASTERY: Balance dialogue, action, contemplation, and visual moments strategically
6. CONFLICT INTEGRATION: Include tension, challenge, or character obstacle elements
7. ATMOSPHERE CREATION: Establish mood through setting, character interaction, and environmental details

### MANGA-SPECIFIC OPTIMIZATION (PRODUCTION READY):
- PANEL POTENTIAL: Structure scenes with natural panel break points and visual rhythm
- VISUAL DRAMA: Create moments perfect for impactful manga spreads and emphasis panels
- DIALOGUE BALANCE: Optimize text-to-visual ratio for manga reading pace and flow
- ACTION SEQUENCES: Design clear, readable action progression and character movement
- EMOTIONAL BEATS: Create moments that translate to powerful visual storytelling impact
- TRANSITION POINTS: Enable smooth flow between scenes within chapters

## SCENE COMPONENTS SPECIFICATION

### CORE SCENE ELEMENTS (ALL REQUIRED):
- title: Descriptive scene name capturing essence (e.g., "Rooftop Confrontation", "Morning Routine Discovery")
- description: Rich narrative description (150-250 words) with visual and emotional detail
- order: Sequential number within chapter for proper story flow
- sceneContext: Modern comprehensive scene structure including all sub-elements

### DETAILED SCENE CONTEXT STRUCTURE (MANDATORY COMPLETION):

**Location Integration (REQUIRED)**:
- locationId: Specific location template ID to use for this scene setting
- locationVariationId: (Optional) Specific location variation for unique conditions
- Ensures visual consistency and production efficiency through template system

**Character Outfit Management (COMPREHENSIVE REQUIRED)**:
- characterOutfits: Array of character outfit assignments with complete specifications:
  - characterId: Character reference for outfit assignment
  - outfitId: Specific outfit template ID for visual consistency
  - outfitVariationId: (Optional) Specific outfit variation for context
  - reason: (Optional) Narrative reason for outfit choice when contextually significant
- presentCharacters: Array of all character IDs appearing in scene for planning

**Environmental Overrides (SCENE-SPECIFIC CUSTOMIZATION)**:
- timeOfDay: Precise timing (dawn/morning/noon/afternoon/evening/night) affecting lighting and mood
- weather: Atmospheric conditions (sunny/cloudy/rainy/stormy/snowy/foggy) influencing scene tone
- mood: Emotional atmosphere (peaceful/mysterious/energetic/romantic/tense/cheerful/somber)
- lighting: Custom lighting configuration for specific dramatic or emotional effects
- additionalProps: Extra environmental elements required for scene narrative
- sceneNotes: Additional scene-specific notes for production and continuity

### TEMPLATE INTEGRATION REQUIREMENTS (CRITICAL FOR CONSISTENCY):

**Location Template Usage Strategy**:
- Select appropriate location templates from available project options
- Use locationVariationId when specific environmental conditions are narratively required
- Apply environmentOverrides for scene-specific atmospheric changes and mood
- Ensure location choice enhances rather than distracts from character interaction and story

**Outfit Template Usage Strategy**:
- Assign specific outfit templates to each character appearing in scene
- Use outfitVariationId for weather/time/mood-appropriate clothing variations
- Provide clear reasoning for outfit choices when contextually significant to story
- Ensure outfit-location compatibility (formal wear for formal locations, casual for casual, etc.)
- Maintain character recognition while allowing for appropriate outfit changes

**Character Integration Strategy**:
- Include all relevant characters in presentCharacters array for comprehensive planning
- Ensure character outfit assignments match story context and character development
- Consider character relationships, status, and emotional state when selecting outfits
- Balance character focus to avoid overcrowding while maintaining story relevance

## SCENE CREATION STANDARDS

### LITERARY EXCELLENCE (PROFESSIONAL QUALITY):
- PROSE QUALITY: Professional-grade narrative writing with vivid sensory details
- SENSORY RICHNESS: Immersive details creating complete reader experience
- DIALOGUE AUTHENTICITY: Character-specific speech patterns and authentic voice
- ATMOSPHERIC DEPTH: Rich environmental and emotional details enhancing story
- CONFLICT INTEGRATION: Natural tension and character challenges driving narrative forward

### MANGA PRODUCTION READINESS (OPTIMIZATION):
- PANEL CONSCIOUSNESS: Clear visual composition opportunities and natural break points
- ACTION CLARITY: Readable movement and gesture sequences for visual translation
- EMOTIONAL VISUALIZATION: Moments specifically designed for visual impact and reader connection
- PACING OPTIMIZATION: Balanced text and visual storytelling for manga reading rhythm
- TRANSITION PLANNING: Smooth scene-to-scene flow maintaining story momentum

### NARRATIVE FUNCTION REQUIREMENTS (STORY SERVICE):
- STORY ADVANCEMENT: Meaningful progression of overall narrative arc
- CHARACTER DEVELOPMENT: Growth moments and relationship evolution
- VISUAL POTENTIAL: Rich scenes perfect for manga panel adaptation
- TEMPLATE INTEGRATION: Natural, seamless use of existing outfits and locations
- READER ENGAGEMENT: Compelling content demanding continued reading
- PRODUCTION READINESS: Structure ready for panel breakdown and development

Creates scenes representing the pinnacle of manga storytelling - emotionally resonant, visually compelling, narratively essential, and production-ready for immediate panel development using established template systems.`,
    inputSchema: zodSchemaToMcpSchema(sceneSchema),
    handler: createSceneHandler,
  },
  {
    name: "updateScene",
    description: "Updates fields of an existing scene.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        sceneId: z.string().describe("ID of the scene to update"),
        updates: sceneSchema
          .omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            panels: true,
            chapterId: true,
            isAiGenerated: true,
          })
          .partial()
          .describe("Fields to update"),
      })
    ),
    handler: updateSceneHandler,
  },
  {
    name: "deleteScene",
    description: "Deletes a scene and all its panels from the chapter.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        sceneId: z
          .string()
          .describe("ID of the scene to remove - verify scene order and title"),
      })
    ),
    handler: deleteSceneHandler,
  },
  {
    name: "getScene",
    description: "Retrieves complete details of a scene by ID.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        sceneId: z.string().describe("ID of the scene to retrieve"),
      })
    ),
    handler: getSceneHandler,
  },
  {
    name: "listScenes",
    description: "Lists all scenes in a chapter.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapterId: z.string().describe("ID of the chapter to list scenes from"),
      })
    ),
    handler: listScenesForChapterHandler,
  },
];
