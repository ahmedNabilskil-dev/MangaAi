import { z } from 'zod';

// Outfit Template Schema
export const outfitTemplateSchema = z
  .object({
    id: z.string().describe('Unique identifier for the outfit template'),
    name: z
      .string()
      .describe(
        "Descriptive name of the outfit (e.g., 'School Uniform', 'Winter Casual', 'Formal Evening Wear')",
      ),
    characterId: z
      .string()
      .describe(
        'ID of the character this outfit belongs to - establishes ownership and consistency',
      ),
    description: z
      .string()
      .describe(
        'Short visual summary (30-50 words) describing the overall look, style, and key visual elements of the outfit',
      ),
    aiPrompt: z
      .string()
      .describe(
        'Complete AI image generation prompt with specific garment details, colors, materials, styling, and accessories for consistent visual reproduction',
      ),
    category: z
      .enum(['casual', 'formal', 'school', 'special'])
      .describe(
        'Classification of outfit type: casual (everyday wear), formal (dressy occasions), school (uniforms/academic), special (unique/themed)',
      ),
    season: z
      .enum(['spring', 'summer', 'autumn', 'winter', 'all'])
      .describe(
        'Seasonal appropriateness of the outfit - determines when this outfit would logically be worn based on weather and context',
      ),
    isDefault: z
      .boolean()
      .describe(
        "Whether this is the character's primary/signature outfit - the default choice when no specific outfit is specified for scenes",
      ),
    tags: z
      .array(z.string())
      .describe(
        "Searchable keywords for filtering and categorization (e.g., 'sporty', 'elegant', 'colorful', 'practical')",
      ),
    imageUrl: z
      .string()
      .optional()
      .describe('URL of reference image showing the completed outfit design'),
    mangaProjectId: z
      .string()
      .describe(
        'ID of the parent manga project this outfit template belongs to',
      ),
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe('Creation timestamp'),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe('Last update timestamp'),
  })
  .describe(
    'Simplified template defining character outfits for consistent AI generation',
  );

// Location Template Schema
export const locationTemplateSchema = z
  .object({
    id: z.string().describe('Unique identifier for the location template'),
    name: z
      .string()
      .describe(
        "Clear, descriptive name of the location (e.g., 'High School Classroom 2-A', 'Downtown Park with Cherry Blossoms', 'Family Kitchen')",
      ),
    description: z
      .string()
      .describe(
        "Brief overview (30-50 words) of the location's purpose, atmosphere, and key visual characteristics",
      ),
    basePrompt: z
      .string()
      .describe(
        'Comprehensive AI generation prompt (100-150 words) describing architecture, layout, lighting, materials, colors, and environmental details for consistent visual reproduction',
      ),
    type: z
      .enum(['indoor', 'outdoor'])
      .describe(
        'Fundamental location classification determining lighting conditions, weather effects, and environmental factors',
      ),
    category: z
      .enum(['school', 'home', 'public', 'nature', 'fantasy'])
      .describe(
        'Thematic category: school (educational settings), home (residential), public (commercial/civic), nature (natural environments), fantasy (supernatural/fictional)',
      ),
    cameraAngles: z
      .array(z.string())
      .describe(
        "Array of available camera perspective descriptions for varied visual storytelling (e.g., 'wide establishing shot', 'close-up corner view', 'overhead layout view')",
      ),
    tags: z
      .array(z.string())
      .describe(
        "Searchable descriptive keywords for location discovery and filtering (e.g., 'bright', 'cozy', 'modern', 'traditional', 'spacious')",
      ),
    imageUrl: z
      .string()
      .optional()
      .describe(
        "URL of reference image showing the location's visual design and layout",
      ),
    mangaProjectId: z
      .string()
      .describe(
        'ID of the parent manga project this location template belongs to',
      ),
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe('Creation timestamp'),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe('Last update timestamp'),
  })
  .describe(
    'Simplified template defining locations for consistent scene generation',
  );

// Character Schema
export const characterSchema = z
  .object({
    id: z.string().describe('Unique identifier for the character'),
    name: z
      .string()
      .describe('Full name of the character as it appears in the story'),
    age: z
      .number()
      .describe(
        "Character's age in years - affects physical proportions, behavior patterns, and story role appropriateness",
      ),
    gender: z
      .string()
      .describe(
        "Character's gender identity - influences design choices, social interactions, and character archetype selection",
      ),

    // Physical Attributes
    bodyAttributes: z
      .object({
        height: z
          .string()
          .describe(
            "Character's height with units (e.g., '165cm', '5'6') - crucial for consistent size relationships between characters",
          ),
        bodyType: z
          .string()
          .describe(
            "Overall physique description (e.g., 'athletic', 'slender', 'stocky', 'petite') - defines silhouette and proportions",
          ),
        proportions: z
          .string()
          .describe(
            "Notable proportional characteristics specific to anime/manga style (e.g., 'long legs', 'broad shoulders', 'compact frame')",
          ),
      })
      .describe(
        "Physical body characteristics that define the character's overall build and proportions",
      ),

    facialAttributes: z
      .object({
        faceShape: z
          .string()
          .describe(
            "Shape and structure of the face (e.g., 'oval', 'round', 'angular', 'heart-shaped') - foundation for facial recognition",
          ),
        skinTone: z
          .string()
          .describe(
            "Skin color with specific descriptors (e.g., 'pale peach', 'warm olive', 'deep brown') - include hex codes when possible",
          ),
        eyeColor: z
          .string()
          .describe(
            "Eye color with specific hues (e.g., 'emerald green', 'deep amber', 'steel blue') - often exaggerated in anime style",
          ),
        eyeShape: z
          .string()
          .describe(
            "Eye shape and style (e.g., 'large round', 'sharp almond', 'droopy gentle') - key distinguishing anime feature",
          ),
        noseType: z
          .string()
          .describe(
            "Nose shape and prominence (e.g., 'small button', 'straight refined', 'slightly upturned') - usually subtle in anime",
          ),
        mouthType: z
          .string()
          .describe(
            "Mouth and lip characteristics (e.g., 'small rosebud', 'wide expressive', 'thin serious') - affects emotional expression",
          ),
        jawline: z
          .string()
          .describe(
            "Jaw structure and definition (e.g., 'soft rounded', 'defined angular', 'delicate pointed') - influences face shape",
          ),
      })
      .describe(
        'Detailed facial features that make the character instantly recognizable and visually distinct',
      ),

    hairAttributes: z
      .object({
        hairColor: z
          .string()
          .describe(
            "Hair color with specific tones (e.g., 'platinum blonde', 'raven black', 'auburn red') - can be natural or fantastical",
          ),
        hairstyle: z
          .string()
          .describe(
            "Hair styling and arrangement (e.g., 'messy spikes', 'twin ponytails', 'flowing waves', 'neat bob cut')",
          ),
        hairLength: z
          .string()
          .describe(
            "Length classification (e.g., 'shoulder-length', 'waist-long', 'pixie short', 'mid-back flowing')",
          ),
        hairTexture: z
          .string()
          .describe(
            "Hair texture and movement (e.g., 'silky straight', 'bouncy curls', 'wild untamed', 'soft waves')",
          ),
        specialHairFeatures: z
          .string()
          .describe(
            "Unique hair characteristics (e.g., 'natural highlights', 'asymmetrical cut', 'hair accessories', 'color gradients')",
          ),
      })
      .describe(
        'Complete hair design that serves as a major visual identifier and personality indicator',
      ),

    distinctiveFeatures: z
      .array(z.string())
      .describe(
        "Unique physical traits that make character instantly recognizable (e.g., 'scar over left eye', 'dimples when smiling', 'heterochromia', 'birthmark')",
      ),

    physicalMannerisms: z
      .array(z.string())
      .describe(
        "Characteristic body language and movements (e.g., 'fidgets with glasses', 'hands on hips when confident', 'tilts head when thinking')",
      ),

    posture: z
      .string()
      .describe(
        "Default body stance and bearing (e.g., 'confident upright', 'relaxed slouch', 'nervous fidgety', 'regal composed') - reflects personality",
      ),

    // Art Direction
    styleGuide: z
      .object({
        artStyle: z
          .string()
          .describe(
            "Specific artistic approach for this character (e.g., 'soft shoujo style', 'detailed seinen realism', 'energetic shounen')",
          ),
        lineweight: z
          .string()
          .describe(
            "Line art characteristics (e.g., 'thick bold outlines', 'delicate fine lines', 'variable expressive strokes')",
          ),
        shadingStyle: z
          .string()
          .describe(
            "Shading and lighting approach (e.g., 'cell shading', 'soft gradient', 'dramatic contrast', 'minimal flat')",
          ),
        colorStyle: z
          .string()
          .describe(
            "Color treatment method (e.g., 'vibrant saturated', 'muted pastels', 'high contrast', 'monochromatic accents')",
          ),
      })
      .describe(
        'Artistic guidelines ensuring visual consistency across all character appearances',
      ),

    // Outfit Management
    defaultOutfitId: z
      .string()
      .optional()
      .describe(
        "ID of the character's primary outfit template - used when no specific outfit is assigned to scenes",
      ),
    outfitHistory: z
      .array(
        z.object({
          sceneId: z
            .string()
            .describe('Scene identifier where outfit was worn'),
          outfitId: z
            .string()
            .describe('Outfit template ID used in that scene'),
        }),
      )
      .optional()
      .describe(
        'Historical record of outfit choices across different scenes for continuity tracking',
      ),

    // AI Generation
    consistencyPrompt: z
      .string()
      .optional()
      .describe(
        'Standardized prompt ensuring consistent character appearance across all AI-generated images - includes key visual markers',
      ),
    negativePrompt: z
      .string()
      .optional()
      .describe(
        "Negative prompt for AI image generation listing what to avoid (e.g., 'realistic, photographic, inconsistent style, wrong proportions')",
      ),

    // Narrative Attributes
    role: z
      .enum(['protagonist', 'antagonist', 'supporting', 'minor'])
      .describe(
        "Character's narrative importance: protagonist (main character), antagonist (opposing force), supporting (important secondary), minor (background)",
      ),
    briefDescription: z
      .string()
      .describe(
        'Concise character summary (50-100 words) covering personality essence, role in story, and key relationships',
      ),
    personality: z
      .string()
      .describe(
        'Detailed psychological profile including traits, motivations, fears, strengths, weaknesses, and behavioral patterns',
      ),
    abilities: z
      .string()
      .describe(
        "Special skills, talents, powers, or notable capabilities that define character's role and potential in the story",
      ),
    backstory: z
      .string()
      .describe(
        "Character's historical background, formative experiences, family history, and events that shaped their current personality",
      ),

    // Visual References
    imgUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "URL of the primary reference image showing the character's complete design and appearance",
      ),

    // Development
    traits: z
      .array(z.string())
      .describe(
        "Specific personality traits and characteristics (e.g., 'brave', 'impulsive', 'analytical', 'compassionate') for behavioral consistency",
      ),
    arcs: z
      .array(z.string())
      .describe(
        'Character development arcs and growth trajectories planned throughout the story progression',
      ),

    // Metadata
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe(
        'Whether this character was created automatically by AI (true) or manually designed by user (false)',
      ),
    mangaProjectId: z
      .string()
      .describe('ID of the parent manga project this character belongs to'),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe('Creation timestamp'),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe('Last update timestamp'),
  })
  .describe('Detailed profile of a manga character');

// Chapter Schema
export const chapterSchema = z
  .object({
    id: z.string().describe('Unique identifier for the chapter'),
    chapterNumber: z
      .number()
      .describe(
        'Sequential chapter number in the manga series - determines reading order and story progression',
      ),
    title: z
      .string()
      .describe(
        "Compelling chapter title that captures the essence, hooks readers, and hints at the chapter's central conflict or theme",
      ),
    narrative: z
      .string()
      .describe(
        'Complete 600-800 word chapter narrative with cinematic visual storytelling structure, natural panel break points, character development, and story advancement',
      ),
    purpose: z
      .string()
      .optional()
      .describe(
        "Specific narrative function this chapter serves in the overall story arc (e.g., 'character introduction', 'major conflict escalation', 'emotional climax', 'plot revelation')",
      ),
    tone: z
      .string()
      .optional()
      .describe(
        "Emotional atmosphere and mood that permeates the chapter (e.g., 'tense and suspenseful', 'lighthearted comedic', 'melancholy introspective', 'action-packed energetic')",
      ),
    keyCharacters: z
      .array(z.string())
      .optional()
      .describe(
        'Names of characters who play important roles or have significant development in this chapter',
      ),
    coverImageUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "URL of the chapter's cover artwork - should represent the chapter's theme or key moment",
      ),
    mangaProjectId: z
      .string()
      .describe('ID of the parent manga project this chapter belongs to'),
    isAiGenerated: z
      .boolean()
      .optional()
      .describe(
        'Whether the chapter content was automatically generated by AI (true) or manually written by user (false)',
      ),
    isPublished: z
      .boolean()
      .optional()
      .describe(
        'Public availability status - whether readers can access this chapter',
      ),
    viewCount: z
      .number()
      .nonnegative()
      .optional()
      .describe(
        'Number of times this chapter has been viewed by readers - engagement metric',
      ),
    createdAt: z
      .date()
      .or(z.string().datetime())
      .optional()
      .describe('Creation timestamp'),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .optional()
      .describe('Last update timestamp'),
    scenes: z
      .array(z.lazy(() => sceneSchema))
      .optional()
      .describe('Scenes contained within this chapter'),
  })
  .describe('A single chapter within a manga series');

// Scene Schema
export const sceneSchema = z
  .object({
    id: z.string().describe('Unique identifier for the scene'),
    order: z
      .number()
      .describe(
        'Sequential position within the parent chapter - determines the flow and pacing of story events',
      ),
    title: z
      .string()
      .describe(
        "Descriptive title that captures the scene's essence, purpose, or key event",
      ),
    description: z
      .string()
      .describe(
        'Rich narrative description (150-250 words) of what happens in the scene, including character actions, dialogue, emotions, and visual elements',
      ),

    // Scene Context
    sceneContext: z.object({
      locationId: z
        .string()
        .describe(
          'ID of the location template being used as the setting - establishes the visual environment and atmosphere',
        ),
      locationOverrides: z
        .object({
          timeOfDay: z
            .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
            .optional()
            .describe(
              'Override the default time of day for this scene - affects lighting, mood, and character behavior',
            ),
          weather: z
            .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
            .optional()
            .describe(
              'Override weather conditions for dramatic effect, seasonal consistency, or narrative purpose',
            ),
          customPrompt: z
            .string()
            .optional()
            .describe(
              "Custom AI generation prompt additions specific to this scene's unique visual requirements",
            ),
        })
        .optional()
        .describe(
          'Scene-specific modifications to the base location template for unique atmospheric conditions',
        ),
      characterOutfits: z
        .array(
          z.object({
            characterId: z
              .string()
              .describe('ID of the character whose outfit is being specified'),
            outfitId: z
              .string()
              .optional()
              .describe(
                "ID of the outfit template to use - if omitted, uses character's default outfit",
              ),
            customOutfit: z
              .object({
                description: z
                  .string()
                  .describe(
                    'Visual description of the custom outfit for this specific scene',
                  ),
                aiPrompt: z
                  .string()
                  .describe(
                    'AI generation prompt for creating this custom outfit design',
                  ),
              })
              .optional()
              .describe(
                "Custom outfit definition when existing templates don't meet scene requirements",
              ),
            reason: z
              .string()
              .optional()
              .describe(
                "Narrative justification for this outfit choice (e.g., 'formal event', 'weather change', 'character development')",
              ),
          }),
        )
        .describe(
          'Complete outfit assignments for all characters appearing in this scene - ensures visual consistency and narrative logic',
        ),
      presentCharacters: z
        .array(z.string())
        .describe(
          'Array of character IDs for all characters who appear in this scene - used for outfit management and interaction tracking',
        ),
      environmentOverrides: z
        .object({
          timeOfDay: z
            .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
            .optional()
            .describe(
              'Time override affecting lighting quality, character activity, and scene mood',
            ),
          weather: z
            .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
            .optional()
            .describe(
              'Weather override for atmospheric storytelling and visual drama',
            ),
          mood: z
            .enum([
              'peaceful',
              'mysterious',
              'energetic',
              'romantic',
              'tense',
              'cheerful',
              'somber',
            ])
            .optional()
            .describe(
              "Emotional atmosphere that should permeate the scene's visual presentation and character interactions",
            ),
          lighting: z
            .object({
              type: z
                .enum(['natural', 'artificial', 'mixed'])
                .optional()
                .describe(
                  'Source of illumination affecting visual style and mood',
                ),
              intensity: z
                .enum(['dim', 'moderate', 'bright'])
                .optional()
                .describe(
                  'Brightness level impacting visibility and atmosphere',
                ),
              color: z
                .string()
                .optional()
                .describe(
                  "Lighting color/temperature (e.g., 'warm golden', 'cool blue', 'harsh white') for dramatic effect",
                ),
            })
            .optional()
            .describe(
              'Detailed lighting specifications for creating specific visual moods and dramatic effects',
            ),
          additionalProps: z
            .array(z.string())
            .optional()
            .describe(
              "Extra environmental elements specific to this scene (e.g., 'falling leaves', 'bustling crowd', 'floating particles')",
            ),
        })
        .optional()
        .describe(
          'Environmental condition customizations that override location template defaults for storytelling purposes',
        ),
      sceneNotes: z
        .string()
        .optional()
        .describe(
          'Additional scene-specific production notes, special instructions, or continuity reminders for consistent execution',
        ),
    }),

    // Relationships
    chapterId: z
      .string()
      .describe(
        'ID of the parent chapter this scene belongs to - establishes narrative hierarchy and story flow',
      ),

    // Metadata
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe(
        'Whether this scene was automatically generated by AI (true) or manually created by user (false)',
      ),

    // Timestamps
    createdAt: z
      .date()
      .or(z.string().datetime())
      .describe('Creation timestamp'),
    updatedAt: z
      .date()
      .or(z.string().datetime())
      .describe('Last update timestamp'),

    // Children
    panels: z
      .array(z.lazy(() => panelSchema))
      .optional()
      .describe('Panels composing this scene'),
  })
  .describe('A continuous story segment within a chapter');

// Panel Schema
export const panelSchema = z
  .object({
    id: z.string().describe('Unique identifier for the panel'),
    order: z
      .number()
      .describe(
        'Sequential position within the parent scene - determines the flow and pacing of visual storytelling',
      ),
    imageUrl: z
      .string()
      .optional()
      .describe(
        'URL of the generated/rendered panel artwork - the final visual output for readers',
      ),

    // Panel Context
    panelContext: z.object({
      locationId: z
        .string()
        .describe(
          'ID of the location template that provides the environmental setting and base visual elements for this panel',
        ),
      locationOverrides: z
        .object({
          timeOfDay: z
            .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
            .optional()
            .describe(
              'Time of day override affecting lighting conditions, shadows, and overall visual atmosphere for storytelling purposes',
            ),
          weather: z
            .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
            .optional()
            .describe(
              'Weather condition override for dramatic effect, seasonal consistency, or narrative enhancement',
            ),
          customPrompt: z
            .string()
            .optional()
            .describe(
              "Additional AI generation prompt text specific to this panel's unique environmental requirements or special visual effects",
            ),
        })
        .optional()
        .describe(
          'Panel-specific modifications to the base location template for unique atmospheric conditions',
        ),
      action: z
        .string()
        .optional()
        .describe(
          "Primary action or event occurring in this panel - the central focus that drives the visual composition (e.g., 'character running', 'emotional conversation', 'dramatic reveal')",
        ),
      characterPoses: z
        .array(
          z.object({
            characterId: z
              .string()
              .describe(
                'Unique identifier of the character appearing in this panel',
              ),
            characterName: z
              .string()
              .describe(
                'Display name of the character for reference and clarity',
              ),
            outfitId: z
              .string()
              .optional()
              .describe(
                "ID of the outfit template this character is wearing - if omitted, uses character's default outfit",
              ),
            customOutfit: z
              .object({
                description: z
                  .string()
                  .describe(
                    "Visual description of a custom outfit created specifically for this panel's narrative requirements",
                  ),
                aiPrompt: z
                  .string()
                  .describe(
                    'Complete AI generation prompt for creating this custom outfit with specific details, colors, and styling',
                  ),
              })
              .optional()
              .describe(
                "Custom outfit definition when existing templates don't meet this panel's specific visual or narrative needs",
              ),
            pose: z
              .string()
              .describe(
                'Specific body position, gesture, or stance the character is taking - should convey emotion and action clearly',
              ),
            expression: z
              .string()
              .describe(
                "Facial expression showing the character's emotional state and reaction to the scene's events",
              ),
            position: z
              .string()
              .optional()
              .describe(
                "Character's spatial location within the panel frame (e.g., 'center foreground', 'left background', 'close-up right side')",
              ),
          }),
        )
        .describe(
          'Complete character positioning, expressions, and outfit specifications for all characters appearing in this panel',
        ),
      environmentOverrides: z
        .object({
          lighting: z
            .object({
              type: z
                .enum(['natural', 'artificial', 'mixed'])
                .optional()
                .describe(
                  'Source of illumination: natural (sunlight/moonlight), artificial (lamps/electronics), mixed (combination)',
                ),
              intensity: z
                .enum(['dim', 'moderate', 'bright'])
                .optional()
                .describe(
                  'Brightness level affecting mood and visibility - dim (shadows/mystery), moderate (balanced), bright (cheerful/clear)',
                ),
              color: z
                .string()
                .optional()
                .describe(
                  "Lighting color temperature and hue (e.g., 'warm golden', 'cool blue', 'harsh white') for dramatic and emotional effect",
                ),
              direction: z
                .string()
                .optional()
                .describe(
                  "Direction and angle of primary light source (e.g., 'top-down', 'side-lit', 'backlit', 'from below') affecting shadows and drama",
                ),
            })
            .optional()
            .describe(
              'Comprehensive lighting specifications that establish mood, drama, and visual atmosphere for the panel',
            ),
          weather: z
            .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
            .optional()
            .describe(
              'Weather conditions affecting environmental appearance, character behavior, and emotional atmosphere',
            ),
          timeOfDay: z
            .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
            .optional()
            .describe(
              'Time of day affecting natural lighting, character activity levels, and scene appropriateness',
            ),
          atmosphere: z
            .string()
            .optional()
            .describe(
              "Overall environmental mood and feeling that should permeate the panel (e.g., 'peaceful tranquility', 'tense anticipation', 'chaotic energy')",
            ),
        })
        .optional()
        .describe(
          'Environmental condition overrides that modify the base location template for specific storytelling and atmospheric needs',
        ),
      cameraSettings: z
        .object({
          angle: z
            .enum(['close-up', 'medium', 'wide', "bird's eye", 'low angle'])
            .optional()
            .describe(
              "Camera perspective: close-up (emotions/details), medium (character interaction), wide (scene context), bird's eye (overview), low angle (power/drama)",
            ),
          shotType: z
            .enum([
              'action',
              'reaction',
              'establishing',
              'detail',
              'transition',
            ])
            .optional()
            .describe(
              'Panel function: action (movement/events), reaction (emotional response), establishing (scene setup), detail (close examination), transition (scene change)',
            ),
          focus: z
            .string()
            .optional()
            .describe(
              "Primary visual element that should draw the reader's attention - the most important aspect of the panel composition",
            ),
        })
        .optional()
        .describe(
          'Camera positioning and framing specifications that control visual storytelling perspective and reader focus',
        ),
      visualEffects: z
        .array(z.string())
        .optional()
        .describe(
          "Special visual effects to enhance the panel (e.g., 'motion blur', 'speed lines', 'dramatic shadows', 'sparkles', 'impact effects')",
        ),
      panelNotes: z
        .string()
        .optional()
        .describe(
          "Additional production notes, special instructions, or creative direction specific to this panel's execution and visual requirements",
        ),
    }),

    // Relationships
    sceneId: z
      .string()
      .describe(
        'ID of the parent scene this panel belongs to - establishes narrative context and sequence flow',
      ),

    // Generation
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe(
        'Whether this panel was automatically generated by AI (true) or manually created/designed by user (false)',
      ),
    negativePrompt: z
      .string()
      .optional()
      .describe(
        "Negative AI generation prompt specifying what to avoid in image creation (e.g., 'blurry, low quality, inconsistent art style, wrong proportions')",
      ),

    // Timestamps
    createdAt: z
      .date()
      .describe(
        'Creation timestamp recording when this panel was first created',
      ),
    updatedAt: z
      .date()
      .describe('Last update timestamp recording the most recent modification'),

    // Children
    dialogues: z
      .array(z.lazy(() => panelDialogueSchema))
      .optional()
      .describe(
        'Array of dialogue entries (speech bubbles, thought bubbles, narration) contained within this panel',
      ),
    characters: z
      .array(z.lazy(() => characterSchema))
      .optional()
      .describe(
        'Array of character reference objects for all characters appearing in this panel - used for consistency and relationship tracking',
      ),
  })
  .describe('A single illustrated frame within a manga scene');

// Panel Dialogue Schema
export const panelDialogueSchema = z
  .object({
    id: z.string().describe('Unique identifier for this dialogue entry'),
    content: z
      .string()
      .describe(
        'The actual spoken or written text that appears in the speech bubble - should sound natural and character-appropriate',
      ),
    order: z
      .number()
      .describe(
        'Sequential position within the panel when multiple dialogue entries exist - determines reading flow and conversation timing',
      ),

    // Styling
    style: z
      .object({
        bubbleType: z
          .enum(['normal', 'thought', 'scream', 'whisper', 'narration'])
          .optional()
          .describe(
            'Visual presentation style: normal (standard speech), thought (internal monologue), scream (loud/emotional), whisper (quiet/secret), narration (story text)',
          ),
      })
      .optional()
      .describe(
        'Visual presentation attributes that affect how the text appears and is interpreted by readers',
      ),

    // Context
    emotion: z
      .string()
      .optional()
      .describe(
        "Current emotional state affecting speech delivery and bubble styling (e.g., 'angry', 'sad', 'excited', 'nervous', 'confident')",
      ),
    subtextNote: z
      .string()
      .optional()
      .describe(
        'Hidden meaning, subtext, or context behind the words that may not be explicitly stated but influences character relationships',
      ),

    // Relationships
    panelId: z
      .string()
      .describe(
        'ID of the panel containing this dialogue - establishes visual and narrative context',
      ),
    speakerId: z
      .string()
      .nullable()
      .optional()
      .describe(
        'ID of the character speaking this dialogue - null for narration or environmental text, character ID for spoken dialogue',
      ),

    // Generation
    isAiGenerated: z
      .boolean()
      .default(false)
      .describe(
        'Whether this dialogue was automatically generated by AI (true) or manually written by user (false)',
      ),

    // Timestamps
    createdAt: z.date().describe('Creation timestamp'),
    updatedAt: z.date().describe('Last update timestamp'),

    // Reference
    speaker: z
      .lazy(() => characterSchema)
      .optional()
      .describe('Resolved speaker character details'),
    config: z.any().optional(),
  })
  .describe('Dialogue text within a manga panel');

// Manga Project Schema
export const mangaProjectSchema = z
  .object({
    id: z
      .string()
      .describe(
        'Unique identifier for the manga series - used for database references and URL routing',
      ),
    title: z
      .string()
      .min(1, 'Project title is required')
      .describe(
        'Official title of the manga series - the primary name readers will see and use to identify the work',
      ),
    description: z
      .string()
      .optional()
      .describe(
        "Brief summary of the manga's premise, setting, and core appeal - used for discovery and reader engagement (50-150 words recommended)",
      ),
    status: z
      .nativeEnum({
        draft: 'draft',
        in_progress: 'in_progress',
        completed: 'completed',
        published: 'published',
        archived: 'archived',
      })
      .describe(
        'Current development phase: draft (planning), in_progress (actively creating), completed (finished), published (publicly available), archived (no longer active)',
      ),
    initialPrompt: z
      .string()
      .optional()
      .describe(
        'Original concept or inspiration text that sparked the creation of this manga - preserves the creative genesis and vision',
      ),
    genre: z
      .string()
      .optional()
      .describe(
        "Primary genre classification (e.g., 'action', 'romance', 'fantasy', 'slice-of-life') for categorization and reader expectations",
      ),
    artStyle: z
      .string()
      .optional()
      .describe(
        "Visual style description or artistic reference (e.g., 'shounen manga style', 'detailed realistic', 'chibi cute') guiding all visual creation",
      ),
    coverImageUrl: z
      .string()
      .url()
      .optional()
      .describe(
        'URL pointing to the cover artwork image - the primary visual representation used for promotion and identification',
      ),
    targetAudience: z
      .enum(['children', 'teen', 'young-adult', 'adult'])
      .optional()
      .describe(
        'Intended demographic readership determining content appropriateness, complexity, and thematic elements',
      ),

    // World Building
    worldDetails: z
      .object({
        summary: z
          .string()
          .describe(
            "High-level overview of the manga's universe, including setting, time period, and fundamental world characteristics",
          ),
        history: z
          .string()
          .describe(
            'Historical background and major past events that shaped the current world state and influence ongoing storylines',
          ),
        society: z
          .string()
          .describe(
            'Cultural norms, social structures, political systems, and factional relationships that govern character interactions',
          ),
        uniqueSystems: z
          .string()
          .describe(
            'Special rules governing magic systems, technology levels, supernatural powers, or other world-specific mechanics',
          ),
      })
      .optional()
      .describe(
        'Comprehensive world-building information that establishes the setting, rules, and background context for all stories within this universe',
      ),

    // Narrative Elements
    concept: z
      .string()
      .optional()
      .describe(
        'Core thematic idea, central conflict, or unique premise that drives the entire narrative and distinguishes this manga from others',
      ),
    plotStructure: z
      .object({
        incitingIncident: z
          .string()
          .describe(
            'Pivotal event that triggers the main storyline and sets the protagonist on their journey or quest',
          ),
        plotTwist: z
          .string()
          .describe(
            'Major unexpected development that changes everything and recontextualizes earlier events',
          ),
        climax: z
          .string()
          .describe(
            'Pivotal confrontation, crisis point, or emotional peak where the central conflict reaches its maximum intensity',
          ),
        resolution: z
          .string()
          .describe(
            'How the central conflict concludes and how character arcs are resolved, providing satisfying closure',
          ),
      })
      .optional()
      .describe(
        'Key structural narrative elements that form the backbone of the story progression and character development',
      ),

    // Templates
    outfitTemplates: z
      .array(outfitTemplateSchema)
      .optional()
      .describe(
        'Collection of reusable outfit designs for consistent character appearance across scenes and chapters',
      ),
    locationTemplates: z
      .array(locationTemplateSchema)
      .optional()
      .describe(
        'Collection of reusable location settings with established visual elements and camera angle options',
      ),

    // Thematic Elements
    themes: z
      .array(z.string())
      .optional()
      .describe(
        "Recurring philosophical ideas, moral questions, or universal messages explored throughout the manga (e.g., 'friendship', 'justice', 'coming-of-age')",
      ),
    motifs: z
      .array(z.string())
      .optional()
      .describe(
        "Recurring symbolic elements, visual patterns, or narrative devices that reinforce themes (e.g., 'cherry blossoms', 'mirrors', 'crossroads')",
      ),
    symbols: z
      .array(z.string())
      .optional()
      .describe(
        "Objects, colors, or imagery representing abstract concepts and deeper meanings within the narrative (e.g., 'red rose for love', 'broken clock for lost time')",
      ),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        'Keywords for categorization, discovery, and search functionality - helps readers find content matching their interests',
      ),

    // Ownership and Metadata
    creatorId: z
      .string()
      .optional()
      .describe(
        'ID of the user who created this manga project - establishes ownership and permissions for editing and publishing',
      ),
    messages: z
      .array(
        z.object({
          role: z
            .string()
            .describe('Message sender role in AI conversation context'),
          parts: z
            .array(
              z.object({
                text: z.string().describe('Text content of the message part'),
              }),
            )
            .describe('Message content segments'),
        }),
      )
      .optional()
      .describe(
        'Historical chat messages and AI generation context used for maintaining consistency and creative direction',
      ),
    viewCount: z
      .number()
      .nonnegative()
      .describe(
        'Total number of times this manga has been viewed by readers - engagement and popularity metric',
      ),
    likeCount: z
      .number()
      .nonnegative()
      .describe(
        'Total number of likes/favorites received from readers - quality and appeal metric',
      ),
    published: z
      .boolean()
      .describe(
        'Whether this manga is publicly visible and accessible to readers (true) or private/draft (false)',
      ),

    // Timestamps
    createdAt: z
      .date()
      .describe(
        'Creation timestamp recording when this manga project was first established',
      ),
    updatedAt: z
      .date()
      .describe(
        'Last update timestamp recording the most recent modification to any aspect of the project',
      ),

    // Relationships
    chapters: z
      .array(chapterSchema)
      .optional()
      .describe(
        'Complete collection of chapters that make up this manga series, ordered by chapter number',
      ),
    characters: z
      .array(characterSchema)
      .optional()
      .describe(
        'Complete cast of characters appearing throughout this manga, including protagonists, antagonists, and supporting roles',
      ),
  })
  .describe('Complete definition of a manga project including all metadata');

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
