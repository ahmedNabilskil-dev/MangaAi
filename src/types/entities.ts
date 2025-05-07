import type { ShapeConfig } from "./editor";
import type { MangaStatus } from "./enums";

export interface MangaLocation {
  id: string;
  name: string;
  description: string;
  significance: string;
  projectId?: string;
}

export interface KeyEvent {
  id: string;
  name: string;
  description: string;
  sequence: number;
  projectId?: string;
}

export interface VisualAnchor {
  text: string;
  weight: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
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
  locations?: MangaLocation[];
  plotStructure?: {
    incitingIncident: string;
    plotTwist: string;
    climax: string;
    resolution: string;
  };
  keyEvents?: KeyEvent[];
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

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  summary?: string;
  purpose?: string;
  tone?: string;
  keyCharacters?: string[];
  coverImageUrl?: string;
  mangaProjectId: string;
  isAiGenerated: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  scenes?: Scene[];
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
  expressionStyle?: {
    defaultExpression: string;
    emotionalRange: string;
    facialTics: string[];
  };
  style?: {
    defaultOutfit: string;
    outfitVariations: string[];
    colorPalette: string[];
    accessories: string[];
    signatureItem: string;
  };
  physicalMannerisms?: string[];
  posture?: string;
  visualIdentityAnchors?: VisualAnchor[];
  styleGuide?: {
    artStyle: string;
    lineweight: string;
    shadingStyle: string;
    colorStyle: string;
  };
  consistencyPrompt?: string;
  negativePrompt?: string;
  referenceImageUrls?: string[];
  role?: "protagonist" | "antagonist" | "supporting" | "minor";
  briefDescription?: string;
  personality?: string;
  abilities?: string;
  backstory?: string;
  imgUrl?: string;
  expressionImages?: { [expression: string]: string };
  traits?: string[];
  arcs?: string[];
  isAiGenerated: boolean;
  aiGenerationPrompt?: string;
  mangaProjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  order: number;
  title: string;
  description?: string;
  sceneContext: {
    setting: string;
    mood: string;
    presentCharacters: string[];
    timeOfDay?: string;
    weather?: string;
  };
  chapterId: string;
  dialogueOutline?: any;
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
    action: string;
    pose?: string;
    characterPoses?: {
      characterName: string;
      pose: string;
      expression?: string;
    }[];
    emotion?: string;
    cameraAngle?: "close-up" | "medium" | "wide" | "bird's eye" | "low angle";
    shotType?: "action" | "reaction" | "establishing" | "detail";
    backgroundDescription?: string;
    backgroundImageUrl?: string;
    lighting: string;
    effects: string[];
    dramaticPurpose: string;
    narrativePosition: string;
  };
  sceneId: string;
  characterIds: string[];
  isAiGenerated: boolean;
  aiPrompt?: string;
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
    fontSize?: "x-small" | "small" | "medium" | "large" | "x-large";
    fontType?: string;
    emphasis?: boolean;
    position?: { x: number; y: number };
  };
  emotion?: string;
  subtextNote?: string;
  panelId: string;
  speakerId?: string | null;
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  speaker?: Character | null;
}

export type { ShapeConfig };
