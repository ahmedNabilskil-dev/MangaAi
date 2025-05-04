import type { MangaStatus } from './enums';

// --- Simple Interfaces ---
export interface Location {
  name: string;
  description: string;
  significance: string;
}

export interface KeyEvent {
  name: string;
  description: string;
  sequence: number;
}

export interface VisualAnchor {
  text: string;
  weight: number; // example: 1.0 = normal, 1.5 = very important
}

// --- Entity Interfaces ---

export interface User {
  id: string; // Assuming UUID from TypeORM
  // Add other relevant user fields from your User entity if needed
  username: string;
  email: string;
  // mangaProjects: MangaProject[]; // Relation omitted for simplicity here
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
  targetAudience?: 'children' | 'teen' | 'young-adult' | 'adult';
  worldDetails?: {
    summary: string;
    history: string;
    society: string;
    uniqueSystems: string;
  };
  concept?: string;
  locations?: Location[];
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
  creator?: User; // Relation
  characters?: Character[]; // Relation
  chapters?: Chapter[]; // Relation
  messages?: { role: string; parts: { text: string }[] }[];
  viewCount: number;
  likeCount: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  mangaProject: MangaProject; // Relation
  mangaProjectId: string; // Foreign Key
  scenes: Scene[]; // Relation
  isAiGenerated: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
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
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
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
  mangaProject: MangaProject; // Relation
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
  chapter: Chapter; // Relation
  chapterId: string; // Foreign Key
  dialogueOutline?: any; // Consider defining a more specific type if possible
  panels: Panel[]; // Relation
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
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
    cameraAngle?: 'close-up' | 'medium' | 'wide' | "bird's eye" | 'low angle';
    shotType?: 'action' | 'reaction' | 'establishing' | 'detail';
    backgroundDescription?: string;
    backgroundImageUrl?: string;
    lighting: string;
    effects: string[];
    dramaticPurpose: string;
    narrativePosition: string;
  };
  scene: Scene; // Relation
  dialogues: PanelDialogue[]; // Relation
  characters: Character[]; // ManyToMany Relation
  isAiGenerated: boolean;
  aiPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface PanelDialogue {
  id: string;
  content: string;
  order: number;
  style?: {
    bubbleType?: 'normal' | 'thought' | 'scream' | 'whisper';
    fontSize?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
    fontType?: string;
    emphasis?: boolean;
    position?: { x: number; y: number };
  };
  emotion?: string;
  subtextNote?: string;
  panel: Panel; // Relation
  speaker?: Character; // Relation
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
