
import { z } from 'zod';
import type { NodeType } from '@/types/nodes';
import type { SelectOption } from '@/components/ui/select';
import type { ComboboxOption } from '@/components/ui/combobox';
import { MangaStatus } from '@/types/enums';
import {
    BookOpen, Film, Square, MessageSquare, User, Type, Hash, FileText, ToggleLeft, List, CaseSensitive, Image as ImageIcon, Search, Binary, Settings, Paintbrush, Tag, Info, ScanText, ImagePlay, Camera, Smile, Feather, Upload, Speech, Cloud
} from 'lucide-react';
// Import the config type from the new location
import type { FormFieldConfig } from './shape-form-config'; // Import common types


// --- Base Zod Schemas (simplified for forms, align with entities where possible) ---
const projectSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Project title is required"),
    description: z.string().optional(),
    status: z.nativeEnum(MangaStatus).optional().default(MangaStatus.DRAFT),
    genre: z.string().optional(),
    artStyle: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    coverImage: z.any().optional(), // Keep for backend entity
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
    presentCharacters: z.array(z.string()).optional().default([]),
});

const dialogueSchema = z.object({
    id: z.string().optional(),
    order: z.number().int().min(0).default(0),
    content: z.string().min(1, "Dialogue content is required"),
    speakerName: z.string().optional(),
    // bubbleType: z.enum(['normal', 'thought', 'scream', 'whisper', 'narration']).optional().default('normal'), // Use style.bubbleType now
    emotion: z.string().optional(),
    isAiGenerated: z.boolean().optional().default(false),
    // Include style object matching PanelDialogue entity
    style: z.object({
        bubbleType: z.enum(["normal", "thought", "scream", "whisper", "narration"]).optional(),
        fontSize: z.enum(["x-small", "small", "medium", "large", "x-large"]).optional(),
        fontType: z.string().optional(),
        emphasis: z.boolean().optional(),
    }).optional(),
});

const characterSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Character name is required"),
    role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
    briefDescription: z.string().optional(),
    traits: z.array(z.string()).optional().default([]),
    referenceImage: z.any().optional(), // Keep for backend entity
    imgUrl: z.string().optional(), // Display URL
});


// --- Node Type Configuration ---
type NodeConfig = {
    icon: React.ElementType;
    schema: z.ZodObject<any, any>;
    fields: FormFieldConfig[]; // Use the imported type
};

// --- Sample Options (Copied from previous version) ---
const statusOptions: SelectOption[] = Object.values(MangaStatus).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
const genreOptions: ComboboxOption[] = [
    { value: 'fantasy', label: 'Fantasy' }, { value: 'sci-fi', label: 'Sci-Fi' }, { value: 'slice-of-life', label: 'Slice of Life' },
    { value: 'action', label: 'Action' }, { value: 'comedy', label: 'Comedy' }, { value: 'drama', label: 'Drama' },
    { value: 'romance', label: 'Romance' }, { value: 'horror', label: 'Horror' }, { value: 'mystery', label: 'Mystery' },
];
const tagOptions: SelectOption[] = [
    { value: 'magic', label: 'Magic' }, { value: 'mecha', label: 'Mecha' }, { value: 'school', label: 'School Life' },
    { value: 'romance', label: 'Romance' }, { value: 'adventure', label: 'Adventure' }, { value: 'isekai', label: 'Isekai' },
    { value: 'cyberpunk', label: 'Cyberpunk' }, { value: 'historical', label: 'Historical' }, { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
];
const moodOptions: ComboboxOption[] = [
    { value: 'tense', label: 'Tense' }, { value: 'comedic', label: 'Comedic' }, { value: 'mysterious', label: 'Mysterious' },
    { value: 'uplifting', label: 'Uplifting' }, { value: 'melancholic', label: 'Melancholic' }, { value: 'suspenseful', label: 'Suspenseful' },
    { value: 'romantic', label: 'Romantic' }, { value: 'eerie', label: 'Eerie' },
];
const roleOptions: SelectOption[] = [
    { value: 'protagonist', label: 'Protagonist' }, { value: 'antagonist', label: 'Antagonist' },
    { value: 'supporting', label: 'Supporting' }, { value: 'minor', label: 'Minor' },
];
const traitOptions: SelectOption[] = [
    { value: 'brave', label: 'Brave' }, { value: 'cowardly', label: 'Cowardly' }, { value: 'intelligent', label: 'Intelligent' },
    { value: 'naive', label: 'Naive' }, { value: 'cunning', label: 'Cunning' }, { value: 'loyal', label: 'Loyal' },
    { value: 'stubborn', label: 'Stubborn' }, { value: 'kind', label: 'Kind' }, { value: 'arrogant', label: 'Arrogant' },
];
const dialogueBubbleTypeOptions: SelectOption[] = [
    { value: 'normal', label: 'Normal' }, { value: 'thought', label: 'Thought' },
    { value: 'scream', label: 'Scream' }, { value: 'whisper', label: 'Whisper' },
    { value: 'narration', label: 'Narration' },
];
const dialogueFontSizeOptions: SelectOption[] = [
     { value: 'x-small', label: 'X-Small' }, { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
     { value: 'large', label: 'Large' }, { value: 'x-large', label: 'X-Large' },
];

// --- Node Form Configuration Map ---
// Defines forms for backend entities managed in React Flow
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
            { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'Enter tags...', section: 'Metadata' }, // Simplified tags input
            { name: 'coverImage', label: 'Cover Image URL', type: 'text', placeholder: 'https://...', section: 'Visuals' },
        ],
    },
    chapter: {
        icon: FileText,
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
            // Character assignment might be complex for a simple form
        ],
    },
    panel: { // Placeholder/empty config for 'panel' node type if needed
        icon: Square, // Default icon if rendered in flow
        schema: z.object({}), // Empty schema
        fields: [], // No fields specific to the flow node itself
    },
    dialogue: {
        icon: MessageSquare,
        schema: dialogueSchema,
        fields: [
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 }, section: 'Basic Info' },
            { name: 'content', label: 'Dialogue Text', type: 'textarea', placeholder: 'Enter dialogue or caption...', section: 'Content' },
            { name: 'speakerName', label: 'Speaker (Name)', type: 'text', placeholder: 'Enter speaker name...', description:"Leave blank for narrator/no speaker.", section: 'Content' },
            { name: 'style.bubbleType', label: 'Bubble Type', type: 'select', options: dialogueBubbleTypeOptions, section: 'Style' },
            { name: 'style.fontSize', label: 'Font Size (Visual)', type: 'select', options: dialogueFontSizeOptions, section: 'Style' },
            { name: 'style.fontType', label: 'Font Type (Visual)', type: 'text', placeholder: 'e.g., Bold, Italic', section: 'Style'},
            { name: 'style.emphasis', label: 'Emphasis (Visual)', type: 'checkbox', section: 'Style'},
            { name: 'emotion', label: 'Emotion', type: 'text', placeholder: 'e.g., Angry, Sad, Excited', section: 'Context' },
            // { name: 'isAiGenerated', label: 'AI Generated?', type: 'checkbox', section: 'Metadata' }, // Removed for brevity
        ],
    },
    character: {
        icon: User,
        schema: characterSchema,
        fields: [
            { name: 'name', label: 'Character Name', type: 'text', placeholder: 'Enter character name...', section: 'Basic Info' },
            { name: 'role', label: 'Role', type: 'select', options: roleOptions, placeholder: 'Select role...', section: 'Basic Info' },
            { name: 'briefDescription', label: 'Brief Description', type: 'textarea', placeholder: 'Short description...', section: 'Description' },
            { name: 'traits', label: 'Traits (comma-separated)', type: 'text', placeholder: 'e.g., brave, loyal, cunning', section: 'Description' },
            { name: 'imgUrl', label: 'Image URL', type: 'text', placeholder: 'https://...', section: 'Visuals' },
            // { name: 'referenceImage', label: 'Upload Reference Image', type: 'file', fileConfig: { accept: 'image/*' }, section: 'Visuals' },
        ],
    },
};

export default nodeFormConfig;
