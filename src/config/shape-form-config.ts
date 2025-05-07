
import { z } from 'zod';
import { type ShapeConfig } from '@/types/editor';
import { type SelectOption } from '@/components/ui/select';
import { type ComboboxOption } from '@/components/ui/combobox';
import { Square, MessageCircle, Image as ImageIcon, Type as TextIcon } from 'lucide-react'; // Import icons

// --- Zod Schemas for Fabric Shape Properties (from node-form-config) ---
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


// --- Field Configuration Types (copied from node-form-config) ---
type BaseFieldConfig = {
    name: string;
    label: string;
    description?: string;
    placeholder?: string;
    section?: string; // Grouping property
};

type TextFieldConfig = BaseFieldConfig & { type: 'text' };
type TextAreaFieldConfig = BaseFieldConfig & { type: 'textarea' };
type NumberFieldConfig = BaseFieldConfig & { type: 'number'; numberConfig?: { step?: number | string; min?: number; max?: number, defaultValue?: number } };
type CheckboxFieldConfig = BaseFieldConfig & { type: 'checkbox' };
type SelectFieldConfig = BaseFieldConfig & { type: 'select'; options: SelectOption[] };
type ComboboxFieldConfig = BaseFieldConfig & { type: 'combobox'; options: ComboboxOption[]; comboboxConfig?: { searchPlaceholder?: string; emptyText?: string, allowCustomValue?: boolean } };
type MultiSelectFieldConfig = BaseFieldConfig & { type: 'multi-select'; options: SelectOption[]; multiselectConfig?: {} };
type FileFieldConfig = BaseFieldConfig & { type: 'file'; fileConfig?: { accept?: string } };
type SliderFieldConfig = BaseFieldConfig & { type: 'slider'; sliderConfig: { min: number; max: number; step: number; defaultValue?: number } };
type ColorFieldConfig = BaseFieldConfig & { type: 'color' };

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

// --- Shape Type Configuration ---
type ShapeFormConfigType = {
    icon: React.ElementType;
    schema: z.ZodObject<any, any>;
    fields: FormFieldConfig[];
};

// --- Sample Options (copied from node-form-config) ---
const bubbleTypeOptions: SelectOption[] = [
    { value: 'speech', label: 'Speech' },
    { value: 'thought', label: 'Thought' },
    { value: 'scream', label: 'Scream/Loud' },
    { value: 'narration', label: 'Narration Box' },
];
const availableFonts: SelectOption[] = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'Impact, charcoal, sans-serif', label: 'Impact' },
    { value: "'Roboto', sans-serif", label: "Roboto" },
    { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP (Japanese)" },
    { value: "'Manga Temple', cursive", label: "Manga Temple" },
    { value: "'Anime Ace', sans-serif", label: "Anime Ace" },
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

// --- Shape Form Configuration Map ---
const shapeFormConfig: Record<ShapeConfig['type'], ShapeFormConfigType> = {
    panel: {
        icon: Square,
        schema: panelShapeSchema,
        fields: [
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
            { name: 'fill', label: 'Fill Color', type: 'color', section: 'Appearance' },
            { name: 'stroke', label: 'Stroke Color', type: 'color', section: 'Appearance' },
            { name: 'strokeWidth', label: 'Stroke Width', type: 'number', numberConfig: { min: 0 }, section: 'Appearance' },
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
    bubble: {
        icon: MessageCircle,
        schema: bubbleShapeSchema,
        fields: [
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
            { name: 'props.text', label: 'Text', type: 'textarea', placeholder: 'Enter bubble text...', section: 'Content' },
            { name: 'props.bubbleType', label: 'Bubble Type', type: 'select', options: bubbleTypeOptions, section: 'Content' },
            { name: 'props.tailDirection', label: 'Tail Direction', type: 'select', options: [ { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },], description: "Only affects speech/scream bubbles", section: 'Content' },
            { name: 'props.fontSize', label: 'Font Size', type: 'number', numberConfig: { min: 1 }, section: 'Text Style' },
            { name: 'props.fontFamily', label: 'Font Family', type: 'select', options: availableFonts, section: 'Text Style' },
            { name: 'props.textColor', label: 'Text Color', type: 'color', section: 'Text Style' },
            { name: 'fill', label: 'Fill Color', type: 'color', section: 'Bubble Style' },
            { name: 'stroke', label: 'Stroke Color', type: 'color', section: 'Bubble Style' },
            { name: 'strokeWidth', label: 'Stroke Width', type: 'number', numberConfig: { min: 0 }, section: 'Bubble Style' },
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
    image: {
        icon: ImageIcon,
        schema: imageShapeSchema,
        fields: [
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
            { name: 'src', label: 'Image Source', type: 'file', fileConfig: { accept: 'image/*' }, description: 'Enter URL or upload file.', section: 'Image' },
            { name: 'props.filters.grayscale', label: 'Grayscale', type: 'checkbox', section: 'Filters'},
            { name: 'props.filters.sepia', label: 'Sepia', type: 'checkbox', section: 'Filters'},
            { name: 'props.filters.brightness', label: 'Brightness', type: 'slider', sliderConfig: { min: -1, max: 1, step: 0.01 }, section: 'Filters'},
            { name: 'props.filters.contrast', label: 'Contrast', type: 'slider', sliderConfig: { min: -1, max: 1, step: 0.01 }, section: 'Filters'},
            { name: 'stroke', label: 'Border Color', type: 'color', section: 'Appearance' },
            { name: 'strokeWidth', label: 'Border Width', type: 'number', numberConfig: { min: 0 }, section: 'Appearance' },
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
    text: {
        icon: TextIcon,
        schema: textShapeSchema,
        fields: [
            { name: 'left', label: 'Left (X)', type: 'number', section: 'Transform' },
            { name: 'top', label: 'Top (Y)', type: 'number', section: 'Transform' },
            { name: 'width', label: 'Width', type: 'number', numberConfig: { min: 1 }, section: 'Transform' },
            // { name: 'height', label: 'Height', type: 'number', numberConfig: { min: 1 }, section: 'Transform' }, // Height often auto-adjusts
            { name: 'angle', label: 'Rotation (°)', type: 'number', section: 'Transform' },
            { name: 'opacity', label: 'Opacity', type: 'slider', sliderConfig: { min: 0, max: 1, step: 0.01 }, section: 'Appearance' },
            { name: 'props.text', label: 'Text Content', type: 'textarea', section: 'Content' },
            { name: 'props.fontSize', label: 'Font Size', type: 'number', numberConfig: { min: 1 }, section: 'Style' },
            { name: 'props.fontFamily', label: 'Font Family', type: 'select', options: availableFonts, section: 'Style' },
            { name: 'fill', label: 'Text Color', type: 'color', section: 'Style' }, // Text color is fill
            { name: 'props.fontWeight', label: 'Font Weight', type: 'select', options: fontWeightOptions, section: 'Style' },
            { name: 'props.textAlign', label: 'Text Align', type: 'select', options: textAlignOptions, section: 'Style' },
            { name: 'props.lineHeight', label: 'Line Height', type: 'number', numberConfig: { step: 0.1, min: 0.5 }, section: 'Style' },
            { name: 'props.textBackgroundColor', label: 'Background Color', type: 'color', section: 'Style' },
            { name: 'stroke', label: 'Outline Color', type: 'color', section: 'Style' },
            { name: 'strokeWidth', label: 'Outline Width', type: 'number', numberConfig: { min: 0 }, section: 'Style' },
            { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Interaction' },
            { name: 'locked', label: 'Locked', type: 'checkbox', section: 'Interaction' },
        ]
    },
};

export default shapeFormConfig;
