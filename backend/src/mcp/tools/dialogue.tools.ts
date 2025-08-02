import { panelDialogueSchema } from "@/types/schemas";
import { z } from "zod";
import { RegisteredTool } from "../tool-registry";
import { zodSchemaToMcpSchema } from "../utils/schema-converter";
import { createPanelDialogueHandler } from "./handlers/creation-tools";
import { deletePanelDialogueHandler } from "./handlers/delete-tools";
import {
  getPanelDialogueHandler,
  listDialoguesForPanelHandler,
} from "./handlers/fetch-tools";
import { updatePanelDialogueHandler } from "./handlers/update-tools";

export const dialogueTools: RegisteredTool[] = [
  {
    name: "createPanelDialogue",
    description:
      "Creates dialogue for a panel with speaker, content, and bubble style.",
    inputSchema: zodSchemaToMcpSchema(
      panelDialogueSchema
        .omit({
          id: true,
          createdAt: true,
          updatedAt: true,
          speaker: true,
          isAiGenerated: true,
        })
        .extend({
          speakerName: z
            .string()
            .optional()
            .describe("Name of the character speaking (optional)"),
        })
    ),
    handler: createPanelDialogueHandler,
  },
  {
    name: "updatePanelDialogue",
    description:
      "Updates existing panel dialogue content, speaker, or bubble style.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        dialogueId: z
          .string()
          .describe("Unique identifier of the dialogue to update"),
        updates: panelDialogueSchema
          .omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            panelId: true,
            speaker: true,
            isAiGenerated: true,
          })
          .partial()
          .describe(
            "Object containing only the dialogue fields you want to modify"
          ),
        speakerName: z
          .string()
          .optional()
          .describe("Name of the character speaking (optional)"),
      })
    ),
    handler: updatePanelDialogueHandler,
  },
  {
    name: "deletePanelDialogue",
    description: "Deletes a dialogue from a panel.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        dialogueId: z.string().describe("ID of the dialogue to remove"),
      })
    ),
    handler: deletePanelDialogueHandler,
  },
  {
    name: "getPanelDialogue",
    description: "Retrieves complete details of a dialogue by ID.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        dialogueId: z.string().describe("ID of the dialogue to retrieve"),
      })
    ),
    handler: getPanelDialogueHandler,
  },
  {
    name: "listPanelDialogues",
    description: "Lists all dialogues in a panel.",
    inputSchema: zodSchemaToMcpSchema(
      z.object({
        panelId: z.string().describe("ID of the panel to list dialogues from"),
      })
    ),
    handler: listDialoguesForPanelHandler,
  },
];
