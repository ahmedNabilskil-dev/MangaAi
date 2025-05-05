
import type { MangaStatus } from './enums';
import type { Timestamp } from 'firebase/firestore'; // Import Firestore types
import type { ShapeConfig } from './editor'; // Import ShapeConfig

// --- Simple Interfaces (keep as is) ---
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

// --- Firestore-Compatible Entity Interfaces ---

// User interface might need adjustment based on how you store users in Firestore (e.g., separate collection)
export interface User {
  id: string; // Firestore document ID
  username: string;
  email: string;
  // Other relevant fields...
}

export interface MangaProject {
  id: string; // Firestore document ID
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
  creatorId?: string; // Store creator ID instead of full object
  messages?: { role: string; parts: { text: string }[] }[];
  viewCount: number;
  likeCount: number;
  published: boolean;
  createdAt: Date | Timestamp; // Use Date in JS, Timestamp in Firestore
  updatedAt: Date | Timestamp;
  // Removed relations that will be fetched separately:
  // characters?: Character[];
  // chapters?: Chapter[];
  // We might add these back temporarily after fetching in getProject
  chapters?: Chapter[]; // For holding fetched data
  characters?: Character[]; // For holding fetched data

}


export interface Chapter {
  id: string; // Firestore document ID
  chapterNumber: number;
  title: string;
  summary?: string;
  purpose?: string;
  tone?: string;
  keyCharacters?: string[];
  coverImageUrl?: string;
  mangaProjectId: string; // Foreign Key to MangaProject document ID
  isAiGenerated: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
   // Removed relation that will be fetched separately:
  // scenes: Scene[];
  scenes?: Scene[]; // For holding fetched data
}

export interface Character {
  id: string; // Firestore document ID
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
  mangaProjectId: string; // Foreign Key to MangaProject document ID
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Scene {
  id: string; // Firestore document ID
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
  chapterId: string; // Foreign Key to Chapter document ID
  dialogueOutline?: any;
  isAiGenerated: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
   // Removed relation that will be fetched separately:
  // panels: Panel[];
  panels?: Panel[]; // For holding fetched data
}

export interface Panel {
  id: string; // Firestore document ID
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
    backgroundImageUrl?: string; // (New) separate background image if needed
    lighting: string;
    effects: string[]; // (Updated) multiple effects like ["rain", "fog"]
    dramaticPurpose: string;
    narrativePosition: string;
  };
  sceneId: string; // Foreign Key to Scene document ID
  characterIds: string[]; // Store array of character IDs
  isAiGenerated: boolean;
  aiPrompt?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  // Removed relations that will be fetched separately:
  // dialogues: PanelDialogue[];
  // characters: Character[]; // Replaced by characterIds
  dialogues?: PanelDialogue[]; // For holding fetched data
  characters?: Character[]; // For holding fetched data (derived from characterIds)
}


export interface PanelDialogue {
  id: string; // Firestore document ID
  content: string;
  order: number;
  style?: {
    bubbleType?: 'normal' | 'thought' | 'scream' | 'whisper' | 'narration'; // Added narration
    fontSize?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
    fontType?: string;
    emphasis?: boolean;
    position?: { x: number; y: number };
  };
  emotion?: string;
  subtextNote?: string;
  panelId: string; // Foreign Key to Panel document ID
  speakerId?: string | null; // Foreign Key to Character document ID (or null)
  isAiGenerated: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  // Removed relation that will be fetched separately:
  // speaker?: Character;
  speaker?: Character | null; // For holding fetched data
}


// Export ShapeConfig along with entities
export type { ShapeConfig };
