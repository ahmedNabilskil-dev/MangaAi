import { z } from 'zod';
import { chapterSchema } from '../../types/schemas';
import { RegisteredTool } from '../tool-registry';
import { zodSchemaToMcpSchema } from '../utils/schema-converter';
import {
  createChaptersHandler,
  updateChaptersHandler,
} from './handlers/batch-tools.js';

// Schema for creating new chapters
const createChapterSchema = chapterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  scenes: true,
  coverImageUrl: true,
  isAiGenerated: true,
  isPublished: true,
  viewCount: true,
});

// Schema for updating existing chapters - all fields optional except id
const updateChapterSchema = z.object({
  id: z.string().describe('ID of the chapter to update'),
  chapterNumber: z
    .number()
    .optional()
    .describe('Sequential chapter number in the manga series'),
  title: z.string().optional().describe('Chapter title'),
  narrative: z
    .string()
    .optional()
    .describe('Complete chapter narrative (600-800 words)'),
  purpose: z
    .string()
    .optional()
    .describe('Narrative function this chapter serves in the story arc'),
  tone: z
    .string()
    .optional()
    .describe('Emotional atmosphere and mood of the chapter'),
  keyCharacters: z
    .array(z.string())
    .optional()
    .describe('Names of important characters in this chapter'),
  mangaProjectId: z
    .string()
    .optional()
    .describe('ID of the parent manga project'),
});

export const chapterTools: RegisteredTool[] = [
  {
    name: 'createChapters',
    description: `Creates one or more new manga chapters with complete narrative structure.

CORE FUNCTIONALITY:
- Generate compelling chapter narratives (600-800 words each)
- Support batch operations (create multiple chapters at once)
- Integrate with existing location and outfit templates automatically
- Auto-generate narrative, mood, and structure if not provided

INPUT REQUIREMENTS:
- title, mangaProjectId (required)
- chapterNumber, narrative, purpose, tone (auto-generated if not provided)
- All content follows project style guidelines and template system

BATCH EXAMPLES:
- Create single: chapters=[{title: "Chapter 1", mangaProjectId: "proj_123"}]
- Create multiple: chapters=[{title: "Ch 1", mangaProjectId: "proj_123"}, {title: "Ch 2", mangaProjectId: "proj_123"}]

All chapters automatically integrate with existing templates and follow established content creation standards.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapters: z
          .array(createChapterSchema)
          .min(1)
          .describe('Array of chapter data for new chapters'),
      }),
    ),
    handler: createChaptersHandler,
  },
  {
    name: 'updateChapters',
    description: `Updates one or more existing manga chapters with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing chapters
- Support batch operations (update multiple chapters at once)
- Only modify provided fields, leave others unchanged
- Maintain story consistency and template integration

INPUT REQUIREMENTS:
- id (required) - ID of the chapter to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update title only: chapters=[{id: "ch_456", title: "New Title"}]
- Update narrative: chapters=[{id: "ch_456", narrative: "New story content..."}]
- Update multiple: chapters=[{id: "ch_1", title: "New Title 1"}, {id: "ch_2", narrative: "New story..."}]
- Update multiple fields: chapters=[{id: "ch_456", title: "New Title", tone: "mysterious"}]

Only the specified fields will be updated, preserving all other chapter data.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapters: z
          .array(updateChapterSchema)
          .min(1)
          .describe(
            'Array of chapter updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updateChaptersHandler,
  },
];
