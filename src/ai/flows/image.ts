import { Character } from "@/types/entities";

export interface CharacterPromptOptions {
  pose?: string;
  expression?: string;
  outfit?: string;
  includeStyle?: boolean;
  includeDetailedBody?: boolean;
  includeDetailedFace?: boolean;
  addFingerprint?: boolean;
}

export class ImageGenerationService {
  constructor() {}
  // Common constants
  private static readonly COMMON_NEGATIVE_PROMPTS = [
    "inconsistent anatomy",
    "different face shape",
    "wrong eye color",
    "wrong hair color or style",
    "missing distinctive features",
    "deformed features",
    "extra limbs",
    "bad hands",
    "bad proportions",
  ];

  private static readonly DEFAULT_STYLE_TAGS = [
    "masterpiece",
    "high quality",
    "detailed",
    "professional illustration",
  ];

  private static readonly DEFAULT_PANEL_STYLE = [
    "manga/anime style",
    "detailed lineart",
    "clean shading",
    "masterpiece quality",
    "high detail",
  ];

  private static readonly PANEL_CONSISTENCY_REQUIREMENTS = [
    "Each character must maintain their exact visual identity",
    "Keep all distinctive features visible",
    "Maintain correct proportions between characters",
    "Ensure hair and eye colors remain exactly as specified",
  ];

  private static readonly EMOTION_MAP: Record<string, string[]> = {
    happy: ["smiling", "grinning", "laughing", "joyful"],
    sad: ["frowning", "teary-eyed", "downcast", "dejected"],
    angry: ["scowling", "gritting teeth", "furrowed brow", "intense glare"],
    surprised: ["wide-eyed", "open-mouthed", "raised eyebrows", "shocked"],
    fearful: ["trembling", "wide eyes", "pale face", "recoiling"],
    disgusted: ["wrinkling nose", "grimacing", "recoiling", "sneering"],
    neutral: ["calm expression", "relaxed face", "composed", "straight-faced"],
    thoughtful: ["contemplative", "hand on chin", "slight frown", "looking up"],
    determined: ["intense gaze", "firm expression", "clenched jaw", "focused"],
    confident: ["smirking", "raised chin", "relaxed smile", "steady gaze"],
  };

  /**
   * Ensures profile data is valid and provides defaults for missing fields
   * This validation step is critical for reducing inconsistencies
   */
  private validateAndNormalizeProfile(profile: Character): Character {
    if (!profile)
      throw new Error("Character profile cannot be null or undefined");

    // Ensure core identity properties exist
    if (!profile.name) throw new Error("Character name is required");
    if (!profile.gender) throw new Error("Character gender is required");
    if (!profile.age) throw new Error("Character age is required");

    // Ensure facial attributes exist
    if (!profile.facialAttributes)
      throw new Error("Facial attributes are required");
    if (!profile.facialAttributes.faceShape)
      throw new Error("Face shape is required");
    if (!profile.facialAttributes.eyeShape)
      throw new Error("Eye shape is required");
    if (!profile.facialAttributes.eyeColor)
      throw new Error("Eye color is required");

    // Ensure hair attributes exist
    if (!profile.hairAttributes)
      throw new Error("Hair attributes are required");
    if (!profile.hairAttributes.hairColor)
      throw new Error("Hair color is required");
    if (!profile.hairAttributes.hairstyle)
      throw new Error("Hairstyle is required");

    // Provide defaults for optional arrays
    const distinctiveFeatures = profile.distinctiveFeatures || [];

    // Provide default body attributes if missing
    const bodyAttributes = profile.bodyAttributes || {
      height: "average height",
      bodyType: "average build",
      proportions: "",
    };

    // Provide default style guide if missing
    const styleGuide = profile.styleGuide || {
      artStyle: "realistic",
      lineweight: "medium",
      shadingStyle: "soft shadows",
      colorStyle: "",
    };

    // Return normalized profile with defaults
    return {
      ...profile,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      facialAttributes: profile.facialAttributes,
      hairAttributes: profile.hairAttributes,
      bodyAttributes,
      distinctiveFeatures,
      styleGuide,
      expressionStyle: profile.expressionStyle,
      style: profile.style,
      negativePrompt: profile.negativePrompt,
    };
  }

  /**
   * Generates a unique character fingerprint for consistency checks
   */
  generateFingerprint(profile: Character): string {
    const normalizedProfile = this.validateAndNormalizeProfile(profile);

    const elements = [
      `${normalizedProfile.name}-${normalizedProfile.gender}-${normalizedProfile.age}`,
      `face:${normalizedProfile.facialAttributes.faceShape}-${normalizedProfile.facialAttributes.eyeShape}-${normalizedProfile.facialAttributes.eyeColor}`,
      `hair:${normalizedProfile.hairAttributes.hairColor}-${normalizedProfile.hairAttributes.hairstyle}`,
      `distinct:${normalizedProfile.distinctiveFeatures.join("-")}`,
      `body:${normalizedProfile.bodyAttributes.height}-${normalizedProfile.bodyAttributes.bodyType}`,
    ];

    return elements.join("||");
  }

  /**
   * Formats character attributes in standardized way with safety checks
   */
  private formatCharacterAttributes(
    profile: Character,
    options: {
      includeDetailedBody?: boolean;
      includeDetailedFace?: boolean;
    } = {}
  ): string {
    const normalizedProfile = this.validateAndNormalizeProfile(profile);
    const { includeDetailedBody = true, includeDetailedFace = true } = options;

    // Format visual anchors with triple emphasis for AI focus
    const anchors =
      normalizedProfile.visualIdentityAnchors
        .map((anchor) => `(((${anchor})))`)
        .join(", ") || "(none specified)";

    // Build core identity section
    let result = [
      `CHARACTER: ${normalizedProfile.name}, ${normalizedProfile.age}, ${normalizedProfile.gender}`,
      `VISUAL IDENTITY: ${anchors}`,
    ];

    // Add face details with conditional parts
    const faceDetails = [
      `${normalizedProfile.facialAttributes.faceShape} face`,
      `${normalizedProfile.facialAttributes.eyeShape} ${normalizedProfile.facialAttributes.eyeColor} eyes`,
    ];

    if (includeDetailedFace) {
      if (normalizedProfile.facialAttributes.noseType) {
        faceDetails.push(normalizedProfile.facialAttributes.noseType);
      }
      if (normalizedProfile.facialAttributes.mouthType) {
        faceDetails.push(normalizedProfile.facialAttributes.mouthType);
      }
      if (normalizedProfile.facialAttributes.skinTone) {
        faceDetails.push(`${normalizedProfile.facialAttributes.skinTone} skin`);
      }
    }

    result.push(`FACE: ${faceDetails.join(", ")}`);

    // Add hair details
    const hairDetails = [
      normalizedProfile.hairAttributes.hairLength,
      normalizedProfile.hairAttributes.hairTexture,
      normalizedProfile.hairAttributes.hairColor,
    ].filter(Boolean);

    result.push(
      `HAIR: ${
        hairDetails.length
          ? hairDetails.join(" ") + " hair"
          : normalizedProfile.hairAttributes.hairColor + " hair"
      }, ${normalizedProfile.hairAttributes.hairstyle}`
    );

    // Add distinctive features if any
    if (normalizedProfile.distinctiveFeatures.length > 0) {
      result.push(
        `DISTINCTIVE: ${normalizedProfile.distinctiveFeatures.join(", ")}`
      );
    }

    // Add body details if requested
    if (includeDetailedBody) {
      const bodyDetails = [
        normalizedProfile.bodyAttributes.height,
        normalizedProfile.bodyAttributes.bodyType,
      ];

      if (normalizedProfile.bodyAttributes.proportions) {
        bodyDetails.push(normalizedProfile.bodyAttributes.proportions);
      }

      result.push(`BODY: ${bodyDetails.join(", ")}`);
    }

    return result.join("\n");
  }

  /**
   * Formats art style section with consistent output
   */
  private formatArtStyle(
    styleGuide?: Character["styleGuide"],
    isPanel: boolean = false
  ): string {
    if (isPanel) {
      return [
        "ART STYLE:",
        ...ImageGenerationService.DEFAULT_PANEL_STYLE.map(
          (style) => `- ${style}`
        ),
      ].join("\n");
    }

    if (!styleGuide) {
      return [
        "ART STYLE:",
        ...ImageGenerationService.DEFAULT_STYLE_TAGS.map((tag) => `- ${tag}`),
      ].join("\n");
    }

    return [
      "ART STYLE:",
      `- ${styleGuide.artStyle}`,
      `- ${styleGuide.lineweight}`,
      `- ${styleGuide.shadingStyle}`,
      styleGuide.colorStyle ? `- ${styleGuide.colorStyle}` : null,
      ...ImageGenerationService.DEFAULT_STYLE_TAGS.map((tag) => `- ${tag}`),
    ]
      .filter(Boolean)
      .join("\n");
  }

  /**
   * Formats negative prompts with consistent output
   */
  private formatNegativePrompt(
    customNegative?: string,
    isPanel: boolean = false
  ): string {
    if (isPanel) {
      return "NEGATIVE PROMPT: inconsistent character designs, wrong faces, wrong hair colors, deformed bodies, incorrect number of characters, missing distinctive features";
    }

    const negatives = [...ImageGenerationService.COMMON_NEGATIVE_PROMPTS];
    if (customNegative) negatives.push(customNegative);

    return ["NEGATIVE PROMPT:", ...negatives.map((neg) => `- ${neg}`)].join(
      "\n"
    );
  }

  /**
   * Expands expression into detailed description using emotion map
   */
  private expandExpression(expression: string): string {
    if (!expression) return "neutral (calm expression, relaxed face)";

    const expressionLower = expression.toLowerCase();

    // Direct match in emotion map
    if (expressionLower in ImageGenerationService.EMOTION_MAP) {
      const variations = ImageGenerationService.EMOTION_MAP[expressionLower];
      return `${expression} (${variations.join(", ")})`;
    }

    // Check for partial match in variations
    for (const [emotion, variations] of Object.entries(
      ImageGenerationService.EMOTION_MAP
    )) {
      if (variations.includes(expressionLower)) {
        return `${expression} (${variations.join(", ")})`;
      }
    }

    // No match, return as-is with default explanation
    return `${expression} (facial expression)`;
  }

  /**
   * Primary method for building character prompts
   * Supports full customization through options
   */
  async buildCharacterPrompt(
    characterId: string,
    options: CharacterPromptOptions = {}
  ): Promise<string> {
    const profile = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    const normalizedProfile = this.validateAndNormalizeProfile(profile);
    const {
      pose,
      expression,
      outfit,
      includeStyle = true,
      includeDetailedBody = true,
      includeDetailedFace = true,
      addFingerprint = false,
    } = options;

    // Base identity prompt with specified level of detail
    let prompt = this.formatCharacterAttributes(normalizedProfile, {
      includeDetailedBody,
      includeDetailedFace,
    });

    // Add current state if variables provided
    if (pose || expression || outfit) {
      const sections = ["CURRENT STATE:"];

      if (pose) sections.push(`- POSE: ${pose}`);
      if (expression)
        sections.push(`- EXPRESSION: ${this.expandExpression(expression)}`);

      const outfitToUse =
        outfit || normalizedProfile.style?.defaultOutfit || "casual outfit";

      sections.push(`- OUTFIT: ${outfitToUse}`);

      prompt += "\n\n" + sections.join("\n");
    }

    // Add style guide if requested
    if (includeStyle) {
      prompt += "\n\n" + this.formatArtStyle(normalizedProfile.styleGuide);
      prompt +=
        "\n\n" + this.formatNegativePrompt(normalizedProfile.negativePrompt);
    }

    // Add fingerprint if requested
    if (addFingerprint) {
      const fingerprint = this.generateFingerprint(normalizedProfile);
      prompt += `\n\nCHARACTER_FINGERPRINT<${fingerprint}>`;
    }

    return prompt.trim();
  }

  /**
   * Builds a tag-based prompt optimized for image generation models
   */
  async buildTagBasedPrompt(
    characterId: string,
    pose?: string,
    expression?: string,
    outfit?: string
  ): Promise<{ prompt: string; negative_prompt: string }> {
    const profile = await this.characterRepository.findOne({
      where: { id: characterId },
    });
    const normalizedProfile = this.validateAndNormalizeProfile(profile);

    // Core identity tags with emphasis
    const coreTags = [
      `((${normalizedProfile.name}))`,
      `((${normalizedProfile.gender}))`,
      `((${normalizedProfile.age} years old))`,
      `((${normalizedProfile.facialAttributes.faceShape} face))`,
      `(((${normalizedProfile.facialAttributes.eyeShape} ${normalizedProfile.facialAttributes.eyeColor} eyes)))`,
      `(((${normalizedProfile.hairAttributes.hairColor} ${normalizedProfile.hairAttributes.hairstyle} hair)))`,
      normalizedProfile.facialAttributes.skinTone
        ? `((${normalizedProfile.facialAttributes.skinTone} skin))`
        : null,
    ];

    // Visual identity anchors (highest priority)
    const anchorTags = normalizedProfile.visualIdentityAnchors.map(
      (anchor) => `(((${anchor})))`
    );

    // Distinctive features (high priority)
    const distinctiveTags = normalizedProfile.distinctiveFeatures.map(
      (feature) => `((${feature}))`
    );

    // Current state tags
    const variationTags = [
      pose,
      expression,
      outfit || normalizedProfile.style?.defaultOutfit || "casual outfit",
    ].filter(Boolean);

    // Style tags
    const styleTags = normalizedProfile.styleGuide
      ? [
          normalizedProfile.styleGuide.artStyle,
          normalizedProfile.styleGuide.lineweight,
          normalizedProfile.styleGuide.shadingStyle,
          normalizedProfile.styleGuide.colorStyle,
          ...ImageGenerationService.DEFAULT_STYLE_TAGS,
        ].filter(Boolean)
      : ImageGenerationService.DEFAULT_STYLE_TAGS;

    // Combine all tags and remove any null/undefined values
    const allTags = [
      ...coreTags,
      ...anchorTags,
      ...distinctiveTags,
      ...variationTags,
      ...styleTags,
    ].filter(Boolean);

    // Get negative tags
    const negativeTags = [
      ...ImageGenerationService.COMMON_NEGATIVE_PROMPTS,
      normalizedProfile.negativePrompt,
    ].filter(Boolean);

    return {
      prompt: allTags.join(", "),
      negative_prompt: negativeTags.join(", "),
    };
  }

  /**
   * Builds a complete panel prompt with multiple characters
   */
  async buildPanelPrompt(panelId: string): Promise<string> {
    // Validate inputs

    const panel = await this.panelRepository.findOne({
      where: { id: panelId },
      relations: ["character", "scene"],
    });

    if (!panel || !panel.panelContext)
      throw new Error("Panel context is required");
    if (!panel.scene || !panel.scene.sceneContext)
      throw new Error("Scene context is required");

    // Apply validation to each character
    const normalizedCharacters = panel.characters.map((char) =>
      this.validateAndNormalizeProfile(char)
    );

    // Character identity sections using unified method
    const characterPrompts = normalizedCharacters
      .map((character) => {
        const pose = panel.panelContext.pose || "natural pose";
        const expression =
          character.expressionStyle?.defaultExpression || "neutral";

        // Use buildCharacterPrompt with panel-specific options
        return this.buildCharacterPrompt(character.id, {
          pose,
          expression,
          includeStyle: false,
          includeDetailedBody: false,
          includeDetailedFace: true,
        });
      })
      .join("\n\n");

    // Panel composition
    const panelDetails = [
      `Shot: ${panel.panelContext.shotType}`,
      `Angle: ${panel.panelContext.cameraAngle}`,
      `Background: ${panel.panelContext.backgroundDescription}`,
      `Lighting: ${panel.panelContext.lighting}`,
      `Action: ${panel.panelContext.action || "character interaction"}`,
    ];

    if (panel.panelContext.effects) {
      panelDetails.push(`Effects: ${panel.panelContext.effects}`);
    }

    // Scene details
    const sceneDetails = [
      `Location: ${panel.scene.sceneContext.setting}`,
      `Time: ${panel.scene.sceneContext.timeOfDay}`,
      `Weather: ${panel.scene.sceneContext.weather}`,
      `Mood: ${panel.scene.sceneContext.mood}`,
    ];

    // Combine everything
    const sections = [
      "MANGA PANEL WITH MULTIPLE CHARACTERS:",
      "",
      characterPrompts,
      "",
      "PANEL COMPOSITION:",
      ...panelDetails.map((detail) => `- ${detail}`),
      "",
      "SCENE SETTING:",
      ...sceneDetails.map((detail) => `- ${detail}`),
      "",
      this.formatArtStyle(null, true),
      "",
      "CONSISTENCY REQUIREMENTS:",
      ...ImageGenerationService.PANEL_CONSISTENCY_REQUIREMENTS.map(
        (req) => `- ${req}`
      ),
      "",
      this.formatNegativePrompt(null, true),
    ];

    return sections.join("\n").trim();
  }

  /**
   * Adds a fingerprint to any prompt for consistency tracking
   */
  injectFingerprint(basePrompt: string, profile: Character): string {
    if (!basePrompt) throw new Error("Base prompt cannot be empty");

    const normalizedProfile = this.validateAndNormalizeProfile(profile);
    const fingerprint = this.generateFingerprint(normalizedProfile);

    return `${basePrompt}\n\nCHARACTER_FINGERPRINT<${fingerprint}>`.trim();
  }
}
