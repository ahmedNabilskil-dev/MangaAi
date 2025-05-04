// Define the possible types for our nodes
export type NodeType = 'project' | 'chapter' | 'scene' | 'panel' | 'dialog' | 'character';

// Define the structure for the data object within each node
export interface NodeData {
    label: string; // Display label for the node
    type: NodeType; // The type of the node
    properties: Record<string, any>; // Dynamic properties based on the node type
    // Add other common fields if needed, e.g., description, icon
    icon?: React.ComponentType<{ className?: string }>; // Optional icon component
}

// You might also want specific interfaces for each node type's properties
// for better type safety, although the dynamic form handles `any` for now.
// Example:
// export interface ProjectProperties {
//   title: string;
//   description?: string;
// }

// export interface ChapterProperties {
//   title: string;
//   summary?: string;
// }

// export interface SceneProperties {
//   title: string;
//   setting?: string;
//   notes?: string;
// }

// etc.
