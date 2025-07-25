import { ai } from "@/ai/ai-instance";
import { ImageStorage } from "@/lib/localStorage";
import { updateCharacter, updatePanel } from "@/services/data-service";
import { Content } from "@google/genai";
import { z } from "zod";

// ===== CORE IMAGE GENERATION FLOWS =====

export const GenerateCharacterImage = ai.defineFlow(
  {
    name: "GenerateCharacterImage",
    inputSchema: z.object({
      character: z.any().describe("Character object with all attributes"),
    }),
  },
  async ({ character }) => {
    if (!character || !character.name) {
      throw new Error("Invalid character data - missing name");
    }

    // Add project style context if available
    let prompt = await AnimeCharacterPortraitPrompt({
      character: character,
      seriesStyle: "Komi Can't Communicate",
    });

    const result = await ai.generateImage({
      prompt: prompt.output?.imagePrompt!,
      history: [], // Clean history for pure character generation
    });

    if (result?.image46) {
      // Upload image with descriptive filename
      const filename = `character-${character.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${character.id}-${Date.now()}`;
      const imageUrl = await ImageStorage.uploadImage(result.image46, filename);

      // Prepare character update data
      const updateData = {
        imgUrl: imageUrl,
        aiGeneratedImage: true,
        consistencyPrompt: prompt.output?.imagePrompt,
        updatedAt: new Date(),
      };

      // Update character with image data
      await updateCharacter(character.id, updateData);

      return result.text;
    } else {
      throw new Error("AI image generation failed - no image returned");
    }
  }
);

export const GeneratePanelImage = ai.defineFlow(
  {
    name: "GeneratePanelImage",
    inputSchema: z.object({
      panel: z.any(), // Panel context
      projectContext: z.any(), // Full project data including characters
      scene: z.any(),
    }),
  },
  async ({ panel, projectContext, scene }) => {
    const conversationHistory: Content[] = [];

    for (const ch of projectContext.characters) {
      if (ch.imageData && ch.imageData.data && ch.imageData.mimeType) {
        conversationHistory.push({
          role: "user",
          parts: [
            {
              text: `Character: ${ch.name}`,
            },
            { inlineData: ch.imageData },
          ],
        });
        conversationHistory.push({
          role: "model",
          parts: [
            {
              text: `Reference locked: ${ch.name}`,
            },
          ],
        });
      }
    }

    const prompt = await PanelImagePrompt({
      characters: (projectContext.characters || []).map((ch: any) => ({
        ...ch,
        imageData: undefined,
        consistencyPrompt: undefined,
        negativePrompt: undefined,
      })),
      panel: panel,
      scene: scene,
    });

    const res = await ai.generateImage({
      prompt:
        prompt.output?.imagePrompt! +
        " negative prompt: " +
        prompt.output?.negativePrompt,
      history: conversationHistory,
    });

    if (res?.image46) {
      const url = await ImageStorage.uploadImage(
        res.image46,
        `panel-${panel.id}-${Date.now()}`
      );

      await updatePanel(panel.id, {
        imageUrl: url,
      });
      return res?.text;
    } else {
      console.error("Panel image generation failed - no image returned");
      return "Error: Professional panel generation failed.";
    }
  }
);

// ===== ENHANCED PANEL GENERATION WITH TEMPLATES =====

export const GeneratePanelImageFromData = ai.defineFlow(
  {
    name: "GeneratePanelImageFromData",
    inputSchema: z.object({
      panel: z.any().describe("Panel data with panelContext"),
      scene: z.any().describe("Scene data with sceneContext"),
      characters: z.array(z.any()).describe("Characters in the panel"),
      availableTemplates: z
        .object({
          outfits: z.array(z.any()).optional(),
          locations: z.array(z.any()).optional(),
          poses: z.array(z.any()).optional(),
          effects: z.array(z.any()).optional(),
        })
        .optional()
        .describe("Available templates to enhance the panel"),
    }),
  },
  async ({ panel, scene, characters, availableTemplates }) => {
    const conversationHistory: Content[] = [];

    // Add character references to conversation history
    for (const ch of characters) {
      if (ch.imageData && ch.imageData.data && ch.imageData.mimeType) {
        conversationHistory.push({
          role: "user",
          parts: [
            {
              text: `Character Reference: ${ch.name}`,
            },
            { inlineData: ch.imageData },
          ],
        });
        conversationHistory.push({
          role: "model",
          parts: [
            {
              text: `Character locked: ${ch.name}`,
            },
          ],
        });
      }
    }

    // Get enhanced templates based on panel context
    const enhancedTemplates = getEnhancedTemplatesForPanel(
      panel,
      scene,
      characters,
      availableTemplates
    );

    const prompt = await EnhancedPanelImagePrompt({
      panel,
      scene,
      characters: characters.map((ch: any) => ({
        ...ch,
        imageData: undefined,
        consistencyPrompt: undefined,
        negativePrompt: undefined,
      })),
      enhancedTemplates,
    });

    const result = await ai.generateImage({
      prompt:
        prompt.output?.imagePrompt! +
        " negative prompt: " +
        prompt.output?.negativePrompt,
      history: conversationHistory,
    });

    if (result?.image46) {
      const url = await ImageStorage.uploadImage(
        result.image46,
        `panel-${panel.id}-${Date.now()}`
      );

      await updatePanel(panel.id, {
        imageUrl: url,
      });

      return {
        imageUrl: url,
        success: true,
        text: result.text,
        appliedTemplates: enhancedTemplates,
      };
    } else {
      throw new Error("Panel image generation failed - no image returned");
    }
  }
);

export const GenerateCharacterWithTemplates = ai.defineFlow(
  {
    name: "GenerateCharacterWithTemplates",
    inputSchema: z.object({
      character: z.any().describe("Character data"),
      outfitTemplate: z.any().optional().describe("Specific outfit template"),
      context: z
        .object({
          location: z.string().optional(),
          mood: z.string().optional(),
          lighting: z.string().optional(),
        })
        .optional(),
    }),
  },
  async ({ character, outfitTemplate, context }) => {
    const prompt = await CharacterWithTemplatesPrompt({
      character,
      outfitTemplate,
      context: context || {},
    });

    const result = await ai.generateImage({
      prompt: prompt.output?.imagePrompt!,
      history: [],
    });

    if (result?.image46) {
      const filename = `template-character-${character.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${character.id}-${Date.now()}`;
      const imageUrl = await ImageStorage.uploadImage(result.image46, filename);

      const updateData = {
        imgUrl: imageUrl,
        aiGeneratedImage: true,
        consistencyPrompt: prompt.output?.imagePrompt,
        updatedAt: new Date(),
      };

      await updateCharacter(character.id, updateData);

      return {
        imageUrl,
        success: true,
        text: result.text,
      };
    } else {
      throw new Error("Template-based character generation failed");
    }
  }
);

// ===== STAGE 3: LOCATION GENERATION =====

export const GenerateLocationImage = ai.defineFlow(
  {
    name: "GenerateLocationImage",
    inputSchema: z.object({
      locationTemplate: z
        .any()
        .describe("Location template with camera angles"),
      cameraAngle: z
        .string()
        .optional()
        .describe("Specific camera angle to render"),
    }),
  },
  async ({ locationTemplate, cameraAngle }) => {
    if (!locationTemplate || !locationTemplate.name) {
      throw new Error("Invalid location template - missing name");
    }

    // Find the specific camera angle or use the first one
    const selectedAngle = cameraAngle
      ? locationTemplate.cameraAngles.find(
          (angle: any) => angle.name === cameraAngle
        )
      : locationTemplate.cameraAngles[0];

    if (!selectedAngle) {
      throw new Error(
        `Camera angle ${
          cameraAngle || "default"
        } not found in location template`
      );
    }

    const prompt = await LocationImagePrompt({
      locationTemplate,
      cameraAngle: selectedAngle,
    });

    const result = await ai.generateImage({
      prompt: prompt.output?.imagePrompt!,
      history: [], // Clean history for pure location generation
    });

    if (result?.image46) {
      const filename = `location-${locationTemplate.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${selectedAngle.name}-${Date.now()}`;
      const imageUrl = await ImageStorage.uploadImage(result.image46, filename);

      // Store the reference image in the location template's camera angle
      const updateData = {
        referenceImage: {
          url: imageUrl,
          data: result.image46,
          mimeType: "image/jpeg",
        },
        generatedAt: new Date(),
      };

      // TODO: Update location template with reference image
      // await updateLocationTemplate(locationTemplate.id, selectedAngle.name, updateData);

      return {
        imageUrl,
        cameraAngle: selectedAngle.name,
        success: true,
        text: result.text,
      };
    } else {
      throw new Error("Location image generation failed - no image returned");
    }
  }
);

// ===== STAGE 4: LOCATION WITH EFFECTS =====

export const GenerateLocationWithEffects = ai.defineFlow(
  {
    name: "GenerateLocationWithEffects",
    inputSchema: z.object({
      locationTemplate: z.any().describe("Base location template"),
      cameraAngle: z.string().optional().describe("Specific camera angle"),
      atmosphere: z
        .object({
          timeOfDay: z.string().optional(),
          weather: z.string().optional(),
          mood: z.string().optional(),
          lighting: z.string().optional(),
        })
        .optional(),
    }),
  },
  async ({ locationTemplate, cameraAngle, atmosphere }) => {
    const selectedAngle = cameraAngle
      ? locationTemplate.cameraAngles.find(
          (angle: any) => angle.name === cameraAngle
        )
      : locationTemplate.cameraAngles[0];

    if (!selectedAngle) {
      throw new Error(`Camera angle ${cameraAngle || "default"} not found`);
    }

    const prompt = await LocationWithEffectsPrompt({
      locationTemplate,
      cameraAngle: selectedAngle,
      atmosphere: atmosphere || {},
    });

    const result = await ai.generateImage({
      prompt: prompt.output?.imagePrompt!,
      history: [],
    });

    if (result?.image46) {
      const filename = `location-${locationTemplate.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`;
      const imageUrl = await ImageStorage.uploadImage(result.image46, filename);

      return {
        imageUrl,
        cameraAngle: selectedAngle.name,
        atmosphere,
        success: true,
        text: result.text,
      };
    } else {
      throw new Error("Location generation failed");
    }
  }
);

// ===== STAGE 5: ENHANCED PANEL GENERATION (TWO MODES) =====

export const GeneratePanelImagePromptOnly = ai.defineFlow(
  {
    name: "GeneratePanelImagePromptOnly",
    inputSchema: z.object({
      panel: z.any().describe("Panel data with panelContext"),
      scene: z.any().describe("Scene data with sceneContext"),
      characters: z.array(z.any()).describe("Characters in the panel"),
      availableTemplates: z
        .object({
          outfits: z.array(z.any()).optional(),
          locations: z.array(z.any()).optional(),
          poses: z.array(z.any()).optional(),
          effects: z.array(z.any()).optional(),
        })
        .optional(),
    }),
  },
  async ({ panel, scene, characters, availableTemplates }) => {
    // Mode 1: Pure prompt-based generation without reference images
    const enhancedTemplates = getEnhancedTemplatesForPanel(
      panel,
      scene,
      characters,
      availableTemplates
    );

    const prompt = await EnhancedPanelImagePrompt({
      panel,
      scene,
      characters: characters.map((ch: any) => ({
        ...ch,
        imageData: undefined, // Explicitly remove image data
        consistencyPrompt: undefined,
        negativePrompt: undefined,
      })),
      enhancedTemplates,
    });

    const result = await ai.generateImage({
      prompt:
        prompt.output?.imagePrompt! +
        " negative prompt: " +
        prompt.output?.negativePrompt,
      history: [], // No reference images - pure prompt generation
    });

    if (result?.image46) {
      const url = await ImageStorage.uploadImage(
        result.image46,
        `panel-prompt-only-${panel.id}-${Date.now()}`
      );

      await updatePanel(panel.id, {
        imageUrl: url,
      });

      return {
        imageUrl: url,
        mode: "prompt-only",
        success: true,
        text: result.text,
        appliedTemplates: enhancedTemplates,
      };
    } else {
      throw new Error("Prompt-only panel generation failed");
    }
  }
);

export const GeneratePanelImageWithReferences = ai.defineFlow(
  {
    name: "GeneratePanelImageWithReferences",
    inputSchema: z.object({
      panel: z.any().describe("Panel data with panelContext"),
      scene: z.any().describe("Scene data with sceneContext"),
      characters: z.array(z.any()).describe("Characters with reference images"),
      locationReference: z
        .any()
        .optional()
        .describe("Location reference image"),
      availableTemplates: z
        .object({
          outfits: z.array(z.any()).optional(),
          locations: z.array(z.any()).optional(),
          poses: z.array(z.any()).optional(),
          effects: z.array(z.any()).optional(),
        })
        .optional(),
    }),
  },
  async ({
    panel,
    scene,
    characters,
    locationReference,
    availableTemplates,
  }) => {
    // Mode 2: Reference image enhanced generation
    const conversationHistory: Content[] = [];

    // Add character reference images
    for (const ch of characters) {
      if (ch.imageData && ch.imageData.data && ch.imageData.mimeType) {
        conversationHistory.push({
          role: "user",
          parts: [
            {
              text: `Character Reference: ${ch.name}`,
            },
            { inlineData: ch.imageData },
          ],
        });
        conversationHistory.push({
          role: "model",
          parts: [
            {
              text: `Character locked: ${ch.name}`,
            },
          ],
        });
      }
    }

    // Add location reference image if available
    if (locationReference && locationReference.imageData) {
      conversationHistory.push({
        role: "user",
        parts: [
          {
            text: `Location Reference: ${locationReference.name}`,
          },
          { inlineData: locationReference.imageData },
        ],
      });
      conversationHistory.push({
        role: "model",
        parts: [
          {
            text: `Location reference locked: ${locationReference.name}`,
          },
        ],
      });
    }

    const enhancedTemplates = getEnhancedTemplatesForPanel(
      panel,
      scene,
      characters,
      availableTemplates
    );

    const prompt = await PanelWithReferencesPrompt({
      panel,
      scene,
      characters: characters.map((ch: any) => ({
        ...ch,
        imageData: undefined, // Remove from prompt but keep in history
        consistencyPrompt: undefined,
        negativePrompt: undefined,
      })),
      locationReference,
      enhancedTemplates,
    });

    const result = await ai.generateImage({
      prompt:
        prompt.output?.imagePrompt! +
        " negative prompt: " +
        prompt.output?.negativePrompt,
      history: conversationHistory, // Include all reference images
    });

    if (result?.image46) {
      const url = await ImageStorage.uploadImage(
        result.image46,
        `panel-with-refs-${panel.id}-${Date.now()}`
      );

      await updatePanel(panel.id, {
        imageUrl: url,
      });

      return {
        imageUrl: url,
        mode: "with-references",
        success: true,
        text: result.text,
        appliedTemplates: enhancedTemplates,
        usedReferences: {
          characters: characters
            .filter((ch) => ch.imageData)
            .map((ch) => ch.name),
          location: locationReference?.name || null,
        },
      };
    } else {
      throw new Error("Reference-based panel generation failed");
    }
  }
);

// ===== HELPER FUNCTIONS =====

// Helper function to enhance templates based on panel data
function getEnhancedTemplatesForPanel(
  panel: any,
  scene: any,
  characters: any[],
  availableTemplates?: any
) {
  const enhancedTemplates: any = {};

  // Get location template based on panel's locationId
  if (availableTemplates?.locations && panel.panelContext?.locationId) {
    enhancedTemplates.location = availableTemplates.locations.find(
      (loc: any) => loc.id === panel.panelContext.locationId
    );
  }

  // Get character-specific templates based on panelContext.characterPoses
  if (panel.panelContext?.characterPoses && availableTemplates) {
    enhancedTemplates.characterTemplates =
      panel.panelContext.characterPoses.map((charPose: any) => {
        const character = characters.find((c) => c.id === charPose.characterId);

        // Find outfit template
        const outfit = availableTemplates.outfits?.find(
          (o: any) => o.id === charPose.outfitId
        );

        // Find pose template based on pose description
        const pose = availableTemplates.poses?.find(
          (p: any) =>
            p.name.toLowerCase().includes(charPose.pose.toLowerCase()) ||
            p.description.toLowerCase().includes(charPose.pose.toLowerCase())
        );

        return {
          character,
          outfit,
          pose,
          poseDescription: charPose.pose,
          expression: charPose.expression,
        };
      });
  }

  // Get effects based on panel context
  if (panel.panelContext?.effects && availableTemplates?.effects) {
    enhancedTemplates.effects = panel.panelContext.effects
      .map((effectName: string) =>
        availableTemplates.effects.find(
          (eff: any) =>
            eff.name.toLowerCase().includes(effectName.toLowerCase()) ||
            eff.description.toLowerCase().includes(effectName.toLowerCase())
        )
      )
      .filter(Boolean);
  }

  return enhancedTemplates;
}

// ===== PROMPTS =====

export const PanelImagePrompt = ai.definePrompt({
  name: "PanelImagePrompt",
  input: {
    schema: z.object({
      panel: z.any().describe("panel with aiPrompt and panelContext"),
      scene: z.any().describe("scene context"),
      characters: z.array(z.any()).optional().describe("character references"),
      artStyle: z.string().optional().describe("art style specification"),
      additionalContext: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe(
          "Comprehensive, structured image generation prompt optimized for high-quality manga art"
        ),
      negativePrompt: z
        .string()
        .describe(
          "Detailed negative prompt to avoid common manga generation issues"
        ),
    }),
  },
  prompt: `You are an expert AI image prompt engineer specializing in high-quality anime/manga art generation. Your task is to enhance existing prompts to ensure that **characters are the central focus**, maintaining perfect fidelity to their references, with the background playing a supportive, non-dominant role unless explicitly required.

## QUALITY & STYLE FOUNDATION
**MANDATORY OPENING**: Every imagePrompt must begin with:
"masterpiece, best quality, high resolution, ultra detailed, anime style, manga art style, Japanese animation, 2D anime art, cel-shaded animation style, professional manga illustration, detailed line art, cinematic composition"

---

## PANEL DATA EXTRACTION

**Base Prompt**:
{{panel.aiPrompt}}

### PANEL CONTEXT
- Action: {{panel.panelContext.action}}
- Camera Angle: {{panel.panelContext.cameraAngle}}
- Shot Type: {{panel.panelContext.shotType}}
- Emotion: {{panel.panelContext.emotion}}
- Lighting: {{panel.panelContext.lighting}}
- Background: {{panel.panelContext.backgroundDescription}}
- Effects: {{panel.panelContext.effects}}
- Dramatic Purpose: {{panel.panelContext.dramaticPurpose}}
- Narrative Position: {{panel.panelContext.narrativePosition}}

**Character Details**:
{{#each panel.panelContext.characterPoses}}
- {{characterName}}: pose = {{pose}}, expression = {{expression}}, clothing = {{clothing}}{{#if props}}, props: {{props}}{{/if}}{{#if spatialPosition}}, position: {{spatialPosition}}{{/if}}
{{/each}}

**Scene Context**:
- Setting: {{scene.sceneContext.setting}}
- Mood: {{scene.sceneContext.mood}}
- Time of Day: {{scene.sceneContext.timeOfDay}}
- Weather: {{scene.sceneContext.weather}}
{{#if scene.sceneContext.consistencyAnchors}}
- Consistency Anchors:
  - Character Clothing: {{scene.sceneContext.consistencyAnchors.characterClothing}}
  - Environmental Elements: {{scene.sceneContext.consistencyAnchors.environmentalElements}}
  - Lighting Sources: {{scene.sceneContext.consistencyAnchors.lightingSources}}
  - Color Palette: {{scene.sceneContext.consistencyAnchors.colorPalette}}
  - Atmospheric Effects: {{scene.sceneContext.consistencyAnchors.atmosphericEffects}}
{{/if}}

**Available Characters**:
{{#if characters}}
{{#each characters}}
- {{name}}: {{description}}
{{/each}}
{{/if}}

## PROMPT GENERATION STRATEGY

### 1. CHARACTER FOCUS (Top Priority)
- Integrate: "(use previous character reference image for [CHARACTER_NAME])"
- NEVER describe facial traits; instead focus on:
  - Body posture & pose
  - Expression
  - Props
  - Clothing
  - Interaction & position in space
  - Perspective from camera angle

✅ Use anatomical precision: detailed hands, feet, fingers, proportions  
✅ Include spatial layering: foreground/background depth  

### 2. COMPOSITION & CAMERA
- Apply cinematic composition techniques according to:
  - Shot Type (e.g. close-up = facial focus, wide = group scene, etc.)
  - Camera Angle (low-angle = heroic, high-angle = vulnerable)

### 3. ENVIRONMENT (Supportive Role)
- Only enhance environmental details **when required by shot type**
- Extract architectural and mood details from:
  - 'backgroundDescription', 'setting', 'weather', and 'consistencyAnchors'
- If camera is focused on characters (close-up, medium shot), background should be minimal, blurred, or stylistically light to keep character focus

### 4. LIGHTING INTEGRATION
- Base it on:
  - 'scene.sceneContext.timeOfDay', 'lightingSources', 'effects'
  - Enhance contrast and mood according to panel emotion
- Include lighting realism via:
  - Material interaction
  - Shadow softness or harshness
  - Directional lighting from props (lamps, sun)

### 5. EMOTIONAL EXPRESSION
- Adjust image tone, color temperature, and composition around:
  - 'panel.panelContext.emotion'
  - Dramatic Purpose
  - Character interaction & expression

## NEGATIVE PROMPT RULES

Use this comprehensive default negative prompt, with modifications per panel:

**Negative Prompt**:  
"blurry, low quality, distorted anatomy, amateur art, poor anatomy, bad anatomy, realistic photography, western comic style, 3D render, photorealistic, deformed hands, extra fingers, missing limbs, distorted proportions, malformed anatomy, inconsistent clothing, mismatched lighting, cluttered composition, oversaturated colors, photographic shading, non-anime style, artifacts, noise, compression errors, unclear focus, poor framing, continuity errors, character inconsistency, multiple heads, duplicate characters, realistic facial features, photorealistic lighting, live action, impossible architecture, floating objects"

### Panel-Specific Additions
- If camera is close-up: exclude "distant background, wide scenery"
- If emotional: exclude "neutral expressions"
- If dramatic: exclude "lighthearted tone, soft color palette"
- If action: exclude "motion blur, awkward posing"

## GENERATION COMMAND
Using the provided aiPrompt, panelContext, scene context, and character data, enhance and optimize the aiPrompt to create a comprehensive imagePrompt and negativePrompt. Prioritize character fidelity and reference accuracy while supporting visual storytelling through background and lighting only as needed. Build upon the existing prompt rather than replacing it.
`,
});

export const EnhancedPanelImagePrompt = ai.definePrompt({
  name: "EnhancedPanelImagePrompt",
  input: {
    schema: z.object({
      panel: z.any().describe("panel with panelContext"),
      scene: z.any().describe("scene context"),
      characters: z.array(z.any()).describe("character references"),
      enhancedTemplates: z.any().describe("template data for this panel"),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe("Complete enhanced panel prompt with template integration"),
      negativePrompt: z
        .string()
        .describe("Enhanced negative prompt for quality"),
    }),
  },
  prompt: `You are creating a professional manga panel by intelligently combining existing panel data with available templates.

## QUALITY FOUNDATION
**MANDATORY OPENING**: "masterpiece, best quality, high resolution, ultra detailed, anime style, manga panel art, professional manga illustration, detailed line art, cinematic composition"

## PANEL DATA EXTRACTION

**Panel Context from Data:**
- Action: {{panel.panelContext.action}}
- Camera Angle: {{panel.panelContext.cameraAngle}}
- Shot Type: {{panel.panelContext.shotType}}
- Emotion: {{panel.panelContext.emotion}}
- Lighting: {{panel.panelContext.lighting}}
- Effects: {{panel.panelContext.effects}}
- Location ID: {{panel.panelContext.locationId}}

**Character Poses from Panel Data:**
{{#each panel.panelContext.characterPoses}}
- {{characterName}}: 
  - Pose: {{pose}}
  - Expression: {{expression}}
  - Outfit ID: {{outfitId}}
{{/each}}

**Scene Context:**
- Location: {{scene.location}}
- Mood: {{scene.mood}}
- Time of Day: {{scene.timeOfDay}}
- Weather: {{scene.weather}}

## ENHANCED TEMPLATE INTEGRATION

{{#if enhancedTemplates.location}}
**Location Template Applied:**
- {{enhancedTemplates.location.name}}: {{enhancedTemplates.location.description}}
- Category: {{enhancedTemplates.location.category}}
- Mood: {{enhancedTemplates.location.mood}}
- Lighting: {{enhancedTemplates.location.lighting.type}} {{enhancedTemplates.location.lighting.intensity}}
{{/if}}

{{#if enhancedTemplates.characterTemplates}}
**Character Templates Applied:**
{{#each enhancedTemplates.characterTemplates}}
- **{{character.name}}**:
  {{#if outfit}}
  - Outfit: {{outfit.name}} - {{outfit.description}}
  - Style: {{outfit.category}}, {{outfit.colors}}
  {{/if}}
  {{#if pose}}
  - Emotion: {{pose.emotion}}
  {{/if}}
  - Panel Pose: {{poseDescription}}
  - Expression: {{expression}}
{{/each}}
{{/if}}

{{#if enhancedTemplates.effects}}
**Effect Templates Applied:**
{{#each enhancedTemplates.effects}}
- {{name}}: {{description}}
- Category: {{category}}, Intensity: {{intensity}}
{{/each}}
{{/if}}

## INTELLIGENT COMPOSITION STRATEGY

### 1. CHARACTER FOCUS AND CONSISTENCY
- Use character references: "(use previous character reference image for [CHARACTER_NAME])"
- Apply template outfits while maintaining character identity
- Integrate pose templates with panel-specific pose descriptions
- Layer character expressions with panel emotion context

### 2. LOCATION AND ENVIRONMENTAL INTEGRATION
- Blend location template with scene context
- Apply template lighting with panel lighting specifications
- Balance environmental detail with camera angle requirements
- Support narrative through environmental storytelling

### 3. EFFECT AND ATMOSPHERE ENHANCEMENT
- Layer effect templates to enhance panel emotion
- Ensure effects support rather than overwhelm characters
- Integrate panel-specific effects with template effects
- Maintain manga panel readability

### 4. CAMERA AND COMPOSITION
- Apply panel camera angle and shot type precisely
- Frame composition based on character focus and action
- Use depth layering appropriate to shot type
- Maintain visual hierarchy for manga reading flow

## TEMPLATE SYNTHESIS RULES

**Priority Order:**
1. Character consistency and reference accuracy
2. Panel-specific data (poses, expressions, actions)
3. Template enhancements (outfits, effects, location details)
4. Scene context and atmosphere
5. Technical manga composition standards

**Integration Method:**
- Template data enhances rather than replaces panel data
- Character templates support character consistency
- Location templates provide rich environmental context
- Effect templates amplify emotional and narrative impact

## NEGATIVE PROMPT CONSTRUCTION

Generate comprehensive negative prompt:
"blurry, low quality, distorted anatomy, amateur art, poor anatomy, bad anatomy, realistic photography, western comic style, 3D render, photorealistic, deformed hands, extra fingers, missing limbs, distorted proportions, malformed anatomy, inconsistent clothing, mismatched lighting, cluttered composition, oversaturated colors, photographic shading, non-anime style, artifacts, noise, compression errors, unclear focus, poor framing, continuity errors, character inconsistency, multiple heads, duplicate characters, realistic facial features, photorealistic lighting, live action, template clash, inconsistent integration, competing visual elements"

Create a comprehensive manga panel that seamlessly integrates panel data with template enhancements for optimal visual storytelling.

Panel: {{panel}}
Scene: {{scene}}
Characters: {{characters}}
Enhanced Templates: {{enhancedTemplates}}`,
});

export const CharacterWithTemplatesPrompt = ai.definePrompt({
  name: "CharacterWithTemplatesPrompt",
  input: {
    schema: z.object({
      character: z.any(),
      outfitTemplate: z.any().optional(),
      context: z.object({
        location: z.string().optional(),
        mood: z.string().optional(),
        lighting: z.string().optional(),
      }),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe("Enhanced character prompt with templates"),
    }),
  },
  prompt: `Create a character image that seamlessly integrates specific templates with the base character design.

## QUALITY FOUNDATION
"masterpiece, best quality, high resolution, ultra detailed, anime character art, detailed character design, professional anime illustration, full body character, dynamic character pose, vibrant colors, detailed shading, anime proportions"

## BASE CHARACTER
- Name: {{character.name}}
- Description: {{character.description}}
- Personality: {{character.personality}}

## TEMPLATE INTEGRATION

{{#if outfitTemplate}}
**Outfit Template Applied:**
- Name: {{outfitTemplate.name}}
- Description: {{outfitTemplate.description}}
- Category: {{outfitTemplate.category}}
- Components: {{outfitTemplate.components}}
- Colors: {{outfitTemplate.colors}}
- Materials: {{outfitTemplate.materials}}
{{/if}}


## CONTEXT INTEGRATION
- Location Context: {{context.location || "neutral background"}}
- Mood: {{context.mood || "character default mood"}}
- Lighting: {{context.lighting || "soft anime lighting"}}

## SYNTHESIS INSTRUCTIONS
1. Maintain character's core identity and facial features
2. Apply outfit template as the character's clothing system
3. Use pose template for body positioning and stance
4. Ensure template integration feels natural and cohesive
5. Support the context mood through overall presentation

Generate a complete character image that successfully combines all elements.

Character: {{character}}
Outfit Template: {{outfitTemplate}}
Context: {{context}}`,
});

// PORTRAIT VERSION - For creating detailed character reference faces
export const AnimeCharacterPortraitPrompt = ai.definePrompt({
  name: "AnimeCharacterPortraitGeneration",
  input: {
    schema: z.object({
      character: z.any(),
      seriesStyle: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe("Detailed anime character portrait prompt"),
    }),
  },
  prompt: `Create a detailed anime character portrait prompt for consistent character reference.

## BASE QUALITY
High-quality anime portrait, detailed facial features, upper body shot, studio lighting, sharp focus on face.

## CHARACTER DETAILS
- {{character.gender}} with {{character.personality}} personality
- Role: {{character.role}}

## FACIAL FEATURES
- Face: {{character.facialAttributes.faceShape}} face with {{character.facialAttributes.skinTone}} skin
- Eyes: {{character.facialAttributes.eyeColor}} {{character.facialAttributes.eyeShape}} eyes
- Hair: {{character.hairAttributes.hairColor}} {{character.hairAttributes.hairstyle}}, {{character.hairAttributes.hairLength}}
- Expression: {{character.expressionStyle.defaultExpression}}

## OUTFIT & STYLE
- Clothing: {{character.style.defaultOutfit}} (upper body visible)
- Art style: {{character.styleGuide.artStyle}}
{{#if seriesStyle}}
- Series style: {{seriesStyle}} aesthetic
{{/if}}

## DISTINCTIVE FEATURES
{{character.distinctiveFeatures}}

Generate a focused portrait prompt (200-250 words) emphasizing facial consistency and character recognition.

Character Data: {{character}}`,
});

// FULL BODY VERSION - For creating complete character illustrations
export const AnimeCharacterFullBodyPrompt = ai.definePrompt({
  name: "AnimeCharacterFullBodyGeneration",
  input: {
    schema: z.object({
      character: z.any(),
      seriesStyle: z.string().optional(),
      portraitReference: z.string().optional(),
      pose: z.string().optional(),
      setting: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe(
          "Complete anime character full-body prompt with facial consistency reference"
        ),
    }),
  },
  prompt: `You are creating a complete full-body anime character illustration that maintains perfect facial consistency with the established portrait reference.

## CORE MISSION: FULL BODY CHARACTER ILLUSTRATION
Generate complete character illustrations with consistent facial features, full outfit details, and dynamic poses while maintaining the established character design.

## TECHNICAL FOUNDATION
"Full body anime character, high quality anime art, complete character design head to toe, clean lineart, cel shading, vibrant colors, detailed anime eyes with highlights, expressive facial features, modern anime aesthetic, professional anime production quality, cohesive character design, anime proportions, soft anime shading, detailed hair rendering with individual strands, anime facial features with precise detail, full body pose, detailed clothing and accessories, anatomically correct anime style, dynamic character stance, detailed hands and feet, fabric texture details, consistent art style throughout, full character reference sheet quality."

## FACIAL CONSISTENCY REFERENCE
{{portraitReference ? "CRITICAL: Maintain exact facial consistency with reference: " + portraitReference : ""}}

### MAINTAINED FACIAL FEATURES
- Face: {{character.facialAttributes.faceShape}} face with {{character.facialAttributes.jawline}} jawline
- Eyes: {{character.facialAttributes.eyeColor}} {{character.facialAttributes.eyeShape}} eyes with the same crystalline detail and emotional depth
- Hair: {{character.hairAttributes.hairColor}} {{character.hairAttributes.hairstyle}} {{character.hairAttributes.hairLength}} hair with {{character.hairAttributes.hairTexture}} texture
- Expression: {{character.expressionStyle.defaultExpression}} expression maintaining character personality
- Distinctive features: {{character.distinctiveFeatures}} clearly visible

## FULL BODY COMPOSITION

### BODY STRUCTURE & PROPORTIONS
- {{character.age}} year old {{character.gender}} with {{character.bodyAttributes.bodyType}} build
- Height: {{character.bodyAttributes.height}}
- Overall physique: {{character.bodyAttributes.physique}}
- Posture: {{character.posture}}

### COMPLETE OUTFIT DESIGN
**Main Clothing:**
- {{character.style.defaultOutfit}}
- Color palette: {{character.style.colorPalette}}
- Fabric details: realistic fabric physics, appropriate draping, texture variety
- Fit: how clothes conform to body type and movement

**Accessories & Details:**
- {{character.style.accessories}}
- Signature item: {{character.style.signatureItem}}
- Footwear: detailed shoes/boots appropriate to character style
- Additional details: belts, bags, weapons, tools, etc.

### POSE & COMPOSITION
**Character Pose:**
- {{pose || "confident standing pose showing full character design"}}
- Hand positioning: detailed hands with proper anatomy
- Stance: reflecting {{character.personality}} personality
- Dynamic elements: suggesting {{character.abilities}} if applicable

**Framing:**
- Full body shot showing complete character from head to toe
- Appropriate spacing around character
- Clear view of all design elements
- Character takes up 70-80% of frame height

### SETTING & BACKGROUND
- {{setting || "Simple background that doesn't distract from character design"}}
- {{seriesStyle}} universe environmental elements
- Lighting that enhances character without overpowering
- Background complements character's color palette

### SERIES STYLE APPLICATION
Apply {{seriesStyle}} aesthetic to full body:
- Art style consistency throughout entire figure
- Appropriate lineart weight and shading style
- Color saturation and contrast matching series aesthetic
- Environmental elements that fit the universe

### QUALITY SPECIFICATIONS
- Anatomically correct proportions
- Consistent art style from head to toe
- Detailed fabric rendering and physics
- Perfect hand and foot anatomy
- Clear character silhouette
- Vibrant but harmonious colors
- Professional anime production quality

## NEGATIVE SPECIFICATIONS
Avoid: {{character.negativePrompt}}, realistic, photorealistic, 3D render, western cartoon, chibi, deformed, ugly, blurry, low quality, bad anatomy, extra limbs, mutation, disfigured, bad proportions, watermark, signature, text, inconsistent style, mixed art styles, sketchy lines, rough artwork, amateur drawing, poorly drawn, distorted features, cropped, partial body, headshot only, face only, missing limbs, incomplete character, bad hands, malformed hands, extra fingers, missing fingers, floating limbs, disconnected body parts

Generate a comprehensive full-body imagePrompt (400-500 words) that creates a complete character illustration while maintaining facial consistency.

Character Data: {{character}}
Series Style: {{seriesStyle}}
Portrait Reference: {{portraitReference}}
Pose: {{pose}}
Setting: {{setting}}`,
});

// ===== STAGE 3: LOCATION IMAGE PROMPTS =====

export const LocationImagePrompt = ai.definePrompt({
  name: "LocationImagePrompt",
  input: {
    schema: z.object({
      locationTemplate: z.any().describe("Location template data"),
      cameraAngle: z.any().describe("Specific camera angle object"),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z.string().describe("Complete location image prompt"),
    }),
  },
  prompt: `You are an expert environmental artist creating high-quality location reference images for manga production.

## QUALITY FOUNDATION
**MANDATORY OPENING**: "masterpiece, best quality, high resolution, ultra detailed, anime background art, detailed environmental illustration, professional background design, architectural accuracy, atmospheric rendering, detailed textures, cinematic composition"

## LOCATION TEMPLATE DATA
**Location Name**: {{locationTemplate.name}}
**Location Type**: {{locationTemplate.type}}
**Base Description**: {{locationTemplate.basePrompt}}

## CAMERA ANGLE SPECIFICATIONS  
**Camera Angle**: {{cameraAngle.name}}
**Angle Description**: {{cameraAngle.description}}
**Specific Prompt**: {{cameraAngle.aiPrompt}}

## ENVIRONMENTAL RENDERING STRATEGY

### 1. ARCHITECTURAL ACCURACY
- Maintain structural integrity and realistic proportions
- Include all architectural elements from location template
- Ensure spatial relationships are logical and consistent
- Apply appropriate cultural and contextual architectural styles

### 2. ATMOSPHERIC ENHANCEMENT
- Create compelling environmental mood and atmosphere
- Include appropriate lighting conditions for location type
- Add environmental storytelling elements
- Balance detail levels for optimal manga background use

### 3. TECHNICAL SPECIFICATIONS
- Optimize for manga panel integration
- Ensure clear composition that supports character placement
- Maintain consistent art style with anime/manga aesthetics
- Create depth and perspective appropriate to camera angle

### 4. DETAIL OPTIMIZATION
- Include enough detail for visual interest without overwhelming
- Focus on characteristic elements that define the location
- Ensure backgrounds complement rather than compete with characters
- Maintain production efficiency for repeated use

## COMPOSITION ENHANCEMENT
Based on camera angle specifications, enhance the environmental composition to:
- Support the intended narrative function of this camera angle
- Provide optimal character placement opportunities
- Create visual interest through depth and layering
- Maintain clear focal points and visual hierarchy

## STYLE CONSISTENCY
- Professional anime/manga background art style
- Consistent with high-quality anime production standards
- Appropriate detail level for manga panel use
- Compatible with character art style integration

Generate a comprehensive location image that serves as a perfect reference for manga background use.

Location Template: {{locationTemplate}}
Camera Angle: {{cameraAngle}}`,
});

// ===== STAGE 4: LOCATION WITH EFFECTS PROMPTS =====

export const LocationWithEffectsPrompt = ai.definePrompt({
  name: "LocationWithEffectsPrompt",
  input: {
    schema: z.object({
      locationTemplate: z.any().describe("Base location template"),
      cameraAngle: z.any().describe("Camera angle object"),
      atmosphere: z
        .object({
          timeOfDay: z.string().optional(),
          weather: z.string().optional(),
          mood: z.string().optional(),
          lighting: z.string().optional(),
        })
        .describe("Atmospheric conditions"),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z.string().describe("Enhanced location with effects prompt"),
    }),
  },
  prompt: `You are creating an atmospherically enhanced location by combining base environmental design with atmospheric conditions.

## QUALITY FOUNDATION
**MANDATORY OPENING**: "masterpiece, best quality, high resolution, ultra detailed, anime background art with atmospheric effects, detailed environmental illustration, professional background design with atmospheric enhancements, dynamic atmosphere, enhanced mood lighting, cinematic environmental effects"

## BASE LOCATION FOUNDATION
**Location**: {{locationTemplate.name}} ({{locationTemplate.type}})
**Base Design**: {{locationTemplate.basePrompt}}
**Camera Angle**: {{cameraAngle.name}} - {{cameraAngle.aiPrompt}}

## ATMOSPHERIC CONDITIONS
- **Time of Day**: {{atmosphere.timeOfDay || "neutral"}}
- **Weather**: {{atmosphere.weather || "clear"}}
- **Mood**: {{atmosphere.mood || "neutral"}}
- **Lighting**: {{atmosphere.lighting || "natural"}}


## EFFECT INTEGRATION STRATEGY

### 1. ATMOSPHERIC LAYERING
- Seamlessly blend base location with atmospheric conditions
- Ensure effects enhance rather than overwhelm the environment
- Maintain architectural integrity while adding atmospheric elements
- Create depth through effect layering (foreground, midground, background)

### 2. LIGHTING ENHANCEMENT
- Apply atmospheric lighting enhancements to base location lighting
- Apply time-of-day and weather lighting modifications
- Create mood-appropriate color temperature and contrast
- Ensure lighting supports the intended narrative atmosphere

### 3. WEATHER AND ENVIRONMENTAL EFFECTS
- Apply weather conditions that modify the base location appearance
- Include environmental particles, atmospheric haze, or weather effects
- Modify material appearance based on weather (wet surfaces, snow accumulation, etc.)
- Ensure weather effects feel natural and believable

### 4. MOOD AND EMOTIONAL ENHANCEMENT
- Use color palette adjustments to reinforce mood
- Apply atmospheric effects that support emotional storytelling
- Balance dramatic impact with practical manga background utility
- Maintain visual hierarchy that supports character placement

## TECHNICAL CONSIDERATIONS

### Effect Rendering Quality
- Professional anime/manga effect rendering standards
- Consistent art style integration between location and effects
- Appropriate detail levels for manga panel backgrounds
- Optimized for character integration and story telling

### Composition Balance
- Effects support rather than compete with potential character placement
- Clear visual hierarchy maintained despite atmospheric enhancement
- Depth and perspective enhanced by effect integration
- Camera angle advantages maximized through effect placement

## INTEGRATION VALIDATION
Ensure the final enhanced location:
- Maintains the core identity of the base location template
- Successfully integrates all specified effect templates
- Supports the intended atmospheric conditions
- Functions effectively as a manga background
- Provides visual interest without overwhelming character presence

Create an enhanced location that perfectly combines environmental design with atmospheric effects for compelling manga storytelling.

Location Template: {{locationTemplate}}
Camera Angle: {{cameraAngle}}
Atmosphere: {{atmosphere}}`,
});

// ===== STAGE 5: PANEL WITH REFERENCES PROMPT =====

export const PanelWithReferencesPrompt = ai.definePrompt({
  name: "PanelWithReferencesPrompt",
  input: {
    schema: z.object({
      panel: z.any().describe("Panel data with panelContext"),
      scene: z.any().describe("Scene context"),
      characters: z.array(z.any()).describe("Character data without imageData"),
      locationReference: z.any().optional().describe("Location reference info"),
      enhancedTemplates: z.any().describe("Enhanced template data"),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z.string().describe("Reference-enhanced panel prompt"),
      negativePrompt: z.string().describe("Quality negative prompt"),
    }),
  },
  prompt: `You are creating a professional manga panel using reference images for character and location consistency while integrating template enhancements.

## QUALITY FOUNDATION
**MANDATORY OPENING**: "masterpiece, best quality, high resolution, ultra detailed, anime style, manga panel art, professional manga illustration, detailed line art, cinematic composition, reference-accurate character consistency, environmental reference integration"

## REFERENCE INTEGRATION STRATEGY

### CHARACTER REFERENCE USAGE
The conversation history contains character reference images. For each character in the panel:
- **CRITICAL**: Use "(use previous character reference image for [CHARACTER_NAME])" 
- Maintain exact facial consistency with reference images
- Focus on pose, expression, and outfit details rather than facial features
- Integrate character references seamlessly with panel requirements

### LOCATION REFERENCE INTEGRATION
{{#if locationReference}}
**Location Reference Available**: {{locationReference.name}}
- Use "(use previous location reference image)" for environmental consistency
- Adapt location reference to panel's camera angle and composition needs
- Maintain architectural and environmental integrity from reference
- Blend location reference with panel-specific atmospheric requirements
{{else}}
**No Location Reference**: Generate environment from template and scene data
{{/if}}

## PANEL DATA EXTRACTION

**Panel Context**:
- Action: {{panel.panelContext.action}}
- Camera Angle: {{panel.panelContext.cameraAngle}}
- Shot Type: {{panel.panelContext.shotType}}
- Emotion: {{panel.panelContext.emotion}}
- Lighting: {{panel.panelContext.lighting}}

**Character Poses from Panel**:
{{#each panel.panelContext.characterPoses}}
- {{characterName}}: {{pose}} with {{expression}} expression
{{/each}}

**Scene Context**:
- Setting: {{scene.location}}
- Mood: {{scene.mood}}
- Time: {{scene.timeOfDay}}
- Weather: {{scene.weather}}

## TEMPLATE ENHANCEMENT INTEGRATION

{{#if enhancedTemplates.location}}
**Location Template Enhancement**:
- Template: {{enhancedTemplates.location.name}}
- Use template details to enhance location reference or generate if no reference
{{/if}}

{{#if enhancedTemplates.characterTemplates}}
**Character Template Enhancements**:
{{#each enhancedTemplates.characterTemplates}}
- **{{character.name}}**: 
  {{#if outfit}}Outfit: {{outfit.name}} - {{outfit.description}}{{/if}}
{{/each}}
{{/if}}

{{#if enhancedTemplates.effects}}
**Effect Templates**:
{{#each enhancedTemplates.effects}}
- {{name}}: {{description}} ({{intensity}} intensity)
{{/each}}
{{/if}}

## REFERENCE-ENHANCED COMPOSITION STRATEGY

### 1. CHARACTER INTEGRATION
- Use character reference images for perfect facial consistency
- Apply template outfits while maintaining character identity from references
- Integrate pose templates with reference character proportions and style
- Ensure character references blend seamlessly with panel requirements

### 2. ENVIRONMENTAL INTEGRATION
{{#if locationReference}}
- Adapt location reference to match panel camera angle and shot type
- Blend location reference with scene atmospheric requirements
- Use location reference as foundation, enhance with template details
{{else}}
- Generate environment using location template and scene context
- Create environment that would complement available character references
{{/if}}

### 3. TEMPLATE SYNTHESIS WITH REFERENCES
- Templates enhance rather than override reference accuracy
- Character outfits from templates applied to reference character bases
- Location details from templates integrated with reference environments
- Effects applied to enhance both character and location references

### 4. PANEL-SPECIFIC OPTIMIZATION
- Compose panel using references as foundation elements
- Apply panel camera angle and shot type to reference-based composition
- Ensure reference integration supports panel's narrative function
- Maintain manga panel readability with reference-enhanced elements

## TECHNICAL EXCELLENCE

### Reference Consistency
- Character faces maintain perfect reference accuracy
- Location architecture respects reference structural integrity
- Art style remains consistent between references and generated elements
- Proportions and scale relationships preserved from references

### Template Integration Quality
- Templates enhance reference accuracy rather than competing with it
- Outfit and pose templates applied intelligently to reference characters
- Effect templates complement reference-based environmental mood
- All template elements feel naturally integrated with reference foundation

## NEGATIVE PROMPT CONSTRUCTION

Enhanced negative prompt for reference-based generation:
"blurry, low quality, distorted anatomy, amateur art, poor anatomy, bad anatomy, realistic photography, western comic style, 3D render, photorealistic, deformed hands, extra fingers, missing limbs, distorted proportions, malformed anatomy, inconsistent clothing, mismatched lighting, cluttered composition, oversaturated colors, photographic shading, non-anime style, artifacts, noise, compression errors, unclear focus, poor framing, continuity errors, character inconsistency, multiple heads, duplicate characters, realistic facial features, photorealistic lighting, live action, reference mismatch, inconsistent art style between references and generated elements, poor reference integration, competing visual elements"

Create a professional manga panel that seamlessly integrates character and location references with template enhancements for optimal visual storytelling.

Panel: {{panel}}
Scene: {{scene}}
Characters: {{characters}}
Location Reference: {{locationReference}}
Enhanced Templates: {{enhancedTemplates}}`,
});
