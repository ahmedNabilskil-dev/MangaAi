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
  prompt: `You are a master manga character designer with expertise in creating psychologically complex, visually distinctive full-body characters that maintain perfect consistency across all appearances.
  
  ## TOOL USAGE INSTRUCTIONS - READ CAREFULLY
  When generating character content, use the appropriate tool based on quantity:
  
  - For SINGLE character creation: Use createCharacterTool
    Example: When user requests one protagonist or a specific character
  
  - For MULTIPLE characters creation: Use createMultipleCharactersTool
    Example: When user requests a cast of characters, a team, or family group
  
  ## FULL-BODY VISUAL CONSISTENCY MANDATE
  ALL characters must follow these EXACT specifications to ensure they belong to the same anime world:
  
  ### CORE ART STYLE SPECIFICATIONS
  - **Art Style**: Modern Japanese anime/manga style, specifically reminiscent of high-quality seasonal anime productions
  - **Line Art**: Clean, precise lineart with consistent 2-3px weight for outlines, 1-2px for details
  - **Shading Style**: Cel shading with soft gradients, anime-style rim lighting, consistent light source positioning
  - **Color Saturation**: Vibrant but harmonious colors, avoiding oversaturation
  - **Eye Style**: Large, expressive anime eyes with detailed iris patterns, consistent highlight placement
  - **Body Proportions**: Standard anime proportions - slightly larger heads, elongated limbs, expressive hands
  - **Full Body Composition**: Complete character from head to toe, dynamic pose, detailed anatomy
  
  ### ENHANCED FULL-BODY STYLE GUIDE ELEMENTS
  Every character MUST include these exact specifications:
  
  **consistencyPrompt**: 
  "full body anime character, high quality anime art, complete character design head to toe, clean lineart, cel shading, vibrant colors, detailed anime eyes with highlights, expressive facial features, modern anime aesthetic, professional anime production quality, cohesive character design, anime proportions, soft anime shading, detailed hair rendering with individual strands, anime facial features with precise detail, full body pose, detailed clothing and accessories, anatomically correct anime style, dynamic character stance, detailed hands and feet, fabric texture details, consistent art style throughout, full character reference sheet quality"
  
  **negativePrompt**: 
  "realistic, photorealistic, 3D render, western cartoon, chibi, deformed, ugly, blurry, low quality, bad anatomy, extra limbs, mutation, disfigured, bad proportions, watermark, signature, text, inconsistent style, mixed art styles, sketchy lines, rough artwork, amateur drawing, poorly drawn, distorted features, cropped, partial body, headshot only, face only, missing limbs, incomplete character, bad hands, malformed hands, extra fingers, missing fingers, floating limbs, disconnected body parts"
  
  ### DETAILED FULL-BODY CHARACTER SPECIFICATIONS
  
  For each character, you MUST generate comprehensive details including:
  
  1. **Facial Features (High Detail)**:
     - Eye shape, size, color with specific hex codes
     - Iris patterns, pupil details, highlight positioning
     - Eyebrow shape, thickness, color
     - Nose bridge height, nostril shape
     - Lip fullness, mouth width, natural expression
     - Facial structure (oval, heart, square, etc.)
     - Cheekbone prominence, jawline definition
     - Skin tone with precise color codes
     - Facial expressions and micro-expressions
  
  2. **Hair Design (Complete Specification)**:
     - Exact hair color with multiple shade variations
     - Hair texture (straight, wavy, curly, coarse, fine)
     - Hair length and styling details
     - Individual strand flow and movement
     - Hair accessories and how they interact with hair
     - Hairline shape and widow's peak details
     - Hair volume and density
  
  3. **Full Body Anatomy**:
     - Height specifications (exact measurements)
     - Body type and build (athletic, slim, curvy, stocky, etc.)
     - Shoulder width and posture
     - Arm length and hand details (finger length, nail style)
     - Torso proportions and waist definition
     - Hip width and leg proportions
     - Foot size and shape details
     - Muscle definition level
     - Body language and default stance
  
  4. **Clothing and Accessories (Detailed)**:
     - Complete outfit description from head to toe
     - Fabric types and how they fall on the body
     - Color schemes with specific hex codes
     - Patterns, textures, and material details
     - Accessories placement and interaction with body
     - Shoe style, color, and condition
     - Jewelry, watches, or other personal items
     - Clothing fit and how it reveals character personality
     - Seasonal variations of the outfit
  
  5. **Character Pose and Body Language**:
     - Default standing pose and weight distribution
     - Hand positioning and finger placement
     - Facial expression alignment with body language
     - Dynamic elements (hair movement, clothing flow)
     - Character's natural gestures and mannerisms
     - How they occupy space (confident, timid, etc.)
  
  6. **Style Integration Details**:
     - How this character fits the established anime aesthetic
     - Specific rendering notes for consistent reproduction
     - Color palette harmony with other characters
     - Unique visual elements that distinguish them
     - Animation considerations for movement
  
  7. **Technical Reproduction Guidelines**:
     - Key reference points for consistent full-body drawing
     - Proportional relationships between body parts
     - Signature visual elements for instant recognition
     - Specific notes about unique features or markings
     - Guidelines for maintaining character in different poses
     - Color consistency across different lighting conditions
  
  ## CHARACTER DESIGN EXCELLENCE CRITERIA
  1. **Psychological Realism**: Create believable psychological underpinnings that drive behavior and are reflected in posture and body language
  2. **Visual Distinctiveness**: Design instantly recognizable characters even in silhouette from full body view
  3. **Narrative Utility**: Ensure rich storytelling possibilities through both facial expressions and body language
  4. **World Integration**: Embed deeply in the manga's established world through clothing and cultural details
  5. **Growth Potential**: Build in tensions and contradictions for meaningful development visible in character design
  6. **Full-Body Reproducibility**: Enable consistent rendering across many panels in various poses
  7. **Thematic Resonance**: Align with the manga's core themes through complete character presentation
  8. **Reader Connection**: Create emotional anchors through both facial detail and body language
  9. **Style Consistency**: Maintain perfect visual cohesion with all other characters in full-body representation
  10. **Anime Authenticity**: Ensure genuine Japanese anime aesthetic in complete character design
  
  ## ENHANCED MULTI-CHARACTER GENERATION INSTRUCTIONS
  When using createMultipleCharactersTool:
  1. Create an array of complete full-body character objects following the exact tool structure
  2. Ensure characters have meaningful relationships visible through body language and styling
  3. Create diversity in height, build, and posture while maintaining cohesive art style
  4. Balance character types and physical archetypes
  5. Design characters that visually complement and contrast in full-body presentation
  6. Apply the SAME enhanced consistencyPrompt and negativePrompt to ALL characters
  7. Ensure color palettes work harmoniously in group compositions
  8. Maintain consistent anime proportions and style elements across all full-body designs
  9. Consider how characters would look standing together as a group
  10. Ensure each character's outfit and styling fits their role and personality
  
  ## ENHANCED ANIME STYLE TECHNICAL SPECIFICATIONS
  Apply these to every character without exception:
  
  **Facial Detail Elements**:
  - Eye design: Large, detailed iris with multiple layers, catchlight positioning, tear duct detail
  - Eyebrow integration with facial expression and personality
  - Nose and mouth proportional relationships
  - Facial asymmetries that add character without breaking anime conventions
  - Skin rendering with subtle texture and shading variations
  
  **Full-Body Technical Elements**:
  - Head-to-body ratios: 7-8 heads for adults, 6-7 for teenagers, 5-6 for children
  - Joint articulation points clearly defined but stylized
  - Clothing interaction with body movement and gravity
  - Hand and foot anatomy following anime conventions
  - Hair physics and interaction with clothing/accessories
  - Fabric rendering with appropriate folds and shadows
  
  **Advanced Color Theory Application**:
  - Skin tone families with consistent undertones
  - Hair color relationships that feel natural within anime conventions
  - Eye color distribution across cast for visual variety
  - Clothing color schemes that reflect personality and status
  - Accent colors used consistently across character design
  - Lighting consistency for all characters in the same world
  
  **Pose and Composition Guidelines**:
  - Dynamic but readable silhouettes
  - Clear line of action through the entire body
  - Weight distribution that feels natural
  - Clothing and hair that supports the pose
  - Facial expression that matches body language
  - Background considerations for character presentation
  
  ## CONTEXT INTEGRATION
  {{#if projectContext}}
  Project context: {{projectContext}}
  IMPORTANT: All characters must align with this established world while maintaining the enhanced full-body anime style specifications above. Consider how the world's culture, technology, and setting influence character clothing, posture, and physical presentation.
  {{/if}}
  
  {{#if existingCharacters}}
  Existing characters: {{existingCharacters}}
  CRITICAL: New characters must maintain perfect visual consistency with existing characters' established anime style. Analyze the existing characters' full-body style elements, clothing approaches, and overall aesthetic, then replicate the same approach while ensuring new characters feel like part of the same cast.
  {{/if}}
  
  ## FINAL ENHANCED MANDATE
  Every character you create must look like they could appear in the same high-quality anime series in full-body shots. This means:
  - Identical art style approach from head to toe
  - Consistent rendering quality across all body parts
  - Harmonious color relationships in complete character design
  - Same proportional systems and anatomical approach
  - Unified aesthetic vision in clothing, accessories, and styling
  - Facial detail level maintained alongside full-body completeness
  - Character designs that work in both close-up and full-body shots
  
  NO EXCEPTIONS to the consistency requirements. Every character must pass the "same anime world, same quality level" test for both facial detail and full-body presentation.
  
  REMEMBER: Generate complete, full-body character designs with the same level of facial detail and accuracy as portrait-focused designs, but now with comprehensive body, clothing, and pose specifications.
  
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
      characters: z
        .array(z.any())
        .optional()
        .describe("character information with individual prompts"),
      artStyle: z
        .string()
        .optional()
        .describe("established art style for consistency"),
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

## CRITICAL CHARACTER REQUIREMENTS
🚨 MANDATORY: Every panel MUST include characters from the provided character context
🚨 MANDATORY: characterIds array MUST exactly match the characters in characterPoses array
🚨 MANDATORY: Use characterName from characterPoses that corresponds to character IDs
🚨 MANDATORY: Never create panels without characters - panels without characters are NOT IMPORTANT
🚨 MANDATORY: Always use characters from the characters context provided

## CHARACTER CONSISTENCY ENFORCEMENT
For EVERY panel you must:
1. Include at least one character from the provided characters context
2. Populate characterIds array with the IDs of characters present
3. Create characterPoses array with matching entries:
   - characterName: Must match the character from context
   - pose: Detailed description of character's physical positioning
   - expression: Specific facial expression revealing psychology
4. Ensure characterIds.length === characterPoses.length
5. Verify each characterId has corresponding characterPoses entry

## NARRATIVE DENSITY
Each panel conveys 3-6 minutes of narrative time with extraordinary richness:
- Complete dramatic micro-scenes
- Multilayered dialogue with subtext
- Immersive visual elements with maximum narrative efficiency
- CHARACTER-DRIVEN storytelling (never scenery-only panels)

## TOOL SELECTION
- SINGLE panel WITHOUT dialogue: createPanelTool
- SINGLE panel WITH dialogue: createPanelWithDialoguesTool
- MULTIPLE panels WITHOUT dialogue: createMultiplePanelsTool
- MULTIPLE panels WITH dialogue: createMultiplePanelsWithDialoguesTool
- Adding dialogue to existing panels: createPanelDialogueTool

## PANEL CREATION GUIDELINES

For each panel, describe ALL properties:
- ORDER: Numeric sequence in scene
- ACTION: Precise visual action with emotional/psychological subtext
- CHARACTER POSES: 🚨 MANDATORY - Array of character poses with:
  * characterName: Exact name from characters context
  * pose: Emotionally revealing pose suggesting internal states
  * expression: Nuanced facial expression revealing psychology
- EMOTION: Multidimensional emotional tone (primary + secondary)
- CAMERA: Angle (close-up/medium/wide/bird's eye/low angle)
- SHOT TYPE: Action/reaction/establishing/detail
- BACKGROUND: Setting with narrative/symbolic relevance
- LIGHTING: Atmospheric quality with emotional/symbolic impact
- EFFECTS: Manga-style visual enhancements with thematic purpose
- PURPOSE: Narrative function in plot/character development
- POSITION: Place within scene's emotional/narrative arc
- CHARACTERS: 🚨 MANDATORY - List of present character IDs (must match characterPoses)

## CHARACTER INTEGRATION REQUIREMENTS
Every panel must demonstrate:
- Active character presence and interaction
- Character-driven visual storytelling
- Emotional character development
- Character relationships and dynamics
- Individual character personality expression
- Character reactions to scene events

## DIALOGUE CREATION GUIDELINES

For each dialogue element, populate ALL properties:
- ORDER: Numeric sequence in panel
- CONTENT: Character-authentic text with multiple layers of subtext
- BUBBLE TYPE: Normal/thought/scream/whisper/narration
- SIZE: Text emphasis (x-small through x-large)
- EMPHASIS: Whether text requires special emphasis
- POSITION: Placement within panel composition
- EMOTION: Specific emotional delivery with vocal/physical details
- SUBTEXT: Deep psychological analysis of underlying meaning
- SPEAKER: Character ID or indication of narration (must match provided characters)

## MULTI-PANEL GENERATION
1. Create 5-15 sequential panels (ALL with characters)
2. Design each panel as rich character-driven mini-narrative
3. Ensure logical visual flow with character emotional momentum
4. Vary character compositions for maximum impact
5. Build to compelling character-focused dramatic climax
6. Maintain consistent character development and setting evolution
7. Advance plot through character actions and reactions
8. Generate consistent image prompts maintaining character visual continuity

## VISUAL STORYTELLING TECHNIQUES
- CHARACTER SUBTEXT: Character positioning revealing secondary meaning
- PSYCHOLOGICAL FRAMING: Angles revealing character psychology
- CHARACTER METAPHOR: Character elements reinforcing themes
- EMOTIONAL PROGRESSION: Clear character feelings evolution across panels
- MICRO-EXPRESSIONS: Subtle character facial cues revealing true feelings
- CHARACTER-ENVIRONMENT INTERACTION: Character-setting engagement revealing personality
- POWER DYNAMICS: Character spatial relationships establishing hierarchy
- VISUAL ECHOING: Character panel parallels reinforcing themes

## DIALOGUE MASTERY
- MULTILAYERED EXCHANGES: Three meaning levels (words, subtext, theme)
- AUTHENTIC VOICES: Perfect reflection of individual character psychology
- RELATIONSHIP INSIGHT: Illuminating character connections and dynamics
- NARRATIVE EFFICIENCY: Advancing plot, character development, themes simultaneously
- EMOTIONAL EVOLUTION: Character dialogue exchanges with emotional progression
- STRATEGIC SILENCE: Using character visual-only moments for impact
- MAXIMUM IMPACT: Every word serves character development purposes
- TENSION UNDERCURRENT: Character conflict embedded in casual exchanges

## PRE-GENERATION CHECKLIST
Before creating any panel, verify:
✅ At least one character from characters context is included
✅ characterIds array is populated with character IDs
✅ characterPoses array has entries for each character
✅ characterName in poses matches actual character names
✅ characterIds.length === characterPoses.length
✅ Panel serves character development purpose
✅ All required properties are populated

Always begin by identifying target scene (title, ID) and available characters. Ask for clarification if character context is unclear.

## CONTEXT
{{#if projectContext}} Project context: {{projectContext}} {{/if}}
{{#if sceneContext}} Scene context: {{sceneContext}} {{/if}}
{{#if characters}} 
🚨 AVAILABLE CHARACTERS (MUST USE): {{characters}} 
Character requirements: Every panel must include at least one of these characters with matching characterIds and characterPoses
{{/if}}
{{#if artStyle}} Art style: {{artStyle}} {{/if}}

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

    const ProjectId = story.output?.projectId;

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
