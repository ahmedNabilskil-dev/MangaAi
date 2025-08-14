import { z } from 'zod';
import {
  locationTemplateSchema,
  outfitTemplateSchema,
} from '../../types/schemas';
import { RegisteredTool } from '../tool-registry';
import { zodSchemaToMcpSchema } from '../utils/schema-converter';
import {
  createLocationTemplatesHandler,
  createOutfitTemplatesHandler,
  updateLocationTemplatesHandler,
  updateOutfitTemplatesHandler,
} from './handlers/batch-tools';

// Schema for creating new outfit templates
const createOutfitTemplateSchema = outfitTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating existing outfit templates - all fields optional except id
const updateOutfitTemplateSchema = z.object({
  id: z.string().describe('ID of the outfit template to update'),
  name: z.string().optional().describe('Outfit template name'),
  description: z.string().optional().describe('Detailed outfit description'),
  category: z
    .enum([
      'casual',
      'formal',
      'school',
      'work',
      'sports',
      'sleepwear',
      'special',
      'seasonal',
    ])
    .optional()
    .describe('Outfit category'),
  season: z
    .enum(['spring', 'summer', 'fall', 'winter', 'all'])
    .optional()
    .describe('Appropriate season'),
  characterId: z.string().optional().describe('Associated character ID'),
  components: z
    .object({
      top: z.string().optional(),
      bottom: z.string().optional(),
      footwear: z.string().optional(),
      accessories: z.array(z.string()).optional(),
      outerwear: z.string().optional(),
    })
    .optional()
    .describe('Outfit components'),
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional()
    .describe('Color scheme'),
  aiPrompt: z.string().optional().describe('AI generation prompt'),
});

// Schema for creating new location templates
const createLocationTemplateSchema = locationTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating existing location templates - all fields optional except id
const updateLocationTemplateSchema = z.object({
  id: z.string().describe('ID of the location template to update'),
  name: z.string().optional().describe('Location template name'),
  description: z.string().optional().describe('Detailed location description'),
  type: z
    .enum([
      'indoor',
      'outdoor',
      'natural',
      'urban',
      'fantasy',
      'futuristic',
      'historical',
    ])
    .optional()
    .describe('Location type'),
  category: z.string().optional().describe('Location category'),
  basePrompt: z.string().optional().describe('Base AI generation prompt'),
  mangaProjectId: z.string().optional().describe('Associated manga project ID'),
  environmentPresets: z
    .object({
      timeOfDay: z
        .enum(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'])
        .optional(),
      weather: z
        .enum(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'])
        .optional(),
      lighting: z
        .object({
          type: z.enum(['natural', 'artificial', 'mixed']).optional(),
          intensity: z.enum(['dim', 'moderate', 'bright']).optional(),
          color: z.string().optional(),
        })
        .optional(),
    })
    .optional()
    .describe('Environment presets'),
  cameraAngles: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        prompt: z.string(),
      }),
    )
    .optional()
    .describe('Available camera angles'),
});

export const TemplateTools: RegisteredTool[] = [
  {
    name: 'createOutfitTemplates',
    description: `Creates one or more new outfit templates for manga characters ensuring visual consistency.

CORE FUNCTIONALITY:
- Generate complete outfit specifications for character consistency
- Support batch operations (create multiple templates at once)
- Automatic AI prompt generation for outfit details
- Auto-generate description and categories if not provided

INPUT REQUIREMENTS:
- name, characterId (required)
- description, category, season (auto-generated if not provided)
- All outfits follow project visual standards and character personality

BATCH EXAMPLES:
- Create single: outfitTemplates=[{name: "School Uniform", characterId: "char_123"}]
- Create multiple: outfitTemplates=[{name: "School Uniform", characterId: "char_123"}, {name: "Casual", characterId: "char_123"}]

All outfit templates automatically follow design standards and narrative coherence requirements.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        outfitTemplates: z
          .array(createOutfitTemplateSchema)
          .describe('Array of outfit template data for new templates'),
      }),
    ),
    handler: createOutfitTemplatesHandler,
  },
  {
    name: 'updateOutfitTemplates',
    description: `Updates one or more existing outfit templates with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing outfit templates
- Support batch operations (update multiple templates at once)
- Only modify provided fields, leave others unchanged
- Maintain visual consistency and character coherence

INPUT REQUIREMENTS:
- id (required) - ID of the outfit template to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update name: outfitTemplates=[{id: "outfit_456", name: "Updated Name"}]
- Update description: outfitTemplates=[{id: "outfit_456", description: "New description"}]
- Update components: outfitTemplates=[{id: "outfit_456", components: {top: "new shirt"}}]
- Update multiple: outfitTemplates=[{id: "outfit_1", name: "New Name"}, {id: "outfit_2", season: "summer"}]

Only the specified fields will be updated, preserving all other template data.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        outfitTemplates: z
          .array(updateOutfitTemplateSchema)
          .describe(
            'Array of outfit template updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updateOutfitTemplatesHandler,
  },

  // Location Template Tools
  {
    name: 'createLocationTemplates',
    description: `Creates one or more new location templates for manga environments with multiple perspectives.

CORE FUNCTIONALITY:
- Generate detailed, reusable location specifications
- Support batch operations (create multiple templates at once)
- Automatic camera angle and atmospheric specifications
- Auto-generate description and environment presets if not provided

INPUT REQUIREMENTS:
- name, mangaProjectId (required)
- description, type, category (auto-generated if not provided)
- All locations follow project visual standards and narrative needs

BATCH EXAMPLES:
- Create single: locationTemplates=[{name: "School Courtyard", mangaProjectId: "proj_123"}]
- Create multiple: locationTemplates=[{name: "School Courtyard", mangaProjectId: "proj_123"}, {name: "Classroom", mangaProjectId: "proj_123"}]

All location templates automatically follow architectural consistency and narrative integration requirements.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        locationTemplates: z
          .array(createLocationTemplateSchema)
          .describe('Array of location template data for new templates'),
      }),
    ),
    handler: createLocationTemplatesHandler,
  },
  {
    name: 'updateLocationTemplates',
    description: `Updates one or more existing location templates with partial data.

CORE FUNCTIONALITY:
- Update specific fields of existing location templates
- Support batch operations (update multiple templates at once)
- Only modify provided fields, leave others unchanged
- Maintain architectural consistency and narrative integration

INPUT REQUIREMENTS:
- id (required) - ID of the location template to update
- Any other fields are optional and will only update if provided

UPDATE EXAMPLES:
- Update name: locationTemplates=[{id: "loc_456", name: "Updated Name"}]
- Update description: locationTemplates=[{id: "loc_456", description: "New description"}]
- Update presets: locationTemplates=[{id: "loc_456", environmentPresets: {timeOfDay: "evening"}}]
- Update multiple: locationTemplates=[{id: "loc_1", name: "New Name"}, {id: "loc_2", type: "indoor"}]

Only the specified fields will be updated, preserving all other template data.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        locationTemplates: z
          .array(updateLocationTemplateSchema)
          .describe(
            'Array of location template updates - only provided fields will be modified',
          ),
      }),
    ),
    handler: updateLocationTemplatesHandler,
  },
];
