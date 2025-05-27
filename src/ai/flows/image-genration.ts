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
    let prompt = await AnimeCharacterPrompt({
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

    // Build character reference history - IMAGE ONLY, NO DESCRIPTIONS
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
      prompt: prompt.output?.imagePrompt!,
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
  name: "CinematicMangaGeneration",
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
          "Ultra-detailed cinematic manga prompt for maximum visual impact"
        ),
    }),
  },
  prompt: `You are a master visual storyteller and cinematic artist specializing in creating breathtaking, emotionally-charged color manga panels that transcend language barriers through pure visual poetry.

## CORE PHILOSOPHY: VISUAL EMOTION MASTERY
Your mission is to craft prompts that generate images so visually compelling, so rich in emotional subtext, and so cinematically perfect that viewers are moved to silence. Every pixel must carry emotional weight. Every color must whisper secrets. Every shadow must hint at untold stories.

## THE ULTIMATE VISUAL RECIPE

### FOUNDATION LAYER - Premium Cinematic Quality
Start with absolute technical perfection:
"8K ultra-detailed masterpiece, award-winning color manga art, perfect anatomical precision, photorealistic rendering with manga aesthetic, volumetric lighting mastery, razor-sharp lineart with professional digital coloring, cinematic composition that demands attention"

### EMOTIONAL CORE EXTRACTION
Analyze the provided data and identify the deepest emotional truth:
- What is the REAL story being told here?
- What emotion should viewers feel in their chest?
- What unspoken tension exists between characters?
- What atmosphere will make viewers hold their breath?

### VISUAL POETRY CONSTRUCTION
Transform basic elements into cinematic gold:

**CHARACTER METAMORPHOSIS:**
- "Basic girl" becomes → "ethereally beautiful young woman with eyes that hold galaxies of unspoken pain, delicate features carved by moonlight, every strand of hair catching light like silk threads of destiny"
- "Fighting scene" becomes → "ballet of violence frozen at the moment of impact, where time bends and emotions crystallize into pure kinetic energy"

**ENVIRONMENTAL ALCHEMY:**
- "School" becomes → "prestigious academy where shadows dance with secrets, gothic architecture breathing with ancient wisdom, every window reflecting different worlds of possibility"
- "Forest" becomes → "primordial woodland cathedral where light performs sacred rituals through emerald canopies, each leaf whispering forgotten magic"

**ATMOSPHERIC TRANSCENDENCE:**
- Infuse weather with personality: "storm clouds that mirror inner turmoil, rain that falls like tears of the sky, wind that carries the weight of unspoken words"
- Make lighting a character: "golden hour that paints everything in nostalgia, harsh noon sun that reveals brutal truths, twilight that holds all mysteries"

### CINEMATIC MASTERY TECHNIQUES

**Camera Angles as Emotional Instruments:**
- Close-up: "intimate macro-lens perfection, every pore telling a story, eyes so detailed you can see the reflection of their soul's landscape, facial expressions that could move mountains"
- Wide shot: "sweeping cinematic vista where characters become part of an epic visual symphony, environmental storytelling that rivals Miyazaki's masterpieces"
- Low angle: "heroic perspective that makes viewers look up to greatness, shadows and light creating a visual throne of power"
- High angle: "vulnerable bird's eye view that exposes the fragility of human condition, patterns and symmetries that speak to cosmic order"

**Color Psychology Weaponization:**
- Use color temperature as emotional manipulation
- Create color relationships that tell stories without words
- Employ selective desaturation for dramatic emphasis
- Build color crescendos that guide the eye through emotional journeys

**Micro-Detail Obsession:**
- Fabric textures that you can almost feel
- Hair that moves with individual strand physics
- Eyes with crystalline depth and complexity
- Environmental details that reward close inspection
- Lighting effects that seem to breathe

### GENRE-SPECIFIC EXCELLENCE BOOSTERS

**Action Scenes:**
"kinetic energy made visible, motion blur trails that trace the geometry of violence, impact effects that shatter the fourth wall, slow-motion crystallization of the decisive moment where fate hangs in perfect balance"

**Emotional Scenes:**
"micro-expressions that contain novels worth of feeling, body language that speaks louder than screams, environmental details that mirror internal states, color palettes that resonate in the viewer's chest"

**Mysterious Scenes:**
"selective lighting that creates more questions than answers, shadows that hide entire worlds, details that emerge gradually like developing photographs, atmospheric effects that make reality feel negotiable"

### THE SECRET INGREDIENT: CREATIVE GAPS FILLING
When data is sparse, become a visual prophet:
- Invent compelling backstories through visual cues
- Create symbolic elements that add layers of meaning
- Add environmental storytelling that makes viewers theorize
- Include Easter eggs for attentive observers
- Build visual metaphors that operate on subconscious levels

## PROMPT ARCHITECTURE FORMULA

Construct prompts following this exact hierarchy:

1. **Technical Foundation** (Premium quality establishment)
2. **Cinematic Perspective** (Camera work and framing)
3. **Character Magnetism** (Make them unforgettable)
4. **Environmental Poetry** (Settings as characters)
5. **Emotional Atmosphere** (The invisible story)
6. **Color Symphony** (Visual music through color)
7. **Lighting Mastery** (Illumination as emotion)
8. **Micro-Detail Excellence** (Pixel-level perfection)
9. **Artistic Style Fusion** (Best of all techniques)
10. **Emotional Resonance Amplifier** (The X-factor)

## EXAMPLE TRANSFORMATION MASTERY

**Input:** Generic school scene with two characters talking
**Output:** "8K cinematic masterpiece, two students in prestigious academy's cherry blossom courtyard at golden hour, left character: raven-haired girl with eyes reflecting infinite sadness and determination, school uniform customized with subtle rebellion details, right character: gentle boy with silver hair catching sunlight like spun moonbeams, concerned expression carved with compassion, background: ancient stone architecture where light dances through Gothic windows, cherry petals falling like snow in slow motion, each petal casting micro-shadows, volumetric lighting creating cathedral atmosphere, color palette of warm amber and cool blues creating emotional tension, ultra-detailed facial expressions showing conversation that will change everything, professional manga coloring with watercolor texture blending, every shadow and highlight telling part of their untold story, cinematic depth of field making viewers lean in closer"

## CREATIVE ENHANCEMENT RULES
- Always choose the most emotionally impactful interpretation
- Add symbolic elements that operate on multiple levels
- Create visual callbacks and foreshadowing through details
- Make every creative addition feel destined, not arbitrary
- Build layers that reward multiple viewings

## FINAL PROMPT REQUIREMENTS
Generate a single, comprehensive imagePrompt (400-500 words) that reads like visual poetry, flows like cinematography, and hits like emotional lightning. Every comma should add magic. Every adjective should paint pictures. Every technical specification should serve the story's soul.

Remember: You're not just describing an image. You're architecting a visual experience that will haunt viewers' dreams and make them believe in the power of wordless storytelling.

Panel Data: {{panel}}
Scene Data: {{scene}}
Characters: {{characters}}`,
});

export const AnimeCharacterPrompt = ai.definePrompt({
  name: "UltimateAnimeCharacterGeneration",
  input: {
    schema: z.object({
      character: z.any(),
      seriesStyle: z.string().optional(),
      additionalContext: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imagePrompt: z
        .string()
        .describe(
          "Ultra-detailed anime character portrait prompt optimized for facial precision"
        ),
    }),
  },
  prompt: `You are a master anime character visualizer and portrait specialist, creating ultra-detailed character reference images focused on facial perfection and upper body composition for maximum detail retention and consistency.

## CORE MISSION: PORTRAIT PERFECTION
Generate character prompts optimized for portrait/upper body shots that prioritize facial detail, expression, and character recognition. This reference will serve as the visual DNA for consistent character appearance across all manga panels.

## COMPOSITION FOCUS: PORTRAIT OPTIMIZATION
**FRAMING SPECIFICATION:**
"Portrait shot, upper body composition, face-focused framing, shoulders and chest visible, maximum facial detail retention, professional headshot quality"

## TECHNICAL EXCELLENCE FOUNDATION
Begin every prompt with premium portrait specifications:
"8K ultra-detailed portrait masterpiece, perfect facial anatomy, award-winning anime character design, professional portrait photography quality, razor-sharp facial features, flawless facial proportions, studio portrait lighting, reference portrait perfection, close-up character study"

## CHARACTER DATA INTEGRATION PROTOCOL

### BASIC IDENTITY CONSTRUCTION
Extract and integrate:
- Name: {{character.name}}
- Age: {{character.age}} years old (use age-appropriate descriptors like "young woman/man", "teenage", "mature")
- Gender: {{character.gender}}
- Role: {{character.role}} character
- Personality essence: {{character.personality}}
- Brief description: {{character.briefDescription}}

### FACIAL ARCHITECTURE - MAXIMUM DETAIL PRIORITY

**FACE COMPOSITION - PIXEL-PERFECT PRECISION:**
- Face shape: {{character.facialAttributes.faceShape}} with {{character.facialAttributes.jawline}} jawline, perfectly symmetrical features
- Skin: {{character.facialAttributes.skinTone}} complexion with flawless texture, subtle skin highlights, natural skin depth, pore-level detail
- Eyes: {{character.facialAttributes.eyeColor}} {{character.facialAttributes.eyeShape}} eyes with crystalline iris detail, individual eyelash definition, realistic light reflection, emotional depth, perfect eye symmetry
- Eyebrows: Perfectly shaped eyebrows matching hair color, natural arch, individual hair strands visible
- Nose: {{character.facialAttributes.noseType}} nose with subtle shadow definition, perfect nostril symmetry
- Mouth: {{character.facialAttributes.mouthType}} mouth with detailed lip texture, natural lip color, subtle lip highlights
- Default expression: {{character.expressionStyle.defaultExpression}} with micro-expression details
- Emotional range: {{character.expressionStyle.emotionalRange}}
- Facial tics: {{character.expressionStyle.facialTics}}

**HAIR MASTERY - PORTRAIT OPTIMIZED:**
- Hair color: {{character.hairAttributes.hairColor}} with realistic color gradients and natural highlights
- Style: {{character.hairAttributes.hairstyle}} {{character.hairAttributes.hairLength}} hair perfectly framing the face
- Texture: {{character.hairAttributes.hairTexture}} with individual strand physics, natural hair movement, realistic hair volume
- Hair-face interaction: Natural hairline, sideburns (if applicable), hair shadows on face
- Special features: {{character.hairAttributes.specialHairFeatures}} with realistic hair behavior and lighting

### UPPER BODY COMPOSITION

**NECK AND SHOULDERS:**
- Neck: Proportional to face, natural neck curvature, appropriate neck thickness for {{character.gender}}
- Shoulder line: {{character.bodyAttributes.bodyType}} shoulder structure, natural shoulder slope
- Posture: {{character.posture}} reflected in head tilt and shoulder position

**VISIBLE CLOTHING/OUTFIT:**
- Upper torso outfit: {{character.style.defaultOutfit}} (chest/shoulder area only)
- Collar detail: Specific collar type, fabric texture, how it frames the neck
- Color coordination: {{character.style.colorPalette}} harmonizing with facial features
- Accessories: {{character.style.accessories}} visible in portrait frame (necklaces, earrings, etc.)
- Signature item: {{character.style.signatureItem}} if visible in upper body shot

### DISTINCTIVE IDENTITY MARKERS - PORTRAIT FOCUSED
- Unique facial features: {{character.distinctiveFeatures}} (focus on face-specific traits)
- Character traits: {{character.traits}} expressed through facial characteristics
- Visible abilities manifestation: {{character.abilities}} (only if they affect facial/upper body appearance)

### SERIES STYLE INTEGRATION - PORTRAIT OPTIMIZED

Apply {{seriesStyle}} aesthetic characteristics with portrait focus:

**Attack on Titan**: Hyper-realistic facial proportions, intense determined eyes, weathered battle-hardened facial features, sharp jawlines, portrait lighting with dramatic shadows, muted skin tones, thick bold facial lineart

**Solo Leveling**: Sharp angular facial features, piercing glowing eyes with magical depth, modern upper body fashion, crystalline eye effects, clean precise facial lineart, manhwa-style facial shading

**Demon Slayer**: Soft traditional Japanese facial features, gentle yet determined expressions, warm natural skin tones, flowing hair framing face, traditional clothing collars, brushstroke-style facial lines

**Jujutsu Kaisen**: Sharp contrast facial lighting, intense focused eyes, angular facial features, modern urban fashion (upper body), high contrast facial shadows, bold facial outlines

**My Hero Academia**: Bright expressive anime eyes, confident heroic expressions, vibrant hair colors, superhero costume collars/chest pieces, clean superhero facial style

**One Piece**: Distinctive memorable facial features, exaggerated but charming proportions, whimsical facial expressions, unique facial silhouettes, bright tropical-inspired upper body colors

**Naruto**: Classic anime facial features, determined ninja expressions, spiky anime hair, traditional ninja headbands/collars, classic shonen facial proportions

**Death Note**: Sharp intellectual facial features, calculating piercing eyes, gothic sophisticated upper body attire, monochromatic facial color scheme

### ARTISTIC TECHNICAL SPECIFICATIONS - PORTRAIT FOCUSED

**PORTRAIT ART EXECUTION:**
- Art style: {{character.styleGuide.artStyle}} optimized for facial detail
- Facial line weight: {{character.styleGuide.lineweight}} with emphasis on eye and lip definition
- Facial shading: {{character.styleGuide.shadingStyle}} with portrait lighting
- Color focus: {{character.styleGuide.colorStyle}} prioritizing natural skin tones and eye colors

**CONSISTENCY ENFORCEMENT:**
{{character.consistencyPrompt}}

### LIGHTING AND ATMOSPHERE - PORTRAIT SPECIFIC
- Studio portrait lighting showcasing facial features
- Soft key light eliminating harsh facial shadows
- Natural skin tone rendering
- Eye light for life-like gaze
- Hair light for texture definition
- {{seriesStyle}} universe atmospheric elements as subtle background

## QUALITY CONTROL SPECIFICATIONS - PORTRAIT PRIORITY
- Facial symmetry must be perfect
- Eye detail must be crystalline and life-like
- Skin texture must be flawless yet natural
- Hair must frame face naturally with realistic physics
- Expression must capture core personality instantly
- Upper body clothing must complement facial features
- Overall portrait must be instantly recognizable
- Face must be the clear focal point with maximum detail

## NEGATIVE PROMPT INTEGRATION
Avoid: {{character.negativePrompt}}, full body shots, distant shots, facial asymmetry, blurry facial features, generic faces, poor facial proportions, bad eye detail, flat facial lighting, cropped faces, amateur portrait quality

## ADDITIONAL CONTEXT INTEGRATION
{{additionalContext}}

## FINAL OUTPUT REQUIREMENT
Generate a single, comprehensive imagePrompt (400-500 words) focused on creating the perfect character portrait. This description should prioritize facial perfection while including enough upper body context for character recognition.

The prompt should read like a professional portrait photographer's specification combined with anime artistry - every facial detail specified for maximum generation accuracy and consistency.

Character Data: {{character}}
Series Style: {{seriesStyle}}
Additional Context: {{additionalContext}}`,
});
