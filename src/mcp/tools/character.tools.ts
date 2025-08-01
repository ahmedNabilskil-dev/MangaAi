import { characterSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createCharacterHandler } from "./handlers/creation-tools";
import { deleteCharacterHandler } from "./handlers/delete-tools";
import {
  getCharacterHandler,
  listCharactersForProjectHandler,
} from "./handlers/fetch-tools";
import { updateCharacterHandler } from "./handlers/update-tools";

export const characterTools: RegisteredTool[] = [
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
    handler: createCharacterHandler,
  },
  {
    name: "updateCharacter",
    description:
      "Updates an existing character's appearance, personality, abilities, or backstory.",
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
    handler: updateCharacterHandler,
  },
  {
    name: "deleteCharacter",
    description:
      "Deletes a character and removes all their references from scenes and panels.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        characterId: z
          .string()
          .describe("ID of the character to remove - verify name and role"),
      })
    ),
    handler: deleteCharacterHandler,
  },
  {
    name: "getCharacter",
    description: "Retrieves complete details of a character by ID.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        characterId: z.string().describe("ID of the character to retrieve"),
      })
    ),
    handler: getCharacterHandler,
  },
  {
    name: "listCharacters",
    description: "Lists all characters in a project.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        projectId: z
          .string()
          .describe("ID of the project to list characters from"),
      })
    ),
    handler: listCharactersForProjectHandler,
  },
];
