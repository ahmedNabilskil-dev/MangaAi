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
  components: {
    type: "top" | "bottom" | "shoes" | "accessories" | "outerwear";
    item: string;
    color?: string;
    material?: string;
    pattern?: string;
  }[];
  colors: string[];
  materials: string[];
  tags: string[];
  imagePrompt?: string;
  imageUrl?: string;
  isActive: boolean;
  mangaProjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
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
  timeOfDay:
    | "dawn"
    | "morning"
    | "noon"
    | "afternoon"
    | "evening"
    | "night"
    | "any";
  weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy" | "any";
  mood:
    | "peaceful"
    | "mysterious"
    | "energetic"
    | "romantic"
    | "tense"
    | "cheerful"
    | "somber";
  style: "anime" | "realistic" | "cartoon" | "manga";
  lighting: {
    type?: "natural" | "artificial" | "mixed";
    intensity?: "dim" | "moderate" | "bright";
    color?: string;
  };
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
  imagePrompt?: string;
  imageUrl?: string;
  isActive: boolean;
  mangaProjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
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
