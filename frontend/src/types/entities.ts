import { MangaStatus } from "@/types/enums";

export interface OutfitTemplate {
  _id: string;
  name: string;
  characterId: string;
  description: string;
  aiPrompt: string; // Complete AI generation prompt
  category: "casual" | "formal" | "school" | "special";
  season: "spring" | "summer" | "autumn" | "winter" | "all";
  isDefault: boolean;
  tags: string[];
  imageUrl?: string;
  mangaProjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LocationTemplate {
  _id: string;
  name: string;
  description: string;
  basePrompt: string; // Core location description for AI
  type: "indoor" | "outdoor";
  category: "school" | "home" | "public" | "nature" | "fantasy";
  cameraAngles: string[]; // Simple array of angle descriptions
  tags: string[];
  imageUrl?: string;
  mangaProjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MangaProject {
  _id: string;
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
  _id: string;
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
  _id: string;
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
  _id: string;
  order: number;
  title: string;
  description: string;
  sceneContext: {
    // Location reference with override capability
    locationId: string;
    locationOverrides?: {
      timeOfDay?:
        | "dawn"
        | "morning"
        | "noon"
        | "afternoon"
        | "evening"
        | "night";
      weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
      customPrompt?: string; // Custom AI prompt override
    };

    // Character outfit assignments with override capability
    characterOutfits: {
      characterId: string;
      outfitId?: string; // Use template
      customOutfit?: {
        description: string;
        aiPrompt: string;
      }; // OR define directly
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
  _id: string;
  order: number;
  imageUrl?: string;
  panelContext: {
    // Location reference with override capability
    locationId: string;
    locationOverrides?: {
      timeOfDay?:
        | "dawn"
        | "morning"
        | "noon"
        | "afternoon"
        | "evening"
        | "night";
      weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
      customPrompt?: string;
    };

    // Primary action/description for this panel
    action?: string;

    // Character poses and positions with outfit override capability
    characterPoses: {
      characterId: string;
      characterName: string;
      outfitId?: string; // Use template
      customOutfit?: {
        description: string;
        aiPrompt: string;
      }; // OR define directly
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
  _id: string;
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
