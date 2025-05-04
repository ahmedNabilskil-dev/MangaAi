import { z } from 'zod';
import { MangaStatus } from './enums';

// --- Enums and Simple Interfaces ---
const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().optional(),
  significance: z.string().optional(),
}).describe("Represents a location within the manga world.");

const keyEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  sequence: z.number().int().optional(),
}).describe("Represents a key event in the plot.");

const visualAnchorSchema = z.object({
  text: z.string().min(1, "Anchor text is required"),
  weight: z.number().min(0).max(2).optional().default(1.0), // Example range
}).describe("Visual anchor for character consistency.");


// --- Main Entity Schemas for Forms ---

export const mangaProjectSchema = z.object({
  // id: z.string().uuid().optional(), // Usually generated, not in forms
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  status: z.nativeEnum(MangaStatus).optional().default(MangaStatus.DRAFT),
  initialPrompt: z.string().optional(),
  genre: z.string().optional(),
  artStyle: z.string().optional(),
  coverImageUrl: z.string().url("Must be a valid URL").optional(),
  targetAudience: z.enum(['children', 'teen', 'young-adult', 'adult']).optional(),
  // Complex JSON types simplified for basic form - use Textarea for JSON input for now
  worldDetails: z.string().optional().describe("JSON string for world details (summary, history, society, uniqueSystems)"),
  concept: z.string().optional(),
  locations: z.string().optional().describe("JSON string for locations array"), // Array of locationSchema
  plotStructure: z.string().optional().describe("JSON string for plot structure (incitingIncident, plotTwist, climax, resolution)"),
  keyEvents: z.string().optional().describe("JSON string for key events array"), // Array of keyEventSchema
  themes: z.string().optional().describe("Comma-separated themes"), // simple-array
  motifs: z.string().optional().describe("Comma-separated motifs"), // simple-array
  symbols: z.string().optional().describe("Comma-separated symbols"), // simple-array
  tags: z.string().optional().describe("Comma-separated tags"), // jsonb array of strings
  // Relational fields (creator, characters, chapters) omitted from form schema
  // Metadata fields (viewCount, likeCount, published, createdAt, updatedAt) omitted
}).describe("Schema for Manga Project properties form.");

export const chapterSchema = z.object({
  // id: z.string().uuid().optional(),
  chapterNumber: z.number().int().min(1, "Chapter number must be at least 1"),
  title: z.string().min(1, "Chapter title is required"),
  summary: z.string().optional(),
  purpose: z.string().optional(),
  tone: z.string().optional(),
  keyCharacters: z.string().optional().describe("Comma-separated key character names"), // text array
  coverImageUrl: z.string().url("Must be a valid URL").optional(),
  // mangaProjectId: z.string().uuid().optional(), // Might be needed contextually, but not typically edited directly
  // Relational fields (mangaProject, scenes) omitted
  // Metadata fields omitted
}).describe("Schema for Chapter properties form.");

export const characterSchema = z.object({
    // id: z.string().uuid().optional(),
    name: z.string().min(1, "Character name is required"),
    age: z.number().int().optional(),
    gender: z.string().optional(),
    // Complex JSON types simplified
    bodyAttributes: z.string().optional().describe("JSON string for body attributes"),
    facialAttributes: z.string().optional().describe("JSON string for facial attributes"),
    hairAttributes: z.string().optional().describe("JSON string for hair attributes"),
    expressionStyle: z.string().optional().describe("JSON string for expression style"),
    style: z.string().optional().describe("JSON string for style (outfits, etc.)"),
    styleGuide: z.string().optional().describe("JSON string for style guide"),
    // Arrays simplified
    distinctiveFeatures: z.string().optional().describe("Comma-separated distinctive features"),
    physicalMannerisms: z.string().optional().describe("Comma-separated physical mannerisms"),
    visualIdentityAnchors: z.string().optional().describe("JSON string for visual identity anchors array"), // Array of visualAnchorSchema
    referenceImageUrls: z.string().optional().describe("Comma-separated reference image URLs"),
    // Old fields
    posture: z.string().optional(),
    consistencyPrompt: z.string().optional(),
    negativePrompt: z.string().optional(),
    role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
    briefDescription: z.string().optional(),
    personality: z.string().optional(),
    abilities: z.string().optional(),
    backstory: z.string().optional(),
    imgUrl: z.string().url("Must be a valid URL").optional(),
    expressionImages: z.string().optional().describe("JSON string for expression images map"),
    traits: z.string().optional().describe("Comma-separated traits"),
    arcs: z.string().optional().describe("Comma-separated arcs"),
    // AI fields
    isAiGenerated: z.boolean().optional().default(true),
    aiGenerationPrompt: z.string().optional(),
    // Relational fields (mangaProject) omitted
    // Metadata fields omitted
}).describe("Schema for Character properties form.");


export const sceneSchema = z.object({
  // id: z.string().uuid().optional(),
  order: z.number().int().min(0, "Order must be non-negative"),
  title: z.string().min(1, "Scene title is required"),
  description: z.string().optional(),
  // Complex JSON types simplified
  sceneContext: z.string().optional().describe("JSON string for scene context (setting, mood, etc.)"),
  dialogueOutline: z.string().optional().describe("JSON string or text for dialogue outline"),
  // chapterId: z.string().uuid().optional(), // Contextual
  // Relational fields (chapter, panels) omitted
  isAiGenerated: z.boolean().optional().default(true),
  // Metadata fields omitted
}).describe("Schema for Scene properties form.");

export const panelSchema = z.object({
  // id: z.string().uuid().optional(),
  order: z.number().int().min(0, "Order must be non-negative"),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  // Complex JSON types simplified
  panelContext: z.string().optional().describe("JSON string for panel context (action, pose, emotion, etc.)"),
  // Relational fields (scene, dialogues, characters) omitted
  isAiGenerated: z.boolean().optional().default(true),
  aiPrompt: z.string().optional(),
  // Metadata fields omitted
}).describe("Schema for Panel properties form.");

export const panelDialogueSchema = z.object({
  // id: z.string().uuid().optional(),
  content: z.string().min(1, "Dialogue content is required"),
  order: z.number().int().min(0, "Order must be non-negative"),
  // Complex JSON types simplified
  style: z.string().optional().describe("JSON string for dialogue style (bubble type, font, etc.)"),
  emotion: z.string().optional(),
  subtextNote: z.string().optional(),
  // speakerId: z.string().uuid().optional(), // Needs selection mechanism
  speakerName: z.string().optional().describe("Name of the speaking character"), // Simplified for form
  // Relational fields (panel, speaker) omitted
  isAiGenerated: z.boolean().optional().default(false), // Default to false for manual input
  // Metadata fields omitted
}).describe("Schema for Panel Dialogue properties form.");
