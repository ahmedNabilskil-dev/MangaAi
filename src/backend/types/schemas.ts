import { z } from "zod";
import { MangaStatus } from "./enums";

// Component schema for outfit templates
const outfitComponentSchema = z.object({
  type: z
    .enum([
      "top",
      "bottom",
      "shoes",
      "accessories",
      "outerwear",
      "undergarments",
      "headwear",
    ])
    .describe("Type of clothing component"),
  item: z.string().describe("Name of the clothing item"),
  isRequired: z.boolean().describe("Whether this component is required"),
  defaultColor: z
    .string()
    .optional()
    .describe("Default color of the component"),
  defaultMaterial: z
    .string()
    .optional()
    .describe("Default material of the component"),
  defaultPattern: z
    .string()
    .optional()
    .describe("Default pattern on the component"),
  alternatives: z
    .array(
      z.object({
        item: z.string().describe("Alternative item name"),
        color: z.string().optional().describe("Alternative color"),
        material: z.string().optional().describe("Alternative material"),
        pattern: z.string().optional().describe("Alternative pattern"),
        condition: z
          .string()
          .optional()
          .describe("Condition for using this alternative"),
      })
    )
    .optional()
    .describe("Alternative options for this component"),
});

// Color scheme schema
const colorSchemeSchema = z.object({
  name: z.string().describe("Name of the color scheme"),
  primary: z.string().describe("Primary color"),
  secondary: z.string().optional().describe("Secondary color"),
  accent: z.string().optional().describe("Accent color"),
  description: z
    .string()
    .optional()
    .describe("Description of the color scheme"),
});

// Outfit variation schema
const outfitVariationSchema = z.object({
  id: z.string().describe("Unique identifier for the variation"),
  name: z.string().describe("Name of the variation"),
  description: z.string().optional().describe("Description of the variation"),
  componentOverrides: z
    .array(
      z.object({
        componentType: z.string().describe("Type of component to override"),
        newItem: z.string().describe("New item name"),
        newColor: z.string().optional().describe("New color"),
        newMaterial: z.string().optional().describe("New material"),
        newPattern: z.string().optional().describe("New pattern"),
      })
    )
    .optional()
    .describe("Component modifications"),
  additionalComponents: z
    .array(outfitComponentSchema)
    .optional()
    .describe("Additional components for this variation"),
  conditions: z
    .object({
      weather: z.array(z.string()).optional().describe("Weather conditions"),
      timeOfDay: z
        .array(z.string())
        .optional()
        .describe("Time of day conditions"),
      mood: z.array(z.string()).optional().describe("Mood conditions"),
      activity: z.array(z.string()).optional().describe("Activity conditions"),
    })
    .optional()
    .describe("Conditions for using this variation"),
  promptModifiers: z
    .array(z.string())
    .optional()
    .describe("Prompt modifications"),
  imageUrl: z.string().optional().describe("Image URL for this variation"),
  isActive: z.boolean().describe("Whether this variation is active"),
  usageCount: z.number().int().describe("Usage count"),
  lastUsed: z.date().optional().describe("Last used date"),
  createdAt: z.date().describe("Creation date"),
  updatedAt: z.date().describe("Last update date"),
});

// Lighting schema for location templates
const lightingSchema = z.object({
  type: z
    .enum(["natural", "artificial", "mixed"])
    .optional()
    .describe("Type of lighting"),
  intensity: z
    .enum(["dim", "moderate", "bright"])
    .optional()
    .describe("Lighting intensity"),
  color: z.string().optional().describe("Color of the lighting"),
});

// Body parts schema for pose templates
const bodyPartsSchema = z.object({
  head: z.string().optional().describe("Head position or angle"),
  arms: z.string().optional().describe("Arms position"),
  hands: z.string().optional().describe("Hands position or gesture"),
  torso: z.string().optional().describe("Torso position"),
  legs: z.string().optional().describe("Legs position"),
  feet: z.string().optional().describe("Feet position"),
});

// Outfit Template Schema
export const outfitTemplateSchema = z
  .object({
    id: z.string().describe("Unique identifier for the outfit template"),
    name: z
      .string()
      .min(1, "Outfit name is required")
      .describe("Name of the outfit (e.g., 'School Uniform', 'Casual')"),
    description: z.string().describe("Short, visual-friendly summary"),
    category: z
      .enum([
        "casual",
        "formal",
        "traditional",
        "fantasy",
        "modern",
        "vintage",
        "futuristic",
        "seasonal",
        "special",
      ])
      .describe("Outfit category for classification"),
    subCategory: z.string().optional().describe("More specific categorization"),
    gender: z
      .enum(["male", "female", "unisex"])
      .describe("Gender this outfit is designed for"),
    ageGroup: z
      .enum(["child", "teen", "adult", "elderly"])
      .describe("Age group this outfit suits"),
    season: z
      .enum(["spring", "summer", "autumn", "winter", "all"])
      .describe("Seasonal appropriateness"),
    style: z
      .enum(["anime", "realistic", "cartoon", "manga"])
      .describe("Art style for the outfit"),
    components: z
      .array(outfitComponentSchema)
      .describe("Components that make up the outfit"),
    colorSchemes: z
      .array(colorSchemeSchema)
      .describe("Available color schemes for the outfit"),
    materials: z.array(z.string()).describe("Materials used in the outfit"),
    variations: z
      .array(outfitVariationSchema)
      .optional()
      .describe("Outfit variations for different situations"),
    occasions: z
      .array(z.string())
      .describe("Occasions this outfit is suitable for"),
    compatibility: z
      .object({
        weather: z
          .array(
            z.enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy"])
          )
          .describe("Compatible weather conditions"),
        timeOfDay: z
          .array(
            z.enum(["dawn", "morning", "noon", "afternoon", "evening", "night"])
          )
          .describe("Compatible times of day"),
        activities: z.array(z.string()).describe("Compatible activities"),
      })
      .describe("Compatibility information"),
    tags: z.array(z.string()).describe("Tags for filtering and search"),
    imagePrompt: z
      .string()
      .optional()
      .describe("AI prompt for generating outfit images"),
    imageUrl: z.string().optional().describe("URL of reference image"),
    isActive: z.boolean().describe("Whether this template is active"),
    mangaProjectId: z.string().describe("ID of the parent manga project"),
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),
  })
  .describe("Template defining character outfits for consistent AI generation");

// Location variation schema
const locationVariationSchema = z.object({
  id: z.string().describe("Unique identifier for the variation"),
  name: z.string().describe("Name of the variation"),
  timeOfDay: z
    .enum(["dawn", "morning", "noon", "afternoon", "evening", "night", "any"])
    .optional()
    .describe("Time of day override"),
  weather: z
    .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy", "any"])
    .optional()
    .describe("Weather override"),
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
    .optional()
    .describe("Mood override"),
  lighting: lightingSchema.optional().describe("Lighting override"),
  additionalProps: z.array(z.string()).optional().describe("Additional props"),
  modifiedColors: z.array(z.string()).optional().describe("Modified colors"),
  promptModifiers: z
    .array(z.string())
    .optional()
    .describe("Prompt modifications"),
  imageUrl: z.string().optional().describe("Image URL for this variation"),
  isActive: z.boolean().describe("Whether this variation is active"),
  usageCount: z.number().int().describe("Usage count"),
  lastUsed: z.date().optional().describe("Last used date"),
  createdAt: z.date().describe("Creation date"),
  updatedAt: z.date().describe("Last update date"),
});

// Location Template Schema
export const locationTemplateSchema = z
  .object({
    id: z.string().describe("Unique identifier for the location template"),
    name: z
      .string()
      .min(1, "Location name is required")
      .describe("Name of the location (e.g., 'Classroom', 'Park')"),
    description: z.string().describe("Short description of the location"),
    category: z
      .enum([
        "indoor",
        "outdoor",
        "urban",
        "rural",
        "fantasy",
        "futuristic",
        "historical",
        "natural",
        "architectural",
      ])
      .describe("Location category"),
    subCategory: z.string().optional().describe("More specific categorization"),

    // Backward compatibility fields
    timeOfDay: z
      .enum(["dawn", "morning", "noon", "afternoon", "evening", "night", "any"])
      .optional()
      .describe("Backward compatibility: time of day setting"),
    weather: z
      .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy", "any"])
      .optional()
      .describe("Backward compatibility: weather conditions"),
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
      .optional()
      .describe("Backward compatibility: mood of the location"),
    lighting: lightingSchema
      .optional()
      .describe("Backward compatibility: lighting configuration"),

    // New enhanced fields
    defaultTimeOfDay: z
      .enum(["dawn", "morning", "noon", "afternoon", "evening", "night", "any"])
      .optional()
      .describe("Default time of day for this location"),
    defaultWeather: z
      .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy", "any"])
      .optional()
      .describe("Default weather conditions"),
    defaultMood: z
      .enum([
        "peaceful",
        "mysterious",
        "energetic",
        "romantic",
        "tense",
        "cheerful",
        "somber",
      ])
      .optional()
      .describe("Default mood of the location"),

    style: z
      .enum(["anime", "realistic", "cartoon", "manga"])
      .describe("Art style for the location"),

    baseLighting: lightingSchema.optional().describe("Base lighting setup"),
    variations: z
      .array(locationVariationSchema)
      .optional()
      .describe("Supported variations for this location"),
    cameraAngles: z
      .array(
        z.enum([
          "wide-shot",
          "medium-shot",
          "close-up",
          "birds-eye",
          "worms-eye",
          "dutch-angle",
          "over-shoulder",
        ])
      )
      .describe("Available camera angles"),
    props: z.array(z.string()).describe("Props available in this location"),
    colors: z.array(z.string()).describe("Primary colors of the location"),
    tags: z.array(z.string()).describe("Tags for filtering and search"),
    imagePrompt: z
      .string()
      .optional()
      .describe("Base AI prompt for generating location images"),
    baseImagePrompt: z
      .string()
      .optional()
      .describe("Base image prompt that can be enhanced by variations"),
    imageUrl: z.string().optional().describe("URL of reference image"),
    isActive: z.boolean().describe("Whether this template is active"),
    mangaProjectId: z.string().describe("ID of the parent manga project"),
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),
  })
  .describe("Template defining locations for consistent scene generation");

// Character Schema
export const characterSchema = z
  .object({
    id: z.string().describe("Unique identifier for the character"),
    name: z
      .string()
      .min(1, "Character name is required")
      .describe("Full name of the character"),
    age: z.number().int().describe("Age in years"),
    gender: z.string().describe("Gender identity"),

    // Physical Attributes
    bodyAttributes: z
      .object({
        height: z.string().describe("Height measurement with units"),
        bodyType: z.string().describe("General physique description"),
        proportions: z.string().describe("Notable proportional features"),
      })
      .describe("Physical body characteristics"),

    facialAttributes: z
      .object({
        faceShape: z.string().describe("Shape of the face"),
        skinTone: z.string().describe("Skin color description"),
        eyeColor: z.string().describe("Color of eyes"),
        eyeShape: z.string().describe("Shape of eyes"),
        noseType: z.string().describe("Nose shape"),
        mouthType: z.string().describe("Mouth/lip shape"),
        jawline: z.string().describe("Jaw structure"),
      })
      .describe("Facial features"),

    hairAttributes: z
      .object({
        hairColor: z.string().describe("Color of hair"),
        hairstyle: z.string().describe("Style of hair"),
        hairLength: z.string().describe("Length of hair"),
        hairTexture: z.string().describe("Texture of hair"),
        specialHairFeatures: z
          .string()
          .describe("Notable hair characteristics"),
      })
      .describe("Hair characteristics"),

    distinctiveFeatures: z
      .array(z.string())
      .describe("Unique identifying physical traits"),

    physicalMannerisms: z
      .array(z.string())
      .describe("Characteristic body movements"),

    posture: z.string().describe("Typical stance or bearing"),

    // Art Direction
    styleGuide: z
      .object({
        artStyle: z.string().describe("Preferred artistic treatment"),
        lineweight: z.string().describe("Line art characteristics"),
        shadingStyle: z.string().describe("Shading technique"),
        colorStyle: z.string().describe("Coloring approach"),
      })
      .describe("Artistic guidelines"),

    // Outfit Management
    defaultOutfitId: z.string().optional().describe("ID of their main outfit"),
    outfitHistory: z
      .array(
        z.object({
          sceneId: z.string().describe("Scene ID"),
          outfitId: z.string().describe("Outfit ID used in scene"),
        })
      )
      .optional()
      .describe("History of outfits worn in different scenes"),

    // AI Generation
    consistencyPrompt: z
      .string()
      .optional()
      .describe("Prompt for consistent character generation"),
    negativePrompt: z
      .string()
      .optional()
      .describe("Negative prompt for image generation"),

    // Narrative Attributes
    role: z
      .enum(["protagonist", "antagonist", "supporting", "minor"])
      .describe("Narrative importance level"),
    briefDescription: z.string().describe("Short character summary"),
    personality: z.string().describe("Psychological profile"),
    abilities: z.string().describe("Special skills or powers"),
    backstory: z.string().describe("Historical background"),

    // Visual References
    imgUrl: z.string().url().optional().describe("Primary reference image URL"),

    // Development
    traits: z.array(z.string()).describe("Personality traits"),
    arcs: z.array(z.string()).describe("Character development arcs"),

    // Metadata
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe("Whether character was automatically generated"),
    mangaProjectId: z.string().describe("ID of the parent manga project"),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),
  })
  .describe("Detailed profile of a manga character");

// Chapter Schema
export const chapterSchema = z
  .object({
    id: z.string().describe("Unique identifier for the chapter"),
    chapterNumber: z
      .number()
      .describe("Sequential chapter number in your manga series"),
    title: z
      .string()
      .describe(
        "Compelling chapter title that captures essence and hooks readers"
      ),
    narrative: z
      .string()
      .describe(
        "Complete 600-800 word chapter narrative with visual storytelling structure"
      ),
    purpose: z
      .string()
      .optional()
      .describe(
        "Specific narrative function this chapter serves in overall story arc"
      ),
    tone: z
      .string()
      .optional()
      .describe(
        "Emotional atmosphere and mood (tense, lighthearted, mysterious, dramatic, etc.)"
      ),
    keyCharacters: z
      .array(z.string())
      .optional()
      .describe("Names of characters with important roles in this chapter"),
    coverImageUrl: z
      .string()
      .url()
      .optional()
      .describe("URL of the chapter's cover image"),
    mangaProjectId: z.string().describe("ID of the parent manga project"),
    isAiGenerated: z
      .boolean()
      .optional()
      .describe("Whether content was automatically generated"),
    isPublished: z.boolean().optional().describe("Public availability status"),
    viewCount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe("Number of times viewed"),
    createdAt: z
      .date()
      .or(z.string().datetime())
      .optional()
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .optional()
      .describe("Last update timestamp"),
    scenes: z
      .array(z.lazy(() => sceneSchema))
      .optional()
      .describe("Scenes contained within this chapter"),
  })
  .describe("A single chapter within a manga series");

// Scene Schema
export const sceneSchema = z
  .object({
    id: z.string().describe("Unique identifier for the scene"),
    order: z.number().int().min(0).describe("Sequence position within chapter"),
    title: z
      .string()
      .min(1, "Scene title is required")
      .describe("Descriptive title of the scene"),
    description: z
      .string()
      .describe("Description of what happens in the scene"),

    // Scene Context
    sceneContext: z.object({
      locationId: z
        .string()
        .optional()
        .describe("ID of the location template being used"),
      locationVariationId: z
        .string()
        .optional()
        .describe("ID of the specific location variation"),
      characterOutfits: z
        .array(
          z.object({
            characterId: z.string().describe("Character ID"),
            outfitId: z.string().describe("Outfit template ID"),
            outfitVariationId: z
              .string()
              .optional()
              .describe("Specific outfit variation ID"),
            reason: z.string().optional().describe("Reason for outfit choice"),
          })
        )
        .describe("Character outfit assignments for this scene"),
      presentCharacters: z
        .array(z.string())
        .describe("IDs of characters appearing in the scene"),
      environmentOverrides: z
        .object({
          timeOfDay: z
            .enum(["dawn", "morning", "noon", "afternoon", "evening", "night"])
            .optional()
            .describe("Time of day override"),
          weather: z
            .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy"])
            .optional()
            .describe("Weather override"),
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
            .optional()
            .describe("Mood/atmosphere override"),
          lighting: z
            .object({
              type: z.enum(["natural", "artificial", "mixed"]).optional(),
              intensity: z.enum(["dim", "moderate", "bright"]).optional(),
              color: z.string().optional(),
            })
            .optional()
            .describe("Lighting conditions"),
          additionalProps: z
            .array(z.string())
            .optional()
            .describe("Additional environmental properties"),
        })
        .optional()
        .describe("Environmental condition overrides"),
    }),

    // Relationships
    chapterId: z.string().describe("ID of the parent chapter"),

    // Metadata
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe("Whether scene was automatically generated"),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),

    // Children
    panels: z
      .array(z.lazy(() => panelSchema))
      .optional()
      .describe("Panels composing this scene"),
  })
  .describe("A continuous story segment within a chapter");

// Panel Schema
export const panelSchema = z
  .object({
    id: z.string().describe("Unique identifier for the panel"),
    order: z.number().describe("Sequence position within scene"),
    imageUrl: z
      .string()
      .url()
      .optional()
      .describe("URL of the rendered panel image"),

    // Panel Context
    panelContext: z.object({
      locationId: z.string().describe("ID of the location template"),
      locationVariationId: z
        .string()
        .optional()
        .describe("ID of the specific location variation"),
      action: z
        .string()
        .optional()
        .describe("Primary action occurring in the panel"),
      characterPoses: z
        .array(
          z.object({
            characterId: z.string().describe("ID of the character"),
            characterName: z.string().describe("Name of character"),
            outfitId: z.string().describe("ID of outfit template"),
            outfitVariationId: z
              .string()
              .optional()
              .describe("ID of outfit variation"),
            pose: z.string().describe("Specific pose description"),
            expression: z.string().describe("Facial expression"),
            position: z.string().optional().describe("Position in panel"),
          })
        )
        .describe("Character positioning and expressions"),
      environmentOverrides: z
        .object({
          lighting: z
            .object({
              type: z.enum(["natural", "artificial", "mixed"]).optional(),
              intensity: z.enum(["dim", "moderate", "bright"]).optional(),
              color: z.string().optional(),
              direction: z.string().optional().describe("Lighting direction"),
            })
            .optional()
            .describe("Lighting conditions"),
          weather: z
            .enum(["sunny", "cloudy", "rainy", "stormy", "snowy", "foggy"])
            .optional()
            .describe("Weather conditions"),
          timeOfDay: z
            .enum(["dawn", "morning", "noon", "afternoon", "evening", "night"])
            .optional()
            .describe("Time of day"),
          atmosphere: z
            .string()
            .optional()
            .describe("Environmental atmosphere"),
        })
        .optional()
        .describe("Environmental condition overrides"),
      cameraSettings: z
        .object({
          angle: z
            .enum(["close-up", "medium", "wide", "bird's eye", "low angle"])
            .optional()
            .describe("Camera angle"),
          shotType: z
            .enum([
              "action",
              "reaction",
              "establishing",
              "detail",
              "transition",
            ])
            .optional()
            .describe("Type of shot"),
          focus: z.string().optional().describe("What the camera focuses on"),
        })
        .optional()
        .describe("Camera and framing settings"),
      visualEffects: z
        .array(z.string())
        .optional()
        .describe("Special visual effects to apply"),
      panelNotes: z
        .string()
        .optional()
        .describe("Additional panel-specific notes"),
    }),

    // Relationships
    sceneId: z.string().describe("ID of the parent scene"),

    // Generation
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe("Whether panel was automatically generated"),
    negativePrompt: z
      .string()
      .optional()
      .describe("Negative prompt for image generation"),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),

    // Children
    dialogues: z
      .array(z.lazy(() => panelDialogueSchema))
      .optional()
      .describe("Dialogue contained in this panel"),
    characters: z
      .array(z.lazy(() => characterSchema))
      .optional()
      .describe("Character references appearing in panel"),
  })
  .describe("A single illustrated frame within a manga scene");

// Panel Dialogue Schema
export const panelDialogueSchema = z
  .object({
    id: z.string().describe("Unique identifier for the dialogue"),
    content: z
      .string()
      .min(1, "Dialogue content is required")
      .describe("Actual spoken/written text"),
    order: z.number().int().min(0).describe("Sequence position within panel"),

    // Styling
    style: z
      .object({
        bubbleType: z
          .enum(["normal", "thought", "scream", "whisper", "narration"])
          .optional()
          .describe("Visual presentation style"),
      })
      .optional()
      .describe("Visual presentation attributes"),

    // Context
    emotion: z.string().optional().describe("Emotional tone of delivery"),
    subtextNote: z.string().optional().describe("Unspoken meaning or context"),

    // Relationships
    panelId: z.string().describe("ID of the containing panel"),
    speakerId: z
      .string()
      .nullable()
      .optional()
      .describe("ID of the speaking character if applicable"),

    // Generation
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe("Whether dialogue was automatically generated"),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),

    // Reference
    speaker: z
      .lazy(() => characterSchema)
      .nullable()
      .optional()
      .describe("Resolved speaker character details"),
    config: z.any().optional(),
  })
  .describe("Dialogue text within a manga panel");

// Manga Project Schema
export const mangaProjectSchema = z
  .object({
    id: z.string().describe("Unique identifier for the manga series"),
    title: z
      .string()
      .min(1, "Project title is required")
      .describe("Official title of the manga series"),
    description: z
      .string()
      .optional()
      .describe("Brief summary of the manga's premise and setting"),
    status: z
      .nativeEnum(MangaStatus)
      .describe("Current development phase of the project"),
    initialPrompt: z
      .string()
      .optional()
      .describe("Original concept or inspiration for the manga"),
    genre: z.string().optional().describe("Primary genre classification"),
    artStyle: z
      .string()
      .optional()
      .describe("Visual style description or artistic reference"),
    coverImageUrl: z
      .string()
      .url()
      .optional()
      .describe("URL pointing to the cover artwork image"),
    targetAudience: z
      .enum(["children", "teen", "young-adult", "adult"])
      .optional()
      .describe("Intended demographic readership"),

    // World Building
    worldDetails: z
      .object({
        summary: z
          .string()
          .describe("High-level overview of the manga's universe"),
        history: z
          .string()
          .describe("Historical background and major past events"),
        society: z
          .string()
          .describe("Cultural norms, social structures, and factions"),
        uniqueSystems: z
          .string()
          .describe("Special rules governing magic, technology, or powers"),
      })
      .optional()
      .describe("Detailed setting information for the manga world"),

    // Narrative Elements
    concept: z
      .string()
      .optional()
      .describe("Core thematic idea or central conflict"),
    plotStructure: z
      .object({
        incitingIncident: z
          .string()
          .describe("Event that triggers the main storyline"),
        plotTwist: z.string().describe("Major unexpected development"),
        climax: z.string().describe("Pivotal confrontation or crisis point"),
        resolution: z.string().describe("How the central conflict concludes"),
      })
      .optional()
      .describe("Key structural elements of the narrative"),

    // Templates
    outfitTemplates: z
      .array(outfitTemplateSchema)
      .optional()
      .describe("Outfit templates for consistent character appearance"),
    locationTemplates: z
      .array(locationTemplateSchema)
      .optional()
      .describe("Location templates with camera angles"),

    // Thematic Elements
    themes: z
      .array(z.string())
      .optional()
      .describe("Recurring ideas or messages explored"),
    motifs: z
      .array(z.string())
      .optional()
      .describe("Recurring symbolic elements or imagery"),
    symbols: z
      .array(z.string())
      .optional()
      .describe("Objects representing abstract concepts"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Keywords for categorization and discovery"),

    // Ownership and Metadata
    creatorId: z
      .string()
      .optional()
      .describe("ID of the user who created this project"),
    messages: z
      .array(
        z.object({
          role: z.string(),
          parts: z.array(z.object({ text: z.string() })),
        })
      )
      .optional()
      .describe("Chat messages for AI generation context"),
    viewCount: z
      .number()
      .int()
      .nonnegative()
      .describe("Number of times viewed"),
    likeCount: z
      .number()
      .int()
      .nonnegative()
      .describe("Number of likes received"),
    published: z.boolean().describe("Whether the manga is published"),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe("Last update timestamp"),

    // Relationships
    chapters: z
      .array(chapterSchema)
      .optional()
      .describe("Chapters in this manga"),
    characters: z
      .array(characterSchema)
      .optional()
      .describe("Characters in this manga"),
  })
  .describe("Complete definition of a manga project including all metadata");

// Export all schemas
export const schemas = {
  outfitTemplate: outfitTemplateSchema,
  locationTemplate: locationTemplateSchema,
  mangaProject: mangaProjectSchema,
  chapter: chapterSchema,
  character: characterSchema,
  scene: sceneSchema,
  panel: panelSchema,
  panelDialogue: panelDialogueSchema,
};

// Type exports
export type MangaSchemas = {
  outfitTemplate: z.infer<typeof outfitTemplateSchema>;
  locationTemplate: z.infer<typeof locationTemplateSchema>;
  mangaProject: z.infer<typeof mangaProjectSchema>;
  chapter: z.infer<typeof chapterSchema>;
  character: z.infer<typeof characterSchema>;
  scene: z.infer<typeof sceneSchema>;
  panel: z.infer<typeof panelSchema>;
  panelDialogue: z.infer<typeof panelDialogueSchema>;
};
