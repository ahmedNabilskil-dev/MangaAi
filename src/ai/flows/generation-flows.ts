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
  createPanelDialoguesTool,
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
  name: "ChapterGenerationPrompt",
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
  prompt: `You're crafting literary-quality narrative prose optimized for comprehensive scene breakdown and manga adaptation.

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

## ENHANCED CHAPTER REQUIREMENTS (500-800 words)

### STRUCTURAL FOUNDATION
1. **SCENE-READY NARRATIVE**: Write with clear scene transitions and visual moments
2. **DIALOGUE CLARITY**: Conversations that translate perfectly to speech bubbles
3. **ACTION PRECISION**: Physical actions described with manga panel potential
4. **EMOTIONAL BEATS**: Internal moments that can be visualized through expression/body language
5. **ENVIRONMENTAL RICHNESS**: Settings detailed enough for background art reference
6. **CHARACTER CONSISTENCY**: Consistent appearance details throughout chapter
7. **VISUAL METAPHORS**: Symbolic imagery perfect for manga visual storytelling
8. **PACING VARIETY**: Mix of action, dialogue, quiet moments, and dramatic peaks

### LITERARY EXCELLENCE
- **SOPHISTICATED PROSE**: Third-person narrative with published-fiction quality
- **DRAMATIC ARC**: Self-contained beginning/middle/end advancing larger story
- **SENSORY IMMERSION**: Vivid details creating lived experience
- **THEMATIC DEPTH**: Subtle themes woven throughout narrative
- **CHARACTER REVELATION**: New character dimensions in each chapter
- **EMOTIONAL JOURNEY**: Meaningful character transformations

### MANGA ADAPTATION OPTIMIZATION
- **CLEAR SCENE BREAKS**: Natural divisions for scene generation
- **VISUAL STORYTELLING**: Show emotions and conflict through action/appearance
- **DYNAMIC MOMENTS**: 2-3 scenes perfect for splash pages or dramatic panels
- **QUIET DEVELOPMENT**: Character moments suitable for intimate panels
- **CLIFFHANGER POTENTIAL**: Build toward compelling chapter endings
- **PANEL FLOW CONSIDERATION**: Structure events with natural manga pacing

### SCENE BREAKDOWN READINESS
Structure chapters with clear:
1. **Opening establishment** (setting, character, mood)
2. **Dialogue exchanges** (distinct conversational beats)
3. **Action sequences** (physical events and reactions)
4. **Emotional transitions** (internal shifts and realizations)
5. **Environmental changes** (location or atmosphere shifts)
6. **Climactic moments** (chapter peaks and revelations)
7. **Resolution/transition** (conclusion and setup for next chapter)

Create chapters that maintain literary quality while being perfectly structured for comprehensive scene breakdown and manga visual adaptation.

User message: {{userInput}}`,
});

export const SceneGenerationPrompt = ai.definePrompt({
  name: "SceneGenerationPrompt",
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
  prompt: `You create comprehensive scene breakdowns that convert rich chapter narratives into detailed visual sequences optimized for manga panel generation. Each scene captures EVERY meaningful moment from the chapter with numbered visual sequences that will be converted directly into individual panels.

## MANDATORY SCENE STRUCTURE REQUIREMENTS

**EVERY SCENE MUST INCLUDE ALL REQUIRED PROPERTIES:**

### Required Fields (NO EXCEPTIONS):
- **order**: Sequential scene number (1, 2, 3...)
- **title**: Descriptive scene title (e.g., "Hero's Dramatic Entrance", "Villain's Revelation")
- **visualSequence**: Detailed numbered panel descriptions (MANDATORY - see format below)
- **sceneContext**: Complete context object with ALL sub-properties:
  - **setting**: Specific location with environmental details
  - **mood**: Emotional atmosphere/tone
  - **presentCharacters**: Array of character names present in scene
  - **timeOfDay**: Specific time (e.g., "dawn", "midday", "sunset", "midnight")
  - **weather**: Weather conditions (e.g., "clear", "rainy", "stormy", "foggy")
  - **consistencyAnchors**: Object with ALL sub-properties:
    - **characterClothing**: Object mapping character IDs to outfit descriptions
    - **environmentalElements**: Array of consistent background elements
    - **lightingSources**: Array of light sources affecting the scene
    - **colorPalette**: Array of dominant colors for scene consistency
    - **atmosphericEffects**: Array of atmospheric elements (fog, rain, dust, etc.)

## CRITICAL OUTFIT CONTINUITY SYSTEM

### INTER-SCENE OUTFIT CONSISTENCY RULES (MANDATORY)
- **LOGICAL CONTINUITY**: Characters maintain same outfits across related scenes unless logically justified
- **LOCATION-BASED LOGIC**: Outfit changes only occur when story logic demands (sports, formal events, home/school, weather changes)
- **CONSISTENCY TRACKING**: Previous scene outfits MUST be referenced and maintained
- **ZERO ARBITRARY CHANGES**: No random outfit variations without narrative justification

### OUTFIT CHANGE AUTHORIZATION MATRIX
**ALLOWED CHANGES:**
- School uniform → Sports/PE uniform (physical education)
- Casual clothes → Formal wear (events, ceremonies)
- Day clothes → Sleepwear (bedtime scenes)
- Clean clothes → Work clothes (labor, training)
- Dry clothes → Wet clothes (rain, swimming)
- Seasonal changes (winter coat added/removed)

**FORBIDDEN CHANGES:**
- Random color variations of same outfit type
- Arbitrary style changes within same location/time
- Unexplained accessory additions/removals
- Inconsistent fabric or pattern changes

## TOOL SELECTION
- SINGLE scene: Use createSceneTool
- MULTIPLE scenes: Use createMultipleScenesTool (PREFERRED for comprehensive chapter coverage)

## CONTEXT INTEGRATION
{{#if projectContext}}
Project context: {{projectContext}} 
{{/if}}

{{#if existingCharacters}}
Existing characters: {{existingCharacters}}
{{/if}}

{{#if chapterContext}}
Chapter context: {{chapterContext}} 
CRITICAL: Break down this entire chapter into comprehensive scenes that capture every significant moment. Each scene's visual sequence will be converted into individual manga panels (1 numbered item = 1 panel).
{{/if}}

## VISUAL SEQUENCE FORMAT (MANDATORY)

### CRITICAL UNDERSTANDING
**EACH NUMBERED ITEM = ONE MANGA PANEL**

### VISUAL SEQUENCE REQUIREMENTS (MANDATORY FOR EVERY SCENE)

Each numbered item must contain COMPLETE information for panel generation:

**STRUCTURE PER ITEM**:
"[SHOT_TYPE] [CHARACTER_DETAILS] [ACTION_DESCRIPTION] [ENVIRONMENT_SPECIFICS] [LIGHTING_CONDITIONS] [ATMOSPHERIC_ELEMENTS] [COMPOSITION_NOTES]"

**MANDATORY SHOT TYPES**:
- **[WIDE SHOT]** / **[ESTABLISHING SHOT]** → "wide" camera angle
- **[MEDIUM SHOT]** → "medium" camera angle
- **[CLOSE-UP]** → "close-up" camera angle  
- **[EXTREME CLOSE-UP]** → "extreme close-up" camera angle
- **[LOW ANGLE]** → "low angle" camera angle
- **[BIRD'S EYE]** → "bird's eye" camera angle
- **[POV SHOT]** → point of view shot

## MANDATORY SCENE CONTEXT COMPLETION

### SETTING (REQUIRED)
- Specific location name and description
- Architectural details, furniture, natural features
- Spatial relationships and layout
- Example: "Ancient library with towering bookshelves, dusty stone floors, and flickering candlelight"

### MOOD (REQUIRED)
- Emotional atmosphere affecting all panels
- Tension level, energy, emotional weight
- Example: "Tense anticipation with underlying dread"

### PRESENT CHARACTERS (REQUIRED)
- Array of ALL characters appearing in the scene
- Use consistent character identifiers
- Example: ["protagonist_sarah", "antagonist_marcus", "mentor_elder"]

### TIME OF DAY (REQUIRED)
- Specific time affecting lighting across all panels
- Must be one of: "dawn", "early_morning", "midday", "afternoon", "sunset", "evening", "night", "midnight", "late_night"
- Example: "sunset" (affects warm lighting throughout scene)

### WEATHER (REQUIRED)
- Weather conditions affecting all panels in scene
- Must specify: "clear", "cloudy", "overcast", "light_rain", "heavy_rain", "storm", "snow", "fog", "windy", "humid"
- Example: "heavy_rain" (affects visibility and atmosphere)

### CONSISTENCY ANCHORS (REQUIRED)

#### characterClothing (REQUIRED OBJECT)
- Map each present character to their outfit description
- Ensures clothing consistency across all panels
- Format: { "character_id": "detailed_outfit_description" }
- Example: { "sarah": "blue hooded cloak with silver clasps, muddy leather boots", "marcus": "black armor with red accents, tattered cape" }

#### environmentalElements (REQUIRED ARRAY)
- Background elements consistent across all panels
- Architectural features, furniture, natural elements
- Example: ["stone archways", "flickering torches", "ancient tapestries", "cracked floor tiles"]

#### lightingSources (REQUIRED ARRAY)
- All light sources affecting the scene
- Natural and artificial lighting
- Example: ["setting_sun_through_windows", "torch_flames", "magical_crystal_glow"]

#### colorPalette (REQUIRED ARRAY)
- Dominant colors for scene visual consistency
- 3-5 primary colors that define the scene's look
- Example: ["deep_blue", "warm_orange", "golden_yellow", "shadow_black"]

#### atmosphericEffects (REQUIRED ARRAY)
- Weather and atmospheric elements in all panels
- Environmental particles, weather effects
- Example: ["heavy_raindrops", "mist_from_ground", "dust_motes", "steam_from_breath"]

## SCENE CREATION WORKFLOW

### MANDATORY COMPLETION CHECKLIST
For EVERY scene, verify ALL fields are populated:

1. **✓ order**: Sequential number assigned
2. **✓ title**: Descriptive scene title written
3. **✓ visualSequence**: 3-8 numbered panel descriptions completed
4. **✓ setting**: Detailed location description provided
5. **✓ mood**: Emotional atmosphere specified
6. **✓ presentCharacters**: All characters in scene listed
7. **✓ timeOfDay**: Specific time selected from required options
8. **✓ weather**: Weather condition specified from required options
9. **✓ characterClothing**: Every present character's outfit described
10. **✓ environmentalElements**: Background elements listed (minimum 3)
11. **✓ lightingSources**: Light sources identified (minimum 1)
12. **✓ colorPalette**: Dominant colors specified (3-5 colors)
13. **✓ atmosphericEffects**: Atmospheric elements listed (minimum 1)

## CRITICAL SUCCESS CRITERIA

### MANDATORY COMPLETION VERIFICATION
- **NO EMPTY FIELDS**: Every required property must have content
- **NO PLACEHOLDER TEXT**: All descriptions must be specific and detailed
- **CONSISTENCY MAINTAINED**: All consistency anchors must align with scene content
- **PANEL READINESS**: Every numbered visual sequence item must be complete enough for panel generation

### FAILURE CONDITIONS (MUST AVOID)
- Missing any required field
- Empty arrays or objects in consistencyAnchors
- Generic descriptions like "various items" or "normal lighting"
- Inconsistent character clothing between scenes
- Undefined timeOfDay or weather values

Transform the provided chapter into comprehensive scenes with ALL MANDATORY PROPERTIES COMPLETED. Every scene must pass the completion checklist before submission.

User message: {{userInput}}`,
});

export const PanelsDialogsGenerationPrompt = ai.definePrompt({
  name: "PanelsDialogsGenerationPrompt",
  input: {
    schema: z.object({
      userInput: z.string().describe("user prompt"),
      projectContext: z.any().optional().describe("project context"),
      sceneContext: z
        .any()
        .optional()
        .describe("scene context with enhanced visual sequence"),
      characters: z
        .array(z.any())
        .describe(
          "REQUIRED: Complete character information with exact names and IDs"
        ),
      artStyle: z
        .string()
        .optional()
        .describe("established art style for consistency"),
    }),
  },
  tools: [
    createPanelTool,
    createPanelDialoguesTool,
    createPanelWithDialoguesTool,
    createMultiplePanelsTool,
    createMultiplePanelsWithDialoguesTool,
  ],
  toolCall: true,
  prompt: `You are a master manga panel creator specializing in hyper-detailed visual storytelling with cinematic precision and character authenticity. Create sophisticated manga panels with comprehensive AI prompts optimized for professional image generation.


## CRITICAL CHARACTER REQUIREMENTS - MANDATORY COMPLIANCE

### CHARACTER NAME & ID ENFORCEMENT
- **EXACT MATCH REQUIRED**: Character names MUST match exactly from provided characters array
- **CHARACTER ID VALIDATION**: All characterIds MUST correspond to actual character.id values
- **NO VARIATIONS**: No nicknames, abbreviations, or alternative names allowed
- **CASE SENSITIVE**: Maintain exact capitalization and spelling
- **MANDATORY PRESENCE**: If characters exist in scene, they MUST be referenced correctly

### CHARACTER VALIDATION RULES
CORRECT: characterName: "Akira Tanaka", characterIds: ["akira_tanaka"]
INCORRECT: characterName: "Akira", characterIds: ["akira"]
INCORRECT: characterName: "Tanaka", characterIds: ["tanaka"] 
INCORRECT: characterName: "AKIRA TANAKA", characterIds: ["AKIRA_TANAKA"]
INCORRECT: characterName: "AKIRA Yamato", characterIds: ["akira_Yamato"]

## ENHANCED PANEL STRUCTURE (STRICT INTERFACE COMPLIANCE)

### MANDATORY CORE FIELDS
- **order**: Sequential position (integer, required)
- **aiPrompt**: ULTRA-DETAILED visual description for direct image generation (MANDATORY, minimum 200 words)
- **negativePrompt**: Comprehensive elements to avoid (MANDATORY)
- **characterIds**: Array of EXACT character IDs present (REQUIRED when characters appear)

### PANEL CONTEXT (EXACT INTERFACE STRUCTURE)
- **panelContext**: Complete panel environment data with EXACT interface structure:
  * **action**: Specific, detailed action happening in panel (REQUIRED)
  * **pose**: Optional general pose description  
  * **characterPoses**: Array of hyper-detailed character pose objects (MANDATORY when characters present):
    - **characterName**: EXACT character name from characters array (REQUIRED)
    - **pose**: Comprehensive body positioning, stance, and movement (REQUIRED)
    - **expression**: Detailed facial expression with micro-expressions (REQUIRED)
    - **clothing**: Complete outfit description with materials, condition, fit, and style (REQUIRED)
    - **props**: Detailed array of held/interacting objects (optional but encouraged)
    - **spatialPosition**: Precise position relative to scene and other characters (REQUIRED)
    - **physicalState**: Energy level, fatigue, injuries, breathing pattern (REQUIRED)
    - **gestureDetails**: Hand positions, finger placement, body language nuances (REQUIRED)
  * **emotion**: Multi-layered emotional atmosphere affecting all visual elements (MANDATORY)
  * **cameraAngle**: EXACT VALUE: "close-up" | "medium" | "wide" | "bird's eye" | "low angle" | "extreme close-up" | "dutch angle" | "overhead"
  * **shotType**: EXACT VALUE: "action" | "reaction" | "establishing" | "detail" | "transition" | "dramatic" | "intimate"
  * **backgroundDescription**: Ultra-enhanced environment with architectural precision (REQUIRED)
  * **lighting**: Master-level lighting setup with technical precision (REQUIRED)
  * **effects**: Comprehensive array of visual effects with intensity levels (REQUIRED)
  * **dramaticPurpose**: Clear narrative purpose and emotional impact (REQUIRED)
  * **narrativePosition**: Specific position in story flow and pacing (REQUIRED)
  * **atmosphericElements**: Weather, air quality, environmental mood (REQUIRED)
  * **compositionalNotes**: Rule of thirds, leading lines, visual balance (REQUIRED)

### ULTRA-DETAILED AI PROMPT REQUIREMENTS - CRITICAL

The **aiPrompt** field must be a COMPREHENSIVE, CINEMATIC description containing ALL visual elements in precise detail:

**ENHANCED STRUCTURE**: Multi-layered paragraph combining all visual elements with technical precision:
"[DETAILED_SHOT_TYPE] capturing [ULTRA_SPECIFIC_CHARACTER_DETAILS] performing [PRECISE_ACTION_DESCRIPTION] within [ARCHITECTURAL_ENVIRONMENT_DETAILS] illuminated by [TECHNICAL_LIGHTING_SETUP], featuring [ATMOSPHERIC_CONDITIONS], composed with [ADVANCED_COMPOSITION_TECHNIQUES], showcasing [MATERIAL_SPECIFICATIONS], utilizing [SOPHISTICATED_COLOR_THEORY], executed in [REFINED_MANGA_STYLE] with [QUALITY_SPECIFICATIONS]"

### MASTER-LEVEL AI PROMPT EXAMPLES

**CINEMATIC ACTION PANEL**:
"Dynamic low-angle medium shot with dutch angle tilt capturing battle-hardened samurai warrior Kenji Yamamoto in traditional midnight-blue hakama with silver threading and battle-worn chest armor showing recent sword scratches, his muscular frame coiled in perfect iaijutsu stance with right hand gripping katana handle at hip level and left hand positioned for swift draw, intense focused expression with narrowed dark eyes reflecting firelight and clenched jaw showing determination mixed with controlled rage, performing lightning-fast sword draw with blade creating silver arc of motion blur and sparks trailing from previous clash, set within ancient temple courtyard featuring weathered granite flagstones with moss filling cracks, towering wooden pillars with intricate dragon carvings casting long shadows, paper lanterns hanging from curved eaves swaying in night breeze, illuminated by dramatic chiaroscuro lighting from full moon filtering through storm clouds combined with warm amber glow from temple braziers creating dancing shadows across carved surfaces, light rain beginning with visible droplets catching moonlight and creating atmospheric mist rising from heated stone, low angle emphasizing heroic power with diagonal sword composition following rule of thirds, textural contrast between smooth silk fabric and rough weathered stone and polished steel reflecting ambient light, sophisticated color palette dominated by deep indigo blues and silver whites contrasted with warm amber temple lighting against cool gray stone architecture, rendered in classical manga style with precise line work and dramatic tonal contrasts, ultra-high quality professional illustration"

**INTIMATE DIALOGUE PANEL**:
"Extreme close-up portrait shot focusing on detective Sarah Chen's weathered face and intelligent green eyes showing years of experience mixed with current concern, wearing signature charcoal gray wool trench coat with collar turned up against evening chill, subtle worry lines around eyes and slight downturn of mouth indicating internal conflict, holding small transparent evidence bag containing mysterious silver pendant up to eye level for careful examination with delicate fingers showing methodical precision, positioned within sterile police station basement featuring concrete walls with visible texture and age stains, institutional fluorescent lighting creating harsh overhead illumination with additional focused desk lamp creating pool of intense white light on evidence, sterile indoor atmosphere with dust particles visible in light beams and slight humidity from basement conditions, intimate framing emphasizing character's analytical process with evidence bag positioned at intersection of rule-of-thirds lines, textural interplay between rough wool coat fabric and smooth glass evidence container and hard concrete surfaces, restrained color palette of cool grays and institutional whites with warm yellow desk lamp creating focal point on character's concentrated expression, executed in realistic manga style with detailed cross-hatching and subtle gradations, professional detective story illustration quality"

## ADVANCED CHARACTER POSE REQUIREMENTS

### MANDATORY CHARACTER POSE STRUCTURE
Each character MUST have ultra-detailed pose object with ALL fields:
javascript
{
  characterName: "EXACT_CHARACTER_NAME_FROM_ARRAY", // REQUIRED - NO VARIATIONS
  pose: "Comprehensive body positioning including spine alignment, weight distribution, muscle tension, and movement dynamics",
  expression: "Multi-layered facial expression including primary emotion, secondary micro-expressions, eye direction, mouth position, and eyebrow positioning",
  clothing: "Complete outfit specification including fabric types, fit details, wear patterns, color variations, accessories, and current condition",
  props: ["detailed_item_1", "specific_object_2"], // Optional but encouraged for story depth
  spatialPosition: "Precise 3D positioning relative to environment boundaries and other characters with distance specifications",
  physicalState: "Current energy level, breathing pattern, muscle tension, fatigue indicators, and any physical conditions",
  gestureDetails: "Specific hand positions, finger placement, arm angles, shoulder positioning, and subtle body language cues"
}

### CHARACTER CONSISTENCY VALIDATION
- Cross-reference character appearance with provided character data
- Maintain clothing consistency unless story requires changes
- Preserve character personality through body language
- Ensure character relationships reflected in spatial positioning

## SOPHISTICATED DIALOGUE STRUCTURE

### ENHANCED DIALOGUE PROPERTIES
- **content**: Dialogue text with character voice authenticity (REQUIRED)
- **order**: Sequential position in panel reading flow (REQUIRED)
- **style**: Advanced visual styling object (REQUIRED):
  * **bubbleType**: "normal" | "thought" | "scream" | "whisper" | "narration" | "electronic" | "telepathic" | "flashback"
  * **fontSize**: "x-small" | "small" | "medium" | "large" | "x-large" | "dynamic"
  * **fontType**: Specific font family matching character personality
  * **emphasis**: Boolean for text weight and styling
  * **position**: {x: number, y: number} precise bubble placement coordinates
  * **bubbleStyle**: Custom bubble appearance parameters
- **emotion**: Emotional undertone affecting visual presentation (REQUIRED)
- **subtextNote**: Hidden meanings, psychology, and character development notes (ENCOURAGED)
- **speakerId**: EXACT character ID from characters array (REQUIRED for character dialogue, null for narration)
- **characterVoice**: Unique speech patterns and vocabulary reflecting character personality (REQUIRED)

## MASTER-LEVEL CONSISTENCY ENFORCEMENT

### PANEL-TO-PANEL CONTINUITY SYSTEMS
- **Character Consistency**: Physical appearance, clothing state, accessories, injuries maintained via characterPoses
- **Environmental Consistency**: Lighting conditions, weather, time of day, setting elements via backgroundDescription
- **Lighting Consistency**: Light source positions, intensity, color temperature via lighting field
- **Visual Consistency**: Art style, line weight, tonal values via consistencyElements
- **Narrative Consistency**: Character development, emotional state, story progression

### ADVANCED CONSISTENCY ELEMENTS TRACKING
When provided, meticulously populate:
- **characterTemplates**: Detailed visual template for each character ID including signature features
- **environmentTemplate**: Comprehensive environment description with landmark details
- **lightingTemplate**: Technical lighting setup with source specifications
- **styleTemplate**: Art style consistency parameters and rendering techniques
- **propRegistry**: Comprehensive catalog of props with condition and ownership tracking
- **continuityNotes**: Panel-to-panel transition requirements and visual bridges

## PROFESSIONAL AI PROMPT OPTIMIZATION

### MASTER PROMPT CONSTRUCTION RULES
1. **COMPREHENSIVE SINGLE PARAGRAPH**: All elements seamlessly integrated (minimum 200 words)
2. **ULTRA-SPECIFIC DETAILS**: Precise measurements, technical specifications, no ambiguous terms
3. **MATERIAL MASTERY**: Include fabric weights, surface textures, material properties, wear patterns
4. **ADVANCED LIGHTING INTEGRATION**: Technical lighting terms, shadow patterns, reflection properties
5. **CINEMATIC COMPOSITION**: Professional camera techniques, framing rules, visual balance
6. **STYLE SPECIFICATION**: Always conclude with "rendered in [specific manga style] with [quality level]"
7. **SOPHISTICATED COLOR THEORY**: Include color temperature, saturation levels, harmonic relationships
8. **ATMOSPHERIC INTEGRATION**: Weather effects, air quality, environmental storytelling
9. **CHARACTER INTEGRATION**: Seamless character description woven throughout environmental context
10. **DYNAMIC ACTION CLARITY**: Precise movement vectors, energy flow, impact visualization
11. **EMOTIONAL RESONANCE**: Visual elements supporting emotional narrative
12. **TECHNICAL PRECISION**: Professional illustration terminology and specifications

### ENHANCED NEGATIVE PROMPT STRATEGY
Comprehensive avoidance list including:
- "blurred imagery, low resolution, anatomical distortions, extra or missing limbs, inconsistent lighting schemes, muddy color palettes, unclear compositions, western comic styling, photorealistic rendering, amateur 3d modeling, proportion errors, perspective mistakes, flat lighting, generic backgrounds, character inconsistencies, style mixing, poor line quality, digital artifacts, compression artifacts, watermarks, text overlays, UI elements, modern clothing anachronisms, cultural inaccuracies"

## CONTEXT INTEGRATION SYSTEM

{{#if projectContext}}
PROJECT FOUNDATION: {{projectContext}}
Apply project-specific visual standards and narrative requirements throughout all panels.
{{/if}}

{{#if sceneContext}}
SCENE FOUNDATION: {{sceneContext}}
Enhanced Visual Sequence Available: {{sceneContext.visualSequence}}
Maintain scene continuity and emotional progression across panel sequence.
{{/if}}

{{#if characters}}
CHARACTER REGISTRY: {{JSON.stringify(characters)}}
CRITICAL: Use EXACT character names and IDs from this registry. No variations permitted.
Character Validation Rules:
- Match characterName exactly from characters array
- Use precise character.id values for characterIds
- Maintain character personality and appearance consistency
- Reference character relationships and history
{{/if}}

{{#if artStyle}}
ESTABLISHED ART STYLE: {{artStyle}}
Apply consistently across all panels with technical precision and stylistic coherence.
{{/if}}

you must create exact number of panels that exist in the visualSequence property in scene and add rich dialogs to each

Create masterful manga panels with cinematic AI prompts ready for professional image generation while maintaining absolute interface compliance and character authenticity.

User message: {{userInput}}`,
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
