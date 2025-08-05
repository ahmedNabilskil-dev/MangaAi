import { sceneSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createOrUpdateScenesHandler } from "./handlers/batch-tools.js";

export const sceneTools: RegisteredTool[] = [
  {
    name: "createOrUpdateScenes",
    description: `Creates or updates one or more compelling manga scenes with complete narrative structure.

CORE FUNCTIONALITY:
- Generate rich scene descriptions with visual and emotional detail
- Support batch operations (create multiple scenes at once)
- Update existing scenes by including 'id' field
- Automatic template integration and character outfit management

INPUT REQUIREMENTS:
- title, chapterId, order (required for new scenes)
- description, sceneContext (auto-generated if not provided)
- All scenes integrate with existing location and outfit templates

BATCH EXAMPLES:
- Create single: scenes=[{title: "Opening", chapterId: "ch_123", order: 1}]
- Create multiple: scenes=[{title: "Scene 1", chapterId: "ch_123", order: 1}, {title: "Scene 2", chapterId: "ch_123", order: 2}]
- Update existing: scenes=[{id: "scene_456", title: "Updated Title"}]
- Mixed operations: Mix create and update in same call

All scenes automatically follow narrative structure standards and template integration requirements.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        scenes: z
          .array(
            sceneSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                panels: true,
                isAiGenerated: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe("Include for updates, omit for new scenes"),
              })
          )
          .min(1)
          .describe(
            "Array of scene data - include 'id' to update existing scenes, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdateScenesHandler,
  },
];
