// src/types/editor.d.ts
import type { fabric } from 'fabric'; // Import fabric types if needed

// Base properties common to all shapes using Fabric.js conventions
interface BaseShapeConfig {
  id: string;
  type: 'panel' | 'bubble' | 'image' | 'text'; // Add more types as needed
  left: number; // Fabric uses 'left'
  top: number;  // Fabric uses 'top'
  width: number;
  height: number;
  angle?: number; // Fabric uses 'angle' for rotation
  scaleX?: number;
  scaleY?: number;
  fill?: string | fabric.Pattern | fabric.Gradient;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
  // Add other common fabric.Object properties
  props?: Record<string, any>; // For custom application-specific data or less common fabric props
}

// --- Panel Shape ---
export interface PanelProps {
    // Fabric handles fill, stroke, strokeWidth at BaseShapeConfig level
    cornerRadius?: number; // Fabric Rect doesn't have direct cornerRadius, might need custom drawing or use fabric.Path
    // Add other specific panel properties if needed
}
export interface PanelShapeConfig extends BaseShapeConfig {
  type: 'panel';
  props?: PanelProps & fabric.IRectOptions; // Combine specific props with fabric options
}

// --- Bubble Shape ---
// Bubbles will be more complex with Fabric, likely using fabric.Group or custom fabric.Path
export interface BubbleProps {
    text?: string;
    bubbleType?: 'speech' | 'thought' | 'scream' | 'narration';
    tailDirection?: 'left' | 'right' | 'top' | 'bottom'; // Logic to draw tail needed
    fontFamily?: string; // Added fontFamily
    fontSize?: number;
    textColor?: string; // Separate text color
    // Add other bubble styling props
}
export interface BubbleShapeConfig extends BaseShapeConfig {
  type: 'bubble';
  props?: BubbleProps & fabric.IGroupOptions; // Use Group options if grouping Text and Shape
}

// --- Image Shape ---
export interface ImageProps {
   // Fabric handles stroke, strokeWidth, opacity at BaseShapeConfig level
   // src is handled differently, usually loaded into a fabric.Image instance
   crossOrigin?: string;
   filters?: fabric.IBaseFilter[]; // For image filters
}
export interface ImageShapeConfig extends BaseShapeConfig {
  type: 'image';
  src?: string; // Store src for reloading/reference
  props?: ImageProps & fabric.IImageOptions;
}

// --- Text Shape ---
export interface TextProps {
    text?: string;
    fontFamily?: string; // Ensure fontFamily is here
    fontSize?: number;
    fontWeight?: string | number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    textBackgroundColor?: string;
    // Fabric Textbox handles wrapping, use it over IText for editable multiline text
}
export interface TextShapeConfig extends BaseShapeConfig {
    type: 'text';
    // Use ITextboxOptions for multi-line editable text
    props?: TextProps & fabric.ITextboxOptions;
}

// Union type for any shape configuration
export type ShapeConfig =
  | PanelShapeConfig
  | BubbleShapeConfig
  | ImageShapeConfig
  | TextShapeConfig; // Add other shape types here

// Type for the properties panel form values (Not directly used for rendering inputs now)
// export type ShapePropertiesFormValues = Partial<Omit<BaseShapeConfig, 'type' | 'id' | 'props'>> & {
//     props?: Record<string, any>;
//     src?: string;
//     text?: string;
// };
