import { chapterSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createChapterHandler } from "./handlers/creation-tools";
import { deleteChapterHandler } from "./handlers/delete-tools";
import {
  getChapterHandler,
  listChaptersForProjectHandler,
} from "./handlers/fetch-tools";
import { updateChapterHandler } from "./handlers/update-tools";

export const chapterTools: RegisteredTool[] = [
  {
    name: "createChapter",
    description: `Creates compelling manga chapters (600-800 words) with complete narrative structure, character development, and visual storytelling optimization.
    
    ## CHAPTER CREATION REQUIREMENTS
    
    ### NARRATIVE EXCELLENCE MANDATE
    1. **CINEMATIC STORYTELLING**: Write with visual manga composition in mind
       - Structure scenes with natural panel breakdown points
       - Create visual drama moments perfect for impactful manga spreads
       - Balance text-heavy dialogue with action-heavy visual sequences
       - Design scenes for close-up, medium, and wide shot opportunities
    
    2. **CHARACTER VOICE AUTHENTICITY**: Each character speaks with distinct personality
       - Maintain established character voices and speech patterns from project context
       - Show character growth through dialogue and actions, not exposition
       - Create meaningful character interactions and relationship development
       - Use character-specific mannerisms and speech patterns
    
    3. **EMOTIONAL RESONANCE**: Create moments that translate to powerful manga panels
       - Design emotional beats that work visually in panel format
       - Show emotions through character actions and expressions, not just dialogue
       - Build tension and release through strategic pacing
       - Create memorable moments that advance character arcs meaningfully
    
    4. **PACING MASTERY**: Balance action, dialogue, introspection, and visual beats
       - Vary scene rhythm and intensity throughout the chapter
       - Use narrative white space and timing effectively
       - Build toward compelling chapter conclusions with hooks for next chapter
       - Create natural story flow with smooth scene transitions
    
    5. **WORLD IMMERSION**: Rich environmental details that enhance atmosphere
       - Use available location templates to create vivid, consistent scene settings
       - Integrate world-building naturally into narrative flow without exposition dumps
       - Create atmosphere that supports the chapter's emotional tone
       - Use environmental storytelling to convey mood and subtext
    
    ### TEMPLATE INTEGRATION STRATEGY (CRITICAL)
    **OUTFIT TEMPLATE USAGE**:
    - ALWAYS select appropriate existing outfit templates for ALL character appearances
    - Use context logic: school scenes = school uniforms, home = casual wear, events = formal attire
    - Maintain character recognition through consistent outfit choices across chapters
    - Consider outfit-location compatibility and narrative appropriateness
    - Reference outfits by their EXACT template names for production consistency
    - Never create new outfits - only use existing templates provided in context
    
    **LOCATION TEMPLATE USAGE**:
    - ALWAYS leverage existing location templates for ALL scene settings
    - Choose locations that enhance mood and support character interaction needs
    - Ensure logical location flow and smooth scene transitions
    - Use location features to enhance visual storytelling potential
    - Reference locations by their EXACT template names for production consistency
    - Never create new locations - only use existing templates provided in context
    
    ### MANGA OPTIMIZATION SPECIFICATIONS
    **PANEL CONSCIOUSNESS**:
    - Structure narrative with clear scene breaks suitable for panel transitions
    - Create moments specifically designed for full-page or double-page spreads
    - Consider visual flow between panels and pages
    - Design action sequences with dynamic movement and clear choreography
    - Use dialogue and narration rhythm appropriate for manga reading pace
    
    **VISUAL STORYTELLING INTEGRATION**:
    - Show character emotions through body language, facial expressions, and actions
    - Create subtext through visual details and environmental cues
    - Use character positioning and spatial relationships to convey dynamics
    - Design scenes that work both as text narrative and future visual panels
    - Include specific visual details that enhance mood and character development
    
    **PRODUCTION READINESS REQUIREMENTS**:
    - Clear scene breakdown structure ready for manga scene generation tools
    - Seamless integration of existing outfit and location templates with exact names
    - Visual consistency maintained throughout all character appearances
    - Natural story progression suitable for manga panel adaptation
    - Technical notes for visual reproduction when needed
    
    ### STORYTELLING EXCELLENCE STANDARDS
    **LITERARY QUALITY**:
    - Third-person narrative with published-fiction quality prose
    - Complete story arc with satisfying beginning, middle, and conclusion within chapter
    - Vivid sensory details creating immersive reader experience
    - Complex character emotions and realistic psychological development
    - Subtle theme integration supporting overall project vision and genre
    
    **CHAPTER STRUCTURE REQUIREMENTS**:
    - Clear narrative purpose that advances the overall story meaningfully
    - Focus on 2-3 key characters to avoid overcrowding and maintain clarity
    - Character development moments that feel earned and authentic to established personalities
    - Plot progression that maintains story momentum while developing emotional depth
    - Satisfying chapter conclusion with appropriate hooks for future chapters
    - Chapter length optimized for manga reading experience (600-800 words)
    
    **DIALOGUE AND VOICE MASTERY**:
    - Each character must speak with distinct voice patterns established in project context
    - Dialogue should reveal character personality, relationships, and development
    - Balance dialogue with action and visual storytelling elements
    - Use subtext and implication rather than direct exposition
    - Create natural conversation flow that advances both plot and character development
    
    ### PRODUCTION INTEGRATION REQUIREMENTS
    **TEMPLATE CONSISTENCY**:
    - Use ONLY existing outfit and location templates provided in project context
    - Reference templates by exact names for seamless production workflow
    - Ensure template choices support narrative goals and character development
    - Maintain visual continuity with previous chapters through consistent template usage
    
    **SCENE DEVELOPMENT READINESS**:
    - Structure chapters for easy breakdown into individual manga scenes
    - Provide clear visual descriptions suitable for artist interpretation
    - Include specific details about character positioning, expressions, and actions
    - Design scenes with natural panel flow and visual storytelling potential
    
    Each chapter must advance your overall story while functioning as a complete, engaging reading experience ready for immediate manga production using existing visual templates.`,
    inputSchema: zodSchemaToMcpSchema(
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
    ),
    handler: createChapterHandler,
  },
  {
    name: "updateChapter",
    description:
      "Updates an existing chapter's title, narrative, purpose, tone, or key characters.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapterId: z
          .string()
          .describe(
            "Unique identifier of the chapter to update - use getChapter or list chapters to find chapter IDs"
          ),
        updates: chapterSchema
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
          .partial()
          .describe(
            "Object containing only the chapter fields you want to modify - leave unchanged fields undefined"
          ),
      })
    ),
    handler: updateChapterHandler,
  },
  {
    name: "deleteChapter",
    description: "Deletes a chapter and all its related scenes and panels.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapterId: z
          .string()
          .describe(
            "ID of the chapter to remove - verify chapter number and title"
          ),
      })
    ),
    handler: deleteChapterHandler,
  },
  {
    name: "getChapter",
    description: "Retrieves complete details of a chapter by ID.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapterId: z.string().describe("ID of the chapter to retrieve"),
      })
    ),
    handler: getChapterHandler,
  },
  {
    name: "listChapters",
    description: "Lists all chapters in a project.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        projectId: z
          .string()
          .describe("ID of the project to list chapters from"),
      })
    ),
    handler: listChaptersForProjectHandler,
  },
];
