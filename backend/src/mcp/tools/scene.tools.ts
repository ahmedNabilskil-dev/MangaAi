import { z } from 'zod';
import { sceneSchema } from '../../types/schemas';
import { RegisteredTool } from '../tool-registry';
import { zodSchemaToMcpSchema } from '../utils/schema-converter';
import {
  createScenesHandler,
  updateScenesHandler,
} from './handlers/batch-tools.js';

// Schema for creating new scenes
const createSceneSchema = sceneSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  panels: true,
  isAiGenerated: true,
});

// Schema for updating existing scenes - all fields optional except id
const updateSceneSchema = z.object({
  id: z.string().describe('ID of the scene to update'),
  order: z
    .number()
    .optional()
    .describe('Sequential position within the parent chapter'),
  title: z.string().optional().describe('Descriptive title of the scene'),
  description: z
    .string()
    .optional()
    .describe('Rich narrative description of the scene'),
  sceneContext: z
    .object({
      locationId: z.string().optional(),
      locationOverrides: z
        .object({
          timeOfDay: z
            .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
            .optional(),
          weather: z
            .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
            .optional(),
          customPrompt: z.string().optional(),
        })
        .optional(),
      characterOutfits: z
        .array(
          z.object({
            characterId: z.string(),
            outfitId: z.string().optional(),
            customOutfit: z
              .object({
                description: z.string(),
                aiPrompt: z.string(),
              })
              .optional(),
            reason: z.string().optional(),
          }),
        )
        .optional(),
      presentCharacters: z.array(z.string()).optional(),
      environmentOverrides: z
        .object({
          timeOfDay: z
            .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
            .optional(),
          weather: z
            .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
            .optional(),
          mood: z
            .enum([
              'peaceful',
              'mysterious',
              'energetic',
              'romantic',
              'tense',
              'cheerful',
              'somber',
            ])
            .optional(),
          lighting: z
            .object({
              type: z.enum(['natural', 'artificial', 'mixed']).optional(),
              intensity: z.enum(['dim', 'moderate', 'bright']).optional(),
              color: z.string().optional(),
            })
            .optional(),
          additionalProps: z.array(z.string()).optional(),
        })
        .optional(),
      sceneNotes: z.string().optional(),
    })
    .optional()
    .describe('Scene context and overrides'),
  chapterId: z.string().optional().describe('Parent chapter ID'),
});

export const sceneTools: RegisteredTool[] = [
  {
    name: 'createScenes',
    description: `Creates one or more new compelling manga scenes with complete narrative structure.

CORE FUNCTIONALITY:
- Generate rich scene descriptions with visual and emotional detail
- Support batch operations (create multiple scenes at once)
- Automatic template integration and character outfit management
- Auto-generate description and context if not provided

INPUT REQUIREMENTS:
- title, chapterId, order (required)
- description, sceneContext (auto-generated if not provided)
- All scenes integrate with existing location and outfit templates

BATCH EXAMPLES:
- Create single: scenes=[{title: "Opening", chapterId: "ch_123", order: 1}]
- Create multiple: scenes=[{title: "Scene 1", chapterId: "ch_123", order: 1}, {title: "Scene 2", chapterId: "ch_123", order: 2}]

All scenes automatically follow narrative structure standards and template integration requirements.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        scenes: z
          .array(createSceneSchema)
          .describe('Array of scene data for new scenes'),
      }),
    ),
    handler: createScenesHandler,
  },
  {
    name: 'updateScenes',
    description: `Updates one or more existing manga scenes with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing scenes
- Support batch operations (update multiple scenes at once)
- Only modify provided fields, leave others unchanged
- Maintain narrative consistency and template integration

INPUT REQUIREMENTS:
- id (required) - ID of the scene to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update title: scenes=[{id: "scene_456", title: "Updated Title"}]
- Update description: scenes=[{id: "scene_456", description: "New scene narrative..."}]
- Update context: scenes=[{id: "scene_456", sceneContext: {locationId: "loc_123"}}]
- Update multiple: scenes=[{id: "scene_1", title: "New Title"}, {id: "scene_2", order: 3}]

Only the specified fields will be updated, preserving all other scene data.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        scenes: z
          .array(updateSceneSchema)
          .describe(
            'Array of scene updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updateScenesHandler,
  },
];
