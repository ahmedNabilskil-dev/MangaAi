import { locationTemplateSchema, outfitTemplateSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import {
  createOrUpdateLocationTemplatesHandler,
  createOrUpdateOutfitTemplatesHandler,
} from "./handlers/batch-tools";

export const TemplateTools: RegisteredTool[] = [
  {
    name: "createOrUpdateOutfitTemplates",
    description: `Creates or updates one or more outfit templates for manga characters ensuring visual consistency.

CORE FUNCTIONALITY:
- Generate complete outfit specifications for character consistency
- Support batch operations (create multiple templates at once)
- Update existing templates by including 'id' field
- Automatic AI prompt generation for outfit details

INPUT REQUIREMENTS:
- name, characterId (required for new templates)
- description, category, season (auto-generated if not provided)
- All outfits follow project visual standards and character personality

BATCH EXAMPLES:
- Create single: outfitTemplates=[{name: "School Uniform", characterId: "char_123"}]
- Create multiple: outfitTemplates=[{name: "School Uniform", characterId: "char_123"}, {name: "Casual", characterId: "char_123"}]
- Update existing: outfitTemplates=[{id: "outfit_456", name: "Updated Name"}]
- Mixed operations: Mix create and update in same call

All outfit templates automatically follow design standards and narrative coherence requirements.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        outfitTemplates: z
          .array(
            outfitTemplateSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe(
                    "Include for updates, omit for new outfit templates"
                  ),
              })
          )
          .min(1)
          .describe(
            "Array of outfit template data - include 'id' to update existing templates, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdateOutfitTemplatesHandler,
  },

  // Location Template Tools
  {
    name: "createOrUpdateLocationTemplates",
    description: `Creates or updates one or more location templates for manga environments with multiple perspectives.

CORE FUNCTIONALITY:
- Generate detailed, reusable location specifications
- Support batch operations (create multiple templates at once)
- Update existing templates by including 'id' field
- Automatic camera angle and atmospheric specifications

INPUT REQUIREMENTS:
- name, mangaProjectId (required for new templates)
- description, type, category (auto-generated if not provided)
- All locations follow project visual standards and narrative needs

BATCH EXAMPLES:
- Create single: locationTemplates=[{name: "School Courtyard", mangaProjectId: "proj_123"}]
- Create multiple: locationTemplates=[{name: "School Courtyard", mangaProjectId: "proj_123"}, {name: "Classroom", mangaProjectId: "proj_123"}]
- Update existing: locationTemplates=[{id: "loc_456", name: "Updated Name"}]
- Mixed operations: Mix create and update in same call

All location templates automatically follow architectural consistency and narrative integration requirements.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        locationTemplates: z
          .array(
            locationTemplateSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe(
                    "Include for updates, omit for new location templates"
                  ),
              })
          )
          .min(1)
          .describe(
            "Array of location template data - include 'id' to update existing templates, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdateLocationTemplatesHandler,
  },
];
