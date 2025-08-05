import { chapterSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createOrUpdateChaptersHandler } from "./handlers/batch-tools.js";

export const chapterTools: RegisteredTool[] = [
  {
    name: "createOrUpdateChapters",
    description: `Creates or updates one or more manga chapters with complete narrative structure.

CORE FUNCTIONALITY:
- Generate compelling chapter narratives (600-800 words each)
- Support batch operations (create multiple chapters at once)
- Update existing chapters by including 'id' field
- Integrate with existing location and outfit templates automatically

INPUT REQUIREMENTS:
- title, mangaProjectId (required for new chapters)
- order, narrative, mood (auto-generated if not provided)
- All content follows project style guidelines and template system

BATCH EXAMPLES:
- Create single: chapters=[{title: "Chapter 1", mangaProjectId: "proj_123"}]
- Create multiple: chapters=[{title: "Ch 1", mangaProjectId: "proj_123"}, {title: "Ch 2", mangaProjectId: "proj_123"}]
- Update existing: chapters=[{id: "ch_456", title: "Updated Title"}]
- Mixed operations: Mix create and update in same call

All chapters automatically integrate with existing templates and follow established content creation standards.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        chapters: z
          .array(
            chapterSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                scenes: true,
                coverImageUrl: true,
                isAiGenerated: true,
                isPublished: true,
                viewCount: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe("Include for updates, omit for new chapters"),
              })
          )
          .min(1)
          .describe(
            "Array of chapter data - include 'id' to update existing chapters, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdateChaptersHandler,
  },
];
