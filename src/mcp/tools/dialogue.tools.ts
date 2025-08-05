import { panelDialogueSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createOrUpdateDialoguesHandler } from "./handlers/batch-tools";

export const dialogueTools: RegisteredTool[] = [
  {
    name: "createOrUpdateDialogues",
    description: `Creates or updates one or more natural, character-authentic dialogues for manga panels.

CORE FUNCTIONALITY:
- Generate authentic dialogue matching character voices and emotions
- Support batch operations (create multiple dialogues at once)
- Update existing dialogues by including 'id' field
- Automatic speech pattern and style integration

INPUT REQUIREMENTS:
- content, panelId, speakerId, emotion, order (required for new dialogues)
- style.bubbleType, subtextNote (auto-generated if not provided)
- All dialogue follows character voice guidelines and natural conversation principles

BATCH EXAMPLES:
- Create single: dialogues=[{content: "Hello!", panelId: "panel_123", speakerId: "char_456", emotion: "happy", order: 1}]
- Create multiple: dialogues=[{content: "Hello!", panelId: "panel_123", speakerId: "char_456", emotion: "happy", order: 1}, {content: "Hi there!", panelId: "panel_123", speakerId: "char_789", emotion: "excited", order: 2}]
- Update existing: dialogues=[{id: "dialogue_456", content: "Updated text"}]
- Mixed operations: Mix create and update in same call

All dialogue automatically follows character authenticity and natural conversation standards.`,

    inputSchema: zodSchemaToMcpSchema(
      z.object({
        dialogues: z
          .array(
            panelDialogueSchema
              .omit({
                id: true,
                createdAt: true,
                updatedAt: true,
                speaker: true,
              })
              .extend({
                id: z
                  .string()
                  .optional()
                  .describe("Include for updates, omit for new dialogues"),
              })
          )
          .min(1)
          .describe(
            "Array of dialogue data - include 'id' to update existing dialogues, omit 'id' to create new ones"
          ),
      })
    ),
    handler: createOrUpdateDialoguesHandler,
  },
];
