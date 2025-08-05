import { characterSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createOrUpdateCharactersHandler } from "./handlers/batch-tools";

export const characterTools: RegisteredTool[] = [
  {
    name: "createOrUpdateCharacters",
    description: `Creates or updates one or more manga characters with complete visual and personality profiles.

CORE FUNCTIONALITY:
- Generate full character profiles with appearance, personality, and backstory
- Support batch operations (create multiple characters at once)
- Update existing characters by including 'id' field
- Automatic outfit template creation for new characters

INPUT REQUIREMENTS:
- name, role, mangaProjectId (required for new characters)
- personality, appearance, backstory (auto-generated if not provided)
- All characters follow project art style and consistency standards

BATCH EXAMPLES:
- Create single: characters=[{name: "Hero", role: "protagonist", mangaProjectId: "proj_123"}]
- Create multiple: characters=[{name: "Hero", role: "protagonist", mangaProjectId: "proj_123"}, {name: "Villain", role: "antagonist", mangaProjectId: "proj_123"}]
- Update existing: characters=[{id: "char_456", personality: "Updated traits"}]
- Mixed operations: Mix create and update in same call

All characters automatically include proper consistency prompts and follow established visual design standards.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        characters: z
          .array(
            characterSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                isAiGenerated: true,
                imgUrl: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe("Include for updates, omit for new characters"),
              })
          )
          .min(1)
          .describe(
            "Array of character data - include 'id' to update existing characters, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdateCharactersHandler,
  },
];
