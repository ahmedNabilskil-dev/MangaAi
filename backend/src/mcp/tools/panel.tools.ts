import { z } from 'zod';
import { panelSchema } from '../../types/schemas';
import { RegisteredTool } from '../tool-registry';
import { zodSchemaToMcpSchema } from '../utils/schema-converter';
import {
  createPanelsHandler,
  updatePanelsHandler,
} from './handlers/batch-tools';

// Schema for creating new panels
const createPanelSchema = panelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dialogues: true,
  characters: true,
  imageUrl: true,
  isAiGenerated: true,
  negativePrompt: true,
});

// Schema for updating existing panels - all fields optional except id
const updatePanelSchema = z.object({
  id: z.string().describe('ID of the panel to update'),
  order: z.number().optional().describe('Sequential position within the scene'),
  panelContext: z
    .object({
      cameraAngle: z
        .enum([
          'wide-shot',
          'medium-shot',
          'close-up',
          'extreme-close-up',
          'bird-eye-view',
          'worm-eye-view',
          'over-shoulder',
        ])
        .optional(),
      cameraType: z
        .enum(['establishing', 'action', 'reaction', 'detail', 'transition'])
        .optional(),
      composition: z
        .object({
          focusPoint: z.string().optional(),
          framing: z.enum(['tight', 'loose', 'rule-of-thirds']).optional(),
          depth: z.enum(['shallow', 'deep']).optional(),
        })
        .optional(),
      characterPoses: z
        .array(
          z.object({
            characterId: z.string(),
            pose: z.string(),
            expression: z.string(),
            position: z.enum(['foreground', 'midground', 'background']),
          }),
        )
        .optional(),
      environmentElements: z
        .array(z.string())
        .optional()
        .describe('Important objects or setting details'),
      mood: z
        .enum([
          'peaceful',
          'tense',
          'exciting',
          'mysterious',
          'romantic',
          'comedic',
          'dramatic',
        ])
        .optional(),
      lighting: z
        .object({
          direction: z
            .enum(['front', 'back', 'side', 'top', 'bottom'])
            .optional(),
          intensity: z.enum(['soft', 'harsh', 'dramatic']).optional(),
          color: z.string().optional(),
        })
        .optional(),
      aiPrompt: z.string().optional(),
    })
    .optional()
    .describe('Detailed panel composition and visual context'),
  sceneId: z.string().optional().describe('Parent scene ID'),
});

export const PanelTools: RegisteredTool[] = [
  {
    name: 'createPanels',
    description: `Creates one or more new visually compelling manga panels with professional composition.

CORE FUNCTIONALITY:
- Generate detailed panel compositions with character positioning
- Support batch operations (create multiple panels at once)
- Automatic template inheritance from parent scene
- Auto-generate panel context if not provided

INPUT REQUIREMENTS:
- sceneId, order (required)
- panelContext (auto-generated if not provided with camera settings, character poses, environmental elements)
- All panels inherit location context and integrate with template system

BATCH EXAMPLES:
- Create single: panels=[{sceneId: "scene_123", order: 1}]
- Create multiple: panels=[{sceneId: "scene_123", order: 1}, {sceneId: "scene_123", order: 2}]

All panels automatically follow visual composition standards and template integration requirements.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panels: z
          .array(createPanelSchema)
          .describe('Array of panel data for new panels'),
      }),
    ),
    handler: createPanelsHandler,
  },
  {
    name: 'updatePanels',
    description: `Updates one or more existing manga panels with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing panels
- Support batch operations (update multiple panels at once)
- Only modify provided fields, leave others unchanged
- Maintain visual composition and template integration

INPUT REQUIREMENTS:
- id (required) - ID of the panel to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update order: panels=[{id: "panel_456", order: 2}]
- Update context: panels=[{id: "panel_456", panelContext: {cameraAngle: "close-up"}}]
- Update multiple: panels=[{id: "panel_1", order: 1}, {id: "panel_2", panelContext: {mood: "tense"}}]

Only the specified fields will be updated, preserving all other panel data.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panels: z
          .array(updatePanelSchema)
          .describe(
            'Array of panel updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updatePanelsHandler,
  },
];
