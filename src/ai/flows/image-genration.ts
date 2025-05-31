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
      seriesStyle: "Solo Leveling",
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

    const finalPrompt = await enhancePanelPrompt({
      input: prompt.output?.imagePrompt!,
    });

    const res = await ai.generateImage({
      prompt: finalPrompt.output!,
      history: conversationHistory,
    });

    if (res?.image46) {
      const url = await ImageStorage.uploadImage(
        res.image46,
        `panel-${panel.id}-${Date.now()}`
      );

      updatePanel(panel.id, {
        imageUrl: url,
        aiPrompt: prompt.output?.imagePrompt!,
      });
      return res?.text;
    } else {
      console.error("Panel image generation failed - no image returned");
      return "Error: Professional panel generation failed.";
    }
  }
);

export const PanelImagePrompt = ai.definePrompt({
  name: "DetailedMangaImagePrompt",
  input: {
    schema: z.object({
      panel: z.any(),
      scene: z.any(),
      characters: z.array(z.any()).optional(),
      additionalContext: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe(
          "Detailed, structured image generation prompt following successful format patterns."
        ),
    }),
  },
  prompt: `You are an expert AI image prompt engineer. Generate a highly detailed, structured prompt based on the successful format that produces clean, artifact-free ANIME/MANGA style images.

---

## QUALITY & STYLE REQUIREMENTS
**CRITICAL: Every prompt must start with these specifications:**
- "masterpiece, best quality, high resolution, ultra detailed,"
- "anime style, manga art style, Japanese animation,"
- "2D anime art, cel-shaded animation style,"
- Include specific anime visual characteristics

---

## SUCCESSFUL PROMPT STRUCTURE
Follow this exact pattern for best results:

1. **QUALITY & STYLE DECLARATION** (quality + anime/manga specification)
2. **SCENE OVERVIEW** (1 sentence)
3. **ENVIRONMENT DETAILS** (detailed setting description)
4. **PRIMARY CHARACTER** (full detailed description)
5. **SECONDARY CHARACTER** (full detailed description)  
6. **BACKGROUND ELEMENTS** (if any, brief)
7. **CAMERA & COMPOSITION** (shot type, angle)
8. **LIGHTING DETAILS** (specific lighting setup)
9. **MOOD & ATMOSPHERE** (emotional tone)
10. **SPECIAL EFFECTS** (blood, magic, etc. if relevant)

---

## DATA EXTRACTION

**Panel Information:**
- Action: {{panel.panelContext.action}}
- Character Poses: 
{{#if panel.panelContext.characterPoses}}
{{#each panel.panelContext.characterPoses}}
  * {{characterName}}: {{pose}} {{#if expression}}({{expression}}){{/if}}
{{/each}}
{{/if}}
- Camera Angle: {{panel.panelContext.cameraAngle}}
- Shot Type: {{panel.panelContext.shotType}}
- Background: {{panel.panelContext.backgroundDescription}}
- Lighting: {{panel.panelContext.lighting}}
- Effects: {{panel.panelContext.effects}}
- Dramatic Purpose: {{panel.panelContext.dramaticPurpose}}

**Scene Context:**
- Setting: {{scene.sceneContext.setting}}
- Mood: {{scene.sceneContext.mood}}
- Present Characters: {{scene.sceneContext.presentCharacters}}
- Time of Day: {{scene.sceneContext.timeOfDay}}
- Weather: {{scene.sceneContext.weather}}

**Characters Available:**
{{#if characters}}
{{#each characters}}
- {{name}}: {{description}}
{{/each}}
{{/if}}

---

## GENERATION APPROACH

**Follow the natural narrative flow of the successful example. Each section should flow seamlessly into the next without repetition or mechanical templating.**

**STEP 1: Quality & Style Declaration**
- Always start with "masterpiece, best quality, high resolution, ultra detailed,"
- Follow with "anime style, manga art style, Japanese animation,"
- Include specific anime visual characteristics

**STEP 2: Scene Setup (Single flowing paragraph)**
- Start with the core dramatic action
- Describe character positions and immediate actions in relation to each other
- Keep it natural and narrative, not templated

**STEP 3: Environment (Single descriptive sentence)**
- One clear, detailed description of the setting
- Include specific materials, atmospheric elements
- Don't repeat environment details later

**STEP 4: Character Details (One paragraph per main character)**
- Start with physical appearance (age, hair, eyes)
- Add "(use previous character reference images)" after character name
- Move to clothing (specific materials, fit, condition)
- Add what they're holding/doing
- Include body type and anatomical perfection
- End with expression
- Make it flow naturally, not like a checklist

**STEP 5: Background Characters (Brief sentence)**
- Position and brief description only
- Don't over-detail background characters

**STEP 6: Camera/Composition (Single sentence)**
- Shot type, angle, and focus priority

**STEP 7: Lighting (Flowing paragraph)**
- Multiple light sources described naturally
- How light interacts with characters and environment
- Shadow patterns and highlights

**STEP 8: Mood (Single sentence)**
- 3-4 emotional descriptors

**STEP 9: Special Effects (If relevant)**
- Realistic descriptions of magical/special elements

**STEP 10: Final Context (If needed)**
- Any important contextual notes

## CRITICAL RULES:
- **ALWAYS START WITH QUALITY + ANIME STYLE SPECIFICATION**
- **ADD CHARACTER REFERENCE INSTRUCTION** - Include "(use previous character reference images)" for each character
- **NO REPETITION** - Each element mentioned only once
- **NATURAL FLOW** - Read like a story description, not a template
- **SEAMLESS TRANSITIONS** - Each section flows into the next
- **AVOID MECHANICAL LANGUAGE** - Don't use "He is..." "She wears..." repeatedly
- **SINGLE COHERENT NARRATIVE** - Should read as one flowing description

---

## SUCCESSFUL EXAMPLE TO FOLLOW:

"masterpiece, best quality, high resolution, ultra detailed, anime style, manga art style, Japanese animation style, 2D anime art with clean line work and cel-shaded coloring, a young man protecting a young woman from an unseen monster. The young man lunges forward defensively, holding a sharp blade in his dominant hand, his other arm raised to shield the woman. The young woman is partially behind him, looking scared but hopeful, her body tense. a dark, damp, gothic-style cave interior with detailed stalactites and stalagmites, subtle mist, and intricate, realistic spiderwebs. a tall young man (use previous character reference images) with messy dark black hair and piercing bright blue eyes, wearing a tattered, dark grey, loose-fitting cotton t-shirt with realistic wrinkles and folds, and dark combat pants. He holds a short, razor-sharp combat knife with a defined handle and gleaming blade. His body is muscular and toned, with anatomically perfect hands, fingers, and joints. His expression is fierce and determined. a young woman (use previous character reference images) with long, flowing bubblegum pink hair and large, expressive light blue eyes. She wears a form-fitting black sports bra made of smooth, slightly reflective fabric, and dark shorts. Her body is slender and proportioned, with naturally defined shoulders and arms. Her expression is a mix of fear and trust in the boy's protection. a man with short dark hair and a stern expression, wearing a simple black black jacket, positioned further back in the cave, observing the scene, with clear facial features proportionate to his distance. dynamic medium shot, slightly low-angle, focusing on the boy's protective stance and the girl partially behind him. dramatic cinematic lighting with a single, strong glowing magical light source emanating from the boy's blade, casting sharp highlights and deep, realistic shadows. Subtle rim lighting on the characters, highlighting their silhouettes against the dark cave. Hints of ambient light from distant glowing crystals in the cave ceiling. intense, suspenseful, protective, and determined. realistic blood spatter on the blade and a tiny bit on the boy's shirt, appearing as natural liquid. The environment is dark and filled with a sense of danger from an unseen monster (do not generate the monster in the image, imply its presence through character reaction and context)."

## ACTUAL STRUCTURE BREAKDOWN:
1. **Quality & Style Declaration**: "masterpiece, best quality, high resolution, ultra detailed, anime style, manga art style, Japanese animation style, 2D anime art with clean line work and cel-shaded coloring,"

2. **Scene Setup + Action**: "a young man protecting a young woman from an unseen monster. The young man lunges forward defensively, holding a sharp blade in his dominant hand, his other arm raised to shield the woman. The young woman is partially behind him, looking scared but hopeful, her body tense."

3. **Environment**: "a dark, damp, gothic-style cave interior with detailed stalactites and stalagmites, subtle mist, and intricate, realistic spiderwebs."

4. **Primary Character Details**: "a tall young man (use previous character reference images) with messy dark black hair and piercing bright blue eyes, wearing a tattered, dark grey, loose-fitting cotton t-shirt with realistic wrinkles and folds, and dark combat pants. He holds a short, razor-sharp combat knife with a defined handle and gleaming blade. His body is muscular and toned, with anatomically perfect hands, fingers, and joints. His expression is fierce and determined."

5. **Secondary Character Details**: "a young woman (use previous character reference images) with long, flowing bubblegum pink hair and large, expressive light blue eyes. She wears a form-fitting black sports bra made of smooth, slightly reflective fabric, and dark shorts. Her body is slender and proportioned, with naturally defined shoulders and arms. Her expression is a mix of fear and trust in the boy's protection."

6. **Background Character**: "a man with short dark hair and a stern expression, wearing a simple black black jacket, positioned further back in the cave, observing the scene, with clear facial features proportionate to his distance."

7. **Camera/Composition**: "dynamic medium shot, slightly low-angle, focusing on the boy's protective stance and the girl partially behind him."

8. **Lighting Details**: "dramatic cinematic lighting with a single, strong glowing magical light source emanating from the boy's blade, casting sharp highlights and deep, realistic shadows. Subtle rim lighting on the characters, highlighting their silhouettes against the dark cave. Hints of ambient light from distant glowing crystals in the cave ceiling."

9. **Mood**: "intense, suspenseful, protective, and determined."

10. **Special Effects**: "realistic blood spatter on the blade and a tiny bit on the boy's shirt, appearing as natural liquid."

11. **Final Context**: "The environment is dark and filled with a sense of danger from an unseen monster (do not generate the monster in the image, imply its presence through character reaction and context)."

---

## GENERATE PROMPT

Using the panel, scene, and character data provided, create a detailed prompt following the successful structure pattern. Focus on:
- **ALWAYS begin with quality + anime/manga style declaration**
- **Add "(use previous character reference images)" for each character**
- Specific visual details over abstract concepts
- Anatomical perfection mentions
- Realistic material descriptions  
- Clear spatial relationships between characters
- Dramatic lighting setups
- Atmospheric environmental details

Generate the complete prompt now:`,
});

export const enhancePanelPrompt = ai.definePrompt({
  name: "enhancePanelPrompt",
  input: { schema: z.object({ input: z.string() }) },
  output: { schema: z.string().describe("the enhanced Prompt") },
  prompt: `enhance this prompt for the ai image generation that has a poor quality for non well structured prompt  or wide shot it show poor details specially face or things also notes i will give the ai image model the prompt and a reference image for each characters(it is portrait image, only head is appear) don,t try to change the look  {{input}}`,
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
- {{character.age}} year old {{character.gender}} with {{character.personality}} demeanor, {{character.role}} character

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
