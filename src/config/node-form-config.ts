
import { z } from 'zod';
import type { NodeType } from '@/types/nodes';
import type { SelectOption, ComboboxOption } from '@/components/ui/combobox'; // Assuming types are exported
import { MangaStatus } from '@/types/enums';
import {
    BookOpen, Film, Square, MessageSquare, User, Type, Hash, FileText, ToggleLeft, List, CaseSensitive, Image as ImageIcon, Search, Binary
} from 'lucide-react'; // Import icons

// --- Base Zod Schemas (can reuse from types/schemas or define specific form schemas here) ---
// Using simplified versions for demonstration. Replace with your actual schemas from src/types/schemas.ts
const projectSchema = z.object({
    id: z.string().optional(), // Usually hidden or read-only
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.nativeEnum(MangaStatus).optional(),
    genre: z.string().optional(),
    tags: z.array(z.string()).optional(), // Example for multi-select
    coverImage: z.any().optional(), // For file upload
});

const chapterSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    chapterNumber: z.number().int().positive(),
    summary: z.string().optional(),
});

const sceneSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    order: z.number().int().min(0),
    setting: z.string().optional(),
    mood: z.string().optional(), // Example for combobox
});

const panelSchema = z.object({
    id: z.string().optional(),
    order: z.number().int().min(0),
    action: z.string().optional(),
    lighting: z.string().optional(),
    backgroundImage: z.any().optional(), // File upload
});

const dialogueSchema = z.object({
    id: z.string().optional(),
    order: z.number().int().min(0),
    content: z.string().min(1),
    speakerName: z.string().optional(), // Example for combobox with custom entry
    isAiGenerated: z.boolean().optional(),
});

const characterSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
    briefDescription: z.string().optional(),
    traits: z.array(z.string()).optional(), // Multi-select
    referenceImage: z.any().optional(), // File upload
});

// --- Field Configuration Types ---

type BaseFieldConfig = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
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
];
const tagOptions: SelectOption[] = [ // For multi-select
    { value: 'magic', label: 'Magic' },
    { value: 'mecha', label: 'Mecha' },
    { value: 'school', label: 'School Life' },
    { value: 'romance', label: 'Romance' },
    { value: 'adventure', label: 'Adventure' },
];
const moodOptions: ComboboxOption[] = [
    { value: 'tense', label: 'Tense' },
    { value: 'comedic', label: 'Comedic' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'uplifting', label: 'Uplifting' },
    { value: 'melancholic', label: 'Melancholic' },
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
];

// --- Node Form Configuration Map ---

const nodeFormConfig: Record<NodeType, NodeConfig> = {
    project: {
        icon: BookOpen,
        schema: projectSchema,
        fields: [
            { name: 'title', label: 'Project Title', type: 'text', placeholder: 'Enter project title...' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter project description...' },
            { name: 'status', label: 'Status', type: 'select', options: statusOptions },
            { name: 'genre', label: 'Genre', type: 'combobox', options: genreOptions, placeholder: 'Select or type genre...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Search genres...' } },
            { name: 'tags', label: 'Tags', type: 'multi-select', options: tagOptions, placeholder: 'Select tags...' },
            { name: 'coverImage', label: 'Cover Image', type: 'file', fileConfig: { accept: 'image/*' } },
        ],
    },
    chapter: {
        icon: BookOpen, // Could use FileText or similar
        schema: chapterSchema,
        fields: [
            { name: 'title', label: 'Chapter Title', type: 'text', placeholder: 'Enter chapter title...' },
            { name: 'chapterNumber', label: 'Chapter Number', type: 'number', numberConfig: { step: 1, min: 1, defaultValue: 1 } },
            { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Enter chapter summary...' },
        ],
    },
    scene: {
        icon: Film,
        schema: sceneSchema,
        fields: [
            { name: 'title', label: 'Scene Title', type: 'text', placeholder: 'Enter scene title...' },
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 } },
            { name: 'setting', label: 'Setting', type: 'text', placeholder: 'e.g., Dark Forest, Bustling City' },
            { name: 'mood', label: 'Mood', type: 'combobox', options: moodOptions, placeholder: 'Select or type mood...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Search moods...' } },
        ],
    },
    panel: {
        icon: Square,
        schema: panelSchema,
        fields: [
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 } },
            { name: 'action', label: 'Action Description', type: 'textarea', placeholder: 'Describe the main action...' },
            { name: 'lighting', label: 'Lighting', type: 'text', placeholder: 'e.g., Dramatic shadows, Bright sunlight' },
            { name: 'backgroundImage', label: 'Background Image', type: 'file', fileConfig: { accept: 'image/*' } },
        ],
    },
    dialogue: {
        icon: MessageSquare,
        schema: dialogueSchema,
        fields: [
            { name: 'order', label: 'Order', type: 'number', numberConfig: { step: 1, min: 0, defaultValue: 0 } },
            { name: 'content', label: 'Dialogue Text', type: 'textarea', placeholder: 'Enter dialogue or caption...' },
            { name: 'speakerName', label: 'Speaker', type: 'combobox', options: [], placeholder: 'Select or type speaker...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Find character...' } }, // Options should be populated dynamically
            { name: 'isAiGenerated', label: 'AI Generated?', type: 'checkbox', placeholder: 'Check if generated by AI' },
        ],
    },
    character: {
        icon: User,
        schema: characterSchema,
        fields: [
            { name: 'name', label: 'Character Name', type: 'text', placeholder: 'Enter character name...' },
            { name: 'role', label: 'Role', type: 'select', options: roleOptions, placeholder: 'Select role...' },
            { name: 'briefDescription', label: 'Brief Description', type: 'textarea', placeholder: 'Short description...' },
            { name: 'traits', label: 'Traits', type: 'multi-select', options: traitOptions, placeholder: 'Select traits...' },
            { name: 'referenceImage', label: 'Reference Image', type: 'file', fileConfig: { accept: 'image/*' } },
        ],
    },
};

export default nodeFormConfig;
