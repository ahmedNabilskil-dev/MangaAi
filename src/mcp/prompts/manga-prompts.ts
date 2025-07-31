import { getProjectWithRelations } from "../../services/data-service";

/**
 * Simplified MCP Manga Creation Prompts
 * User-friendly with enum selections and minimal context building
 */
export const mangaCreationPrompts = {
  // ===== CONTENT CREATION PROMPTS =====

  "story-generation": {
    name: "story-generation",
    description: "Create a comprehensive manga project from user input",
    arguments: [
      {
        name: "concept",
        description: "Your manga concept, story idea, or inspiration",
        required: true,
        type: "string",
      },
      {
        name: "target_audience",
        description: "Target demographic for the manga",
        required: false,
        type: "string",
        enum: ["children", "teen", "young-adult", "adult"],
      },
      {
        name: "genre",
        description: "Primary genre classification",
        required: false,
        type: "string",
        enum: [
          "action",
          "romance",
          "comedy",
          "horror",
          "fantasy",
          "sci-fi",
          "slice-of-life",
          "drama",
          "adventure",
          "mystery",
          "supernatural",
          "sports",
        ],
      },
    ],
    handler: async (args: any) => {
      return `Create a complete manga project blueprint with:

**User Concept**: ${args.concept}
${args.target_audience ? `**Target Audience**: ${args.target_audience}` : ""}
${args.genre ? `**Preferred Genre**: ${args.genre}` : ""}

Generate a structured manga project including:
- title, description, concept, genre, targetAudience, artStyle, tags
- worldDetails (summary, history, society, uniqueSystems)
- themes, motifs, symbols arrays
- plotStructure (incitingIncident, plotTwist, climax, resolution)

Focus on originality, emotional depth, and visual storytelling potential.`;
    },
  },

  "character-generation": {
    name: "character-generation",
    description: "Generate a detailed character for the current manga project",
    arguments: [
      {
        name: "character_concept",
        description:
          "Character idea, role, personality, or visual concept description",
        required: true,
        type: "string",
      },
      {
        name: "role",
        description: "Character's narrative role",
        required: false,
        type: "string",
        enum: ["protagonist", "antagonist", "supporting", "minor"],
      },
      {
        name: "age_group",
        description: "Character's age group for proportions",
        required: false,
        type: "string",
        enum: ["child", "teen", "young-adult", "adult", "elderly"],
      },
      {
        name: "focus_areas",
        description: "Specific aspects to emphasize (comma-separated)",
        required: false,
        type: "string",
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      return `You are a master manga character designer creating psychologically complex, visually distinctive full-body characters with perfect consistency.

## CHARACTER REQUEST
**Concept**: ${args.character_concept}
${args.role ? `**Role**: ${args.role}` : ""}
${args.age_group ? `**Age Group**: ${args.age_group}` : ""}
${args.focus_areas ? `**Focus Areas**: ${args.focus_areas}` : ""}


## FULL-BODY VISUAL CONSISTENCY MANDATE
ALL characters MUST follow these EXACT specifications for the same anime world:

### CORE ART STYLE SPECIFICATIONS
- **Art Style**: Modern Japanese anime/manga style, high-quality seasonal anime production level
- **Line Art**: Clean, precise lineart with 2-3px weight for outlines, 1-2px for details
- **Shading Style**: Cel shading with soft gradients, anime-style rim lighting, consistent light source
- **Color Saturation**: Vibrant but harmonious colors, avoiding oversaturation
- **Eye Style**: Large, expressive anime eyes with detailed iris patterns, consistent highlight placement
- **Body Proportions**: Standard anime proportions - slightly larger heads, elongated limbs, expressive hands
- **Full Body Composition**: Complete character from head to toe, dynamic pose, detailed anatomy

### ENHANCED FULL-BODY STYLE GUIDE ELEMENTS
**REQUIRED consistencyPrompt**: 
"full body anime character, high quality anime art, complete character design head to toe, clean lineart, cel shading, vibrant colors, detailed anime eyes with highlights, expressive facial features, modern anime aesthetic, professional anime production quality, cohesive character design, anime proportions, soft anime shading, detailed hair rendering with individual strands, anime facial features with precise detail, full body pose, detailed clothing and accessories, anatomically correct anime style, dynamic character stance, detailed hands and feet, fabric texture details, consistent art style throughout, full character reference sheet quality"

**REQUIRED negativePrompt**: 
"realistic, photorealistic, 3D render, western cartoon, chibi, deformed, ugly, blurry, low quality, bad anatomy, extra limbs, mutation, disfigured, bad proportions, watermark, signature, text, inconsistent style, mixed art styles, sketchy lines, rough artwork, amateur drawing, poorly drawn, distorted features, cropped, partial body, headshot only, face only, missing limbs, incomplete character, bad hands, malformed hands, extra fingers, missing fingers, floating limbs, disconnected body parts"

## DETAILED FULL-BODY CHARACTER SPECIFICATIONS
Generate comprehensive details for ALL sections:

### 1. FACIAL FEATURES (High Detail)
- Eye shape, size, color with specific hex codes (#RRGGBB format)
- Iris patterns, pupil details, highlight positioning
- Eyebrow shape, thickness, color matching or complementing hair
- Nose bridge height, nostril shape, overall nose proportions
- Lip fullness, mouth width, natural resting expression
- Facial structure (oval, heart, square, round, diamond, etc.)
- Cheekbone prominence, jawline definition and strength
- Skin tone with precise hex color codes
- Unique facial expressions and micro-expressions

### 2. HAIR DESIGN (Complete Specification)
- Exact hair color with multiple shade variations (base, highlights, shadows)
- Hair texture (straight, wavy, curly, coarse, fine, thick, thin)
- Hair length and detailed styling (layers, bangs, parting, etc.)
- Individual strand flow and natural movement patterns
- Hair accessories and their interaction with hair physics
- Hairline shape, widow's peak details, temple recession
- Hair volume, density, and how it frames the face

### 3. FULL BODY ANATOMY
- Height specifications with exact measurements (cm and feet/inches)
- Body type and build (athletic, slim, curvy, stocky, lanky, muscular, etc.)
- Shoulder width, posture, and spine curvature
- Arm length, hand size, finger proportions, nail style
- Torso proportions, waist definition, chest/bust details
- Hip width, leg proportions, thigh/calf relationship
- Foot size, arch height, toe proportions
- Overall muscle definition level and body fat distribution
- Natural body language, default stance, weight distribution

### 4. CLOTHING AND ACCESSORIES (Detailed)
- Complete outfit description from head to toe
- Fabric types, weights, and how they fall on the body
- Color schemes with specific hex codes for each element
- Patterns, textures, material details (cotton, silk, denim, etc.)
- Accessories placement and body interaction (how they move, hang, fit)
- Shoe style, color, condition, heel height, sole type
- Jewelry, watches, bags, or other personal items
- Clothing fit philosophy and how it reveals personality
- Seasonal outfit variations and adaptability

### 5. CHARACTER POSE AND BODY LANGUAGE
- Default standing pose, weight distribution between feet
- Hand positioning, finger placement, arm positioning
- Facial expression alignment with overall body language
- Dynamic elements (hair movement, clothing flow, accessories)
- Natural gestures, mannerisms, and unconscious movements
- How they occupy space (confident expansion, timid contraction)
- Walking style, sitting posture, interaction with objects

### 6. STYLE INTEGRATION DETAILS
- How this character fits the established anime aesthetic
- Specific rendering notes for consistent reproduction
- Color palette harmony with other established characters
- Unique visual elements that make them instantly recognizable
- Animation considerations for fluid movement
- Lighting interaction with their design elements

### 7. TECHNICAL REPRODUCTION GUIDELINES
- Key reference points for consistent full-body drawing
- Proportional relationships between all body parts
- Signature visual elements for instant recognition
- Specific notes about unique features, scars, or markings
- Guidelines for maintaining character integrity across different poses
- Color consistency across various lighting conditions
- Critical details that must never be omitted

## CHARACTER DESIGN EXCELLENCE CRITERIA
Ensure your character achieves ALL of these:

1. **Psychological Realism**: Believable psychological underpinnings reflected in posture and body language
2. **Visual Distinctiveness**: Instantly recognizable even in silhouette from full body view
3. **Narrative Utility**: Rich storytelling possibilities through facial expressions AND body language
4. **World Integration**: Deep embedding in the manga's world through clothing and cultural details
5. **Growth Potential**: Built-in tensions and contradictions for character development
6. **Full-Body Reproducibility**: Consistent rendering across many panels in various poses
7. **Thematic Resonance**: Alignment with core manga themes through complete design
8. **Reader Connection**: Emotional anchors through both facial detail and body language
9. **Style Consistency**: Perfect visual cohesion with all other characters
10. **Anime Authenticity**: Genuine Japanese anime aesthetic in complete character design

## ENHANCED ANIME STYLE TECHNICAL SPECIFICATIONS
Apply to every character without exception:

**Facial Detail Elements**:
- Eye design: Large, detailed iris with multiple layers, precise catchlight positioning, tear duct detail
- Eyebrow integration with facial expression and core personality
- Nose and mouth proportional relationships following anime conventions
- Subtle facial asymmetries that add character without breaking style
- Skin rendering with subtle texture and shading variations

**Full-Body Technical Elements**:
- Head-to-body ratios: 7-8 heads for adults, 6-7 for teenagers, 5-6 for children
- Joint articulation points clearly defined but stylized appropriately
- Clothing interaction with body movement and gravity effects
- Hand and foot anatomy following anime conventions (slightly elongated, expressive)
- Hair physics and realistic interaction with clothing/accessories
- Fabric rendering with appropriate folds, shadows, and material weight

**Advanced Color Theory Application**:
- Skin tone families with consistent undertones across cast
- Hair color relationships that feel natural within anime conventions
- Eye color distribution across cast for visual variety and meaning
- Clothing color schemes reflecting personality, status, and role
- Accent colors used consistently across character design elements
- Lighting consistency for all characters existing in the same world

## FINAL MANDATE
Create a character that perfectly passes the "same anime world, same quality level" test:
- Identical art style approach from head to toe
- Consistent rendering quality across all body parts
- Harmonious color relationships in complete character design
- Same proportional systems and anatomical approach
- Unified aesthetic vision in clothing, accessories, and styling
- Facial detail level maintained alongside full-body completeness
- Character designs that work in both close-up and full-body shots

Generate complete character data populating ALL relevant fields in the character schema. Every detail should serve both visual consistency and narrative purpose.

NO EXCEPTIONS to consistency requirements. This character must feel like they belong in the same high-quality anime series as any existing characters.`;
    },
  },

  "chapter-generation": {
    name: "chapter-generation",
    description: "Create a detailed chapter for the current manga project",
    arguments: [
      {
        name: "chapter_concept",
        description: "Chapter idea, events, or narrative focus",
        required: true,
        type: "string",
      },
      {
        name: "chapter_number",
        description: "Chapter number in the series",
        required: false,
        type: "number",
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const nextChapterNumber =
        args.chapter_number || (project.chapters?.length || 0) + 1;

      return `Create Chapter ${nextChapterNumber} for "${project.title}":

**Chapter Concept**: ${args.chapter_concept}

**Project Context**:
- Concept: ${project.concept || "Not specified"}
- Existing Chapters: ${project.chapters?.length || 0}

Generate complete chapter data including:
- chapterNumber, title, narrative, purpose, tone
- keyCharacters (names from available characters)
- Story structure and chapter-specific themes`;
    },
  },

  "scene-generation": {
    name: "scene-generation",
    description: "Create a detailed scene for a specific chapter",
    arguments: [
      {
        name: "scene_concept",
        description: "Scene idea, action, or dramatic purpose",
        required: true,
        type: "string",
      },
      {
        name: "chapter_name",
        description: "Chapter where this scene belongs",
        required: true,
        type: "string",
        // This will be populated dynamically with available chapter titles
        enum: [], // Will be filled by the system
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const chapter = project.chapters?.find(
        (ch) => ch.title === args.chapter_name
      );
      if (!chapter) throw new Error(`Chapter "${args.chapter_name}" not found`);

      return `Create a scene for Chapter "${chapter.title}":

**Scene Concept**: ${args.scene_concept}

**Chapter Context**: ${chapter.narrative}

**Available Characters**: ${
        project.characters?.map((ch) => ch.name).join(", ") || "None"
      }
**Available Locations**: ${
        project.locationTemplates?.map((lt) => lt.name).join(", ") || "None"
      }

Generate complete scene data including:
- order, title, description
- sceneContext with location and character assignments
- Character outfits and environmental settings`;
    },
  },

  "panel-generation": {
    name: "panel-generation",
    description: "Generate a detailed panel for a specific scene",
    arguments: [
      {
        name: "panel_concept",
        description: "Panel action, composition, or visual idea",
        required: true,
        type: "string",
      },
      {
        name: "scene_name",
        description: "Scene where this panel belongs",
        required: true,
        type: "string",
        enum: [], // Will be populated with available scene titles
      },
      {
        name: "shot_type",
        description: "Camera shot type for the panel",
        required: false,
        type: "string",
        enum: ["close-up", "medium", "wide", "bird's eye", "low angle"],
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let scene: any = null;
      for (const chapter of project.chapters || []) {
        scene = chapter.scenes?.find((sc) => sc.title === args.scene_name);
        if (scene) break;
      }
      if (!scene) throw new Error(`Scene "${args.scene_name}" not found`);

      return `Create a panel for Scene "${scene.title}":

**Panel Concept**: ${args.panel_concept}
${args.shot_type ? `**Shot Type**: ${args.shot_type}` : ""}

**Scene Context**: ${scene.description}
**Available Characters**: ${
        scene.sceneContext?.presentCharacters?.join(", ") || "None"
      }

Generate complete panel data including:
- order, panelContext with action and character poses
- Camera settings and visual effects
- Environment and lighting details`;
    },
  },

  "dialogue-generation": {
    name: "dialogue-generation",
    description: "Generate dialogue for a specific panel",
    arguments: [
      {
        name: "dialogue_concept",
        description: "Dialogue content, emotion, or character interaction",
        required: true,
        type: "string",
      },
      {
        name: "panel_description",
        description:
          "Panel where this dialogue belongs (from available panels)",
        required: true,
        type: "string",
        enum: [], // Will be populated with panel descriptions
      },
      {
        name: "speaker_name",
        description: "Character who speaks this dialogue",
        required: false,
        type: "string",
        enum: [], // Will be populated with available character names
      },
      {
        name: "bubble_type",
        description: "Type of speech bubble",
        required: false,
        type: "string",
        enum: ["normal", "thought", "scream", "whisper", "narration"],
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      return `Create dialogue for the specified panel:

**Dialogue Concept**: ${args.dialogue_concept}
${args.speaker_name ? `**Speaker**: ${args.speaker_name}` : ""}
${args.bubble_type ? `**Bubble Type**: ${args.bubble_type}` : ""}

**Panel Context**: ${args.panel_description}

Generate dialogue data including:
- content, order, emotion
- Speaker assignment and bubble styling
- Subtext notes if needed`;
    },
  },

  // ===== UPDATE PROMPTS =====

  "character-update": {
    name: "character-update",
    description: "Update specific aspects of an existing character",
    arguments: [
      {
        name: "update_request",
        description: "What you want to change about the character",
        required: true,
        type: "string",
      },
      {
        name: "character_name",
        description: "Character to update",
        required: true,
        type: "string",
        enum: [], // Will be populated with available character names
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const character = project.characters?.find(
        (ch) => ch.name === args.character_name
      );
      if (!character)
        throw new Error(`Character "${args.character_name}" not found`);

      return `Update character "${character.name}":

**Update Request**: ${args.update_request}

**Current Character**: ${character.briefDescription || "No description"}

Make targeted updates while preserving character consistency.
Use updateCharacterTool to save changes.`;
    },
  },

  "chapter-update": {
    name: "chapter-update",
    description: "Update specific aspects of an existing chapter",
    arguments: [
      {
        name: "update_request",
        description: "What you want to change about the chapter",
        required: true,
        type: "string",
      },
      {
        name: "chapter_name",
        description: "Chapter to update",
        required: true,
        type: "string",
        enum: [], // Will be populated with available chapter titles
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const chapter = project.chapters?.find(
        (ch) => ch.title === args.chapter_name
      );
      if (!chapter) throw new Error(`Chapter "${args.chapter_name}" not found`);

      return `Update Chapter "${chapter.title}":

**Update Request**: ${args.update_request}

**Current Chapter**: ${chapter.narrative || "No narrative"}

Make targeted updates while maintaining narrative consistency.
Use updateChapterTool to save changes.`;
    },
  },

  "scene-update": {
    name: "scene-update",
    description: "Update specific aspects of an existing scene",
    arguments: [
      {
        name: "update_request",
        description: "What you want to change about the scene",
        required: true,
        type: "string",
      },
      {
        name: "scene_name",
        description: "Scene to update",
        required: true,
        type: "string",
        enum: [], // Will be populated with available scene titles
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      let scene: any = null;
      for (const chapter of project.chapters || []) {
        scene = chapter.scenes?.find((sc) => sc.title === args.scene_name);
        if (scene) break;
      }
      if (!scene) throw new Error(`Scene "${args.scene_name}" not found`);

      return `Update Scene "${scene.title}":

**Update Request**: ${args.update_request}

**Current Scene**: ${scene.description || "No description"}

Make targeted updates while preserving scene flow.
Use updateSceneTool to save changes.`;
    },
  },

  "panel-update": {
    name: "panel-update",
    description: "Update specific aspects of an existing panel",
    arguments: [
      {
        name: "update_request",
        description: "What you want to change about the panel",
        required: true,
        type: "string",
      },
      {
        name: "panel_description",
        description: "Panel to update (from available panels)",
        required: true,
        type: "string",
        enum: [], // Will be populated with panel descriptions
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      return `Update the specified panel:

**Update Request**: ${args.update_request}

**Panel**: ${args.panel_description}

Make targeted visual and composition updates.
Use updatePanelTool to save changes.`;
    },
  },

  "dialogue-update": {
    name: "dialogue-update",
    description: "Update specific aspects of existing dialogue",
    arguments: [
      {
        name: "update_request",
        description: "What you want to change about the dialogue",
        required: true,
        type: "string",
      },
      {
        name: "dialogue_content",
        description: "Dialogue to update (existing dialogue text)",
        required: true,
        type: "string",
        enum: [], // Will be populated with existing dialogue content
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      return `Update dialogue: "${args.dialogue_content}"

**Update Request**: ${args.update_request}

Make targeted dialogue updates while preserving character voice.
Use updatePanelDialogueTool to save changes.`;
    },
  },

  // ===== TEMPLATE PROMPTS =====

  "outfit-template-creation": {
    name: "outfit-template-creation",
    description: "Create a reusable outfit template",
    arguments: [
      {
        name: "outfit_concept",
        description: "Outfit idea, style, or purpose",
        required: true,
        type: "string",
      },
      {
        name: "category",
        description: "Outfit category",
        required: false,
        type: "string",
        enum: [
          "casual",
          "formal",
          "traditional",
          "fantasy",
          "modern",
          "vintage",
          "futuristic",
          "seasonal",
          "special",
        ],
      },
      {
        name: "gender",
        description: "Target gender",
        required: false,
        type: "string",
        enum: ["male", "female", "unisex"],
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      return `Create outfit template:

**Outfit Concept**: ${args.outfit_concept}
${args.category ? `**Category**: ${args.category}` : ""}
${args.gender ? `**Gender**: ${args.gender}` : ""}

Generate complete outfit template including:
- name, description, components, colorSchemes
- materials, occasions, compatibility settings
- Style and usage specifications`;
    },
  },

  "location-template-creation": {
    name: "location-template-creation",
    description: "Create a reusable location template",
    arguments: [
      {
        name: "location_concept",
        description: "Location idea, setting, or atmosphere",
        required: true,
        type: "string",
      },
      {
        name: "category",
        description: "Location category",
        required: false,
        type: "string",
        enum: [
          "indoor",
          "outdoor",
          "urban",
          "rural",
          "fantasy",
          "futuristic",
          "historical",
          "natural",
          "architectural",
        ],
      },
      {
        name: "mood",
        description: "Default mood/atmosphere",
        required: false,
        type: "string",
        enum: [
          "peaceful",
          "mysterious",
          "energetic",
          "romantic",
          "tense",
          "cheerful",
          "somber",
        ],
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      return `Create location template:

**Location Concept**: ${args.location_concept}
${args.category ? `**Category**: ${args.category}` : ""}
${args.mood ? `**Mood**: ${args.mood}` : ""}

Generate complete location template including:
- name, description, props, colors
- lighting, camera angles, variations
- Usage and atmospheric specifications`;
    },
  },

  // ===== IMAGE GENERATION PROMPTS =====

  "character-image": {
    name: "character-image",
    description: "Generate an image for a character",
    arguments: [
      {
        name: "character_name",
        description: "Character to generate image for",
        required: true,
        type: "string",
        enum: [], // Will be populated with available character names
      },
      {
        name: "pose_description",
        description: "Specific pose or action (optional)",
        required: false,
        type: "string",
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      const character = project.characters?.find(
        (ch) => ch.name === args.character_name
      );
      if (!character)
        throw new Error(`Character "${args.character_name}" not found`);

      return (
        character.consistencyPrompt ||
        `Generate image of ${character.name}: ${character.briefDescription}
        ${args.pose_description ? `Pose: ${args.pose_description}` : ""}`
      );
    },
  },

  "panel-image": {
    name: "panel-image",
    description: "Generate an image for a panel",
    arguments: [
      {
        name: "panel_description",
        description: "Panel to generate image for",
        required: true,
        type: "string",
        enum: [], // Will be populated with panel descriptions
      },
    ],
    handler: async (args: any, sessionContext: any) => {
      const project = await getProjectWithRelations(
        sessionContext.currentProjectId
      );
      if (!project) throw new Error(`Project not found`);

      return `Generate high-quality manga panel image for:
      ${args.panel_description}
      
      Style: ${project.artStyle || "manga/anime style"}`;
    },
  },
};

// Helper function to dynamically populate enum options
export async function getPromptEnumOptions(
  promptName: string,
  argName: string,
  sessionContext: any
) {
  const project = await getProjectWithRelations(
    sessionContext.currentProjectId
  );
  if (!project) return [];

  switch (argName) {
    case "character_name":
    case "speaker_name":
      return project.characters?.map((ch) => ch.name) || [];

    case "chapter_name":
      return project.chapters?.map((ch) => ch.title) || [];

    case "scene_name":
      const scenes: string[] = [];
      project.chapters?.forEach((ch) => {
        ch.scenes?.forEach((sc) => scenes.push(sc.title));
      });
      return scenes;

    case "panel_description":
      const panels: string[] = [];
      project.chapters?.forEach((ch) => {
        ch.scenes?.forEach((sc) => {
          sc.panels?.forEach((p) => {
            panels.push(
              `${sc.title} - Panel ${p.order}: ${
                p.panelContext?.action || "Panel action"
              }`
            );
          });
        });
      });
      return panels;

    case "dialogue_content":
      const dialogues: string[] = [];
      project.chapters?.forEach((ch) => {
        ch.scenes?.forEach((sc) => {
          sc.panels?.forEach((p) => {
            p.dialogues?.forEach((d) => {
              if (d.content) dialogues.push(d.content);
            });
          });
        });
      });
      return dialogues;

    default:
      return [];
  }
}
