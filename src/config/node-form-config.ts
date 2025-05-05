import { z } from 'zod';
import type { NodeType } from '@/types/nodes';
import type { SelectOption } from '@/components/ui/select'; // Adjusted import if needed
import type { ComboboxOption } from '@/components/ui/combobox';
import { MangaStatus } from '@/types/enums';
import {
    BookOpen, Film, Square, MessageSquare, User, Type, Hash, FileText, ToggleLeft, List, CaseSensitive, Image as ImageIcon, Search, Binary, Settings, Paintbrush, Tag, Info, ScanText, ImagePlay, Camera, Smile, Feather, Upload, Speech, Cloud
} from 'lucide-react'; // Import more specific icons


// --- Base Zod Schemas (simplified for forms, align with ShapeConfig where possible) ---
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

// Schema for Fabric Panel Shape (simplified)
const panelShapeSchema = z.object({
    id: z.string().optional(),
    left: z.number().optional(),
    top: z.number().optional(),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
    angle: z.number().optional().default(0),
    fill: z.string().optional().default('rgba(220, 220, 220, 0.5)'),
    stroke: z.string().optional().default('black'),
    strokeWidth: z.number().min(0).optional().default(1),
    opacity: z.number().min(0).max(1).optional().default(1),
    visible: z.boolean().optional().default(true),
    locked: z.boolean().optional().default(false),
    // No specific panel props defined currently
});

// Schema for Fabric Bubble Shape
const bubbleShapeSchema = z.object({
    id: z.string().optional(),
    left: z.number().optional(),
    top: z.number().optional(),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
    angle: z.number().optional().default(0),
    fill: z.string().optional().default('white'),
    stroke: z.string().optional().default('black'),
    strokeWidth: z.number().min(0).optional().default(1.5),
    opacity: z.number().min(0).max(1).optional().default(1),
    visible: z.boolean().optional().default(true),
    locked: z.boolean().optional().default(false),
    props: z.object({
        text: z.string().optional().default('Bubble'),
        bubbleType: z.enum(['speech', 'thought', 'scream', 'narration']).optional().default('speech'),
        tailDirection: z.enum(['left', 'right', 'top', 'bottom']).optional().default('bottom'),
        fontFamily: z.string().optional().default('Arial, sans-serif'),
        fontSize: z.number().positive().optional().default(14),
        textColor: z.string().optional().default('black'),
    }).optional(),
});

// Schema for Fabric Image Shape
const imageShapeSchema = z.object({
    id: z.string().optional(),
    left: z.number().optional(),
    top: z.number().optional(),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
    angle: z.number().optional().default(0),
    opacity: z.number().min(0).max(1).optional().default(1),
    visible: z.boolean().optional().default(true),
    locked: z.boolean().optional().default(false),
    src: z.any().optional(), // Allow string URL or File object
    stroke: z.string().optional(), // Optional border
    strokeWidth: z.number().min(0).optional().default(0),
    props: z.object({
        crossOrigin: z.string().optional().default('anonymous'),
        filters: z.object({
            grayscale: z.boolean().optional().default(false),
            sepia: z.boolean().optional().default(false),
            brightness: z.number().min(-1).max(1).optional().default(0),
            contrast: z.number().min(-1).max(1).optional().default(0),
        }).optional(),
    }).optional(),
});

// Schema for Fabric Text Shape
const textShapeSchema = z.object({
    id: z.string().optional(),
    left: z.number().optional(),
    top: z.number().optional(),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"), // Height might be calculated by Fabric
    angle: z.number().optional().default(0),
    fill: z.string().optional().default('black'), // Text color
    opacity: z.number().min(0).max(1).optional().default(1),
    visible: z.boolean().optional().default(true),
    locked: z.boolean().optional().default(false),
    props: z.object({
        text: z.string().optional().default('New Text'),
        fontFamily: z.string().optional().default('Arial, sans-serif'),
        fontSize: z.number().positive().optional().default(20),
        fontWeight: z.string().optional().default('normal'),
        textAlign: z.enum(['left', 'center', 'right', 'justify']).optional().default('left'),
        lineHeight: z.number().optional(),
        textBackgroundColor: z.string().optional(),
    }).optional(),
    // Text shapes don't typically have stroke/strokeWidth for the text itself
    stroke: z.string().optional(),
    strokeWidth: z.number().min(0).optional().default(0),
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
type SliderFieldConfig = BaseFieldConfig & { type: 'slider'; sliderConfig: { min: number; max: number; step: number; defaultValue?: number } }; // Slider config
type ColorFieldConfig = BaseFieldConfig & { type: 'color' }; // Color Picker


export type FormFieldConfig =
    | TextFieldConfig
    | TextAreaFieldConfig
    | NumberFieldConfig
    | CheckboxFieldConfig
    | SelectFieldConfig
    | ComboboxFieldConfig
    | MultiSelectFieldConfig
    | FileFieldConfig
    | SliderFieldConfig
    | ColorFieldConfig;

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
    { value: 'speech', label: 'Speech' },
    { value: 'thought', label: 'Thought' },
    { value: 'scream', label: 'Scream/Loud' },
    { value: 'whisper', label: 'Whisper/Quiet' },
    { value: 'narration', label: 'Narration Box' },
];
const availableFonts = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'Impact, charcoal, sans-serif', label: 'Impact' },
    { value: "'Roboto', sans-serif", label: "Roboto" },
    { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP (Japanese)" },
    { value: "'Manga Temple', cursive", label: "Manga Temple" }, // Example Manga Font
    { value: "'Anime Ace', sans-serif", label: "Anime Ace" }, // Example Manga Font
];

const fontWeightOptions: SelectOption[] = [
    { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' },
    { value: '100', label: '100' }, { value: '200', label: '200' }, { value: '300', label: '300' },
    { value: '400', label: '400 (Normal)' }, { value: '500', label: '500 (Medium)' }, { value: '600', label: '600 (Semi-Bold)' },
    { value: '700', label: '700 (Bold)' }, { value: '800', label: '800 (Extra-Bold)' }, { value: '900', label: '900 (Black)' },
];

const textAlignOptions: SelectOption[] = [
    { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }, { value: 'justify', label: 'Justify' },
];


// --- Node Form Configuration Map ---
// This map now includes configurations for both backend entities and Fabric shapes
// Ensure keys match the 'type' property used for selection (e.g., 'project', 'chapter', 'panel', 'text')

const nodeFormConfig: Record<NodeType | string, NodeConfig> = {
    project: {
        icon: BookOpen,
        schema: projectSchema,
        fields: [
            { name: 'title', label: 'Project Title', type: 'text', placeholder: 'Enter project title...', section: 'Basic Info' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter project description...', section: 'Basic Info' },
            { name: 'status', label: 'Status', type: 'select', options: statusOptions, section: 'Metadata' },
            { name: 'genre', label: 'Genre', type: 'combobox', options: genreOptions, placeholder: 'Select or type genre...', comboboxConfig: { allowCustomValue: true, searchPlaceholder: 'Search genres...' }, section: 'Metadata' },
            { name: 'artStyle', label: 'Art Style', type: 'text', placeholder: 'e.g., Shonen, Shojo, Chibi', section: 'Metadata' },
            // { name: 'tags', label: 'Tags', type: 'multi-select', options: tagOptions, placeholder: 'Select tags...', section: 'Metadata' },
            { name: 'tags', label: 'Tags', type: 'text', placeholder: 'Enter tags, comma-separated', section: 'Metadata' },
            { name: 'coverImage', label: 'Cover Image URL', type: 'text', fileConfig: { accept: 'image/*' }, description: "Enter Image URL.", section: 'Visuals' },
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
     // --- Fabric Shape Configurations ---
    panel: { // Corresponds to 'panel' shape type in editor-store
        icon: Square,
        schema: panelShapeSchema, // Use the dedicated schema for fabric panel
        fields: [
            // General Transform
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
            // Appearance
            { name: 'fill', label: 'Fill Color', type: 'color', section: 'Appearance' },
            { name: 'stroke', label: 'Stroke Color', type: 'color', section: 'Appearance' },
            { name: 'strokeWidth', label: 'Stroke Width', type: 'number', numberConfig: { min: 0 }, section: 'Appearance' },
            // Interaction
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
            // Panel Specific (if any needed beyond rect)
        ]
    },
    bubble: { // Corresponds to 'bubble' shape type
        icon: Speech,
        schema: bubbleShapeSchema,
        fields: [
             // General Transform
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
             // Bubble Specific
            { name: 'props.text', label: 'Text', type: 'textarea', placeholder: 'Enter bubble text...', section: 'Content' },
            { name: 'props.bubbleType', label: 'Bubble Type', type: 'select', options: bubbleTypeOptions, section: 'Content' },
            { name: 'props.tailDirection', label: 'Tail Direction', type: 'select', options: [ { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },], description: "Only affects speech/scream bubbles", section: 'Content' },
             // Text Style within Bubble
            { name: 'props.fontSize', label: 'Font Size', type: 'number', numberConfig: { min: 1 }, section: 'Text Style' },
            { name: 'props.fontFamily', label: 'Font Family', type: 'select', options: availableFonts, section: 'Text Style' },
            { name: 'props.textColor', label: 'Text Color', type: 'color', section: 'Text Style' },
             // Bubble Appearance
            { name: 'fill', label: 'Fill Color', type: 'color', section: 'Bubble Style' },
            { name: 'stroke', label: 'Stroke Color', type: 'color', section: 'Bubble Style' },
            { name: 'strokeWidth', label: 'Stroke Width', type: 'number', numberConfig: { min: 0 }, section: 'Bubble Style' },
             // Interaction
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
    image: { // Corresponds to 'image' shape type
        icon: ImageIcon,
        schema: imageShapeSchema,
        fields: [
             // General Transform
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
             // Image Specific
            { name: 'src', label: 'Image Source', type: 'file', fileConfig: { accept: 'image/*' }, description: 'Enter URL or upload file.', section: 'Image' },
             // Filters
            { name: 'props.filters.grayscale', label: 'Grayscale', type: 'checkbox', section: 'Filters'},
            { name: 'props.filters.sepia', label: 'Sepia', type: 'checkbox', section: 'Filters'},
            { name: 'props.filters.brightness', label: 'Brightness', type: 'slider', sliderConfig: { min: -1, max: 1, step: 0.01 }, section: 'Filters'},
            { name: 'props.filters.contrast', label: 'Contrast', type: 'slider', sliderConfig: { min: -1, max: 1, step: 0.01 }, section: 'Filters'},
            // Optional Border
            { name: 'stroke', label: 'Border Color', type: 'color', section: 'Appearance' },
            { name: 'strokeWidth', label: 'Border Width', type: 'number', numberConfig: { min: 0 }, section: 'Appearance' },
             // Interaction
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
     text: { // Corresponds to 'text' shape type
        icon: Type,
        schema: textShapeSchema,
        fields: [
             // General Transform
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            // { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' }, // Height often auto-adjusts
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
             // Text Content & Style
            { name: 'props.text', label: 'Text Content', type: 'textarea', section: 'Content' },
            { name: 'props.fontSize', label: 'Font Size', type: 'number', numberConfig: { min: 1 }, section: 'Style' },
            { name: 'props.fontFamily', label: 'Font Family', type: 'select', options: availableFonts, section: 'Style' },
            { name: 'fill', label: 'Text Color', type: 'color', section: 'Style' }, // Text color is fill
            { name: 'props.fontWeight', label: 'Font Weight', type: 'select', options: fontWeightOptions, section: 'Style' },
            { name: 'props.textAlign', label: 'Text Align', type: 'select', options: textAlignOptions, section: 'Style' },
            { name: 'props.lineHeight', label: 'Line Height', type: 'number', numberConfig: { step: 0.1, min: 0.5 }, section: 'Style' },
            { name: 'props.textBackgroundColor', label: 'Background Color', type: 'color', section: 'Style' },
            // Optional Stroke (for text outline)
            { name: 'stroke', label: 'Outline Color', type: 'color', section: 'Style' },
            { name: 'strokeWidth', label: 'Outline Width', type: 'number', numberConfig: { min: 0 }, section: 'Style' },
             // Interaction
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
    // --- Backend Entity Forms (Keep as before) ---
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
            // { name: 'traits', label: 'Traits', type: 'multi-select', options: traitOptions, placeholder: 'Select character traits...', section: 'Description' },
            { name: 'traits', label: 'Traits', type: 'text', placeholder: 'Enter traits, comma-separated', section: 'Description' },
            { name: 'referenceImage', label: 'Reference Image', type: 'file', fileConfig: { accept: 'image/*' }, description: "Upload a reference image.", section: 'Visuals' },
             { name: 'imgUrl', label: 'Current Image URL', type: 'text', placeholder: 'Image URL (if set)', section: 'Visuals' }, // Display existing URL
        ],
    },
};

export default nodeFormConfig;
