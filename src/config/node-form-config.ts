import { MangaStatus } from "@/types/enums";
import type { NodeType } from "@/types/nodes";
import {
  BookOpen,
  FileText,
  Film,
  MessageSquare,
  Square,
  User,
} from "lucide-react";
import { z } from "zod";
// Import the config type

// --- Base Zod Schemas ---
// These are defined in your imported schemas file, so we're just referencing them here
import { FormFieldConfig } from "@/components/properties-panel/property-form";
import { SelectOption } from "@/components/ui/multi-select";
import {
  chapterSchema,
  characterSchema,
  mangaProjectSchema,
  panelDialogueSchema,
  panelSchema,
  sceneSchema,
} from "@/types/schemas";

// --- Selection Options ---
const statusOptions: SelectOption[] = Object.values(MangaStatus).map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

const genreOptions: SelectOption[] = [
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "slice-of-life", label: "Slice of Life" },
  { value: "action", label: "Action" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "romance", label: "Romance" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "isekai", label: "Isekai" },
  { value: "historical", label: "Historical" },
  { value: "seinen", label: "Seinen" },
  { value: "shonen", label: "Shonen" },
  { value: "shojo", label: "Shojo" },
  { value: "cyberpunk", label: "Cyberpunk" },
];

const tagOptions: SelectOption[] = [
  { value: "magic", label: "Magic" },
  { value: "mecha", label: "Mecha" },
  { value: "school", label: "School Life" },
  { value: "romance", label: "Romance" },
  { value: "adventure", label: "Adventure" },
  { value: "isekai", label: "Isekai" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "historical", label: "Historical" },
  { value: "post-apocalyptic", label: "Post-Apocalyptic" },
  { value: "martial-arts", label: "Martial Arts" },
  { value: "supernatural", label: "Supernatural" },
  { value: "psychological", label: "Psychological" },
];

const moodOptions: SelectOption[] = [
  { value: "tense", label: "Tense" },
  { value: "comedic", label: "Comedic" },
  { value: "mysterious", label: "Mysterious" },
  { value: "uplifting", label: "Uplifting" },
  { value: "melancholic", label: "Melancholic" },
  { value: "suspenseful", label: "Suspenseful" },
  { value: "romantic", label: "Romantic" },
  { value: "eerie", label: "Eerie" },
  { value: "peaceful", label: "Peaceful" },
  { value: "chaotic", label: "Chaotic" },
];

const timeOfDayOptions: SelectOption[] = [
  { value: "dawn", label: "Dawn" },
  { value: "morning", label: "Morning" },
  { value: "noon", label: "Noon" },
  { value: "afternoon", label: "Afternoon" },
  { value: "dusk", label: "Dusk" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: "midnight", label: "Midnight" },
];

const weatherOptions: SelectOption[] = [
  { value: "clear", label: "Clear" },
  { value: "cloudy", label: "Cloudy" },
  { value: "rainy", label: "Rainy" },
  { value: "stormy", label: "Stormy" },
  { value: "snowy", label: "Snowy" },
  { value: "foggy", label: "Foggy" },
  { value: "sunny", label: "Sunny" },
  { value: "windy", label: "Windy" },
];

const characterRoleOptions: SelectOption[] = [
  { value: "protagonist", label: "Protagonist" },
  { value: "antagonist", label: "Antagonist" },
  { value: "supporting", label: "Supporting" },
  { value: "minor", label: "Minor" },
];

const traitOptions: SelectOption[] = [
  { value: "brave", label: "Brave" },
  { value: "cowardly", label: "Cowardly" },
  { value: "intelligent", label: "Intelligent" },
  { value: "naive", label: "Naive" },
  { value: "cunning", label: "Cunning" },
  { value: "loyal", label: "Loyal" },
  { value: "stubborn", label: "Stubborn" },
  { value: "kind", label: "Kind" },
  { value: "arrogant", label: "Arrogant" },
  { value: "humble", label: "Humble" },
  { value: "mysterious", label: "Mysterious" },
  { value: "cheerful", label: "Cheerful" },
];

const targetAudienceOptions: SelectOption[] = [
  { value: "children", label: "Children" },
  { value: "teen", label: "Teen" },
  { value: "young-adult", label: "Young Adult" },
  { value: "adult", label: "Adult" },
];

const dialogueBubbleTypeOptions: SelectOption[] = [
  { value: "normal", label: "Normal" },
  { value: "thought", label: "Thought" },
  { value: "scream", label: "Scream" },
  { value: "whisper", label: "Whisper" },
  { value: "narration", label: "Narration" },
];

const dialogueFontSizeOptions: SelectOption[] = [
  { value: "x-small", label: "X-Small" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "x-large", label: "X-Large" },
];

const cameraAngleOptions: SelectOption[] = [
  { value: "close-up", label: "Close-up" },
  { value: "medium", label: "Medium" },
  { value: "wide", label: "Wide" },
  { value: "bird's eye", label: "Bird's Eye" },
  { value: "low angle", label: "Low Angle" },
];

const shotTypeOptions: SelectOption[] = [
  { value: "action", label: "Action" },
  { value: "reaction", label: "Reaction" },
  { value: "establishing", label: "Establishing" },
  { value: "detail", label: "Detail" },
];

// --- Node Type Configuration ---
type NodeConfig = {
  icon: React.ElementType;
  schema: z.ZodObject<any, any>;
  fields: FormFieldConfig[];
};

// --- Node Form Configuration Map ---
const nodeFormConfig: Record<NodeType, NodeConfig> = {
  project: {
    icon: BookOpen,
    schema: mangaProjectSchema,
    fields: [
      // Basic Info
      {
        name: "title",
        label: "Project Title",
        type: "text",
        placeholder: "Enter project title...",
        section: "Basic Info",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter project description...",
        section: "Basic Info",
      },
      {
        name: "initialPrompt",
        label: "Initial Concept",
        type: "textarea",
        placeholder: "Original concept or inspiration...",
        section: "Basic Info",
      },

      // Metadata
      {
        name: "genre",
        label: "Genre",
        type: "combobox",
        options: genreOptions,
        placeholder: "Select or type genre...",
        comboboxConfig: {
          allowCustomValue: true,
          searchPlaceholder: "Search genres...",
        },
        section: "Metadata",
      },
      {
        name: "artStyle",
        label: "Art Style",
        type: "text",
        placeholder: "e.g., Shonen, Seinen, Chibi",
        section: "Metadata",
      },
      {
        name: "coverImageUrl",
        label: "Cover Image URL",
        type: "text",
        placeholder: "https://...",
        section: "Metadata",
      },
      {
        name: "targetAudience",
        label: "Target Audience",
        type: "select",
        options: targetAudienceOptions,
        section: "Metadata",
      },
      {
        name: "tags",
        label: "Tags (comma-separated)",
        type: "text",
        placeholder: "Enter tags...",
        section: "Metadata",
      },

      // World Building
      {
        name: "worldDetails.summary",
        label: "World Summary",
        type: "textarea",
        placeholder: "High-level overview of the manga universe...",
        section: "World Building",
      },
      {
        name: "worldDetails.history",
        label: "World History",
        type: "textarea",
        placeholder: "Historical background...",
        section: "World Building",
      },
      {
        name: "worldDetails.society",
        label: "Society & Culture",
        type: "textarea",
        placeholder: "Social structures, norms, factions...",
        section: "World Building",
      },
      {
        name: "worldDetails.uniqueSystems",
        label: "Unique Systems",
        type: "textarea",
        placeholder: "Special rules for magic, technology, powers...",
        section: "World Building",
      },

      // Narrative Elements
      {
        name: "concept",
        label: "Core Concept",
        type: "textarea",
        placeholder: "Central thematic idea or conflict...",
        section: "Narrative",
      },
      {
        name: "plotStructure.incitingIncident",
        label: "Inciting Incident",
        type: "textarea",
        placeholder: "Event that triggers the main storyline...",
        section: "Narrative",
      },
      {
        name: "plotStructure.plotTwist",
        label: "Major Plot Twist",
        type: "textarea",
        placeholder: "Unexpected development...",
        section: "Narrative",
      },
      {
        name: "plotStructure.climax",
        label: "Climax",
        type: "textarea",
        placeholder: "Pivotal confrontation or crisis point...",
        section: "Narrative",
      },
      {
        name: "plotStructure.resolution",
        label: "Resolution",
        type: "textarea",
        placeholder: "How the central conflict concludes...",
        section: "Narrative",
      },

      // Content Elements
      {
        name: "themes",
        label: "Themes (comma-separated)",
        type: "text",
        placeholder: "Recurring ideas or messages...",
        section: "Content Elements",
      },
      {
        name: "motifs",
        label: "Motifs (comma-separated)",
        type: "text",
        placeholder: "Recurring symbolic elements...",
        section: "Content Elements",
      },
      {
        name: "symbols",
        label: "Symbols (comma-separated)",
        type: "text",
        placeholder: "Objects representing abstract concepts...",
        section: "Content Elements",
      },
    ],
  },

  chapter: {
    icon: FileText,
    schema: chapterSchema,
    fields: [
      // Basic Info
      {
        name: "title",
        label: "Chapter Title",
        type: "text",
        placeholder: "Enter chapter title...",
        section: "Basic Info",
      },
      {
        name: "chapterNumber",
        label: "Chapter Number",
        type: "number",
        numberConfig: { step: 1, min: 1 },
        section: "Basic Info",
      },
      {
        name: "narrative",
        label: "narrative",
        type: "textarea",
        placeholder: "narrative...",
        section: "Content",
      },
      {
        name: "purpose",
        label: "Narrative Purpose",
        type: "text",
        placeholder: "Function this chapter serves...",
        section: "Content",
      },
      {
        name: "tone",
        label: "Tone",
        type: "text",
        placeholder: "Dominant mood or atmosphere...",
        section: "Content",
      },

      // Visual
      {
        name: "coverImageUrl",
        label: "Cover Image URL",
        type: "text",
        placeholder: "https://...",
        section: "Visual",
      },

      // Status
      {
        name: "isPublished",
        label: "Published",
        type: "checkbox",
        section: "Status",
      },
    ],
  },

  character: {
    icon: User,
    schema: characterSchema,
    fields: [
      // Basic Info
      {
        name: "name",
        label: "Character Name",
        type: "text",
        placeholder: "Enter character name...",
        section: "Basic Info",
      },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: characterRoleOptions,
        section: "Basic Info",
      },
      {
        name: "age",
        label: "Age",
        type: "number",
        numberConfig: { step: 1, min: 0 },
        section: "Basic Info",
      },
      {
        name: "gender",
        label: "Gender",
        type: "text",
        placeholder: "Character gender...",
        section: "Basic Info",
      },
      {
        name: "briefDescription",
        label: "Brief Description",
        type: "textarea",
        placeholder: "Short character summary...",
        section: "Basic Info",
      },

      // Physical Attributes
      {
        name: "bodyAttributes.height",
        label: "Height",
        type: "text",
        placeholder: "Height with units...",
        section: "Physical Attributes",
      },
      {
        name: "bodyAttributes.bodyType",
        label: "Body Type",
        type: "text",
        placeholder: "General physique...",
        section: "Physical Attributes",
      },
      {
        name: "bodyAttributes.proportions",
        label: "Proportions",
        type: "text",
        placeholder: "Notable proportional features...",
        section: "Physical Attributes",
      },

      // Facial Attributes
      {
        name: "facialAttributes.faceShape",
        label: "Face Shape",
        type: "text",
        placeholder: "Shape of face...",
        section: "Facial Attributes",
      },
      {
        name: "facialAttributes.skinTone",
        label: "Skin Tone",
        type: "text",
        placeholder: "Skin color...",
        section: "Facial Attributes",
      },
      {
        name: "facialAttributes.eyeColor",
        label: "Eye Color",
        type: "text",
        placeholder: "Color of eyes...",
        section: "Facial Attributes",
      },
      {
        name: "facialAttributes.eyeShape",
        label: "Eye Shape",
        type: "text",
        placeholder: "Shape of eyes...",
        section: "Facial Attributes",
      },

      // Hair Attributes
      {
        name: "hairAttributes.hairColor",
        label: "Hair Color",
        type: "text",
        placeholder: "Color of hair...",
        section: "Hair Attributes",
      },
      {
        name: "hairAttributes.hairstyle",
        label: "Hairstyle",
        type: "text",
        placeholder: "Style of hair...",
        section: "Hair Attributes",
      },
      {
        name: "hairAttributes.hairLength",
        label: "Hair Length",
        type: "text",
        placeholder: "Length of hair...",
        section: "Hair Attributes",
      },

      // Expression & Style
      {
        name: "expressionStyle.defaultExpression",
        label: "Default Expression",
        type: "text",
        placeholder: "Typical facial expression...",
        section: "Expression",
      },
      {
        name: "expressionStyle.emotionalRange",
        label: "Emotional Range",
        type: "text",
        placeholder: "Breadth of expressions...",
        section: "Expression",
      },
      {
        name: "style.defaultOutfit",
        label: "Default Outfit",
        type: "text",
        placeholder: "Primary clothing ensemble...",
        section: "Style",
      },
      {
        name: "style.signatureItem",
        label: "Signature Item",
        type: "text",
        placeholder: "Distinctive carried/worn item...",
        section: "Style",
      },

      // Personality & Background
      {
        name: "traits",
        label: "Traits (comma-separated)",
        type: "text",
        placeholder: "e.g., brave, loyal, cunning",
        section: "Personality",
      },
      {
        name: "personality",
        label: "Personality",
        type: "textarea",
        placeholder: "Psychological profile...",
        section: "Personality",
      },
      {
        name: "abilities",
        label: "Abilities",
        type: "textarea",
        placeholder: "Special skills or powers...",
        section: "Background",
      },
      {
        name: "backstory",
        label: "Backstory",
        type: "textarea",
        placeholder: "Character history and origins...",
        section: "Background",
      },

      // Visual References
      {
        name: "imgUrl",
        label: "Main Image URL",
        type: "text",
        placeholder: "https://...",
        section: "Visual References",
      },
    ],
  },

  scene: {
    icon: Film,
    schema: sceneSchema,
    fields: [
      // Basic Info
      {
        name: "title",
        label: "Scene Title",
        type: "text",
        placeholder: "Enter scene title...",
        section: "Basic Info",
      },
      {
        name: "order",
        label: "Order",
        type: "number",
        numberConfig: { step: 1, min: 0 },
        section: "Basic Info",
      },
      {
        name: "narrative",
        label: "narrative",
        type: "textarea",
        placeholder: "Detailed narrative...",
        section: "Content",
      },

      // Context
      {
        name: "sceneContext.setting",
        label: "Setting",
        type: "text",
        placeholder: "Physical location...",
        section: "Context",
      },
      {
        name: "sceneContext.mood",
        label: "Mood",
        type: "combobox",
        options: moodOptions,
        placeholder: "Select or type mood...",
        comboboxConfig: {
          allowCustomValue: true,
          searchPlaceholder: "Search moods...",
        },
        section: "Context",
      },
      {
        name: "sceneContext.timeOfDay",
        label: "Time of Day",
        type: "select",
        options: timeOfDayOptions,
        section: "Context",
      },
      {
        name: "sceneContext.weather",
        label: "Weather",
        type: "select",
        options: weatherOptions,
        section: "Context",
      },
    ],
  },

  panel: {
    icon: Square,
    schema: panelSchema,
    fields: [
      // Basic Info
      {
        name: "order",
        label: "Order",
        type: "number",
        numberConfig: { step: 1, min: 0 },
        section: "Basic Info",
      },
      {
        name: "imageUrl",
        label: "Panel Image URL",
        type: "text",
        placeholder: "https://...",
        section: "Visual",
      },

      // Composition
      {
        name: "panelContext.action",
        label: "Action",
        type: "text",
        placeholder: "Primary action occurring...",
        section: "Composition",
      },
      {
        name: "panelContext.pose",
        label: "Character Pose",
        type: "text",
        placeholder: "Character stance/positioning...",
        section: "Composition",
      },
      {
        name: "panelContext.emotion",
        label: "Emotion",
        type: "text",
        placeholder: "Dominant emotional tone...",
        section: "Composition",
      },
      {
        name: "panelContext.cameraAngle",
        label: "Camera Angle",
        type: "select",
        options: cameraAngleOptions,
        section: "Composition",
      },
      {
        name: "panelContext.shotType",
        label: "Shot Type",
        type: "select",
        options: shotTypeOptions,
        section: "Composition",
      },

      // Background & Effects
      {
        name: "panelContext.backgroundDescription",
        label: "Background",
        type: "textarea",
        placeholder: "Backdrop details...",
        section: "Background",
      },
      {
        name: "panelContext.backgroundImageUrl",
        label: "Background Image URL",
        type: "text",
        placeholder: "https://...",
        section: "Background",
      },
      {
        name: "panelContext.lighting",
        label: "Lighting",
        type: "text",
        placeholder: "Illumination style...",
        section: "Effects",
      },
      {
        name: "panelContext.effects",
        label: "Effects (comma-separated)",
        type: "text",
        placeholder: "Visual effects...",
        section: "Effects",
      },

      // Narrative Purpose
      {
        name: "panelContext.dramaticPurpose",
        label: "Dramatic Purpose",
        type: "text",
        placeholder: "Narrative function...",
        section: "Narrative",
      },
      {
        name: "panelContext.narrativePosition",
        label: "Narrative Position",
        type: "text",
        placeholder: "Placement in story flow...",
        section: "Narrative",
      },
    ],
  },

  dialogue: {
    icon: MessageSquare,
    schema: panelDialogueSchema,
    fields: [
      // Basic Info
      {
        name: "order",
        label: "Order",
        type: "number",
        numberConfig: { step: 1, min: 0 },
        section: "Basic Info",
      },
      {
        name: "content",
        label: "Dialogue Text",
        type: "textarea",
        placeholder: "Enter dialogue or caption...",
        section: "Content",
      },
      {
        name: "speakerId",
        label: "Speaker ID",
        type: "text",
        placeholder: "ID of speaking character...",
        section: "Content",
      },
      {
        name: "emotion",
        label: "Emotion",
        type: "text",
        placeholder: "Emotional tone of delivery...",
        section: "Content",
      },
      {
        name: "subtextNote",
        label: "Subtext",
        type: "textarea",
        placeholder: "Unspoken meaning or context...",
        section: "Content",
      },

      // Style
      {
        name: "style.bubbleType",
        label: "Bubble Type",
        type: "select",
        options: dialogueBubbleTypeOptions,
        section: "Style",
      },
      {
        name: "style.fontSize",
        label: "Font Size",
        type: "select",
        options: dialogueFontSizeOptions,
        section: "Style",
      },
      {
        name: "style.fontType",
        label: "Font Type",
        type: "text",
        placeholder: "Typeface or lettering style...",
        section: "Style",
      },
      {
        name: "style.emphasis",
        label: "Emphasis",
        type: "checkbox",
        section: "Style",
      },
      {
        name: "style.position.x",
        label: "Position X",
        type: "number",
        numberConfig: { step: 1 },
        section: "Position",
      },
      {
        name: "style.position.y",
        label: "Position Y",
        type: "number",
        numberConfig: { step: 1 },
        section: "Position",
      },
    ],
  },
};

export default nodeFormConfig;
