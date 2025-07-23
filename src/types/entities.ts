import { MangaStatus } from "@/types/enums";

export interface PoseTemplate {
  id: string;
  name: string; // "Standing", "Running", "Crossed Arms", etc.
  description: string;
  characterId?: string; // optional: use for character-specific poses
  imageUrl: string; // preview or sprite
  tags: string[]; // e.g., ["neutral", "dynamic", "angry"]
  angle?: "front" | "side" | "back";
  viewType?: "full-body" | "bust" | "headshot";
  emotionOverlayId?: string; // for combining expressions
  isDefault?: boolean;
}

export interface EffectTemplate {
  id: string;
  name: string; // "Rain", "Speed Lines", "Magic Aura"
  description?: string;
  imageUrl: string;
  type: "weather" | "motion" | "magic" | "emotion" | "ui";
  tags?: string[];
  blendMode?: "overlay" | "multiply" | "screen";
  opacity?: number;
  animation?: boolean; // optional for animated support later
}

export interface OutfitTemplate {
  id: string;
  name: string; // e.g., "School Uniform", "Casual"
  characterId: string;
  description: string; // Short, visual-friendly summary
  aiPrompt: string; // Detailed and composable prompt for AI
  isDefault?: boolean; // Marks main outfit
  tags: string[]; // e.g., ["uniform", "blue", "skirt"]

  category:
    | "school"
    | "casual"
    | "formal"
    | "sports"
    | "sleepwear"
    | "work"
    | "special"
    | "fantasy"
    | "historical"; // <-- NEW: allows genre expansion

  season?: "spring" | "summer" | "fall" | "winter" | "any";

  materialTags?: string[]; // <-- NEW: ["cotton", "leather", "silk"] for realism
  colorPalette?: string[]; // <-- NEW: ["navy", "white", "red"] helps AI and filtering
  layers?: string[]; // <-- NEW: ["shirt", "jacket", "tie"] (good for sprite separation)

  referenceImages: {
    id: string;
    url: string;
    description: string; // "front view", "side view", etc.
    isMain: boolean;
    metadata?: {
      angle?: string;
      lighting?: string;
      resolution?: string;
    }; // <-- NEW: helpful for AI training or consistency
  }[];
}

export interface LocationTemplate {
  id: string;
  name: string; // e.g., "Classroom", "Park"
  basePrompt: string; // Foundational scene elements
  type: "interior" | "exterior";
  cameraAngles: {
    id: string;
    name: string; // e.g., "corner_view", "doorway_view"
    aiPrompt: string; // Full prompt for rendering
    referenceImage?: {
      url: string;
      description: string;
      metadata?: {
        resolution?: string;
        lighting?: string;
      }; // <-- NEW
    };
  }[];
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
    locationId?: string;
    outfitOverrides?: {
      characterId: string;
      outfitId: string;
      reason?: string;
    }[];
    setting: string;
    mood: string;
    presentCharacters: string[];
    timeOfDay: string;
    weather: string;
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
    action?: string;
    characterPoses?: {
      characterName: string;
      characterId: string;
      pose: string;
      expression: string;
      outfitId: string;
    }[];
    emotion?: string;
    cameraAngle?: "close-up" | "medium" | "wide" | "bird's eye" | "low angle";
    shotType?: "action" | "reaction" | "establishing" | "detail" | "transition";
    locationId: string;
    cameraAngelId: string;
    lighting?: string;
    effects?: string[];
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
