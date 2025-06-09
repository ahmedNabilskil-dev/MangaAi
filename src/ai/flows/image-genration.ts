import { ai } from "@/ai/ai-instance";
import { ImageStorage } from "@/lib/localStorage";
import { updateCharacter, updatePanel } from "@/services/data-service";
import { Content } from "@google/genai";
import { z } from "zod";

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
        .describe(
          "Ultra-detailed anime character portrait prompt optimized for facial precision and reference creation"
        ),
    }),
  },
  prompt: `You are a master anime character visualizer creating ultra-detailed portrait references for maximum facial consistency and detail.

## CORE MISSION: PORTRAIT REFERENCE CREATION
Generate character portrait prompts optimized for creating detailed facial references that will be used to maintain consistency across all future character appearances.

## TECHNICAL EXCELLENCE FOUNDATION
Begin with premium portrait specifications:
"8K ultra-detailed portrait masterpiece, perfect facial anatomy, award-winning anime character design, professional portrait photography quality, razor-sharp facial features, flawless facial proportions, studio portrait lighting, reference portrait perfection, close-up character study. Portrait shot, upper body composition, face-focused framing, shoulders and chest visible, maximum facial detail retention, professional headshot quality."

## CHARACTER DATA INTEGRATION

### BASIC IDENTITY
- {{character.gender}} with {{character.personality}} demeanor, {{character.role}} character


### FACIAL ARCHITECTURE - MAXIMUM DETAIL
**Face Structure:**
- Face shape: {{character.facialAttributes.faceShape}} with {{character.facialAttributes.jawline}} jawline, perfectly symmetrical features
- Skin: {{character.facialAttributes.skinTone}} complexion with flawless texture, subtle skin highlights, natural skin depth, pore-level detail

**Eyes (Priority Detail):**
- {{character.facialAttributes.eyeColor}} {{character.facialAttributes.eyeShape}} eyes with crystalline iris detail, individual eyelash definition, realistic light reflection, emotional depth, perfect eye symmetry
- Perfectly shaped {{character.hairAttributes.hairColor}} eyebrows with natural arch, individual hair strands visible

**Facial Features:**
- {{character.facialAttributes.noseType}} nose with subtle shadow definition, perfect nostril symmetry
- {{character.facialAttributes.mouthType}} mouth with detailed lip texture, natural lip color, subtle lip highlights, {{character.expressionStyle.defaultExpression}} with micro-expression details

**Hair (Portrait Optimized):**
- Hair color {{character.hairAttributes.hairColor}} with realistic color gradients and natural highlights
- {{character.hairAttributes.hairstyle}}, {{character.hairAttributes.hairLength}} hair perfectly framing the face
- {{character.hairAttributes.hairTexture}} texture with individual strand physics, natural hair movement, realistic hair volume
- Natural hairline, sideburns, hair shadows on face. {{character.hairAttributes.specialHairFeatures}} with realistic hair behavior and lighting

### UPPER BODY COMPOSITION
**Body Structure:**
- {{character.bodyAttributes.bodyType}} build shoulder structure, natural shoulder slope
- {{character.posture}} reflected in head tilt and shoulder position

**Upper Torso Outfit:**
- {{character.style.defaultOutfit}} (chest/shoulder area only)
- Collar detail: High, upturned collar framing the neck, fabric texture, color harmonizing with facial features

### DISTINCTIVE FEATURES
- Unique facial features: {{character.distinctiveFeatures}} serves as a distinctive mark
- Character traits: {{character.traits}} expressed through facial characteristics, especially through {{character.expressionStyle.defaultExpression}} and the intense gaze in the eyes

### SERIES STYLE INTEGRATION
Apply {{seriesStyle}} aesthetic with portrait focus:
- Sharp angular facial features, piercing glowing eyes with magical depth, modern upper body fashion, crystalline eye effects, clean precise facial lineart, manhwa-style facial shading

**Art Style Specifications:**
- Art style: {{character.styleGuide.artStyle}}, optimized for facial detail
- Facial line weight with emphasis on eye and lip definition
- Facial shading with portrait lighting emphasizing bone structure and subtle skin texture
- Color focus prioritizing natural skin tones and {{character.facialAttributes.eyeColor}} eye colors

### LIGHTING SETUP
- Studio portrait lighting showcasing facial features
- Soft key light eliminating harsh facial shadows
- Natural skin tone rendering, Eye light for life-like gaze, Hair light for texture definition
- {{seriesStyle}} universe atmospheric elements as subtle background

Generate a comprehensive portrait imagePrompt (350-400 words) focused on creating the perfect character reference face.

<!-- 
The character's age is {{character.age}}, but it must never be explicitly stated as a number in the output.

The image should reflect the character's **true age visually** using descriptive cues (e.g., youthful energy, mature expression, aged features, life-worn gaze). Do not say the age numerically, and never include phrases like "40 years old" or "teenage".

Use visual storytelling and physical traits to **imply** the age (e.g., soft round cheeks for youth, fine smile lines for adults, sagging eyelids for elderly), depending on the character.

⚠️ ABSOLUTELY DO NOT mention any number representing age in any form. Age must be visually inferred through descriptive details only. This rule applies to all ages.
-->


Character Data: {{character}}
Series Style: {{seriesStyle}}`,
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
