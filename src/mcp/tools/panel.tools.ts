import { panelSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createOrUpdatePanelsHandler } from "./handlers/batch-tools";

export const PanelTools: RegisteredTool[] = [
  {
    name: "createOrUpdatePanels",
    description: `Creates or updates one or more visually compelling manga panels with professional composition.

CORE FUNCTIONALITY:
- Generate detailed panel compositions with character positioning
- Support batch operations (create multiple panels at once)
- Update existing panels by including 'id' field
- Automatic template inheritance from parent scene

INPUT REQUIREMENTS:
- sceneId, order (required for new panels)
- panelContext (auto-generated if not provided with camera settings, character poses, environmental elements)
- All panels inherit location context and integrate with template system

BATCH EXAMPLES:
- Create single: panels=[{sceneId: "scene_123", order: 1}]
- Create multiple: panels=[{sceneId: "scene_123", order: 1}, {sceneId: "scene_123", order: 2}]
- Update existing: panels=[{id: "panel_456", order: 1}]
- Mixed operations: Mix create and update in same call

All panels automatically follow visual composition standards and template integration requirements.`,
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panels: z
          .array(
            panelSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                dialogues: true,
                characters: true,
                imageUrl: true,
                isAiGenerated: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe("Include for updates, omit for new panels"),
              })
          )
          .min(1)
          .describe(
            "Array of panel data - include 'id' to update existing panels, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdatePanelsHandler,
  },
];
