import { z } from 'zod';

// Zod schema that matches the MongoDB MangaProject schema exactly
export const mangaProjectGenerationSchema = z.object({
  title: z
    .string()
    .describe(
      "A captivating manga title that follows Japanese naming conventions. Should be evocative, memorable, and hint at the story's core mystery or emotional journey.",
    ),

  description: z
    .string()
    .describe(
      'A gripping 2-3 sentence synopsis that immediately hooks readers and makes them desperate to know what happens next.',
    ),

  genre: z
    .string()
    .describe(
      "Primary genre that defines the story's core identity. Examples: action, romance, fantasy, slice-of-life, mystery, horror, comedy, drama, adventure, sci-fi, supernatural, psychological, historical, sports, mecha, magical-girl, isekai, etc.",
    ),

  artStyle: z
    .string()
    .describe(
      'Visual and narrative style that matches the target demographic: shounen (dynamic, action-oriented), shoujo (elegant, emotion-focused), seinen (detailed, mature), josei (realistic, nuanced), kodomomuke (simple, colorful).',
    ),

  targetAudience: z
    .enum(['children', 'teen', 'young-adult', 'adult'])
    .describe(
      'Primary audience based on content complexity, emotional themes, and psychological depth required.',
    ),

  concept: z
    .string()
    .describe(
      'The unique, compelling core concept that makes this manga stand out from others in its genre.',
    ),

  worldDetails: z
    .object({
      summary: z
        .string()
        .describe(
          "Comprehensive world/setting overview that establishes the story's atmosphere",
        ),
      history: z
        .string()
        .describe(
          'Important historical events, wars, or discoveries that shaped the current world',
        ),
      society: z
        .string()
        .describe(
          'Social hierarchies, cultural norms, government systems, and how different groups interact',
        ),
      uniqueSystems: z
        .string()
        .describe(
          'Special elements like magic systems, advanced technology, supernatural rules, or unique mechanics',
        ),
    })
    .describe(
      'Detailed world-building information that creates an immersive setting',
    ),

  plotStructure: z
    .object({
      incitingIncident: z
        .string()
        .describe(
          'The specific dramatic event that disrupts the status quo and launches the main story',
        ),
      plotTwist: z
        .string()
        .describe(
          'A major revelation or surprise that recontextualizes everything and raises stakes',
        ),
      climax: z
        .string()
        .describe(
          'The emotional and dramatic peak where the main conflict reaches its ultimate confrontation',
        ),
      resolution: z
        .string()
        .describe(
          'How conflicts resolve, character arcs complete, and new equilibrium is established',
        ),
    })
    .describe(
      'Complete dramatic structure that ensures proper pacing and emotional satisfaction',
    ),

  themes: z
    .array(z.string())
    .describe(
      'Deep thematic elements that resonate with the human experience: identity, sacrifice, redemption, coming-of-age, power vs responsibility, etc.',
    ),

  motifs: z
    .array(z.string())
    .describe(
      'Recurring symbolic elements that reinforce themes: cherry blossoms (impermanence), masks (hidden identity), mirrors (self-reflection), etc.',
    ),

  symbols: z
    .array(z.string())
    .describe(
      'Important symbolic representations with deeper meanings: sword = burden of power, key = unlocking potential, bridge = transformation, etc.',
    ),

  tags: z
    .array(z.string())
    .describe(
      'Comprehensive tags for categorization and discovery: genre elements, character types, setting details, themes, mood descriptors, etc.',
    ),
});

// TypeScript type derived from Zod schema
export type MangaProjectGenerationSchema = z.infer<
  typeof mangaProjectGenerationSchema
>;

// Enhanced descriptive prompt for manga generation
export const MANGA_GENERATION_PROMPT = `
You are Naoki Urasawa reborn - a legendary manga creator whose works like "Monster," "20th Century Boys," and "Pluto" have defined what it means to craft psychologically complex, emotionally resonant stories that transcend cultural boundaries. You possess an intuitive understanding of the human condition and an unparalleled ability to weave intricate narratives that feel both intimate and epic.

Your creative genius lies in:
🎨 CHARACTER PSYCHOLOGY: Creating protagonists who feel like real people with authentic flaws, dreams, and growth arcs
🌍 WORLD-BUILDING: Constructing lived-in worlds that breathe with history, culture, and internal logic
📖 NARRATIVE STRUCTURE: Balancing pacing, tension, and emotional payoffs with masterful precision
🎭 THEMATIC DEPTH: Exploring universal human experiences through compelling metaphors and symbolism
✨ VISUAL STORYTELLING: Understanding how art style and visual elements enhance narrative impact

CREATIVE PROCESS:
1. EMOTIONAL CORE: Identify the raw human emotion or experience at the heart of this idea
2. CHARACTER TRUTH: Develop protagonists whose internal struggles mirror universal human conflicts
3. WORLD AUTHENTICITY: Build settings that feel genuine and support the story's themes naturally
4. DRAMATIC STRUCTURE: Create plot beats that escalate tension while developing character depth
5. SYMBOLIC RESONANCE: Weave in motifs and symbols that reinforce themes without being heavy-handed
6. CULTURAL AUTHENTICITY: Ensure the manga feels true to Japanese storytelling traditions while being universally relatable

Transform the user's manga idea into a comprehensive project structure that could become the next beloved manga series. Focus on creating something that feels both fresh and timeless - a story that readers will discuss, analyze, and cherish for years to come.

Every element should serve the story's emotional journey. Characters should feel like people you could meet on the street. World-building should create immersion without overwhelming exposition. Themes should emerge organically from character actions and consequences.

Create a manga concept that could sit alongside the greatest works in the medium - something that honors manga's rich tradition while pushing the art form forward.

RESPOND WITH ONLY A PERFECTLY FORMATTED JSON OBJECT. NO ADDITIONAL TEXT OR EXPLANATIONS.

JSON Structure Required:
{
  "title": "A compelling manga title that captures the story's essence and would look striking on a bookshelf",
  "description": "A gripping synopsis that immediately hooks readers and makes them desperate to start reading", 
  "genre": "Primary genre that defines the story's identity and reader expectations",
  "artStyle": "Visual style that matches the demographic and enhances the narrative",
  "targetAudience": "Audience based on emotional maturity and thematic complexity",
  "concept": "The unique hook that makes this manga stand out in a crowded market",
  "worldDetails": {
    "summary": "Vivid world overview that establishes atmosphere and scope",
    "history": "Historical events that shaped the world and influence current conflicts",
    "society": "Social structures, cultures, and interpersonal dynamics",
    "uniqueSystems": "Special elements that drive plot and create narrative possibilities"
  },
  "plotStructure": {
    "incitingIncident": "The dramatic event that launches the protagonist's journey",
    "plotTwist": "A revelation that recontextualizes everything and raises emotional stakes",
    "climax": "The ultimate confrontation where all conflicts and character arcs converge",
    "resolution": "How the story concludes and what the characters have learned"
  },
  "themes": ["Universal human experiences that resonate across cultures"],
  "motifs": ["Recurring elements that reinforce themes through visual and narrative callbacks"],
  "symbols": ["Meaningful representations that add layers of interpretation"],
  "tags": ["Comprehensive descriptors for discovery and categorization"]
}`;
