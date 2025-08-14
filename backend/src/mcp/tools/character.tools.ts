import { z } from 'zod';
import { characterSchema } from '../../types/schemas';
import { RegisteredTool } from '../tool-registry';
import { zodSchemaToMcpSchema } from '../utils/schema-converter';
import {
  createCharactersHandler,
  updateCharactersHandler,
} from './handlers/batch-tools';

// Schema for creating new characters
const createCharacterSchema = characterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isAiGenerated: true,
  imgUrl: true,
});

// Schema for updating existing characters - all fields optional except id
const updateCharacterSchema = z.object({
  id: z.string().describe('ID of the character to update'),
  name: z.string().optional().describe('Full name of the character'),
  age: z.number().optional().describe("Character's age in years"),
  gender: z.string().optional().describe("Character's gender identity"),
  bodyAttributes: z
    .object({
      height: z.string().optional(),
      bodyType: z.string().optional(),
      proportions: z.string().optional(),
    })
    .optional()
    .describe('Physical body characteristics'),
  facialAttributes: z
    .object({
      faceShape: z.string().optional(),
      skinTone: z.string().optional(),
      eyeColor: z.string().optional(),
      eyeShape: z.string().optional(),
      noseType: z.string().optional(),
      mouthType: z.string().optional(),
      jawline: z.string().optional(),
    })
    .optional()
    .describe('Detailed facial features'),
  hairAttributes: z
    .object({
      hairColor: z.string().optional(),
      hairstyle: z.string().optional(),
      hairLength: z.string().optional(),
      hairTexture: z.string().optional(),
      specialHairFeatures: z.string().optional(),
    })
    .optional()
    .describe('Complete hair design'),
  distinctiveFeatures: z
    .array(z.string())
    .optional()
    .describe('Unique physical traits'),
  physicalMannerisms: z
    .array(z.string())
    .optional()
    .describe('Characteristic body language'),
  posture: z.string().optional().describe('Default body stance and bearing'),
  styleGuide: z
    .object({
      artStyle: z.string().optional(),
      lineweight: z.string().optional(),
      shadingStyle: z.string().optional(),
      colorStyle: z.string().optional(),
    })
    .optional()
    .describe('Artistic guidelines'),
  defaultOutfitId: z.string().optional().describe('Primary outfit template ID'),
  consistencyPrompt: z
    .string()
    .optional()
    .describe('Standardized AI generation prompt'),
  negativePrompt: z
    .string()
    .optional()
    .describe('Negative AI generation prompt'),
  role: z
    .enum(['protagonist', 'antagonist', 'supporting', 'minor'])
    .optional()
    .describe("Character's narrative importance"),
  briefDescription: z.string().optional().describe('Concise character summary'),
  personality: z.string().optional().describe('Detailed psychological profile'),
  abilities: z.string().optional().describe('Special skills and talents'),
  backstory: z
    .string()
    .optional()
    .describe("Character's historical background"),
  traits: z
    .array(z.string())
    .optional()
    .describe('Specific personality traits'),
  arcs: z.array(z.string()).optional().describe('Character development arcs'),
  mangaProjectId: z.string().optional().describe('Parent manga project ID'),
});

export const characterTools: RegisteredTool[] = [
  {
    name: 'createCharacters',
    description: `Creates one or more new manga characters with complete visual and personality profiles.

CORE FUNCTIONALITY:
- Generate full character profiles with appearance, personality, and backstory
- Support batch operations (create multiple characters at once)
- Automatic outfit template creation for new characters
- Auto-generate personality, appearance, backstory if not provided

INPUT REQUIREMENTS:
- name, role, mangaProjectId (required)
- All other fields auto-generated if not provided
- All characters follow project art style and consistency standards

BATCH EXAMPLES:
- Create single: characters=[{name: "Hero", role: "protagonist", mangaProjectId: "proj_123"}]
- Create multiple: characters=[{name: "Hero", role: "protagonist", mangaProjectId: "proj_123"}, {name: "Villain", role: "antagonist", mangaProjectId: "proj_123"}]

All characters automatically include proper consistency prompts and follow established visual design standards.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        characters: z
          .array(createCharacterSchema)
          .describe('Array of character data for new characters'),
      }),
    ),
    handler: createCharactersHandler,
  },
  {
    name: 'updateCharacters',
    description: `Updates one or more existing manga characters with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing characters
- Support batch operations (update multiple characters at once)
- Only modify provided fields, leave others unchanged
- Maintain visual and narrative consistency

INPUT REQUIREMENTS:
- id (required) - ID of the character to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update personality: characters=[{id: "char_456", personality: "Updated traits"}]
- Update appearance: characters=[{id: "char_456", hairAttributes: {hairColor: "blue"}}]
- Update multiple: characters=[{id: "char_1", name: "New Name"}, {id: "char_2", age: 18}]
- Update role: characters=[{id: "char_456", role: "supporting"}]

Only the specified fields will be updated, preserving all other character data.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        characters: z
          .array(updateCharacterSchema)
          .describe(
            'Array of character updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updateCharactersHandler,
  },
];
