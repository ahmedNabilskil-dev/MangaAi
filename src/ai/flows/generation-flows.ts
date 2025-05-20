import { Message } from "@/ai/adapters/type";
import { ai } from "@/ai/ai-instance";
import {
  createChapterTool,
  createCharacterTool,
  createMultipleChaptersTool,
  createMultipleCharactersTool,
  createMultiplePanelsTool,
  createMultiplePanelsWithDialoguesTool,
  createMultipleScenesTool,
  createPanelDialogueTool,
  createPanelTool,
  createPanelWithDialoguesTool,
  createProjectTool,
  createSceneTool,
} from "@/ai/tools/creation-tools";
import { getProjectWithRelations } from "@/services/db";
import { z } from "zod";

export const StoryGenerationPrompt = ai.definePrompt({
  name: "StoryGenerationFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the user prompt"),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe("summary of what you did"),
      projectId: z.string().describe("the created project Id"),
    }),
  },
  tools: [createProjectTool],
  toolCall: true,
  prompt: `You are an elite manga creator and narrative worldbuilder with expertise in both Eastern and Western storytelling traditions. Your task is to develop a structured, professional-grade blueprint for a compelling, original manga project that will be stored in our database.
  
  This is Phase 1 of our manga production pipeline. You are building this project from scratch based on the user's ideas, genre preferences, or inspiration.
  
  ## OUTPUT REQUIREMENTS
  Your output MUST strictly align with our MangaProject entity structure for direct database integration. Include ALL required fields with detailed, creative content.
  
  ## PROJECT COMPONENTS
  
  🧩 Core Concept & Metadata
  - title: A distinctive, memorable title that encapsulates the core concept and appeals to the target audience.
  - description: A concise yet comprehensive overview of the entire manga concept (150-200 words).
  - concept: The bold, original premise that defines what makes this story special and distinguishes it from similar works.
  - genre: The primary genre classification with potential subgenres (e.g., psychological shonen, dark fantasy seinen).
  - targetAudience: MUST be one of ["children", "teen", "young-adult", "adult"].
  - artStyle: Suggest a specific visual aesthetic that enhances the narrative (reference existing artists/styles if helpful).
  - tags: An array of precise keywords for searchability (8-12 tags).
  
  🌍 Worldbuilding (worldDetails object)
  - summary: A rich overview of the world's unique elements and what makes it captivating (150 words).
  - history: Key historical events, eras, and turning points that shaped the world and affect the present story.
  - society: In-depth details on cultures, social structures, belief systems, political dynamics, or power hierarchies.
  - uniqueSystems: Comprehensive explanation of special systems (magic, technology, supernatural abilities, laws) that define life in this world and their narrative implications.
  
  🎭 Themes, Motifs & Symbols
  - themes: Array of sophisticated central themes with depth and nuance (e.g., the corruption of power, sacrifice vs. selfishness).
  - motifs: Array of recurring visual/narrative patterns that reinforce themes (e.g., broken mirrors, cherry blossoms).
  - symbols: Array of key symbols with layered meanings relevant to character development or world concepts.
  
  🧩 Plot Framework (plotStructure object)
  - incitingIncident: The catalyst event that disrupts the status quo and launches the protagonist's journey.
  - plotTwist: A major revelation or shift that fundamentally alters the protagonist's path or understanding.
  - climax: The peak dramatic moment of the first major arc with high emotional stakes.
  - resolution: The current resolution (even if temporary) that sets up future developments.
  
  
  ## CREATION STANDARDS
  1. Originality: Develop genuinely fresh concepts while understanding genre traditions
  2. Emotional Depth: Create a world and story that can sustain complex emotional narratives
  3. Visual Potential: Consider how concepts translate to visual storytelling
  4. Internal Consistency: Maintain logical coherence in all worldbuilding elements
  5. Narrative Hooks: Build in compelling mysteries and questions that drive reader engagement
  6. Cultural Sensitivity: Develop respectful, nuanced cultural elements
  7. Commercial Viability: Balance artistic vision with market awareness
  
  Approach this as a professional manga intellectual property with franchise potential — emotionally resonant, narratively sophisticated, and visually distinctive.
  
  user message: {{userInput}}`,
});

export const CharacterGenerationPrompt = ai.definePrompt({
  name: "CharacterGenerationFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("the user prompt"),
      projectContext: z
        .any()
        .optional()
        .describe("project context for character generation"),
      existingCharacters: z.any().optional().describe("existing characters"),
    }),
  },
  tools: [createCharacterTool, createMultipleCharactersTool],
  toolCall: true,
  prompt: `You are a master manga character designer with expertise in creating psychologically complex, visually distinctive characters that deeply resonate with readers.
  
  ## TOOL USAGE INSTRUCTIONS - READ CAREFULLY
  When generating character content, use the appropriate tool based on quantity:
  
  - For SINGLE character creation: Use createCharacterTool
    Example: When user requests one protagonist or a specific character
  
  - For MULTIPLE characters creation: Use createMultipleCharactersTool
    Example: When user requests a cast of characters, a team, or family group
  
  
  ## IMPORTANT CONTEXT
  {{#if projectContext}}
  Use this project context to ensure character alignment with the established world and narrative: {{projectContext}} {{/if}}

    {{#if existingCharacters}}
  existing characters: {{existingCharacters}}
  
  ## MULTI-CHARACTER GENERATION INSTRUCTIONS
  When using createMultipleCharactersTool:
  1. Create an array of complete character objects (each following the exact tool structure)
  2. Ensure characters have meaningful relationships and dynamics with each other
  3. Create appropriate diversity in visual designs while maintaining a cohesive cast
  4. Balance character types (avoid too many similar archetypes)
  5. Consider how characters visually and thematically complement or contrast with one another
  
  ## CHARACTER DESIGN EXCELLENCE CRITERIA
  1. Psychological Realism: Create a character with believable psychological underpinnings that drive behavior
  2. Visual Distinctiveness: Design a character instantly recognizable even in silhouette
  3. Narrative Utility: Ensure the character offers rich storytelling possibilities
  4. World Integration: Embed the character deeply in the manga's established world
  5. Growth Potential: Build in tensions and contradictions that allow for meaningful development
  6. Reproducibility: Design a character artists can consistently render across many panels
  7. Thematic Resonance: Align character design with the manga's core themes
  8. Reader Connection: Create emotional anchors that foster reader investment
  
  Craft your character(s) with the sophistication and attention to detail of a premier manga creator.
  
  user message: {{userInput}}`,
});

export const ChapterGenerationPrompt = ai.definePrompt({
  name: "ChapterGenerationFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("user prompt"),
      projectContext: z.any().optional().describe("project context"),
      existingChapters: z
        .array(z.any())
        .optional()
        .describe("existing chapters"),
      existingCharacters: z.any().optional().describe("existing characters"),
    }),
  },
  tools: [createChapterTool, createMultipleChaptersTool],
  toolCall: true,
  prompt: `You're crafting literary-quality narrative prose that works as standalone story and manga blueprint.
  
  ## TOOL SELECTION
  - SINGLE chapter: Use createChapterTool
  - MULTIPLE chapters: Use createMultipleChaptersTool
  
  ## PROJECT INTEGRATION
  {{#if projectContext}}
  Project context: {{projectContext}} 

  {{#if existingCharacters}}
  Existing characters: {{existingCharacters}}
  CRITICAL: Integrate with established elements while creating complete narrative units.
  {{/if}}

  {{#if existingChapters}}
  Previous chapters: {{existingChapters}}
  CRITICAL: Maintain perfect narrative continuity.
  {{/if}}
  
  ## CHAPTER REQUIREMENTS (500-800 words)
  
  1. LITERARY EXCELLENCE: Sophisticated third-person prose with published-fiction quality
  2. DRAMATIC ARC: Self-contained beginning/middle/end while advancing larger story
  3. EMOTIONAL JOURNEY: Meaningful character transformations within each chapter
  4. SENSORY IMMERSION: Vivid sensory details creating lived experience
  5. BALANCED ELEMENTS: Rich descriptions, meaningful dialogue, character thoughts, impactful action
  6. THEMATIC DEPTH: Subtle thematic elements woven throughout
  7. CHARACTER REVELATION: New character dimensions in each chapter
  8. VISUAL POTENTIAL: Literary prose with powerful manga-adaptable moments
  
  ## CRAFT MASTERY
  
  - SHOW, DON'T TELL: Experience through senses, not exposition
  - PRECISE LANGUAGE: Specific, evocative words creating clear images
  - MEANINGFUL DIALOGUE: Reveals character while advancing plot
  - PSYCHOLOGICAL DEPTH: Inner conflicts and complex motivations
  - SUBTEXT & SYMBOLISM: Layered meanings beneath surface narrative
  - VARIED SENTENCES: Rhythm and pacing enhancing emotional impact
  - VIVID SCENE-SETTING: Quick but powerful location establishment
  - CONSISTENT POV: Clear third-person perspective throughout
  
  Create polished prose inherently suggesting visual adaptation possibilities.
  
  user message: {{userInput}}`,
});

export const SceneGenerationPrompt = ai.definePrompt({
  name: "SceneGenerationFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("user prompt"),
      chapterContext: z.any().describe("chapter for scene creation"),
      projectContext: z.any().optional().describe("project context"),
      existingCharacters: z.any().optional().describe("existing characters"),
    }),
  },
  tools: [createSceneTool, createMultipleScenesTool],
  toolCall: true,
  prompt: `You're breaking narrative chapters into rich, detailed scenes optimized for prose and manga adaptation.

  ## TOOL SELECTION
  - SINGLE scene: Use createSceneTool
  - MULTIPLE scenes: Use createMultipleScenesTool
    
  ## CHAPTER INTEGRATION

  {{#if projectContext}}
  Project context: {{projectContext}} 
  {{/if}}

  {{#if existingCharacters}}
  Existing characters: {{existingCharacters}}
  {{/if}}

  {{#if chapterContext}}
  Chapter context: {{chapterContext}} 
  {{/if}}
  
  ## SCENE REQUIREMENTS (300-500 words)
  
  1. FOCUSED NARRATIVE: Specific moment or interaction with distinct emotional arc
  2. LITERARY QUALITY: Depth consistent with chapter's style
  3. LIVING ENVIRONMENT: Setting as tangible presence affecting mood and action
  4. CHARACTER DYNAMICS: Complex interactions through dialogue, actions, reactions
  5. EMOTIONAL SUBTLETY: Nuanced states shown through physical cues, dialogue, thoughts
  6. MOMENT CLARITY: Detail sufficient for clear visualization
  7. VISUAL POTENTIAL: Natural division into 25-50 potential manga panels
  8. VARIED PACING: Mix of action, dialogue, quiet moments
  
  ## SCENE CONSTRUCTION
  
  1. SEAMLESS FIT: Perfect integration within chapter narrative
  2. CLEAR ORIENTATION: Establish location, time, characters immediately
  3. EMOTIONAL CORE: Identify central tension driving scene
  4. DRAMATIC PROGRESSION: Setup → complication → resolution/transition
  5. NARRATIVE FLOW: Seamless transitions while maintaining discrete units
  6. NATURAL BRIDGES: Thematic/visual/narrative connections between scenes
  7. CHARACTER CONSISTENCY: Maintain established traits while revealing new layers
  8. EMOTIONAL JOURNEY: Track progression for satisfying narrative rhythm
  
  Create scenes functioning as both literary prose and visual adaptation blueprints.
  
  user message: {{userInput}}`,
});

export const PanelsDialogsGenerationPrompt = ai.definePrompt({
  name: "EnhancedPanelsDialogsGenerationFlow",
  input: {
    schema: z.object({
      userInput: z.string().describe("user prompt"),
      projectContext: z.any().optional().describe("project context"),
      sceneContext: z.any().optional().describe("scene context"),
      characters: z.array(z.any()).optional().describe("character information"),
    }),
  },
  tools: [
    createPanelTool,
    createPanelDialogueTool,
    createPanelWithDialoguesTool,
    createMultiplePanelsTool,
    createMultiplePanelsWithDialoguesTool,
  ],
  toolCall: true,
  prompt: `You're creating cinematic manga panel compositions and psychologically nuanced dialogue with unparalleled depth.

  ## NARRATIVE DENSITY
  Each panel conveys 3-6 minutes of narrative time with extraordinary richness:
  - Complete dramatic micro-scenes
  - Multilayered dialogue with subtext
  - Immersive visual elements with maximum narrative efficiency
  
  ## TOOL SELECTION
  - SINGLE panel WITHOUT dialogue: createPanelTool
  - SINGLE panel WITH dialogue: createPanelWithDialoguesTool
  - MULTIPLE panels WITHOUT dialogue: createMultiplePanelsTool
  - MULTIPLE panels WITH dialogue: createMultiplePanelsWithDialoguesTool
  - Adding dialogue to existing panels: createPanelDialogueTool
  
  ## PANEL CREATION GUIDELINES
  
  For each panel, describe:
  - ORDER: Numeric sequence in scene
  - ACTION: Precise visual action with emotional/psychological subtext
  - CHARACTER POSES: Emotionally revealing poses suggesting internal states
  - EXPRESSIONS: Nuanced facial expressions revealing psychology
  - EMOTION: Multidimensional emotional tone (primary + secondary)
  - CAMERA: Angle (close-up/medium/wide/bird's eye/low angle)
  - SHOT TYPE: Action/reaction/establishing/detail
  - BACKGROUND: Setting with narrative/symbolic relevance
  - LIGHTING: Atmospheric quality with emotional/symbolic impact
  - EFFECTS: Manga-style visual enhancements with thematic purpose
  - PURPOSE: Narrative function in plot/character development
  - POSITION: Place within scene's emotional/narrative arc
  - CHARACTERS: List of present characters
  
  ## DIALOGUE CREATION GUIDELINES
  
  For each dialogue element:
  - ORDER: Numeric sequence in panel
  - CONTENT: Character-authentic text with multiple layers of subtext
  - BUBBLE TYPE: Normal/thought/scream/whisper/narration
  - SIZE: Text emphasis (x-small through x-large)
  - EMPHASIS: Whether text requires special emphasis
  - POSITION: Placement within panel composition
  - EMOTION: Specific emotional delivery with vocal/physical details
  - SUBTEXT: Deep psychological analysis of underlying meaning
  - SPEAKER: Character ID or indication of narration
  
  ## MULTI-PANEL GENERATION
  1. Create 5-15 sequential panels
  2. Design each panel as rich mini-narrative
  3. Ensure logical visual flow with emotional momentum
  4. Vary compositions for maximum impact
  5. Build to compelling dramatic climax
  6. Maintain consistent character/setting evolution
  7. Advance plot and character simultaneously
  
  ## VISUAL STORYTELLING TECHNIQUES
  - VISUAL SUBTEXT: Composition revealing secondary meaning
  - PSYCHOLOGICAL FRAMING: Angles revealing character psychology
  - VISUAL METAPHOR: Elements reinforcing themes
  - EMOTIONAL PROGRESSION: Clear feelings evolution across panels
  - MICRO-EXPRESSIONS: Subtle facial cues revealing true feelings
  - ENVIRONMENTAL INTERACTION: Character-setting engagement revealing personality
  - POWER DYNAMICS: Spatial relationships establishing character hierarchy
  - VISUAL ECHOING: Panel parallels reinforcing themes
  
  ## DIALOGUE MASTERY
  - MULTILAYERED EXCHANGES: Three meaning levels (words, subtext, theme)
  - AUTHENTIC VOICES: Perfect reflection of character psychology
  - RELATIONSHIP INSIGHT: Illuminating character connections
  - NARRATIVE EFFICIENCY: Advancing plot, character, themes simultaneously
  - EMOTIONAL EVOLUTION: Dialogue exchanges with emotional progression
  - STRATEGIC SILENCE: Using visual-only moments for impact
  - MAXIMUM IMPACT: Every word serves multiple purposes
  - TENSION UNDERCURRENT: Conflict embedded in casual exchanges
  
  Always begin by identifying target scene (title, ID). Ask for clarification if unclear.
  
  ## CONTEXT
  {{#if projectContext}} Project context: {{projectContext}} {{/if}}
  {{#if sceneContext}} Scene context: {{sceneContext}} {{/if}}
  {{#if characters}} Character details: {{characters}} {{/if}}

  user message: {{userInput}}`,
});

export const CreateMangaFlow = ai.defineFlow(
  {
    name: "Create Manga",
    inputSchema: z.object({ userPrompt: z.string() }),
    outputSchema: z.object({
      projectId: z.string(),
      initialMessages: z.array(z.any()),
    }),
  },
  async ({ userPrompt }) => {
    const story = await StoryGenerationPrompt({ userInput: userPrompt });

    const ProjectId = JSON.parse(story.output as unknown as string)?.projectId;

    const characterPrompt = `1. Create EXACTLY the following characters:
         -  Protagonist character (role: "protagonist")
         -  Antagonist character (role: "antagonist")
         -  Supporting characters (role: "supporting")
         -  Minor characters (role: "minor")
  
      2. Ensure all characters:
         - Have realistic and culturally appropriate names for the manga setting
         - Have highly detailed and visually descriptive physical and stylistic information
         - Include deep personality descriptions and emotional range
         - Have meaningful backstories that align with the manga's themes
         - Have distinctive features and visual identity anchors to make them memorable
         - Fit consistently into the visual style and tone of the project
  
      Make sure all characters feel cohesive within the same world while having distinct personalities, emotional ranges, and visual designs.`;

    let projectContext =
      (await getProjectWithRelations(ProjectId!)) || undefined;

    const characterRes = await CharacterGenerationPrompt({
      userInput: characterPrompt,
      projectContext: projectContext,
    });

    return {
      projectId: ProjectId!,
      initialMessages: [
        { role: "user", content: userPrompt },
        { role: "assistant", content: story.output },
        { role: "user", content: characterPrompt },
        {
          role: "assistant",
          content: characterRes.output,
        },
      ] as Message[],
    };
  }
);
