import type { z } from 'zod';
import type {
    mangaProjectSchema,
    chapterSchema,
    characterSchema,
    sceneSchema,
    panelSchema,
    panelDialogueSchema
} from './schemas'; // Import zod schemas

// Define the possible types for our nodes, aligning with TypeORM entities + original types
export type NodeType =
    | 'project' // Corresponds to MangaProject
    | 'chapter' // Corresponds to Chapter
    | 'scene' // Corresponds to Scene
    | 'panel' // Corresponds to Panel
    | 'dialogue' // Corresponds to PanelDialogue
    | 'character'; // Corresponds to Character

// Define the structure for the data object within each node
export interface NodeData<T extends NodeType = NodeType> {
    label: string; // Display label for the node
    type: T; // The type of the node
    // Use conditional types for properties based on zod schemas
    properties: T extends 'project' ? z.infer<typeof mangaProjectSchema> :
                T extends 'chapter' ? z.infer<typeof chapterSchema> :
                T extends 'character' ? z.infer<typeof characterSchema> :
                T extends 'scene' ? z.infer<typeof sceneSchema> :
                T extends 'panel' ? z.infer<typeof panelSchema> :
                T extends 'dialogue' ? z.infer<typeof panelDialogueSchema> :
                Record<string, any>; // Fallback for safety
    icon?: React.ComponentType<{ className?: string }>; // Optional icon component
}
