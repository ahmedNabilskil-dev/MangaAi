import { MangaStatus } from "@/types/enums";

export interface OutfitTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "casual"
    | "formal"
    | "traditional"
    | "fantasy"
    | "modern"
    | "vintage"
    | "futuristic"
    | "seasonal"
    | "special";
  subCategory?: string;
  gender: "male" | "female" | "unisex";
  ageGroup: "child" | "teen" | "adult" | "elderly";
  season: "spring" | "summer" | "autumn" | "winter" | "all";
  style: "anime" | "realistic" | "cartoon" | "manga";

  // Enhanced component system
  components: OutfitComponent[];

  // Color schemes and materials
  colorSchemes: ColorScheme[];
  materials: string[];

  // Outfit variations for different situations
  variations?: OutfitVariation[];

  // Usage and context
  occasions: string[]; // e.g., ["school", "formal_event", "casual_day"]
  compatibility: {
    weather: ("sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy")[];
    timeOfDay: (
      | "dawn"
      | "morning"
      | "noon"
      | "afternoon"
      | "evening"
      | "night"
    )[];
    activities: string[]; // e.g., ["walking", "running", "sitting", "fighting"]
  };

  tags: string[];
  imagePrompt?: string;
  imageUrl?: string;
  isActive: boolean;
  mangaProjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OutfitComponent {
  type:
    | "top"
    | "bottom"
    | "shoes"
    | "accessories"
    | "outerwear"
    | "undergarments"
    | "headwear";
  item: string;
  isRequired: boolean; // Some components might be optional
  defaultColor?: string;
  defaultMaterial?: string;
  defaultPattern?: string;

  // Alternative options for this component
  alternatives?: {
    item: string;
    color?: string;
    material?: string;
    pattern?: string;
    condition?: string; // e.g., "if weather is rainy"
  }[];
}

export interface ColorScheme {
  name: string; // e.g., "Default", "Summer", "Formal"
  primary: string;
  secondary?: string;
  accent?: string;
  description?: string;
}

export interface OutfitVariation {
  id: string;
  name: string; // e.g., "Casual Version", "Damaged", "Winter Coat Added"
  description?: string;

  // Component modifications
  componentOverrides?: {
    componentType: string;
    newItem: string;
    newColor?: string;
    newMaterial?: string;
    newPattern?: string;
  }[];

  // Additional components for this variation
  additionalComponents?: OutfitComponent[];

  // When to use this variation
  conditions?: {
    weather?: string[];
    timeOfDay?: string[];
    mood?: string[];
    activity?: string[];
  };

  // Prompt modifications
  promptModifiers?: string[];
  imageUrl?: string;

  // Usage tracking
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "indoor"
    | "outdoor"
    | "urban"
    | "rural"
    | "fantasy"
    | "futuristic"
    | "historical"
    | "natural"
    | "architectural";
  subCategory?: string;

  // Backward compatibility: keep old single-value fields
  timeOfDay?:
    | "dawn"
    | "morning"
    | "noon"
    | "afternoon"
    | "evening"
    | "night"
    | "any";
  weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy" | "any";
  mood?:
    | "peaceful"
    | "mysterious"
    | "energetic"
    | "romantic"
    | "tense"
    | "cheerful"
    | "somber";
  lighting?: {
    type?: "natural" | "artificial" | "mixed";
    intensity?: "dim" | "moderate" | "bright";
    color?: string;
  };

  // New enhanced fields (optional for backward compatibility)
  defaultTimeOfDay?:
    | "dawn"
    | "morning"
    | "noon"
    | "afternoon"
    | "evening"
    | "night"
    | "any";
  defaultWeather?:
    | "sunny"
    | "cloudy"
    | "rainy"
    | "stormy"
    | "snowy"
    | "foggy"
    | "any";
  defaultMood?:
    | "peaceful"
    | "mysterious"
    | "energetic"
    | "romantic"
    | "tense"
    | "cheerful"
    | "somber";

  style: "anime" | "realistic" | "cartoon" | "manga";

  // Base lighting setup (new)
  baseLighting?: {
    type?: "natural" | "artificial" | "mixed";
    intensity?: "dim" | "moderate" | "bright";
    color?: string;
  };

  // Supported variations for this location (new)
  variations?: LocationVariation[];

  cameraAngles: (
    | "wide-shot"
    | "medium-shot"
    | "close-up"
    | "birds-eye"
    | "worms-eye"
    | "dutch-angle"
    | "over-shoulder"
  )[];
  props: string[];
  colors: string[];
  tags: string[];

  // Base prompt that can be enhanced by variations
  imagePrompt?: string;
  baseImagePrompt?: string;
  imageUrl?: string;
  isActive: boolean;
  mangaProjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LocationVariation {
  id: string;
  name: string; // e.g., "Morning Classroom", "Rainy Classroom", "Evening Classroom"

  // Override specific properties
  timeOfDay?:
    | "dawn"
    | "morning"
    | "noon"
    | "afternoon"
    | "evening"
    | "night"
    | "any";
  weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy" | "any";
  mood?:
    | "peaceful"
    | "mysterious"
    | "energetic"
    | "romantic"
    | "tense"
    | "cheerful"
    | "somber";

  // Variation-specific lighting
  lighting?: {
    type?: "natural" | "artificial" | "mixed";
    intensity?: "dim" | "moderate" | "bright";
    color?: string;
  };

  // Additional or modified props for this variation
  additionalProps?: string[];
  modifiedColors?: string[];

  // Specific image prompt modifications
  promptModifiers?: string[]; // e.g., ["golden hour lighting", "rain drops on windows"]
  imageUrl?: string;

  // Usage tracking
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MangaProject {
  id: string;
  title: string;
  description?: string;
  status: MangaStatus;
  initialPrompt?: string;
  genre?: string;
  artStyle?: string;
  coverImageUrl?: string;
  targetAudience?: "children" | "teen" | "young-adult" | "adult";
  worldDetails?: {
    summary: string;
    history: string;
    society: string;
    uniqueSystems: string;
  };
  concept?: string;
  // Locations now directly part of project
  plotStructure?: {
    incitingIncident: string;
    plotTwist: string;
    climax: string;
    resolution: string;
  };
  outfitTemplates?: OutfitTemplate[];
  locationTemplates?: LocationTemplate[];
  // Key events now directly part of project
  themes?: string[];
  motifs?: string[];
  symbols?: string[];
  tags?: string[];
  creatorId?: string;
  messages?: { role: string; parts: { text: string }[] }[];
  viewCount: number;
  likeCount: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
  characters?: Character[];
}

export interface Character {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  bodyAttributes?: {
    height: string;
    bodyType: string;
    proportions: string;
  };
  facialAttributes?: {
    faceShape: string;
    skinTone: string;
    eyeColor: string;
    eyeShape: string;
    noseType: string;
    mouthType: string;
    jawline: string;
  };
  hairAttributes?: {
    hairColor: string;
    hairstyle: string;
    hairLength: string;
    hairTexture: string;
    specialHairFeatures: string;
  };
  distinctiveFeatures?: string[];
  physicalMannerisms?: string[];
  posture?: string;
  styleGuide?: {
    artStyle: string;
    lineweight: string;
    shadingStyle: string;
    colorStyle: string;
  };
  defaultOutfitId?: string; // Their main outfit
  outfitHistory?: { sceneId: string; outfitId: string }[];
  consistencyPrompt?: string;
  negativePrompt?: string;
  role?: "protagonist" | "antagonist" | "supporting" | "minor";
  briefDescription?: string;
  personality?: string;
  abilities?: string;
  backstory?: string;
  imgUrl?: string;
  traits?: string[];
  arcs?: string[];
  isAiGenerated: boolean;
  mangaProjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  narrative: string;
  purpose?: string;
  tone?: string;
  keyCharacters?: string[];
  coverImageUrl?: string;
  mangaProjectId: string;
  isAiGenerated?: boolean;
  isPublished?: boolean;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  scenes?: Scene[];
}

export interface Scene {
  id: string;
  order: number;
  title: string;
  description: string;
  sceneContext: {
    // Required location reference with optional variation
    locationId: string;
    locationVariationId?: string; // Reference to specific variation

    // Character outfit assignments
    characterOutfits: {
      characterId: string;
      outfitId: string;
      outfitVariationId?: string; // Reference to specific variation
      reason?: string;
    }[];

    // Present characters in this scene
    presentCharacters: string[];

    // Additional scene-specific overrides (optional)
    environmentOverrides?: {
      timeOfDay?:
        | "dawn"
        | "morning"
        | "noon"
        | "afternoon"
        | "evening"
        | "night";
      weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
      mood?:
        | "peaceful"
        | "mysterious"
        | "energetic"
        | "romantic"
        | "tense"
        | "cheerful"
        | "somber";
      lighting?: {
        type?: "natural" | "artificial" | "mixed";
        intensity?: "dim" | "moderate" | "bright";
        color?: string;
      };
      additionalProps?: string[];
    };

    // Scene-specific notes or special instructions
    sceneNotes?: string;
  };
  chapterId: string;
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  panels?: Panel[];
}

export interface Panel {
  id: string;
  order: number;
  imageUrl?: string;
  panelContext: {
    // Location reference
    locationId: string;
    locationVariationId?: string;

    // Primary action/description for this panel
    action?: string;

    // Character poses and positions
    characterPoses: {
      characterId: string;
      characterName: string;
      outfitId: string;
      outfitVariationId?: string;
      pose: string;
      expression: string;
      position?: string;
    }[];

    // Panel-specific environment modifications
    environmentOverrides?: {
      lighting?: {
        type?: "natural" | "artificial" | "mixed";
        intensity?: "dim" | "moderate" | "bright";
        color?: string;
        direction?: string; // e.g., "from above", "backlit", "side lighting"
      };
      weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
      timeOfDay?:
        | "dawn"
        | "morning"
        | "noon"
        | "afternoon"
        | "evening"
        | "night";
      atmosphere?: string; // e.g., "tense", "peaceful", "chaotic"
    };

    // Camera and framing settings
    cameraSettings?: {
      angle?: "close-up" | "medium" | "wide" | "bird's eye" | "low angle";
      shotType?:
        | "action"
        | "reaction"
        | "establishing"
        | "detail"
        | "transition";
      focus?: string;
    };

    // Visual effects and special elements
    visualEffects?: string[];

    // Panel-specific notes
    panelNotes?: string;
  };
  sceneId: string;
  isAiGenerated: boolean;
  negativePrompt?: string;
  createdAt: Date;
  updatedAt: Date;
  dialogues?: PanelDialogue[];
  characters?: Character[];
}
export interface PanelDialogue {
  id: string;
  content: string;
  order: number;
  style?: {
    bubbleType?: "normal" | "thought" | "scream" | "whisper" | "narration";
  };
  emotion?: string;
  subtextNote?: string;
  panelId: string;
  speakerId?: string | null;
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  speaker?: Character | null;
  config?: any;
}
