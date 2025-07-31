import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodSchemaToMcpSchema } from "./utils/schema-converter.js";

// Import tool handlers
import {
  createChapterHandler,
  createCharacterHandler,
  createLocationTemplateHandler,
  createOutfitTemplateHandler,
  createPanelHandler,
  createProjectHandler,
  createSceneHandler,
} from "./tools/creation-tools.js";

import {
  deleteChapterHandler,
  deleteCharacterHandler,
  deleteLocationTemplateHandler,
  deleteOutfitTemplateHandler,
  deletePanelHandler,
  deleteProjectHandler,
  deleteSceneHandler,
} from "./tools/delete-tools.js";

import {
  getChapterHandler,
  getCharacterHandler,
  getLocationTemplateHandler,
  getOutfitTemplateHandler,
  getPanelHandler,
  getProjectHandler,
  getSceneHandler,
  listLocationTemplatesHandler,
  listOutfitTemplatesHandler,
  listProjectsHandler,
} from "./tools/fetch-tools.js";

import {
  updateChapterHandler,
  updateCharacterHandler,
  updateLocationTemplateHandler,
  updateOutfitTemplateHandler,
  updatePanelHandler,
  updateProjectHandler,
  updateSceneHandler,
} from "./tools/update-tools.js";

// Import schemas
import { z } from "zod";
import {
  chapterSchema,
  characterSchema,
  locationTemplateSchema,
  mangaProjectSchema,
  outfitTemplateSchema,
  panelSchema,
  sceneSchema,
} from "../types/schemas.js";
import { mangaCreationPrompts } from "./prompts/manga-prompts.js";
import {
  getChapterResourceHandler,
  getCharacterResourceHandler,
  getLocationTemplateResourceHandler,
  getOutfitTemplateResourceHandler,
  getPanelResourceHandler,
  getProjectResourceHandler,
  getSceneResourceHandler,
  listLocationTemplatesResourceHandler,
  listOutfitTemplatesResourceHandler,
  listProjectsResourceHandler,
} from "./resources/manga-resources.js";

export abstract class BaseMangaAiMcpServer {
  protected server: Server;
  protected sessionState: {
    currentProjectId?: string;
    projectName?: string;
  } = {};

  constructor() {
    this.server = new Server(
      {
        name: "manga-ai-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // ===== SESSION MANAGEMENT TOOLS =====
          {
            name: "setCurrentProject",
            description: `Sets the active manga project for your current session - the foundation for all manga creation work.

This tool establishes your working context by selecting which manga project you want to work on. Once set, all subsequent character creation, chapter writing, scene building, and panel design will automatically be associated with this project.

Think of this as "opening" your manga project workspace. You must set a current project before creating any content.

When to use this tool:
- Starting work on a specific manga project
- Switching between different manga projects
- Before creating any characters, chapters, scenes, or panels
- When you want to work on a particular story

Key features:
- Automatically validates the project exists
- Sets up session context for all subsequent operations  
- Eliminates need to specify project ID in every operation
- Enables streamlined workflow for content creation

What happens after setting:
- All create operations (characters, chapters, scenes) will use this project
- You can immediately start creating content without specifying project IDs
- The system will remember your choice throughout the session`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z
                  .string()
                  .describe(
                    "Unique identifier of the manga project you want to work on. Use listProjects to see available projects."
                  ),
              })
            ),
          },

          {
            name: "getCurrentProject",
            description: `Retrieves detailed information about your currently active manga project session.

This tool shows you which manga project is currently set as your working context, along with all its details like title, genre, characters, chapters, and creation progress.

Use this when you want to:
- Check which project you're currently working on
- See the full overview of your active project
- Review project details before creating new content
- Verify your session context is correct

The response includes:
- Project metadata (title, description, genre, art style)
- Current project status and progress
- List of existing characters, chapters, and scenes
- Creation timestamps and project statistics

If no project is set, this will let you know you need to use setCurrentProject first.`,
            inputSchema: zodSchemaToMcpSchema(z.object({})),
          },

          {
            name: "clearCurrentProject",
            description: `Clears your current project session, returning to a neutral state.

This tool removes the active project from your session context. After clearing, you'll need to set a new current project before creating any content.

Use this when:
- Finished working on a project
- Want to switch to a different project
- Need to reset your session context
- Cleaning up your workspace

After clearing, you'll need to use setCurrentProject again to resume content creation work.`,
            inputSchema: zodSchemaToMcpSchema(z.object({})),
          },

          // ===== PROJECT CREATION TOOLS =====
          {
            name: "createProject",
            description: `Creates a brand new manga project from scratch and automatically sets it as your current working project.

This is your starting point for any new manga creation. The tool takes your core concept and builds a complete project structure with world-building details, themes, plot structure, and metadata.

Perfect for when you have:
- A new story idea you want to develop
- Characters or world concepts you want to explore
- A genre or theme you want to work with
- An artistic vision you want to bring to life

What this tool creates:
- Complete project metadata (title, description, genre targeting)
- Rich world-building foundation (history, society, unique systems)
- Thematic framework (themes, motifs, symbols)
- Basic plot structure (inciting incident, twists, climax, resolution)
- Art style guidelines for consistent visual development
- Searchable tags for organization

The tool automatically becomes your current project, so you can immediately start creating characters and chapters.

Best practices:
- Provide a clear, inspiring concept as your foundation
- Consider your target audience for appropriate content development
- Think about the visual style you want to achieve`,
            inputSchema: zodSchemaToMcpSchema(
              mangaProjectSchema.omit({
                id: true,
                chapters: true,
                characters: true,
                outfitTemplates: true,
                locationTemplates: true,
                coverImageUrl: true,
                status: true,
                tags: true,
                creatorId: true,
                createdAt: true,
                updatedAt: true,
                likeCount: true,
                viewCount: true,
                published: true,
                messages: true,
              })
            ),
          },

          // ===== CHARACTER CREATION TOOLS =====
          {
            name: "createCharacter",
            description: `Creates psychologically complex, visually distinctive full-body anime/manga characters with perfect consistency across all appearances.

## FULL-BODY VISUAL CONSISTENCY MANDATE
ALL characters MUST follow these EXACT specifications to ensure they belong to the same anime world:

### CORE ART STYLE SPECIFICATIONS
- **Art Style**: Modern Japanese anime/manga style, specifically reminiscent of high-quality seasonal anime productions
- **Line Art**: Clean, precise lineart with consistent 2-3px weight for outlines, 1-2px for details
- **Shading Style**: Cel shading with soft gradients, anime-style rim lighting, consistent light source positioning
- **Color Saturation**: Vibrant but harmonious colors, avoiding oversaturation
- **Eye Style**: Large, expressive anime eyes with detailed iris patterns, consistent highlight placement
- **Body Proportions**: Standard anime proportions - slightly larger heads, elongated limbs, expressive hands
- **Full Body Composition**: Complete character from head to toe, dynamic pose, detailed anatomy

### REQUIRED CONSISTENCY PROMPTS
Every character MUST include these EXACT prompts:

**consistencyPrompt**: 
"full body anime character, high quality anime art, complete character design head to toe, clean lineart, cel shading, vibrant colors, detailed anime eyes with highlights, expressive facial features, modern anime aesthetic, professional anime production quality, cohesive character design, anime proportions, soft anime shading, detailed hair rendering with individual strands, anime facial features with precise detail, full body pose, detailed clothing and accessories, anatomically correct anime style, dynamic character stance, detailed hands and feet, fabric texture details, consistent art style throughout, full character reference sheet quality"

**negativePrompt**: 
"realistic, photorealistic, 3D render, western cartoon, chibi, deformed, ugly, blurry, low quality, bad anatomy, extra limbs, mutation, disfigured, bad proportions, watermark, signature, text, inconsistent style, mixed art styles, sketchy lines, rough artwork, amateur drawing, poorly drawn, distorted features, cropped, partial body, headshot only, face only, missing limbs, incomplete character, bad hands, malformed hands, extra fingers, missing fingers, floating limbs, disconnected body parts"

### DETAILED CHARACTER SPECIFICATION REQUIREMENTS

#### 1. FACIAL FEATURES (High Detail Mandatory)
- **Eye Design**: Shape, size, color with specific hex codes (#RRGGBB format)
- **Iris Details**: Patterns, pupil shape, highlight positioning, catchlight placement
- **Eyebrow Specification**: Shape, thickness, color matching or complementing hair
- **Nose Structure**: Bridge height, nostril shape, overall proportions
- **Mouth Design**: Lip fullness, mouth width, natural resting expression
- **Facial Structure**: Shape (oval, heart, square, round, diamond), cheekbone prominence, jawline definition
- **Skin Tone**: Precise hex color codes with undertone specification
- **Expression Range**: Default expression and micro-expression capabilities

#### 2. HAIR DESIGN (Complete Specification)
- **Color Palette**: Exact hair color with multiple shade variations (base, highlights, shadows) in hex codes
- **Texture Properties**: Type (straight, wavy, curly), density (thick, medium, fine), coarseness
- **Length and Style**: Detailed cut description, layering, styling approach
- **Movement Physics**: How hair flows, responds to movement, natural fall patterns
- **Accessories Integration**: How hair accessories interact with hair physics
- **Hairline Details**: Shape, widow's peak presence, temple characteristics
- **Volume and Density**: Overall fullness, how it frames the face

#### 3. FULL BODY ANATOMY (Comprehensive)
- **Height Specifications**: Exact measurements in both metric and imperial
- **Body Type Classification**: Athletic, slim, curvy, stocky, lanky, muscular with specific details
- **Posture Analysis**: Shoulder positioning, spine curvature, natural stance
- **Arm Proportions**: Length relative to torso, hand size, finger characteristics
- **Torso Details**: Shoulder width, waist definition, hip measurements
- **Leg Proportions**: Thigh-to-calf ratio, overall leg length, foot size and shape
- **Muscle Definition**: Level of visible musculature, body fat distribution
- **Natural Movement**: Default body language, weight distribution, spatial presence

#### 4. CLOTHING AND ACCESSORIES (Detailed)
- **Complete Outfit Description**: Every piece from head to toe with specific details
- **Fabric Analysis**: Material types, weight, how they interact with body movement
- **Color Coordination**: Full color scheme with hex codes for each clothing element
- **Pattern and Texture**: Detailed description of any patterns, textures, surface treatments
- **Accessory Integration**: How accessories interact with body and clothing
- **Footwear Specification**: Style, color, condition, practical details
- **Personal Items**: Jewelry, bags, watches, or signature accessories
- **Fit Philosophy**: How clothing fits reveals personality and status
- **Seasonal Adaptability**: How outfit varies with different contexts

#### 5. CHARACTER POSE AND BODY LANGUAGE
- **Default Stance**: Natural standing position, weight distribution
- **Hand Positioning**: Finger placement, arm positioning, gesture tendencies
- **Facial-Body Alignment**: How facial expression matches body language
- **Dynamic Elements**: Hair movement, clothing flow, accessory behavior
- **Signature Mannerisms**: Unconscious gestures, movement patterns
- **Spatial Relationship**: How they occupy and interact with space
- **Emotional Expression**: How different emotions manifest in posture

#### 6. STYLE INTEGRATION SPECIFICATIONS
- **Aesthetic Harmony**: How character fits established anime visual style
- **Reproduction Guidelines**: Specific notes for consistent artistic rendering
- **Color Palette Integration**: How character colors work with established cast
- **Distinguishing Elements**: Unique visual features for instant recognition
- **Animation Considerations**: How design elements work in motion
- **Lighting Interaction**: How character design responds to different lighting

#### 7. TECHNICAL REPRODUCTION REQUIREMENTS
- **Reference Point System**: Key anatomical landmarks for consistent drawing
- **Proportional Relationships**: Mathematical relationships between body parts
- **Recognition Elements**: Visual signature that makes character instantly identifiable
- **Unique Feature Documentation**: Scars, markings, or distinctive characteristics
- **Pose Consistency Guidelines**: Maintaining character integrity across different positions
- **Color Consistency Standards**: Maintaining accurate colors across lighting conditions
- **Critical Detail Checklist**: Essential elements that must never be omitted

### CHARACTER DESIGN EXCELLENCE CRITERIA (ALL REQUIRED)
1. **Psychological Realism**: Believable psychological foundation reflected in all visual choices
2. **Visual Distinctiveness**: Instantly recognizable silhouette and design elements
3. **Narrative Utility**: Rich storytelling potential through design choices
4. **World Integration**: Perfect fit within established manga world and culture
5. **Growth Potential**: Built-in contradictions and tensions for character development
6. **Full-Body Reproducibility**: Consistent rendering across unlimited poses and scenes
7. **Thematic Resonance**: Visual alignment with manga's core themes
8. **Reader Connection**: Emotional engagement through design psychology
9. **Style Consistency**: Perfect visual cohesion with all existing characters
10. **Anime Authenticity**: Genuine Japanese anime aesthetic throughout

### ENHANCED ANIME STYLE TECHNICAL SPECIFICATIONS (MANDATORY)

#### Facial Detail Standards
- **Eye Construction**: Large iris with multiple layers, precise catchlight positioning, tear duct accuracy
- **Eyebrow Integration**: Natural connection with facial expression and personality
- **Nose-Mouth Harmony**: Proportional relationships following anime conventions
- **Asymmetry Balance**: Character-adding irregularities without breaking style consistency
- **Skin Rendering**: Subtle texture variations and appropriate shading techniques

#### Full-Body Technical Standards
- **Proportional Systems**: 7-8 heads for adults, 6-7 for teenagers, 5-6 for children
- **Joint Definition**: Clear articulation points styled appropriately for anime
- **Clothing Physics**: Realistic fabric interaction with body movement and gravity
- **Extremity Accuracy**: Hand and foot anatomy following anime stylistic conventions
- **Hair Physics**: Natural movement and interaction with clothing and accessories
- **Fabric Rendering**: Appropriate folds, shadows, and material weight representation

#### Color Theory Application
- **Skin Tone Families**: Consistent undertones across entire character cast
- **Hair Color Logic**: Natural relationships within anime color conventions
- **Eye Color Strategy**: Meaningful distribution for visual variety and character depth
- **Clothing Psychology**: Color schemes reflecting personality, role, and status
- **Accent Color Usage**: Consistent application across all design elements
- **Lighting Consistency**: Unified lighting approach for all characters in shared world

### FINAL CONSISTENCY MANDATE
Every character must achieve perfect "same anime world, same quality level" consistency:
- Identical art style approach from head to toe
- Consistent rendering quality across all anatomical elements
- Harmonious color relationships in complete character design
- Unified proportional systems and anatomical standards
- Cohesive aesthetic vision in all clothing and styling choices
- Maintained facial detail level alongside full-body completeness
- Design functionality in both close-up and full-body presentations

Generate complete character profiles populating ALL schema fields with professional-grade detail suitable for consistent manga production across unlimited scenes and contexts.`,
            inputSchema: zodSchemaToMcpSchema(
              characterSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                isAiGenerated: true,
                mangaProjectId: true,
                imgUrl: true,
              })
            ),
          },

          // ===== CHAPTER CREATION TOOLS =====
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
          },

          // ===== SCENE CREATION TOOLS =====
          {
            name: "createScene",
            description: `Creates compelling, visually rich manga scenes with complete narrative structure, character assignments, and environmental specifications optimized for manga panel composition.

## SCENE DESIGN EXCELLENCE MANDATE

### NARRATIVE STRUCTURE REQUIREMENTS (ALL MANDATORY)
1. **DRAMATIC PURPOSE**: Every scene MUST serve a clear, specific story function
   - Advance plot through character action or revelation
   - Develop character relationships or internal growth
   - Establish or resolve conflict elements
   - Build toward chapter climax or transition points
   - Create emotional resonance that serves larger story arc

2. **EMOTIONAL PROGRESSION**: Scenes MUST build emotional momentum
   - Start with clear emotional baseline for characters
   - Include emotional catalyst or development moment
   - Show character emotional response through action and dialogue
   - Progress emotional stakes throughout scene duration
   - Connect to overall chapter emotional journey

3. **CHARACTER DEVELOPMENT**: Advance character arcs and relationships
   - Reveal new aspects of character personality or background
   - Progress existing character relationships (romantic, friendship, rivalry)
   - Show character growth through choices and reactions
   - Create meaningful character interactions that feel authentic
   - Maintain established character voice and behavioral patterns

4. **VISUAL STORYTELLING**: Design scenes for optimal manga panel composition
   - Structure narrative with natural panel break points
   - Create visual drama moments perfect for impactful manga spreads
   - Balance dialogue-heavy and action-heavy content appropriately
   - Include specific visual details that enhance mood and character
   - Design scenes that work both in close-up and wide shots

5. **PACING MASTERY**: Balance dialogue, action, and contemplative moments
   - Vary scene rhythm and intensity appropriately
   - Use narrative beats that translate to effective panel timing
   - Create natural pauses and acceleration points
   - Build tension through pacing rather than just content
   - Enable smooth transitions to following scenes

6. **CONFLICT INTEGRATION**: Include tension or character challenge elements
   - Introduce obstacles that characters must overcome
   - Create interpersonal tension through differing goals or values
   - Include internal character conflicts reflected in external action
   - Use environmental challenges to test character relationships
   - Maintain appropriate conflict level for scene's story position

7. **ATMOSPHERE CREATION**: Establish mood through setting and character interaction
   - Use location details to reinforce emotional tone
   - Select environmental conditions that support narrative mood
   - Create atmosphere through character body language and interaction
   - Use lighting and weather to enhance scene emotional impact
   - Integrate sensory details that immerse readers in scene environment

### MANGA-SPECIFIC OPTIMIZATION STANDARDS

#### PANEL POTENTIAL REQUIREMENTS
- Structure scenes with natural panel break points every 2-3 narrative beats
- Create moments specifically designed for full-page or double-page spreads
- Include close-up opportunities for character emotional moments
- Design wide shots that establish location and character positioning
- Plan medium shots that capture character interaction and body language
- Create action sequences with clear movement progression across panels

#### VISUAL DRAMA SPECIFICATIONS
- Include at least one "money shot" moment perfect for impactful visual
- Design character positioning for dramatic visual composition
- Create environmental elements that enhance visual storytelling
- Include opportunities for artistic interpretation and visual creativity
- Plan lighting and shadow usage for dramatic effect
- Design character expressions and gestures for maximum visual impact

#### DIALOGUE BALANCE OPTIMIZATION
- Maintain appropriate text-to-visual ratio for manga pacing standards
- Create dialogue that reveals character while advancing plot
- Include subtext that can be conveyed through visual storytelling
- Balance speech with action and environmental description
- Use character-specific speech patterns established in project context
- Create dialogue rhythms that work with panel flow and page turns

### SCENE COMPONENTS SPECIFICATION (COMPLETE REQUIREMENTS)

#### CORE SCENE ELEMENTS (ALL MANDATORY)
**title**: Descriptive scene name that captures essence and mood
- Must be specific and evocative (e.g., "Rooftop Confrontation at Dawn", "Library Study Session Interrupted")
- Should indicate location and primary action or emotional tone
- Length: 3-8 words that immediately convey scene purpose

**description**: Rich narrative description (200-300 words)
- Must include specific character actions, dialogue, and interactions
- Detailed environmental description supporting mood and atmosphere
- Clear beginning, middle, and end structure within scene
- Specific emotional beats and character development moments
- Visual details that translate directly to manga panel composition
- Integration of location and outfit elements naturally into narrative

**order**: Sequential scene number within chapter
- Must maintain logical narrative progression
- Consider pacing and emotional flow between scenes
- Account for natural chapter rhythm and climax building

**sceneContext**: Complete technical specification including:

#### LOCATION INTEGRATION (MANDATORY)
**locationId**: Location template ID from available project locations
- MUST use existing location templates only
- Select location that serves narrative purpose and character needs
- Consider location's established atmosphere and visual characteristics
- Ensure location supports planned character interactions and actions

**locationVariationId**: (Optional) Specific location variation
- Use when scene requires different time of day or weather conditions
- Apply when narrative needs specific atmospheric modification
- Select variation that enhances rather than contradicts scene mood

#### CHARACTER OUTFIT ASSIGNMENTS (COMPREHENSIVE)
**characterOutfits**: Array of complete character appearance specifications
For EVERY character appearing in scene:
- **characterId**: Exact character ID from project character registry
- **outfitId**: Specific outfit template ID from available outfit templates
- **outfitVariationId**: (Optional) Specific outfit variation for weather/context
- **reason**: (Optional but recommended) Contextual reason for outfit choice

Outfit Selection Criteria:
- Weather and time-of-day appropriateness
- Character personality and status reflection
- Scene location and activity compatibility
- Narrative significance of appearance choices
- Character recognition and consistency maintenance
- Cultural and social context appropriateness

#### CHARACTER PRESENCE (COMPLETE)
**presentCharacters**: Array of ALL character names appearing in scene
- Must include every character who speaks, acts, or is referenced visually
- Use exact character names from project character registry
- Consider character relationships and interaction dynamics
- Account for logical character presence based on story context

#### ENVIRONMENTAL SPECIFICATIONS (DETAILED)
**environmentOverrides**: Scene-specific environmental modifications
**timeOfDay**: Specific time selection (dawn/morning/noon/afternoon/evening/night)
- Choose time that supports scene mood and narrative requirements
- Consider character schedules and story logic
- Use lighting implications for visual storytelling enhancement

**weather**: Weather conditions (sunny/cloudy/rainy/stormy/snowy/foggy)
- Select weather that reinforces scene emotional tone
- Consider practical implications for character actions and outfits
- Use weather as storytelling element, not just background

**mood**: Atmospheric mood (peaceful/mysterious/energetic/romantic/tense/cheerful/somber)
- Must align with scene's narrative purpose and character emotional states
- Should support rather than contradict established location atmosphere
- Use to guide visual artistic interpretation and reader emotional response

**lighting**: Custom lighting configuration
- **type**: natural/artificial/mixed lighting approach
- **intensity**: dim/moderate/bright lighting level
- **color**: Specific color temperature or tint for mood enhancement

**additionalProps**: Extra environmental elements
- Include any special objects, decorations, or environmental features needed for scene
- Consider props that characters interact with or that support visual storytelling
- List items that aren't part of standard location template but are scene-essential

#### SCENE PRODUCTION NOTES
**sceneNotes**: Additional scene-specific instructions
- Include any special visual requirements or artistic considerations
- Note any unique character interactions or emotional requirements
- Specify any technical considerations for manga panel composition
- Include references to previous scenes or setup for following scenes

### TEMPLATE INTEGRATION EXCELLENCE STANDARDS

#### LOCATION TEMPLATE MASTERY
- Use ONLY existing location templates from project registry
- Select locations that naturally support planned character interactions
- Consider location's established visual identity and atmosphere
- Apply location variations appropriately for narrative enhancement
- Use environmentOverrides sparingly and purposefully
- Ensure location choice serves both story and visual composition needs

#### OUTFIT TEMPLATE EXPERTISE
- Use ONLY existing outfit templates from project registry
- Assign outfits that reflect character personality and scene context
- Consider practical appropriateness for location and weather conditions
- Maintain character recognition while allowing appropriate outfit variation
- Use outfit choices to support character development and story themes
- Provide contextual reasoning for significant outfit changes

#### CHARACTER INTEGRATION MASTERY
- Utilize established character personalities and relationship dynamics
- Advance existing character arcs through scene interactions
- Maintain character voice consistency with established patterns
- Create authentic character reactions based on established psychology
- Use character presence strategically for maximum story impact

### PRODUCTION READINESS STANDARDS

#### MANGA ADAPTATION OPTIMIZATION
- Structure scenes for immediate manga panel breakdown
- Include specific visual descriptions ready for artist interpretation
- Create natural panel flow with appropriate pacing and rhythm
- Design action sequences with clear movement progression
- Plan dialogue placement that works with visual composition
- Include artistic direction notes for mood and atmosphere

#### NARRATIVE CONTINUITY ASSURANCE
- Ensure logical progression from previous scenes
- Set up elements needed for following scenes
- Maintain consistency with chapter's overall narrative arc
- Support established character development and relationship progression
- Advance plot elements appropriate to scene's position in chapter

### FINAL SCENE EXCELLENCE MANDATE
Every scene must achieve:
- **STORY ADVANCEMENT**: Meaningful progression of chapter narrative
- **CHARACTER DEVELOPMENT**: Growth or revelation for at least one character
- **VISUAL POTENTIAL**: Rich composition opportunities for manga panels
- **EMOTIONAL RESONANCE**: Genuine emotional impact appropriate to story context
- **PRODUCTION READINESS**: Complete specifications ready for manga creation
- **TEMPLATE INTEGRATION**: Seamless use of existing location and outfit templates
- **NARRATIVE CONSISTENCY**: Perfect continuity with established story elements

Generate complete scene data populating ALL schema fields with professional-grade detail suitable for immediate manga production.`,
            inputSchema: zodSchemaToMcpSchema(
              sceneSchema
                .omit({
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  panels: true,
                  isAiGenerated: true,
                })
                .extend({
                  chapterId: z
                    .string()
                    .describe(
                      "ID of the parent chapter where this scene belongs"
                    ),
                  order: z
                    .number()
                    .describe(
                      "Sequential order of this scene within the chapter (1, 2, 3, etc.)"
                    ),
                  title: z
                    .string()
                    .describe(
                      "Descriptive scene title capturing main action and mood (3-8 words)"
                    ),
                  description: z
                    .string()
                    .describe(
                      "Complete narrative description (200-300 words) with character actions, dialogue, and environmental details"
                    ),
                  sceneContext: z
                    .object({
                      locationId: z
                        .string()
                        .describe(
                          "ID of location template where scene takes place - use existing project locations only"
                        ),
                      locationVariationId: z
                        .string()
                        .optional()
                        .describe(
                          "Optional specific location variation (different time/weather/atmosphere)"
                        ),
                      characterOutfits: z
                        .array(
                          z.object({
                            characterId: z
                              .string()
                              .describe(
                                "Character ID from project character registry"
                              ),
                            outfitId: z
                              .string()
                              .describe(
                                "Outfit template ID from project outfit templates"
                              ),
                            outfitVariationId: z
                              .string()
                              .optional()
                              .describe(
                                "Optional specific outfit variation for this scene"
                              ),
                            reason: z
                              .string()
                              .optional()
                              .describe(
                                "Contextual reason for this outfit choice"
                              ),
                          })
                        )
                        .describe(
                          "Complete outfit assignments for all characters in scene"
                        ),
                      presentCharacters: z
                        .array(z.string())
                        .describe(
                          "Names of ALL characters appearing in this scene"
                        ),
                      environmentOverrides: z
                        .object({
                          timeOfDay: z
                            .enum([
                              "dawn",
                              "morning",
                              "noon",
                              "afternoon",
                              "evening",
                              "night",
                            ])
                            .optional(),
                          weather: z
                            .enum([
                              "sunny",
                              "cloudy",
                              "rainy",
                              "stormy",
                              "snowy",
                              "foggy",
                            ])
                            .optional(),
                          mood: z
                            .enum([
                              "peaceful",
                              "mysterious",
                              "energetic",
                              "romantic",
                              "tense",
                              "cheerful",
                              "somber",
                            ])
                            .optional(),
                          lighting: z
                            .object({
                              type: z
                                .enum(["natural", "artificial", "mixed"])
                                .optional(),
                              intensity: z
                                .enum(["dim", "moderate", "bright"])
                                .optional(),
                              color: z.string().optional(),
                            })
                            .optional(),
                          additionalProps: z
                            .array(z.string())
                            .optional()
                            .describe(
                              "Extra scene-specific environmental elements"
                            ),
                        })
                        .optional()
                        .describe("Scene-specific environmental modifications"),
                      sceneNotes: z
                        .string()
                        .optional()
                        .describe(
                          "Additional scene-specific instructions and artistic considerations"
                        ),
                    })
                    .describe(
                      "Complete scene context with location, characters, outfits, and environment"
                    ),
                })
            ),
          },

          // ===== PANEL CREATION TOOLS =====
          {
            name: "createPanel",
            description: `Creates a detailed manga panel within a specific scene, handling character poses, camera work, and visual storytelling elements.

Panels are the fundamental visual units of manga storytelling. This tool creates publication-ready panel specifications with character positioning, camera angles, lighting, and all the technical details needed for consistent visual production.

Perfect for:
- Translating scene narratives into specific visual moments
- Establishing camera work and visual flow for dynamic storytelling
- Managing character poses, expressions, and outfit consistency
- Creating detailed specifications for artists or AI generation

What this tool generates:
- Precise character positioning and pose specifications
- Camera angle and shot type selections for optimal storytelling
- Lighting and environmental atmosphere details
- Visual effects and special element integration
- Character outfit and expression consistency
- Technical specifications for art production

Advanced panel features:
- Character outfit variation support for different panel needs
- Environmental lighting override capabilities
- Camera angle optimization for dramatic impact
- Visual effect integration for action and mood
- Character expression and pose detailed specification

Panel creation workflow:
- Automatically inherits location and character context from parent scene
- Assigns specific character poses and expressions for this moment
- Sets camera angle and shot type for optimal visual impact
- Configures lighting and environmental details
- Adds any special visual effects or requirements`,
            inputSchema: zodSchemaToMcpSchema(
              panelSchema
                .omit({
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  dialogues: true,
                  characters: true,
                  imageUrl: true,
                  isAiGenerated: true,
                  sceneId: true,
                })
                .extend({
                  sceneId: z
                    .string()
                    .describe(
                      "ID of the parent scene where this panel belongs - use getScene to find the correct scene ID"
                    ),
                  order: z
                    .number()
                    .describe(
                      "Sequential order of this panel within the scene (1, 2, 3, etc.) - determines reading flow"
                    ),
                  panelContext: z
                    .object({
                      locationId: z
                        .string()
                        .describe(
                          "ID of the location template for visual consistency - usually inherits from parent scene"
                        ),
                      locationVariationId: z
                        .string()
                        .optional()
                        .describe(
                          "Specific location variation if different from scene default"
                        ),
                      action: z
                        .string()
                        .optional()
                        .describe(
                          "Primary action or event happening in this panel - the key visual moment being captured"
                        ),
                      characterPoses: z
                        .array(
                          z.object({
                            characterId: z
                              .string()
                              .describe(
                                "ID of the character appearing in this panel"
                              ),
                            characterName: z
                              .string()
                              .describe(
                                "Name of the character for easy reference"
                              ),
                            outfitId: z
                              .string()
                              .describe(
                                "ID of the outfit template this character is wearing"
                              ),
                            outfitVariationId: z
                              .string()
                              .optional()
                              .describe(
                                "Specific outfit variation if different from scene default"
                              ),
                            pose: z
                              .string()
                              .describe(
                                "Detailed description of the character's body position, stance, and physical action"
                              ),
                            expression: z
                              .string()
                              .describe(
                                "Facial expression and emotional state visible in this panel"
                              ),
                            position: z
                              .string()
                              .optional()
                              .describe(
                                "Character's spatial position relative to other elements in the panel"
                              ),
                          })
                        )
                        .describe(
                          "Complete character pose and position specifications for every character in this panel"
                        ),
                      environmentOverrides: z
                        .object({
                          lighting: z
                            .object({
                              type: z
                                .enum(["natural", "artificial", "mixed"])
                                .optional(),
                              intensity: z
                                .enum(["dim", "moderate", "bright"])
                                .optional(),
                              color: z.string().optional(),
                              direction: z
                                .string()
                                .optional()
                                .describe(
                                  "Lighting direction (from above, backlit, side lighting, etc.)"
                                ),
                            })
                            .optional()
                            .describe(
                              "Panel-specific lighting that may differ from scene defaults"
                            ),
                          weather: z
                            .enum([
                              "sunny",
                              "cloudy",
                              "rainy",
                              "stormy",
                              "snowy",
                              "foggy",
                            ])
                            .optional(),
                          timeOfDay: z
                            .enum([
                              "dawn",
                              "morning",
                              "noon",
                              "afternoon",
                              "evening",
                              "night",
                            ])
                            .optional(),
                          atmosphere: z
                            .string()
                            .optional()
                            .describe(
                              "Panel-specific mood or atmosphere (tense, peaceful, chaotic, etc.)"
                            ),
                        })
                        .optional()
                        .describe(
                          "Environmental modifications specific to this panel moment"
                        ),
                      cameraSettings: z
                        .object({
                          angle: z
                            .enum([
                              "close-up",
                              "medium",
                              "wide",
                              "bird's eye",
                              "low angle",
                            ])
                            .optional()
                            .describe(
                              "Camera angle that best captures this panel's dramatic intent"
                            ),
                          shotType: z
                            .enum([
                              "action",
                              "reaction",
                              "establishing",
                              "detail",
                              "transition",
                            ])
                            .optional()
                            .describe(
                              "Type of shot for optimal storytelling impact"
                            ),
                          focus: z
                            .string()
                            .optional()
                            .describe(
                              "What element should be the visual focus of this panel"
                            ),
                        })
                        .optional()
                        .describe(
                          "Camera and framing specifications for optimal visual storytelling"
                        ),
                      visualEffects: z
                        .array(z.string())
                        .optional()
                        .describe(
                          "Special visual effects needed for this panel (motion lines, impact effects, magical effects, etc.)"
                        ),
                      panelNotes: z
                        .string()
                        .optional()
                        .describe(
                          "Additional notes or special instructions for this panel's creation"
                        ),
                    })
                    .describe(
                      "Complete panel context including characters, environment, camera work, and visual specifications"
                    ),
                  characterNames: z
                    .array(z.string())
                    .optional()
                    .describe(
                      "Names of characters present in this panel - used for easy reference and validation"
                    ),
                })
            ),
          },

          // ===== UPDATE TOOLS =====
          {
            name: "updateProject",
            description: `Updates and modifies fields of an existing manga project while preserving its core structure and related content.

This tool allows you to refine and evolve your manga project as your vision develops. You can update any aspect of the project from basic metadata to complex world-building details without affecting existing characters, chapters, or other content.

Perfect for:
- Refining your story concept as it evolves during development
- Updating target audience or genre classifications
- Expanding world-building details and background lore
- Adjusting themes and artistic direction
- Improving project descriptions and marketing elements

What you can update:
- Basic project metadata (title, description, genre, art style)
- Target audience and content appropriateness
- World-building elements (history, society, unique systems)
- Plot structure elements (inciting incident, twists, climax)
- Thematic content (themes, motifs, symbols)
- Project tags and organizational elements

Update safety features:
- Preserves all existing content (characters, chapters, scenes)
- Maintains relationships between project elements
- Validates updates for consistency
- Tracks modification history

Best practices for project updates:
- Make incremental changes rather than complete overhauls
- Consider how changes affect existing characters and chapters
- Update related elements for consistency (e.g., if changing genre, review themes)
- Test changes with small updates before major revisions`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z
                  .string()
                  .describe(
                    "Unique identifier of the manga project to update - use listProjects to find project IDs"
                  ),
                updates: mangaProjectSchema
                  .omit({
                    id: true,
                    chapters: true,
                    characters: true,
                    coverImageUrl: true,
                    initialPrompt: true,
                    status: true,
                  })
                  .partial()
                  .describe(
                    "Object containing only the fields you want to update - leave unchanged fields undefined"
                  ),
              })
            ),
          },

          {
            name: "updateCharacter",
            description: `Updates and refines an existing character while maintaining visual and narrative consistency across your manga project.

This tool allows precise character evolution and refinement without breaking existing relationships or scene references. Perfect for character development that reflects story progression or design improvements.

Essential for:
- Evolving character appearance as story progresses (injuries, aging, style changes)
- Refining personality traits based on story development
- Updating character abilities or backstory elements  
- Improving visual consistency prompts for better AI generation
- Adjusting character roles or narrative importance

What you can safely update:
- Physical appearance details and distinctive features
- Personality traits and behavioral characteristics
- Abilities, skills, and character progression
- Backstory elements and character history
- Visual style guides and consistency prompts
- Character relationships and story arc potential

Character update safety:
- Preserves character references in existing scenes and panels
- Maintains character identity while allowing evolution
- Validates updates for internal consistency
- Tracks character development history

Character development best practices:
- Make changes that reflect natural character growth
- Ensure visual updates maintain character recognizability  
- Update related characters if relationships change
- Consider impact on future scenes and story developments`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe(
                    "Unique identifier of the character to update - use getCharacter or listCharacters to find character IDs"
                  ),
                updates: characterSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                    isAiGenerated: true,
                  })
                  .partial()
                  .describe(
                    "Object containing only the character fields you want to modify - unchanged fields should be left undefined"
                  ),
              })
            ),
          },

          {
            name: "updateChapter",
            description: `Updates and revises an existing chapter while maintaining narrative flow and scene relationships.

This tool enables chapter refinement and story development without disrupting existing scenes or breaking narrative continuity. Perfect for improving story pacing, character focus, or thematic elements.

Perfect for:
- Refining chapter narrative and story progression
- Adjusting character focus and relationships
- Improving chapter pacing and emotional flow  
- Updating thematic content and story purpose
- Revising chapter tone and atmospheric elements

What you can update:
- Chapter title and narrative description
- Story purpose and thematic focus
- Character prominence and key relationships
- Emotional tone and atmospheric mood
- Chapter-specific notes and creative direction

Chapter update features:
- Preserves existing scene structure and relationships
- Maintains chapter numbering and sequence
- Validates narrative consistency with related chapters
- Tracks revision history for version control

Chapter revision best practices:
- Consider impact on existing scenes when making narrative changes
- Maintain consistency with overall story arc and themes
- Update related chapters if making significant plot changes
- Ensure character actions remain consistent with their development`,
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
          },
          {
            name: "updatePanel",
            description: `Modifies an existing manga panel while maintaining visual continuity and narrative flow.

This precision editing tool allows targeted adjustments to panel composition without breaking scene continuity. It enables fine-tuning of visual storytelling elements while preserving the panel's fundamental role in the scene.

Key capabilities:
- Dynamic pose adjustment with automatic character consistency checks
- Camera angle refinement for improved storytelling impact
- Lighting and atmosphere tuning with real-time preview capabilities
- Visual effect management for action sequences and mood enhancement
- Panel ordering adjustment with automatic flow validation

Advanced features:
- Pose transition analysis between sequential panels
- Shot type compatibility suggestions
- Lighting consistency warnings across panels
- Character expression continuity validation
- Action sequence flow optimization

When to use:
- Improving action sequence clarity
- Enhancing emotional impact through camera work
- Adjusting compositions for better page flow
- Correcting visual continuity errors
- Updating panel notes for production teams

Safety mechanisms:
- Version history of all panel modifications
- Character consistency preservation
- Scene-wide visual continuity checks
- Automatic dialogue positioning adjustment
- Dependent panel impact analysis`,
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
          },

          {
            name: "updateCharacter",
            description: `Refines character details while maintaining visual and narrative consistency across the entire project.

This sophisticated tool enables character evolution without breaking existing references, ensuring all scenes and panels remain coherent with updated character attributes.

Key capabilities:
- Visual attribute refinement with automatic style propagation
- Personality trait adjustment with relationship impact analysis
- Backstory expansion with timeline consistency checking
- Ability modification with power scaling validation
- Art style refinement with project-wide updates

Advanced features:
- Character design version history
- Cross-reference impact visualization
- Visual consistency checking across all panels
- Relationship dynamic adjustment tools
- Arc development tracking

When to use:
- Evolving character designs through story progression
- Refining personality based on narrative needs
- Correcting continuity errors
- Enhancing visual style consistency
- Developing character abilities organically

Safety mechanisms:
- Project-wide reference updating
- Visual consistency validation
- Relationship impact warnings
- Timeline continuity checking
- Version-controlled modifications`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe(
                    "ID of the character to update - use getCharacter or listCharacters to locate"
                  ),
                updates: characterSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                    isAiGenerated: true,
                  })
                  .partial()
                  .describe(
                    "Partial character definition containing only fields requiring refinement"
                  ),
              })
            ),
          },

          // Delete Tools
          {
            name: "deleteProject",
            description: `Permanently removes a manga project and ALL associated content with comprehensive dependency resolution.

This irreversible action completely erases a project including all chapters, scenes, panels, characters, and templates. The system performs thorough dependency analysis and provides detailed confirmation requirements.

Safety features:
- Multi-level confirmation process
- Comprehensive dependency mapping
- Final verification checklist
- Project archival option
- 24-hour restoration window (configurable)

Impact analysis includes:
- All chapters and their nested content
- Character references across project
- Template usage statistics
- Panel and scene relationships
- Asset library connections

Best practices:
- Export project backup before deletion
- Review dependency report carefully
- Consider archiving instead of deleting
- Verify you have correct project ID
- Perform during low-activity periods`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z
                  .string()
                  .describe(
                    "ID of the project to permanently remove - verify carefully"
                  ),
                confirmation: z
                  .boolean()
                  .describe(
                    "Must be explicitly set to true to confirm understanding of irreversible deletion"
                  ),
              })
            ),
          },

          {
            name: "deleteChapter",
            description: `Removes a chapter and all nested content with automatic reference cleanup.

This structured deletion tool handles chapter removal while maintaining project integrity through:

Key features:
- Scene and panel cascade deletion
- Character reference analysis
- Timeline gap detection
- Narrative flow adjustment suggestions
- Automatic table of contents updating

Safety mechanisms:
- Chapter importance evaluation
- Narrative continuity warnings
- Character arc impact assessment
- Dependent content preview
- 24-hour restoration buffer

When to use:
- Removing redundant chapters
- Major story restructuring
- Cleaning up abandoned drafts
- Resolving continuity issues
- Finalizing published works`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                chapterId: z
                  .string()
                  .describe(
                    "ID of the chapter to remove - verify chapter number and title"
                  ),
              })
            ),
          },

          {
            name: "deleteScene",
            description: `Removes a scene and its panels while maintaining chapter structure.

This precision deletion tool handles scene removal with:

Key features:
- Panel cascade deletion
- Character appearance tracking
- Timeline adjustment
- Location usage analysis
- Automatic scene renumbering

Safety mechanisms:
- Importance evaluation
- Transition impact warnings
- Character presence verification
- Action sequence validation
- Restoration snapshot

Best practices:
- Review connected panels first
- Check character arcs
- Verify location usage
- Consider scene merging
- Document deletion reason`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                sceneId: z
                  .string()
                  .describe(
                    "ID of the scene to remove - verify scene order and title"
                  ),
              })
            ),
          },

          {
            name: "deletePanel",
            description: `Removes a panel while maintaining scene flow and dialogue continuity.

This surgical deletion tool handles panel removal with:

Key features:
- Dialogue reassignment
- Action sequence repair
- Page flow optimization
- Composition analysis
- Automatic panel renumbering

Safety mechanisms:
- Importance evaluation
- Visual continuity checks
- Dialogue preservation
- Transition smoothing
- Undo snapshot

When to use:
- Removing redundant panels
- Tightening pacing
- Improving page turns
- Fixing composition errors
- Streamlining action sequences`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                panelId: z
                  .string()
                  .describe(
                    "ID of the panel to remove - verify panel number and content"
                  ),
              })
            ),
          },

          {
            name: "deleteCharacter",
            description: `Removes a character and all references with comprehensive cleanup.

This sophisticated deletion tool handles character removal while maintaining narrative integrity through:

Key features:
- Scene appearance analysis
- Dialogue reassignment
- Relationship rebalancing
- Arc continuity checking
- Automatic reference updating

Safety mechanisms:
- Importance evaluation
- Story impact warnings
- Replacement suggestions
- Dependency mapping
- Archival preservation

Best practices:
- Review all appearances first
- Consider character merging
- Document removal reason
- Update character-dependent plots
- Verify chapter impacts`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe(
                    "ID of the character to remove - verify name and role"
                  ),
              })
            ),
          },

          // Fetch Tools
          {
            name: "getProject",
            description: "Retrieves complete details of a manga project by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                projectId: z
                  .string()
                  .describe("ID of the manga project to retrieve"),
              })
            ),
          },
          {
            name: "getChapter",
            description: "Retrieves complete details of a chapter by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                chapterId: z.string().describe("ID of the chapter to retrieve"),
              })
            ),
          },
          {
            name: "getScene",
            description: "Retrieves complete details of a scene by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                sceneId: z.string().describe("ID of the scene to retrieve"),
              })
            ),
          },
          {
            name: "getPanel",
            description: "Retrieves complete details of a panel by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                panelId: z.string().describe("ID of the panel to retrieve"),
              })
            ),
          },
          {
            name: "getCharacter",
            description: "Retrieves complete details of a character by ID.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                characterId: z
                  .string()
                  .describe("ID of the character to retrieve"),
              })
            ),
          },
          {
            name: "listProjects",
            description: "Retrieves a list of all manga projects.",
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                limit: z
                  .number()
                  .int()
                  .positive()
                  .optional()
                  .describe("Maximum number of projects to return"),
                offset: z
                  .number()
                  .int()
                  .nonnegative()
                  .optional()
                  .describe("Number of projects to skip"),
              })
            ),
          },

          // Outfit Template Tools
          {
            name: "createOutfitTemplate",
            description: `Creates a comprehensive outfit template with detailed component specifications for consistent character design across your manga.

This advanced tool establishes visual consistency by creating reusable outfit configurations with:

Key Features:
- Multi-layered component system (tops, bottoms, accessories, etc.)
- Material and color scheme management
- Seasonal and situational variations
- Gender and age-specific adaptations
- Style consistency enforcement

Template Components:
- Base outfit configuration with required components
- Color palette definitions and material specifications
- Weather and activity compatibility settings
- Style guidelines for artistic consistency
- Variation system for alternate versions

When to use:
- Establishing main character signature looks
- Creating uniform designs for organizations
- Developing era-specific fashion styles
- Building fantasy/unique world clothing
- Maintaining visual continuity across artists

Best Practices:
- Start with base components before variations
- Define color schemes early for consistency
- Consider multiple usage scenarios
- Document cultural/period references
- Test with character designs before finalizing`,
            inputSchema: zodSchemaToMcpSchema(
              outfitTemplateSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                variations: true,
                imageUrl: true,
                isActive: true,
                mangaProjectId: true,
              })
            ),
          },

          {
            name: "getOutfitTemplate",
            description: `Retrieves complete outfit template specifications with all components, variations, and usage data.

This detailed inspection tool provides:

Comprehensive View:
- Full component hierarchy and relationships
- Color scheme specifications
- Material definitions
- Variation configurations
- Project usage statistics

Advanced Information:
- Character assignment tracking
- Scene appearance frequency
- Style compatibility analysis
- Variation comparison tools
- Update history tracking

Usage Insights:
- Most common variations used
- Weather condition preferences
- Seasonal usage patterns
- Activity type correlations
- Character-specific adaptations`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                outfitTemplateId: z
                  .string()
                  .describe(
                    "ID of the outfit template to retrieve - use listOutfitTemplates to locate"
                  ),
              })
            ),
          },

          {
            name: "updateOutfitTemplate",
            description: `Modifies existing outfit templates with version-controlled updates and automatic reference propagation.

This professional-grade update tool handles:

Advanced Modification:
- Component system refinement
- Color scheme evolution
- Material specification updates
- Variation management
- Style guideline adjustments

Change Management:
- Version control and history
- Project-wide impact analysis
- Character design consistency checks
- Variation compatibility validation
- Automatic dependent updates

Best Practices:
- Document major version changes
- Test updates with character renders
- Review variation impacts
- Verify weather/activity compatibility
- Check age/gender appropriateness`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                outfitTemplateId: z
                  .string()
                  .describe("ID of the outfit template to modify"),
                updates: outfitTemplateSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                  })
                  .partial()
                  .describe(
                    "Partial outfit configuration containing only fields requiring adjustment"
                  ),
              })
            ),
          },

          {
            name: "deleteOutfitTemplate",
            description: `Permanently removes an outfit template with comprehensive reference cleanup and archival options.

This deletion tool provides:

Safety Features:
- Multi-level confirmation
- Character assignment warnings
- Scene usage analysis
- Variation impact assessment
- Optional archival preservation

Cleanup Process:
- Character default outfit reassignment
- Scene outfit reference removal
- Variation elimination
- Style guide updates
- Project template synchronization

Best Practices:
- Export template backup first
- Review all character assignments
- Check for scene dependencies
- Consider merging instead of deleting
- Document removal reasoning`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                outfitTemplateId: z
                  .string()
                  .describe(
                    "ID of the outfit template to remove - verify carefully"
                  ),
              })
            ),
          },

          {
            name: "listOutfitTemplates",
            description: `Retrieves a filtered, paginated list of outfit templates with comprehensive metadata.

This powerful listing tool offers:

Advanced Filtering:
- By project, category, and gender
- Seasonal and style filters
- Material and color scheme filters
- Variation count thresholds
- Usage frequency ranges

Rich Metadata:
- Preview thumbnails
- Component counts
- Variation statistics
- Character assignment data
- Recent usage information

Output Features:
- Custom sorting options
- Pagination control
- Summary statistics
- Bulk export options
- Template relationship mapping`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                mangaProjectId: z
                  .string()
                  .optional()
                  .describe("ID of the manga project to filter by"),
                category: z
                  .string()
                  .optional()
                  .describe(
                    "Filter by specific outfit category (casual, formal, fantasy, etc.)"
                  ),
                gender: z
                  .string()
                  .optional()
                  .describe("Filter by intended gender (male, female, unisex)"),
                limit: z
                  .number()
                  .int()
                  .positive()
                  .optional()
                  .describe(
                    "Maximum number of templates to return (default 20, max 100)"
                  ),
                offset: z
                  .number()
                  .int()
                  .nonnegative()
                  .optional()
                  .describe("Pagination offset for large result sets"),
              })
            ),
          },

          // Location Template Tools
          {
            name: "createLocationTemplate",
            description: `Creates a detailed location template for consistent environmental design across your manga.

This world-building tool establishes:

Key Features:
- Multi-variant environment system
- Time-of-day lighting configurations
- Weather condition adaptations
- Mood and atmosphere settings
- Camera angle specifications

Template Components:
- Base environmental attributes
- Lighting configuration profiles
- Prop and set dressing guidelines
- Color palette definitions
- Variation system for conditions

When to use:
- Establishing key story locations
- Creating reusable environment sets
- Developing fantasy/sci-fi worlds
- Maintaining visual continuity
- Streamlining scene creation

Best Practices:
- Define base lighting first
- Establish key props early
- Consider multiple usage scenarios
- Document cultural/period references
- Test with scene compositions`,
            inputSchema: zodSchemaToMcpSchema(
              locationTemplateSchema.omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                variations: true,
                imageUrl: true,
                isActive: true,
                mangaProjectId: true,
              })
            ),
          },

          {
            name: "getLocationTemplate",
            description: `Retrieves complete location template specifications with all variations and usage data.

This detailed inspection tool provides:

Comprehensive View:
- Full environmental attributes
- Lighting configurations
- Prop and set dressing lists
- Variation definitions
- Project usage statistics

Advanced Information:
- Scene assignment tracking
- Time-of-day usage patterns
- Weather condition preferences
- Mood application analysis
- Update history tracking

Usage Insights:
- Most common variations used
- Character interaction analysis
- Camera angle preferences
- Lighting condition trends
- Scene type correlations`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                locationTemplateId: z
                  .string()
                  .describe(
                    "ID of the location template to retrieve - use listLocationTemplates to locate"
                  ),
              })
            ),
          },

          {
            name: "updateLocationTemplate",
            description: `Modifies existing location templates with version-controlled updates and automatic scene propagation.

This professional-grade update tool handles:

Advanced Modification:
- Environmental attribute refinement
- Lighting configuration updates
- Prop system adjustments
- Variation management
- Style guideline evolution

Change Management:
- Version control and history
- Project-wide impact analysis
- Scene continuity validation
- Variation compatibility checks
- Automatic dependent updates

Best Practices:
- Document major version changes
- Test updates with scene renders
- Review variation impacts
- Verify time/weather compatibility
- Check mood consistency`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                locationTemplateId: z
                  .string()
                  .describe("ID of the location template to modify"),
                updates: locationTemplateSchema
                  .omit({
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    mangaProjectId: true,
                  })
                  .partial()
                  .describe(
                    "Partial location configuration containing only fields requiring adjustment"
                  ),
              })
            ),
          },

          {
            name: "deleteLocationTemplate",
            description: `Permanently removes a location template with comprehensive scene cleanup and archival options.

This deletion tool provides:

Safety Features:
- Multi-level confirmation
- Scene assignment warnings
- Chapter usage analysis
- Variation impact assessment
- Optional archival preservation

Cleanup Process:
- Scene location reassignment
- Panel reference updates
- Variation elimination
- Environment guide updates
- Project template synchronization

Best Practices:
- Export template backup first
- Review all scene assignments
- Check for chapter dependencies
- Consider merging instead of deleting
- Document removal reasoning`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                locationTemplateId: z
                  .string()
                  .describe(
                    "ID of the location template to remove - verify carefully"
                  ),
              })
            ),
          },

          {
            name: "listLocationTemplates",
            description: `Retrieves a filtered, paginated list of location templates with comprehensive metadata.

This powerful listing tool offers:

Advanced Filtering:
- By project, category, and style
- Time-of-day and weather filters
- Mood and atmosphere filters
- Variation count thresholds
- Usage frequency ranges

Rich Metadata:
- Preview thumbnails
- Prop counts
- Variation statistics
- Scene assignment data
- Recent usage information

Output Features:
- Custom sorting options
- Pagination control
- Summary statistics
- Bulk export options
- Template relationship mapping`,
            inputSchema: zodSchemaToMcpSchema(
              z.object({
                mangaProjectId: z
                  .string()
                  .optional()
                  .describe("ID of the manga project to filter by"),
                category: z
                  .string()
                  .optional()
                  .describe(
                    "Filter by location category (indoor, outdoor, urban, etc.)"
                  ),
                style: z
                  .string()
                  .optional()
                  .describe(
                    "Filter by art style (anime, realistic, cartoon, etc.)"
                  ),
                limit: z
                  .number()
                  .int()
                  .positive()
                  .optional()
                  .describe(
                    "Maximum number of templates to return (default 20, max 100)"
                  ),
                offset: z
                  .number()
                  .int()
                  .nonnegative()
                  .optional()
                  .describe("Pagination offset for large result sets"),
              })
            ),
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Session management tools
          case "setCurrentProject":
            return await this.setCurrentProjectHandler(args);
          case "getCurrentProject":
            return await this.getCurrentProjectHandler(args);
          case "clearCurrentProject":
            return await this.clearCurrentProjectHandler(args);

          // Creation tools
          case "createProject":
            return await this.createProjectWithSession(args);
          case "createChapter":
            return await this.createChapterWithSession(args);
          case "createScene":
            return await createSceneHandler(args);
          case "createPanel":
            return await createPanelHandler(args);
          case "createCharacter":
            return await this.createCharacterWithSession(args);

          // Update tools
          case "updateProject":
            return await updateProjectHandler(args);
          case "updateChapter":
            return await updateChapterHandler(args);
          case "updateScene":
            return await updateSceneHandler(args);
          case "updatePanel":
            return await updatePanelHandler(args);
          case "updateCharacter":
            return await updateCharacterHandler(args);

          // Delete tools
          case "deleteProject":
            return await deleteProjectHandler(args);
          case "deleteChapter":
            return await deleteChapterHandler(args);
          case "deleteScene":
            return await deleteSceneHandler(args);
          case "deletePanel":
            return await deletePanelHandler(args);
          case "deleteCharacter":
            return await deleteCharacterHandler(args);

          // Fetch tools
          case "getProject":
            return await getProjectHandler(args);
          case "getChapter":
            return await getChapterHandler(args);
          case "getScene":
            return await getSceneHandler(args);
          case "getPanel":
            return await getPanelHandler(args);
          case "getCharacter":
            return await getCharacterHandler(args);
          case "listProjects":
            return await listProjectsHandler(args);

          // Outfit Template tools
          case "createOutfitTemplate":
            return await this.createOutfitTemplateWithSession(args);
          case "getOutfitTemplate":
            return await getOutfitTemplateHandler(args);
          case "updateOutfitTemplate":
            return await updateOutfitTemplateHandler(args);
          case "deleteOutfitTemplate":
            return await deleteOutfitTemplateHandler(args);
          case "listOutfitTemplates":
            return await listOutfitTemplatesHandler(args);

          // Location Template tools
          case "createLocationTemplate":
            return await this.createLocationTemplateWithSession(args);
          case "getLocationTemplate":
            return await getLocationTemplateHandler(args);
          case "updateLocationTemplate":
            return await updateLocationTemplateHandler(args);
          case "deleteLocationTemplate":
            return await deleteLocationTemplateHandler(args);
          case "listLocationTemplates":
            return await listLocationTemplatesHandler(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool ${name}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "manga://projects",
            name: "Manga Projects",
            description: "List of all manga projects",
            mimeType: "application/json",
          },
          {
            uri: "manga://outfit-templates",
            name: "Outfit Templates",
            description: "List of all outfit templates",
            mimeType: "application/json",
          },
          {
            uri: "manga://location-templates",
            name: "Location Templates",
            description: "List of all location templates",
            mimeType: "application/json",
          },
        ],
      };
    });

    // Handle resource requests
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;

        try {
          if (uri === "manga://projects") {
            return await listProjectsResourceHandler();
          } else if (uri === "manga://outfit-templates") {
            return await listOutfitTemplatesResourceHandler(uri);
          } else if (uri === "manga://location-templates") {
            return await listLocationTemplatesResourceHandler(uri);
          } else if (uri.startsWith("manga://project/")) {
            return await getProjectResourceHandler(uri);
          } else if (uri.startsWith("manga://chapter/")) {
            return await getChapterResourceHandler(uri);
          } else if (uri.startsWith("manga://scene/")) {
            return await getSceneResourceHandler(uri);
          } else if (uri.startsWith("manga://panel/")) {
            return await getPanelResourceHandler(uri);
          } else if (uri.startsWith("manga://character/")) {
            return await getCharacterResourceHandler(uri);
          } else if (uri.startsWith("manga://outfit-template/")) {
            return await getOutfitTemplateResourceHandler(uri);
          } else if (uri.startsWith("manga://location-template/")) {
            return await getLocationTemplateResourceHandler(uri);
          } else {
            throw new Error(`Unknown resource: ${uri}`);
          }
        } catch (error) {
          throw new Error(
            `Failed to read resource ${uri}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    );
  }

  private setupPromptHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      try {
        return {
          prompts: Object.entries(mangaCreationPrompts).map(
            ([key, prompt]) => ({
              name: key,
              description: prompt.description,
              arguments: prompt.arguments || [],
            })
          ),
        };
      } catch (error) {
        console.error("Error listing prompts:", error);
        throw new Error("Failed to list prompts");
      }
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      try {
        const promptTemplate =
          mangaCreationPrompts[
            request.params.name as keyof typeof mangaCreationPrompts
          ];

        if (!promptTemplate) {
          throw new Error(`Prompt not found: ${request.params.name}`);
        }

        console.log(this.sessionState);
        // Call the prompt handler with arguments and session context
        const renderedPrompt = await promptTemplate.handler(
          request.params.arguments || {},
          this.sessionState
        );

        return {
          description: promptTemplate.description,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: renderedPrompt,
              },
            },
          ],
        };
      } catch (error) {
        console.error("Error getting prompt:", error);
        throw new Error(
          `Failed to get prompt: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });
  }

  // Session management methods
  private async setCurrentProjectHandler(args: any) {
    const { projectId } = args;

    // Verify the project exists
    try {
      const project = await getProjectHandler({ projectId });
      const projectData = JSON.parse(project.content[0].text);

      this.sessionState.currentProjectId = projectId;
      this.sessionState.projectName = projectData.name;

      return {
        content: [
          {
            type: "text",
            text: `Current project set to: ${projectData.name} (ID: ${projectId})`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Project ${projectId} not found: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async getCurrentProjectHandler(args: any) {
    if (!this.sessionState.currentProjectId) {
      return {
        content: [
          {
            type: "text",
            text: "No current project set. Use 'setCurrentProject' to set one.",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              projectId: this.sessionState.currentProjectId,
              projectName: this.sessionState.projectName,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async clearCurrentProjectHandler(args: any) {
    const previousProject =
      this.sessionState.projectName || this.sessionState.currentProjectId;
    this.sessionState.currentProjectId = undefined;
    this.sessionState.projectName = undefined;

    return {
      content: [
        {
          type: "text",
          text: `Cleared current project${
            previousProject ? ` (was: ${previousProject})` : ""
          }`,
        },
      ],
    };
  }

  // Session-aware creation methods
  private async createProjectWithSession(args: any) {
    const result = await createProjectHandler(args);

    // Extract project ID from the result and set as current
    try {
      const projectData = JSON.parse(result.content[0].text);
      this.sessionState.currentProjectId = projectData.id;
      this.sessionState.projectName = projectData.name;

      // Add session info to the response
      const updatedResult = {
        ...result,
        content: [
          result.content[0],
          {
            type: "text",
            text: `\n✓ Project automatically set as current session project.`,
          },
        ],
      };

      return updatedResult;
    } catch (error) {
      // If we can't parse the result, just return the original
      return result;
    }
  }

  private async createChapterWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createChapterHandler(argsWithProject);
  }

  private async createCharacterWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createCharacterHandler(argsWithProject);
  }

  private async createOutfitTemplateWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createOutfitTemplateHandler(argsWithProject);
  }

  private async createLocationTemplateWithSession(args: any) {
    if (!this.sessionState.currentProjectId) {
      throw new Error(
        "No current project set. Use 'setCurrentProject' first or create a new project."
      );
    }

    // Add the project ID from session to the args
    const argsWithProject = {
      ...args,
      mangaProjectId: this.sessionState.currentProjectId,
    };

    return await createLocationTemplateHandler(argsWithProject);
  }

  // Abstract method that concrete implementations must provide
  abstract run(): Promise<void>;
}
