
import { z } from 'zod';
import type { NodeType } from '@/types/nodes';
import type { SelectOption } from '@/components/ui/select'; // Adjusted import if needed
import type { ComboboxOption } from '@/components/ui/combobox';
import { MangaStatus } from '@/types/enums';
import {
    BookOpen, Film, Square, MessageSquare, User, Type, Hash, FileText, ToggleLeft, List, CaseSensitive, Image as ImageIcon, Search, Binary, Settings, Paintbrush, Tag, Info, ScanText, ImagePlay, Camera, Smile, Feather, Upload
} from 'lucide-react'; // Import more specific icons

// --- Base Zod Schemas (simplified for forms) ---
const projectSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Project title is required"),
    description: z.string().optional(),
    status: z.nativeEnum(MangaStatus).optional().default(MangaStatus.DRAFT),
    genre: z.string().optional(),
    artStyle: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    coverImage: z.any().optional(), // Allow string URL or File object
});

const chapterSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Chapter title is required"),
    chapterNumber: z.number().int().positive("Must be positive"),
    summary: z.string().optional(),
    isPublished: z.boolean().optional().default(false),
});

const sceneSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Scene title is required"),
    order: z.number().int().min(0).default(0),
    setting: z.string().optional(),
    mood: z.string().optional(),
    timeOfDay: z.string().optional(),
    weather: z.string().optional(),
    presentCharacters: z.array(z.string()).optional().default([]), // Assuming storing names for simplicity here
});

const panelSchema = z.object({
    id: z.string().optional(),
    order: z.number().int().min(0).default(0),
    action: z.string().optional(),
    lighting: z.string().optional(),
    cameraAngle: z.enum(['close-up', 'medium', 'wide', "bird's eye", 'low angle']).optional(),
    shotType: z.enum(['action', 'reaction', 'establishing', 'detail']).optional(),
    imageUrl: z.any().optional(), // Allow string URL or File object
    aiPrompt: z.string().optional(),
});

const dialogueSchema = z.object({
    id: z.string().optional(),
    order: z.number().int().min(0).default(0),
    content: z.string().min(1, "Dialogue content is required"),
    speakerName: z.string().optional(),
    bubbleType: z.enum(['normal', 'thought', 'scream', 'whisper', 'narration']).optional().default('normal'),
    emotion: z.string().optional(),
    isAiGenerated: z.boolean().optional().default(false),
});

const characterSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Character name is required"),
    role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
    briefDescription: z.string().optional(),
    traits: z.array(z.string()).optional().default([]),
    referenceImage: z.any().optional(), // Allow string URL or File object
    imgUrl: z.string().optional(), // For displaying existing image URL
});


// --- Field Configuration Types ---

type BaseFieldConfig = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    section?: string; // New property for grouping
};

type TextFieldConfig = BaseFieldConfig & { type: 'text' };
type TextAreaFieldConfig = BaseFieldConfig & { type: 'textarea' };
type NumberFieldConfig = BaseFieldConfig & { type: 'number'; numberConfig?: { step?: number | string; min?: number; max?: number, defaultValue?: number } };
type CheckboxFieldConfig = BaseFieldConfig & { type: 'checkbox' };
type SelectFieldConfig = BaseFieldConfig & { type: 'select'; options: SelectOption[] };
type ComboboxFieldConfig = BaseFieldConfig & { type: 'combobox'; options: ComboboxOption[]; comboboxConfig?: { searchPlaceholder?: string; emptyText?: string, allowCustomValue?: boolean } };
type MultiSelectFieldConfig = BaseFieldConfig & { type: 'multi-select'; options: SelectOption[]; multiselectConfig?: {} }; // Add specific config if needed
type FileFieldConfig = BaseFieldConfig & { type: 'file'; fileConfig?: { accept?: string } }; // Mime types like "image/*"

export type FormFieldConfig =
    | TextFieldConfig
    | TextAreaFieldConfig
    | NumberFieldConfig
    | CheckboxFieldConfig
    | SelectFieldConfig
    | ComboboxFieldConfig
    | MultiSelectFieldConfig
    | FileFieldConfig;

// --- Node Type Configuration ---

type NodeConfig = {
    icon: React.ElementType;
    schema: z.ZodObject<any, any>; // Adjust Zod type as needed
    fields: FormFieldConfig[];
};

// --- Sample Options ---
const statusOptions: SelectOption[] = Object.values(MangaStatus).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
const genreOptions: ComboboxOption[] = [
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'slice-of-life', label: 'Slice of Life' },
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'romance', label: 'Romance' },
    { value: 'horror', label: 'Horror' },
    { value: 'mystery', label: 'Mystery' },
];
const tagOptions: SelectOption[] = [ // For multi-select
    { value: 'magic', label: 'Magic' },
    { value: 'mecha', label: 'Mecha' },
    { value: 'school', label: 'School Life' },
    { value: 'romance', label: 'Romance' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'isekai', label: 'Isekai' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'historical', label: 'Historical' },
    { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
];
const moodOptions: ComboboxOption[] = [
    { value: 'tense', label: 'Tense' },
    { value: 'comedic', label: 'Comedic' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'uplifting', label: 'Uplifting' },
    { value: 'melancholic', label: 'Melancholic' },
    { value: 'suspenseful', label: 'Suspenseful' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'eerie', label: 'Eerie' },
];
const roleOptions: SelectOption[] = [
    { value: 'protagonist', label: 'Protagonist' },
    { value: 'antagonist', label: 'Antagonist' },
    { value: 'supporting', label: 'Supporting' },
    { value: 'minor', label: 'Minor' },
];
const traitOptions: SelectOption[] = [
    { value: 'brave', label: 'Brave' },
    { value: 'cowardly', label: 'Cowardly' },
    { value: 'intelligent', label: 'Intelligent' },
    { value: 'naive', label: 'Naive' },
    { value: 'cunning', label: 'Cunning' },
    { value: 'loyal', label: 'Loyal' },
    { value: 'stubborn', label: 'Stubborn' },
    { value: 'kind', label: 'Kind' },
    { value: 'arrogant', label: 'Arrogant' },
];
const cameraAngleOptions: SelectOption[] = [
    { value: 'close-up', label: 'Close-up' },
    { value: 'medium', label: 'Medium Shot' },
    { value: 'wide', label: 'Wide Shot' },
    { value: "bird's eye", label: "Bird's Eye View" },
    { value: 'low angle', label: 'Low Angle' },
];
const shotTypeOptions: SelectOption[] = [
    { value: 'action', label: 'Action Shot' },
    { value: 'reaction', label: 'Reaction Shot' },
    { value: 'establishing', label: 'Establishing Shot' },
    { value: 'detail', label: 'Detail Shot' },
];
const bubbleTypeOptions: SelectOption[] = [
    { value: 'normal', label: 'Normal Speech' },
    { value: 'thought', label: 'Thought' },
    { value: 'scream', label: 'Scream/Loud' },
    { value: 'whisper', label: 'Whisper/Quiet' },
    { value: 'narration', label: 'Narration Box' },
];

// --- Node Form Configuration Map ---

const nodeFormConfig: Record<NodeType, NodeConfig> = {
    project: {
        icon: BookOpen,
        schema: projectSchema,
        fields: [
            { name: 'title', label: 'Project Title', type: 'text', placeholder: 'Enter project title...', section: 'Basic Info' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter project description...', section: 'Basic Info' },
            { name: 'status', label: 'Status', type: 'select', options: statusOptions, section: 'Metadata' },
            { name: 'genre', label: 'Genre', type: 'combobox', options: genreOptions, placeholder: 'Select or type genre...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Search genres...' }, section: 'Metadata' },
            { name: 'artStyle', label: 'Art Style', type: 'text', placeholder: 'e.g., Shonen, Shojo, Chibi', section: 'Metadata' },
            { name: 'tags', label: 'Tags', type: 'multi-select', options: tagOptions, placeholder: 'Select tags...', section: 'Metadata' },
            { name: 'coverImage', label: 'Cover Image', type: 'file', fileConfig: { accept: 'image/*' }, description: "Upload a cover image.", section: 'Visuals' },
        ],
    },
    chapter: {
        icon: FileText, // Changed icon
        schema: chapterSchema,
        fields: [
            { name: 'title', label: 'Chapter Title', type: 'text', placeholder: 'Enter chapter title...', section: 'Basic Info' },
            { name: 'chapterNumber', label: 'Chapter Number', type: 'number', numberConfig: { step: 1, min: 1, defaultValue: 1 }, section: 'Basic Info' },
            { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Enter chapter summary...', section: 'Content' },
            { name: 'isPublished', label: 'Published', type: 'checkbox', section: 'Status' },
        ],
    },
    scene: {
        icon: Film,
        schema: sceneSchema,
        fields: [
            { name: 'title', label: 'Scene Title', type: 'text', placeholder: 'Enter scene title...', section: 'Basic Info' },
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 }, section: 'Basic Info' },
            { name: 'setting', label: 'Setting', type: 'text', placeholder: 'e.g., Dark Forest, Bustling City', section: 'Context' },
            { name: 'mood', label: 'Mood', type: 'combobox', options: moodOptions, placeholder: 'Select or type mood...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Search moods...' }, section: 'Context' },
            { name: 'timeOfDay', label: 'Time of Day', type: 'text', placeholder: 'e.g., Dawn, Midnight', section: 'Context' },
            { name: 'weather', label: 'Weather', type: 'text', placeholder: 'e.g., Rainy, Sunny', section: 'Context' },
            // Character assignment might be better handled via drag/drop or a dedicated tool in the future
            // { name: 'presentCharacters', label: 'Characters Present', type: 'multi-select', options: [], placeholder: 'Select characters...', section: 'Characters' }, // Options need dynamic population
        ],
    },
    panel: {
        icon: Square,
        schema: panelSchema,
        fields: [
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 }, section: 'Basic Info' },
            { name: 'action', label: 'Action Description', type: 'textarea', placeholder: 'Describe the main action in the panel...', section: 'Content' },
            { name: 'lighting', label: 'Lighting', type: 'text', placeholder: 'e.g., Dramatic shadows, Bright sunlight', section: 'Visuals' },
            { name: 'cameraAngle', label: 'Camera Angle', type: 'select', options: cameraAngleOptions, placeholder: 'Select camera angle...', section: 'Visuals' },
            { name: 'shotType', label: 'Shot Type', type: 'select', options: shotTypeOptions, placeholder: 'Select shot type...', section: 'Visuals' },
            { name: 'imageUrl', label: 'Panel Image', type: 'file', fileConfig: { accept: 'image/*' }, description: "Upload an image for this panel.", section: 'Visuals' },
            { name: 'aiPrompt', label: 'AI Generation Prompt', type: 'textarea', placeholder: '(Optional) Prompt for AI image generation...', section: 'AI Generation' },
        ],
    },
    dialogue: {
        icon: MessageSquare,
        schema: dialogueSchema,
        fields: [
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 }, section: 'Basic Info' },
            { name: 'content', label: 'Dialogue Text', type: 'textarea', placeholder: 'Enter dialogue or caption...', section: 'Content' },
            { name: 'speakerName', label: 'Speaker', type: 'combobox', options: [], placeholder: 'Select or type speaker...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Find character...' }, section: 'Content' }, // Options should be populated dynamically
            { name: 'bubbleType', label: 'Bubble Type', type: 'select', options: bubbleTypeOptions, section: 'Style' },
            { name: 'emotion', label: 'Emotion', type: 'text', placeholder: 'e.g., Angry, Sad, Excited', section: 'Style' },
            { name: 'isAiGenerated', label: 'AI Generated?', type: 'checkbox', section: 'Metadata' },
        ],
    },
    character: {
        icon: User,
        schema: characterSchema,
        fields: [
            { name: 'name', label: 'Character Name', type: 'text', placeholder: 'Enter character name...', section: 'Basic Info' },
            { name: 'role', label: 'Role', type: 'select', options: roleOptions, placeholder: 'Select role...', section: 'Basic Info' },
            { name: 'briefDescription', label: 'Brief Description', type: 'textarea', placeholder: 'Short description of the character...', section: 'Description' },
            { name: 'traits', label: 'Traits', type: 'multi-select', options: traitOptions, placeholder: 'Select character traits...', section: 'Description' },
            { name: 'referenceImage', label: 'Reference Image', type: 'file', fileConfig: { accept: 'image/*' }, description: "Upload a reference image.", section: 'Visuals' },
             { name: 'imgUrl', label: 'Current Image URL', type: 'text', placeholder: 'Image URL (if set)', section: 'Visuals' }, // Display existing URL
        ],
    },
};

export default nodeFormConfig;
