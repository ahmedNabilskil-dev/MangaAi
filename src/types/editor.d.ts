// src/types/editor.d.ts

import Konva from 'konva';

// Base properties common to all shapes
interface BaseShapeConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  draggable?: boolean;
  // Add any other common Konva node properties you might use
  // e.g., scaleX, scaleY, offsetX, offsetY, fill, stroke, strokeWidth, etc.
  // These can also be in the 'props' object if preferred
}

// --- Panel Shape ---
export interface PanelProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    // Add other specific panel properties if needed
}
export interface PanelShapeConfig extends BaseShapeConfig {
  type: 'panel';
  props?: PanelProps;
}

// --- Bubble Shape ---
export interface BubbleProps {
    text?: string;
    bubbleType?: 'speech' | 'thought' | 'scream' | 'narration';
    tailDirection?: 'left' | 'right' | 'top' | 'bottom';
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    // Add other bubble styling props
}
export interface BubbleShapeConfig extends BaseShapeConfig {
  type: 'bubble';
  props?: BubbleProps;
}

// --- Image Shape ---
export interface ImageProps {
    // src is now a top-level property for easier access
    stroke?: string; // Optional border
    strokeWidth?: number;
    cornerRadius?: number; // If you want rounded image corners
    opacity?: number;
    // filter effects etc.
}

export interface ImageShapeConfig extends BaseShapeConfig {
  type: 'image';
  src?: string; // Image source URL (can be data URL)
  props?: ImageProps; // Optional additional Konva props
}

// --- Text Shape ---
export interface TextProps {
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    // Add stroke, padding etc. if needed
}
export interface TextShapeConfig extends BaseShapeConfig {
    type: 'text';
    props?: TextProps;
}

// Union type for any shape configuration
export type ShapeConfig =
  | PanelShapeConfig
  | BubbleShapeConfig
  | ImageShapeConfig
  | TextShapeConfig; // Add other shape types here

// Type for the properties panel form values
// This might vary depending on the selected shape type
export type ShapePropertiesFormValues = Partial<BaseShapeConfig> & {
    props?: Record<string, any>;
    // Add specific fields that might not be direct Konva props
    src?: string; // For image URL input
};
