import { z } from 'zod';
import { panelDialogueSchema } from '../../types/schemas';
import { RegisteredTool } from '../tool-registry';
import { zodSchemaToMcpSchema } from '../utils/schema-converter';
import {
  createDialoguesHandler,
  updateDialoguesHandler,
} from './handlers/batch-tools';

// Schema for creating new dialogues
const createDialogueSchema = panelDialogueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  speaker: true,
});

// Schema for updating existing dialogues - all fields optional except id
const updateDialogueSchema = z.object({
  id: z.string().describe('ID of the dialogue to update'),
  content: z.string().optional().describe('The spoken dialogue text'),
  panelId: z
    .string()
    .optional()
    .describe('ID of the panel containing this dialogue'),
  speakerId: z.string().optional().describe('ID of the character speaking'),
  emotion: z
    .enum([
      'neutral',
      'happy',
      'sad',
      'angry',
      'surprised',
      'excited',
      'worried',
      'confused',
      'determined',
      'playful',
    ])
    .optional()
    .describe('Emotional tone of the dialogue'),
  order: z.number().optional().describe('Sequential order within the panel'),
  style: z
    .object({
      bubbleType: z
        .enum(['speech', 'thought', 'shout', 'whisper', 'narration', 'sound'])
        .optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      fontWeight: z.enum(['normal', 'bold']).optional(),
      isItalic: z.boolean().optional(),
    })
    .optional()
    .describe('Visual styling for the dialogue bubble'),
  subtextNote: z
    .string()
    .optional()
    .describe('Hidden emotional subtext or context'),
});

export const dialogueTools: RegisteredTool[] = [
  {
    name: 'createDialogues',
    description: `Creates one or more new natural, character-authentic dialogues for manga panels.

CORE FUNCTIONALITY:
- Generate authentic dialogue matching character voices and emotions
- Support batch operations (create multiple dialogues at once)
- Automatic speech pattern and style integration
- Auto-generate style and subtext if not provided

INPUT REQUIREMENTS:
- content, panelId, speakerId, emotion, order (required)
- style.bubbleType, subtextNote (auto-generated if not provided)
- All dialogue follows character voice guidelines and natural conversation principles

BATCH EXAMPLES:
- Create single: dialogues=[{content: "Hello!", panelId: "panel_123", speakerId: "char_456", emotion: "happy", order: 1}]
- Create multiple: dialogues=[{content: "Hello!", panelId: "panel_123", speakerId: "char_456", emotion: "happy", order: 1}, {content: "Hi there!", panelId: "panel_123", speakerId: "char_789", emotion: "excited", order: 2}]

All dialogue automatically follows character authenticity and natural conversation standards.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        dialogues: z
          .array(createDialogueSchema)
          .describe('Array of dialogue data for new dialogues'),
      }),
    ),
    handler: createDialoguesHandler,
  },
  {
    name: 'updateDialogues',
    description: `Updates one or more existing manga panel dialogues with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing dialogues
- Support batch operations (update multiple dialogues at once)
- Only modify provided fields, leave others unchanged
- Maintain character voice and conversation flow consistency

INPUT REQUIREMENTS:
- id (required) - ID of the dialogue to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update content: dialogues=[{id: "dialogue_456", content: "Updated text"}]
- Update emotion: dialogues=[{id: "dialogue_456", emotion: "angry"}]
- Update style: dialogues=[{id: "dialogue_456", style: {bubbleType: "shout"}}]
- Update multiple: dialogues=[{id: "dialogue_1", content: "New text"}, {id: "dialogue_2", order: 2}]

Only the specified fields will be updated, preserving all other dialogue data.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        dialogues: z
          .array(updateDialogueSchema)
          .describe(
            'Array of dialogue updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updateDialoguesHandler,
  },
];
