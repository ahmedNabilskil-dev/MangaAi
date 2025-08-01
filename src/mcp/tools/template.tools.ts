import { locationTemplateSchema, outfitTemplateSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import {
  createLocationTemplateHandler,
  createOutfitTemplateHandler,
} from "./handlers/creation-tools";
import {
  deleteLocationTemplateHandler,
  deleteOutfitTemplateHandler,
} from "./handlers/delete-tools";
import {
  getLocationTemplateHandler,
  getOutfitTemplateHandler,
  listLocationTemplatesHandler,
  listOutfitTemplatesHandler,
} from "./handlers/fetch-tools";
import {
  updateLocationTemplateHandler,
  updateOutfitTemplateHandler,
} from "./handlers/update-tools";

export const TemplateTools: RegisteredTool[] = [
  // Outfit Template Tools
  {
    name: "createOutfitTemplate",
    description: `Creates comprehensive outfit template systems for manga characters ensuring maximum visual consistency, narrative coherence, and production efficiency.
    
    ## MANDATORY OUTFIT TEMPLATE REQUIREMENTS
    
    ### CORE REQUIRED FIELDS (ALL MUST BE POPULATED):
    - name: Descriptive outfit name (e.g., "Winter School Uniform", "Casual Weekend Outfit")
    - characterId: Character reference ID (MANDATORY for character association)
    - description: Concise visual summary (30-50 words describing overall appearance)
    - aiPrompt: Comprehensive AI generation prompt with detailed specifications
    - isDefault: Boolean marking character's primary/most recognizable outfit
    - tags: Searchable descriptors array (minimum 5 tags for categorization)
    - category: Outfit classification (school/casual/formal/sports/sleepwear/work/special/fantasy/historical)
    - season: Seasonal appropriateness (spring/summer/fall/winter/any)
    - materialTags: Fabric specifications array (cotton, wool, silk, denim, etc.)
    - colorPalette: 3-5 primary colors defining outfit identity with hex codes
    - layers: Clothing components array detailing construction from base to accessories
    
    ### REVOLUTIONARY OUTFIT DESIGN SYSTEM
    
    **OUTFIT CATEGORY STRATEGY (CRITICAL)**:
    Each character requires strategic outfit distribution across categories:
    - TIER 1 ESSENTIAL: Default outfit (isDefault: true) + Context-primary (school/work uniform)
    - TIER 2 NARRATIVE: Casual personal style + Formal/special event wear
    - TIER 3 SITUATIONAL: Sports/activity + Seasonal variants + Character development outfits
    
    **OUTFIT DESIGN PRINCIPLES (MANDATORY)**:
    - Visual Coherence: All outfits must feel unified to same character
    - Personality Reflection: Clothing choices express character traits authentically
    - Practical Logic: Outfits appropriate for intended activities and locations
    - Cultural Authenticity: Respect cultural contexts and social norms
    - Narrative Utility: Outfits support storytelling needs and character arcs
    - Seasonal Logic: Weather-appropriate clothing choices and materials
    - Color Harmony: Consistent color preferences across outfit variations
    - Status Consistency: Clothing quality matches character's social/economic position
    
    ### COMPREHENSIVE AI PROMPT CONSTRUCTION SYSTEM
    
    **REQUIRED AI PROMPT STRUCTURE**:
    "[CHARACTER_IDENTIFIER] wearing [DETAILED_GARMENT_SPECIFICATIONS] including [SPECIFIC_CLOTHING_ITEMS with colors, materials, fit details], [ACCESSORY_PLACEMENT and descriptions], [FABRIC_TEXTURES and patterns], [SEASONAL_APPROPRIATENESS], [CULTURAL_ELEMENTS], [PERSONALITY_INDICATORS through style choices], [PRACTICAL_CONSIDERATIONS for activities], rendered in [CONSISTENT_ANIME_STYLE], [LIGHTING_CONSIDERATIONS], [POSE_COMPATIBILITY notes], [QUALITY_LEVEL indicators]"
    
    **AI PROMPT ENHANCEMENT LAYERS (ALL REQUIRED)**:
    1. Foundation Layer: Basic garment identification and fit specifications
    2. Material Layer: Fabric types, textures, quality indicators, and wear patterns
    3. Color Layer: Specific color names, combinations, and harmony relationships
    4. Detail Layer: Accessories, embellishments, unique features, and styling elements
    5. Context Layer: Appropriateness for activities, locations, and social situations
    6. Style Layer: Artistic rendering specifications and manga consistency requirements
    7. Character Layer: Personality expression through clothing choices and styling
    
    ### CATEGORY SPECIFICATIONS
    
    **Category Logic Matrix**:
    - school: Academic uniforms, school-appropriate casual wear, study outfits
    - casual: Personal expression, comfort wear, everyday clothing, weekend attire
    - formal: Social expectations, ceremonies, professional presentations, special events
    - sports: Physical activity gear, athletic performance wear, training equipment
    - sleepwear: Rest clothing, privacy wear, comfort attire, home relaxation
    - work: Professional requirements, job-specific uniforms, workplace attire
    - special: Unique story moments, character development, thematic outfits
    - fantasy: Genre-specific magical or fantastical clothing elements
    - historical: Period-appropriate or culturally specific traditional wear
    
    **Seasonal Logic Requirements**:
    - spring: Light layers, pastel colors, fresh fabrics, transitional pieces
    - summer: Minimal coverage, breathable materials, bright colors, sun protection
    - fall: Layered clothing, earth tones, transitional pieces, weather protection
    - winter: Heavy outerwear, warm materials, muted colors, insulation layers
    - any: Season-neutral pieces, adaptable clothing, versatile garments
    
    ### ADVANCED SPECIFICATIONS
    
    **Material Tags System (REQUIRED)**:
    Specify realistic fabric choices with narrative implications:
    - Natural Fabrics: cotton, wool, silk, linen, leather, cashmere
    - Synthetic Fabrics: polyester, nylon, acrylic, spandex, rayon
    - Specialty Materials: denim, corduroy, velvet, lace, mesh, fleece
    - Quality Indicators: high-quality, standard, worn, vintage, luxury
    - Texture Descriptors: smooth, rough, soft, crisp, flowing, structured
    
    **Color Palette Construction (MANDATORY)**:
    Create harmonious color combinations with specific elements:
    - Primary Color: Dominant color defining outfit identity
    - Secondary Color: Supporting color for visual balance
    - Accent Colors: 1-2 colors for details and accessories
    - Neutral Colors: Foundation colors for layering and coordination
    - Contrast Colors: Strategic pops for visual interest and emphasis
    
    **Layering System Architecture (DETAILED REQUIRED)**:
    Define clothing components for precise construction:
    - Base Layer: Undergarments, foundation pieces, skin contact items
    - Primary Layer: Main garments (shirts, pants, dresses, skirts)
    - Secondary Layer: Outerwear, jackets, cardigans, vests
    - Accessory Layer: Belts, scarves, jewelry, bags, hair accessories
    - Footwear Layer: Shoes, socks, specialized footwear, seasonal boots
    
    ### PRODUCTION STANDARDS
    
    **Visual Consistency Requirements**:
    - All outfits must maintain character recognition across variations
    - Color harmonies must work within established project palette
    - Art style specifications must be identical across all templates
    - Quality levels must be consistent with character's established status
    - Proportions and fit must align with character's body type
    
    **Narrative Integration Standards**:
    - Outfit designs must support character development and growth
    - Clothing choices must enhance storytelling without distraction
    - Cultural and contextual elements must enrich world-building
    - Outfit variations must enable character growth representation
    - Template system must support long-form manga production needs
    
    **Technical Excellence Requirements**:
    - Templates must enable consistent character reproduction across scenes
    - Design specifications must be clear for AI generation systems
    - Color codes must be specific and reproducible
    - Fabric specifications must be realistic and visually accurate
    - Construction details must be logical and anatomically correct
    
    ### CRITICAL SUCCESS CRITERIA
    
    **MANDATORY COMPLETION VERIFICATION (NO EXCEPTIONS)**:
    Every outfit template must have ALL fields populated:
    ✓ name: Descriptive name assigned
    ✓ characterId: Character reference confirmed  
    ✓ description: Visual summary completed (30-50 words)
    ✓ aiPrompt: Comprehensive generation prompt written
    ✓ isDefault: Primary outfit status determined
    ✓ tags: Minimum 5 searchable tags assigned
    ✓ category: Appropriate category selected
    ✓ season: Seasonal appropriateness specified
    ✓ materialTags: Fabric specifications documented
    ✓ colorPalette: Color harmony established (3-5 colors)
    ✓ layers: Clothing components detailed
    
    **Template Validation Checklist**:
    ✓ Character Compatibility: All outfits suit character personality and role
    ✓ Category Coverage: Appropriate outfit categories represented for character needs
    ✓ Seasonal Logic: Weather-appropriate clothing choices and materials
    ✓ Cultural Authenticity: Culturally appropriate designs and elements
    ✓ Narrative Utility: Outfits support storytelling needs and character arcs
    ✓ Visual Distinctiveness: Each outfit offers unique visual identity
    ✓ Production Readiness: All templates ready for scene generation and consistency
    
    Creates comprehensive outfit template systems enabling consistent, high-quality manga character presentation while supporting rich storytelling and visual development. Every outfit template must be complete, logically consistent, and ready for production use.`,
    inputSchema: zodSchemaToMcpSchema(
      outfitTemplateSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        variations: true,
        imageUrl: true,
        isActive: true,
        mangaProjectId: true,
      })
    ),
    handler: createOutfitTemplateHandler,
  },

  {
    name: "getOutfitTemplate",
    description: `Retrieves complete outfit template specifications with all components, variations, and usage data.
    
    This detailed inspection tool provides:
    
    Comprehensive View:
    - Full component hierarchy and relationships
    - Color scheme specifications
    - Material definitions
    - Variation configurations
    - Project usage statistics
    
    Advanced Information:
    - Character assignment tracking
    - Scene appearance frequency
    - Style compatibility analysis
    - Variation comparison tools
    - Update history tracking
    
    Usage Insights:
    - Most common variations used
    - Weather condition preferences
    - Seasonal usage patterns
    - Activity type correlations
    - Character-specific adaptations`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        outfitTemplateId: z
          .string()
          .describe(
            "ID of the outfit template to retrieve - use listOutfitTemplates to locate"
          ),
      })
    ),
    handler: getOutfitTemplateHandler,
  },

  {
    name: "updateOutfitTemplate",
    description:
      "Updates an existing outfit template's components, colors, materials, or variations.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        outfitTemplateId: z
          .string()
          .describe("ID of the outfit template to modify"),
        updates: outfitTemplateSchema
          .omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            mangaProjectId: true,
          })
          .partial()
          .describe(
            "Partial outfit configuration containing only fields requiring adjustment"
          ),
      })
    ),
    handler: updateOutfitTemplateHandler,
  },

  {
    name: "deleteOutfitTemplate",
    description:
      "Deletes an outfit template and removes it from all character assignments.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        outfitTemplateId: z
          .string()
          .describe("ID of the outfit template to remove - verify carefully"),
      })
    ),
    handler: deleteOutfitTemplateHandler,
  },

  {
    name: "listOutfitTemplates",
    description: `Retrieves a filtered, paginated list of outfit templates with comprehensive metadata.
    
    This powerful listing tool offers:
    
    Advanced Filtering:
    - By project, category, and gender
    - Seasonal and style filters
    - Material and color scheme filters
    - Variation count thresholds
    - Usage frequency ranges
    
    Rich Metadata:
    - Preview thumbnails
    - Component counts
    - Variation statistics
    - Character assignment data
    - Recent usage information
    
    Output Features:
    - Custom sorting options
    - Pagination control
    - Summary statistics
    - Bulk export options
    - Template relationship mapping`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        mangaProjectId: z
          .string()
          .optional()
          .describe("ID of the manga project to filter by"),
        category: z
          .string()
          .optional()
          .describe(
            "Filter by specific outfit category (casual, formal, fantasy, etc.)"
          ),
        gender: z
          .string()
          .optional()
          .describe("Filter by intended gender (male, female, unisex)"),
        limit: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "Maximum number of templates to return (default 20, max 100)"
          ),
        offset: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe("Pagination offset for large result sets"),
      })
    ),
    handler: listOutfitTemplatesHandler,
  },

  // Location Template Tools
  {
    name: "createLocationTemplate",
    description: `Creates comprehensive location template systems providing maximum visual consistency, narrative support, and production efficiency for manga environmental design.
    
    ## MANDATORY LOCATION TEMPLATE REQUIREMENTS
    
    ### CORE REQUIRED FIELDS (ALL MUST BE POPULATED):
    - name: Descriptive location name (e.g., "Main Classroom", "School Rooftop", "Corner Cafe")
    - basePrompt: Foundational environmental description (100-150 words describing permanent elements)
    - type: Location classification (interior/exterior for lighting and atmospheric considerations)
    - cameraAngles: Array of camera angle objects (minimum 3, maximum 6 perspectives)
    
    ### CAMERA ANGLE OBJECT STRUCTURE (MANDATORY FOR EACH):
    Each cameraAngle must include complete specifications:
    - id: Unique angle identifier (e.g., "corner_view", "entrance_perspective")
    - name: Descriptive angle name explaining viewpoint
    - aiPrompt: Complete comprehensive prompt for rendering this specific angle
    - referenceImage: Optional reference image object for visual consistency
    
    ## REVOLUTIONARY LOCATION DESIGN SYSTEM
    
    ### LOCATION HIERARCHY STRATEGY (CRITICAL PLANNING):
    Create locations based on narrative importance and usage frequency:
    
    **TIER 1 PRIMARY LOCATIONS (5-6 camera angles)**:
    - Story-Critical: Main narrative locations where major plot events occur
    - Character-Defining: Locations that define character identity and personality
    - Emotional Centers: Locations reserved for key emotional moments and development
    
    **TIER 2 RECURRING LOCATIONS (3-4 camera angles)**:
    - Functional Spaces: Regular story locations for ongoing narrative needs
    - Social Hubs: Character interaction spaces for relationship development
    - Transition Zones: Movement and travel locations connecting story areas
    
    **TIER 3 SUPPORTING LOCATIONS (2-3 camera angles)**:
    - Background Settings: Atmospheric locations for mood and world-building
    - Specific Function: Single-purpose story locations for particular scenes
    - World-Building: Locations that enrich story universe without direct plot function
    
    ### LOCATION TEMPLATE DESIGN PRINCIPLES (MANDATORY ADHERENCE):
    - Visual Consistency: All camera angles maintain clear location identity
    - Narrative Support: Locations enhance storytelling potential and character interaction
    - Atmospheric Flexibility: Locations adapt to different moods, times, and weather
    - Character Integration: Natural interaction points and positioning opportunities
    - Cultural Authenticity: Appropriate cultural and contextual design elements
    - Technical Excellence: Optimized for manga panel composition and visual flow
    - Production Efficiency: Reusable across multiple scenes, chapters, and story arcs
    
    ### COMPREHENSIVE BASE PROMPT CONSTRUCTION SYSTEM
    
    **REQUIRED BASE PROMPT STRUCTURE**:
    "[ARCHITECTURAL_FOUNDATION describing permanent structural elements and layout] featuring [SPATIAL_LAYOUT with dimensions, flow, and movement patterns] including [DISTINCTIVE_FEATURES and visual landmark elements] with [LIGHTING_CHARACTERISTICS from natural and artificial sources] incorporating [ATMOSPHERIC_ELEMENTS and ambient mood factors] designed for [FUNCTIONAL_PURPOSE and narrative utility] rendered in [CONSISTENT_MANGA_STYLE] optimized for [CAMERA_ANGLE_FLEXIBILITY] supporting [CHARACTER_INTERACTION_POSSIBILITIES and positioning options]"
    
    **BASE PROMPT ENHANCEMENT LAYERS (ALL REQUIRED)**:
    1. Structural Layer: Permanent architectural elements, walls, floors, ceilings
    2. Spatial Layer: Layout, dimensions, movement flow, and accessibility
    3. Feature Layer: Distinctive elements, visual landmarks, and memorable details
    4. Lighting Layer: Natural light sources, artificial illumination, and shadow patterns
    5. Atmospheric Layer: Mood, ambiance, environmental factors, and sensory elements
    6. Functional Layer: Purpose, narrative utility, and character interaction potential
    7. Technical Layer: Manga-specific rendering considerations and panel optimization
    
    ## ADVANCED CAMERA ANGLE SYSTEM
    
    ### CAMERA ANGLE CATEGORIES (MANDATORY COVERAGE):
    Every location must include angles from these essential categories:
    
    **ESTABLISHING ANGLES (REQUIRED)**:
    - Wide Establishing: Full location context showing spatial relationships and scope
    - Medium Establishing: Balanced view showing key elements and character interaction space
    
    **INTERACTION ANGLES (REQUIRED)**:
    - Conversation: Optimal framing for character dialogue and interpersonal scenes
    - Activity Focus: Centered on main functional areas and character activities
    
    **DRAMATIC ANGLES (RECOMMENDED)**:
    - Emotional: Supports emotional moments and character development scenes
    - Dynamic: Unique perspective for action, tension, or dramatic storytelling
    
    **DETAIL ANGLES (OPTIONAL BUT VALUABLE)**:
    - Intimate: Close focus on specific location elements and atmospheric details
    - Atmospheric: Emphasizes mood and environmental storytelling elements
    
    ### CAMERA ANGLE AI PROMPT CONSTRUCTION (COMPREHENSIVE REQUIRED):
    Each camera angle's aiPrompt must include all elements:
    "[SPECIFIC_VIEWPOINT and precise camera position] capturing [LOCATION_ELEMENTS visible from this angle] with [DEPTH_AND_PERSPECTIVE specifications and focal relationships] featuring [LIGHTING_FROM_ANGLE specific to this viewpoint] emphasizing [COMPOSITIONAL_ELEMENTS optimized for manga panels] including [CHARACTER_POSITIONING_POSSIBILITIES and interaction zones] rendered in [CONSISTENT_ART_STYLE matching project specifications] optimized for [NARRATIVE_FUNCTION of this specific angle] with [ATMOSPHERIC_ENHANCEMENT specific to this perspective and mood]"
    
    ## LOCATION TYPE SPECIFICATIONS
    
    ### INTERIOR LOCATION REQUIREMENTS (COMPREHENSIVE):
    - Architectural Details: Walls, ceilings, flooring, structural elements, and construction materials
    - Lighting Systems: Windows, artificial lighting, light quality, and illumination patterns
    - Furniture and Fixtures: Functional and decorative elements, placement, and interaction possibilities
    - Spatial Flow: Movement patterns, accessibility, and character interaction zones
    - Atmospheric Control: Temperature, acoustics, privacy levels, and comfort factors
    - Cultural Elements: Culturally appropriate interior design, decoration, and symbolic elements
    
    ### EXTERIOR LOCATION REQUIREMENTS (COMPREHENSIVE):
    - Landscape Elements: Natural and constructed environmental features and terrain
    - Weather Integration: How different weather conditions affect location appearance
    - Lighting Variations: Sun angles, shadow patterns, artificial illumination at different times
    - Seasonal Changes: How seasons modify location characteristics and visual elements
    - Scale and Perspective: Relationship to surroundings, horizon lines, and depth indicators
    - Cultural Context: Appropriate architectural styles and environmental design elements
    
    ## ENVIRONMENTAL STORYTELLING INTEGRATION
    
    ### ATMOSPHERIC ENHANCEMENT SYSTEM (REQUIRED FLEXIBILITY):
    Locations must support various atmospheric conditions and narrative needs:
    - Time of Day Variations: Morning, afternoon, evening, night lighting and mood changes
    - Weather Adaptability: Clear, cloudy, rainy, stormy, snowy, foggy conditions
    - Seasonal Changes: Spring growth, summer heat, autumn colors, winter bareness
    - Mood Flexibility: Happy, tense, mysterious, romantic, melancholic atmospheres
    - Activity Adaptation: Busy, quiet, energetic, contemplative, social, private states
    
    ### NARRATIVE FUNCTION OPTIMIZATION (STORYTELLING SUPPORT):
    - Exposition Support: Locations that help reveal story information naturally
    - Character Development: Environments that reflect and enhance character growth
    - Conflict Enhancement: Locations that intensify dramatic tension and story conflict
    - Emotional Resonance: Environments that amplify emotional moments and reader connection
    - World Building: Locations that enrich story universe and cultural context
    
    ## PROFESSIONAL STANDARDS COMPLIANCE
    
    ### VISUAL CONSISTENCY REQUIREMENTS (NON-NEGOTIABLE):
    - All camera angles must maintain clear, recognizable location identity
    - Lighting must be consistent with location type, structure, and time parameters
    - Architectural elements must remain stable and logical across all angles
    - Art style must be uniform and consistent across all location templates
    - Proportions and scale must be maintained and mathematically accurate
    
    ### TECHNICAL EXCELLENCE STANDARDS (PRODUCTION READY):
    - Camera angles must provide clear composition opportunities for manga panels
    - Lighting must support various time-of-day and weather scenarios
    - Perspective must be accurate, readable, and appropriate for manga format
    - Detail levels must be consistent with professional manga production standards
    - Templates must be optimized for AI generation systems and consistency
    
    ### NARRATIVE INTEGRATION STANDARDS (STORY SUPPORT):
    - Locations must support multiple story functions and narrative purposes
    - Environments must enhance rather than distract from character and plot development
    - Cultural elements must be authentic, appropriate, and respectful
    - Functional elements must be logical, purposeful, and story-relevant
    - Atmospheric possibilities must be rich, varied, and narratively useful
    
    Creates comprehensive location template systems providing rich, consistent environmental foundations for manga storytelling while supporting character development and narrative progression. Every location template must be architecturally sound, narratively useful, and ready for production use.`,
    inputSchema: zodSchemaToMcpSchema(
      locationTemplateSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        variations: true,
        imageUrl: true,
        isActive: true,
        mangaProjectId: true,
      })
    ),
    handler: createLocationTemplateHandler,
  },

  {
    name: "getLocationTemplate",
    description: `Retrieves complete location template specifications with all variations and usage data.
    
    This detailed inspection tool provides:
    
    Comprehensive View:
    - Full environmental attributes
    - Lighting configurations
    - Prop and set dressing lists
    - Variation definitions
    - Project usage statistics
    
    Advanced Information:
    - Scene assignment tracking
    - Time-of-day usage patterns
    - Weather condition preferences
    - Mood application analysis
    - Update history tracking
    
    Usage Insights:
    - Most common variations used
    - Character interaction analysis
    - Camera angle preferences
    - Lighting condition trends
    - Scene type correlations`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        locationTemplateId: z
          .string()
          .describe(
            "ID of the location template to retrieve - use listLocationTemplates to locate"
          ),
      })
    ),
    handler: getLocationTemplateHandler,
  },

  {
    name: "updateLocationTemplate",
    description:
      "Updates an existing location template's description, props, lighting, or variations.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        locationTemplateId: z
          .string()
          .describe("ID of the location template to modify"),
        updates: locationTemplateSchema
          .omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            mangaProjectId: true,
          })
          .partial()
          .describe(
            "Partial location configuration containing only fields requiring adjustment"
          ),
      })
    ),
    handler: updateLocationTemplateHandler,
  },

  {
    name: "deleteLocationTemplate",
    description:
      "Deletes a location template and removes it from all scene assignments.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        locationTemplateId: z
          .string()
          .describe("ID of the location template to remove - verify carefully"),
      })
    ),
    handler: deleteLocationTemplateHandler,
  },

  {
    name: "listLocationTemplates",
    description: `Retrieves a filtered, paginated list of location templates with comprehensive metadata.
    
    This powerful listing tool offers:
    
    Advanced Filtering:
    - By project, category, and style
    - Time-of-day and weather filters
    - Mood and atmosphere filters
    - Variation count thresholds
    - Usage frequency ranges
    
    Rich Metadata:
    - Preview thumbnails
    - Prop counts
    - Variation statistics
    - Scene assignment data
    - Recent usage information
    
    Output Features:
    - Custom sorting options
    - Pagination control
    - Summary statistics
    - Bulk export options
    - Template relationship mapping`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        mangaProjectId: z
          .string()
          .optional()
          .describe("ID of the manga project to filter by"),
        category: z
          .string()
          .optional()
          .describe(
            "Filter by location category (indoor, outdoor, urban, etc.)"
          ),
        style: z
          .string()
          .optional()
          .describe("Filter by art style (anime, realistic, cartoon, etc.)"),
        limit: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "Maximum number of templates to return (default 20, max 100)"
          ),
        offset: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe("Pagination offset for large result sets"),
      })
    ),
    handler: listLocationTemplatesHandler,
  },
];
