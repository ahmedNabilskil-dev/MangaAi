import { z } from "zod";
import { MangaStatus } from "./enums";

// Base Location Schema
export const locationSchema = z
  .object({
    name: z
      .string()
      .min(1, "Location name is required")
      .describe("The canonical name of the location within the manga universe"),
    description: z
      .string()
      .optional()
      .describe(
        "Detailed physical description of the location's appearance and features"
      ),
    significance: z
      .string()
      .optional()
      .describe(
        "The narrative, thematic or cultural importance of this location to the story"
      ),
  })
  .describe("A physical setting where scenes take place in the manga");

// Key Event Schema
export const keyEventSchema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .describe("The official title used to reference this plot event"),
    description: z
      .string()
      .optional()
      .describe("Complete breakdown of what occurs during this story moment"),
    sequence: z
      .number()
      .int()
      .optional()
      .describe(
        "Numerical order indicating when this event occurs in the overall narrative"
      ),
  })
  .describe("A significant moment that advances the main storyline");

// Visual Anchor Schema
export const visualAnchorSchema = z
  .object({
    text: z
      .string()
      .min(1, "Anchor text is required")
      .describe(
        "Descriptive text defining a distinctive visual characteristic"
      ),
    weight: z
      .number()
      .min(0)
      .max(3)
      .optional()
      .default(1.0)
      .describe(
        "Importance level (0=background, 1=standard, 2=key feature, 3=signature trait)"
      ),
  })
  .describe(
    "A consistent visual element that helps maintain character/scene recognition"
  );

// User Schema
const userSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .describe("Unique system identifier for the user account"),
    username: z.string().min(1).describe("Public display name for the user"),
    email: z.string().email().describe("Primary contact email address"),
  })
  .describe("Registered user account information");

// Manga Project Schema
export const mangaProjectSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Unique identifier for the manga series"),
    title: z
      .string()
      .min(1, "Project title is required")
      .describe("Official title of the manga series"),
    description: z
      .string()
      .describe("Brief summary of the manga's premise and setting"),
    status: z
      .nativeEnum(MangaStatus)
      .describe("Current development phase of the project"),
    initialPrompt: z
      .string()
      .describe("Original concept or inspiration for the manga"),
    genre: z
      .string()
      .describe("Primary genre classification (e.g., shonen, shojo, seinen)"),
    artStyle: z
      .string()
      .describe("Visual style description or artistic reference"),
    coverImageUrl: z
      .string()
      .url()
      .optional()
      .describe("URL pointing to the cover artwork image"),
    targetAudience: z
      .enum(["children", "teen", "young-adult", "adult"])
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
    concept: z.string().describe("Core thematic idea or central conflict"),
    plotStructure: z
      .object({
        incitingIncident: z
          .string()
          .describe("Event that triggers the main storyline"),
        plotTwist: z.string().describe("Major unexpected development"),
        climax: z.string().describe("Pivotal confrontation or crisis point"),
        resolution: z.string().describe("How the central conflict concludes"),
      })
      .describe("Key structural elements of the narrative"),

    themes: z
      .array(z.string())
      .describe("Recurring ideas or messages explored"),
    motifs: z
      .array(z.string())
      .describe("Recurring symbolic elements or imagery"),
    symbols: z
      .array(z.string())
      .describe("Objects representing abstract concepts"),
    tags: z
      .array(z.string())
      .describe("Keywords for categorization and discovery"),

    // Ownership
    creatorId: z
      .string()
      .uuid()
      .optional()
      .describe("ID of the user who created this project"),
    // Relationships
    chapters: z
      .array(z.lazy(() => chapterSchema))
      .optional()
      .describe("Collection of chapters in this manga"),
    characters: z
      .array(z.lazy(() => characterSchema))
      .optional()
      .describe("Characters appearing in this manga"),
  })
  .describe("Complete definition of a manga project including all metadata");

// Chapter Schema
export const chapterSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Unique identifier for the chapter"),
    chapterNumber: z
      .number()
      .int()
      .min(1)
      .describe("Numerical position within the manga sequence"),
    title: z
      .string()
      .min(1, "Chapter title is required")
      .describe("Official title of the chapter"),
    narrative: z.string().describe("Complete literary prose narrative"),
    purpose: z.string().describe("Narrative function this chapter serves"),
    tone: z.string().describe("Dominant mood or atmosphere"),
    keyCharacters: z
      .array(z.string())
      .describe("IDs of characters prominently featured"),
    coverImageUrl: z
      .string()
      .url()
      .optional()
      .describe("URL of the chapter's cover image"),
    mangaProjectId: z
      .string()
      .uuid()
      .describe("ID of the parent manga project"),
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe("Whether content was automatically generated"),
    isPublished: z
      .boolean()
      .default(false)
      .describe("Public availability status"),
    viewCount: z
      .number()
      .int()
      .nonnegative()
      .default(0)
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

// Character Schema
export const characterSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Unique identifier for the character"),
    name: z
      .string()
      .min(1, "Character name is required")
      .describe("Full name of the character"),
    age: z.number().int().optional().describe("Age in years (if applicable)"),
    gender: z.string().describe("Gender identity"),

    // Physical Attributes
    bodyAttributes: z
      .object({
        height: z.string().describe("Height measurement with units"),
        bodyType: z
          .string()

          .describe("General physique description"),
        proportions: z
          .string()

          .describe("Notable proportional features"),
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

    // Behavioral Attributes
    expressionStyle: z
      .object({
        defaultExpression: z
          .string()

          .describe("Character's typical facial expression"),
        emotionalRange: z
          .string()

          .describe("Breadth of emotional expression"),
        facialTics: z
          .array(z.string())

          .describe("Recurring facial movements"),
      })

      .describe("Expressive characteristics"),

    // Style Attributes
    style: z
      .object({
        defaultOutfit: z
          .string()

          .describe("Primary clothing ensemble"),
        outfitVariations: z
          .array(z.string())

          .describe("Alternate clothing sets"),
        colorPalette: z
          .array(z.string())

          .describe("Character's color scheme"),
        accessories: z
          .array(z.string())

          .describe("Regularly worn items"),
        signatureItem: z
          .string()

          .describe("Distinctive carried/worn item"),
      })

      .describe("Costuming and style"),

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
    expressionImages: z
      .record(z.string())
      .optional()
      .describe("Mapped expression images"),
    referenceImageUrls: z
      .array(z.string().url())
      .optional()
      .describe("Additional visual references"),

    // Development
    traits: z.array(z.string()).describe("Personality traits"),
    arcs: z.array(z.string()).describe("Character development arcs"),
    isAiGenerated: z
      .boolean()
      .default(true)
      .describe("Whether character was automatically generated"),
    aiGenerationPrompt: z
      .string()
      .optional()
      .describe("Prompt used for generation if applicable"),

    consistencyPrompt: z
      .string()
      .describe(
        "the prompt that will feed to image ai generation it must be consistent"
      ),
    negativePrompt: z
      .string()
      .describe("the negative prompt that will feed to image ai generation"),

    // Relationships
    mangaProjectId: z
      .string()
      .uuid()
      .describe("ID of the parent manga project"),

    // Timestamps
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
  })
  .describe("Detailed profile of a manga character");

// Scene Schema
export const sceneSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Unique identifier for the scene"),
    order: z.number().int().min(0).describe("Sequence position within chapter"),
    title: z
      .string()
      .min(1, "Scene title is required")
      .describe("Descriptive title of the scene"),
    visualSequence: z
      .string()
      .describe("Visual sequences of the scene with consistency markers"),

    // Context
    sceneContext: z.object({
      setting: z
        .string()
        .describe("Physical location of the scene with consistency anchors"),
      mood: z.string().describe("Emotional atmosphere"),
      presentCharacters: z
        .array(z.string())

        .describe("IDs of characters appearing"),
      timeOfDay: z
        .string()

        .describe("When the scene occurs for lighting consistency"),
      weather: z
        .string()

        .describe("Environmental conditions for atmospheric consistency"),
      consistencyAnchors: z
        .object({
          characterClothing: z.record(z.string()),
          environmentalElements: z.array(z.string()),
          lightingSources: z.array(z.string()),
          colorPalette: z.array(z.string()),
          atmosphericEffects: z.array(z.string()),
        })
        .describe("Tracking elements for visual consistency"),
    }),

    // Relationships
    chapterId: z.string().uuid().describe("ID of the parent chapter"),

    // Content
    dialogueOutline: z.any().describe("Structural breakdown of dialogue"),
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
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Unique identifier for the panel"),
    order: z.number().describe("Sequence position within scene"),
    imageUrl: z
      .string()
      .url()
      .optional()
      .describe("URL of the rendered panel image"),

    // Composition
    panelContext: z.object({
      action: z.string().optional().describe("Primary action occurring"),
      characterPoses: z
        .array(
          z.object({
            characterName: z.string().describe("Name of character"),
            pose: z.string().describe("Specific pose description"),
            expression: z.string().describe("Facial expression"),
            clothing: z.string().describe("Complete clothing description"),
            props: z.array(z.string()).optional(),
            spatialPosition: z.string().optional(),
            physicalState: z.string().optional(),
            gestureDetails: z.string().optional(),
          })
        )
        .optional()
        .describe("Detailed character positioning"),
      emotion: z.string().optional().describe("Dominant emotional tone"),
      cameraAngle: z
        .enum([
          "close-up",
          "medium",
          "wide",
          "bird's eye",
          "low angle",
          "extreme close-up",
        ])
        .optional()
        .describe("Perspective of view"),
      shotType: z
        .enum(["action", "reaction", "establishing", "detail", "transition"])
        .optional()
        .describe("Type of visual framing"),
      backgroundDescription: z
        .string()
        .optional()
        .describe("Backdrop details with full consistency details"),

      lighting: z
        .string()
        .optional()
        .describe("Complete illumination description"),
      effects: z
        .array(z.string())
        .optional()
        .describe("Special visual effects"),
      dramaticPurpose: z.string().optional().describe("Narrative function"),
      narrativePosition: z
        .string()
        .optional()
        .describe("Placement within story flow"),
    }),

    // Relationships
    sceneId: z.string().uuid().describe("ID of the parent scene"),
    characterIds: z
      .array(z.string())
      .optional()
      .describe("IDs of characters featured"),

    // Generation
    isAiGenerated: z
      .boolean()
      .default(true)
      .describe("Whether panel was automatically generated"),
    aiPrompt: z
      .string()
      .optional()
      .describe("Complete prompt for direct generation"),
    negativePrompt: z
      .string()
      .optional()
      .describe("Negative prompt for image generation"),

    // Consistency
    consistencyElements: z
      .object({
        characterTemplates: z.record(z.string()).optional(),
        environmentTemplate: z.string().optional(),
        lightingTemplate: z.string().optional(),
        styleTemplate: z.string().optional(),
        propRegistry: z.array(z.string()).optional(),
      })
      .optional()
      .describe("Elements for maintaining visual consistency"),

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
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Unique identifier for the dialogue"),
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
        fontSize: z
          .enum(["x-small", "small", "medium", "large", "x-large"])
          .optional()
          .describe("Text size relative to panel"),
        fontType: z.string().optional().describe("Typeface or lettering style"),
        emphasis: z
          .boolean()
          .optional()
          .describe("Whether text should be highlighted"),
        position: z
          .object({ x: z.number(), y: z.number() })
          .optional()
          .describe("Coordinates within panel space"),
      })
      .optional()
      .describe("Visual presentation attributes"),

    // Context
    emotion: z.string().optional().describe("Emotional tone of delivery"),
    subtextNote: z.string().optional().describe("Unspoken meaning or context"),

    // Relationships
    panelId: z.string().uuid().describe("ID of the containing panel"),
    speakerId: z
      .string()
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
      .optional()
      .describe("Creation timestamp"),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .optional()
      .describe("Last update timestamp"),

    // Reference
    speaker: z
      .lazy(() => characterSchema)
      .nullable()
      .optional()
      .describe("Resolved speaker character details"),
    config: z.any(),
  })
  .describe("Dialogue text within a manga panel");

// Export all schemas
export const schemas = {
  location: locationSchema,
  keyEvent: keyEventSchema,
  visualAnchor: visualAnchorSchema,
  user: userSchema,
  mangaProject: mangaProjectSchema,
  chapter: chapterSchema,
  character: characterSchema,
  scene: sceneSchema,
  panel: panelSchema,
  panelDialogue: panelDialogueSchema,
};

// Type exports
export type MangaSchemas = {
  location: z.infer<typeof locationSchema>;
  keyEvent: z.infer<typeof keyEventSchema>;
  visualAnchor: z.infer<typeof visualAnchorSchema>;
  user: z.infer<typeof userSchema>;
  mangaProject: z.infer<typeof mangaProjectSchema>;
  chapter: z.infer<typeof chapterSchema>;
  character: z.infer<typeof characterSchema>;
  scene: z.infer<typeof sceneSchema>;
  panel: z.infer<typeof panelSchema>;
  panelDialogue: z.infer<typeof panelDialogueSchema>;
};
