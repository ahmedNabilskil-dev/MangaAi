import { ai } from "@/ai/ai-instance";
import {
  deleteChapter as deleteChapterService,
  deleteCharacter as deleteCharacterService,
  deletePanelDialogue as deletePanelDialogueService,
  deletePanel as deletePanelService,
  deleteProject as deleteProjectService,
  deleteScene as deleteSceneService,
  getChapterForContext,
  getCharacter as getCharacterForContext,
  getPanelDialogueForContext,
  getPanelForContext,
  getProject as getProjectForContext,
  getSceneForContext,
} from "@/services/data-service";
import { z } from "zod";

// --- Delete Tools ---

export const deleteProjectTool = ai.defineTool(
  {
    name: "deleteProject",
    description:
      "Deletes an entire manga project and ALL its associated data (chapters, scenes, characters, etc.). This action is IRREVERSIBLE.",
    inputSchema: z.object({
      projectId: z.string().describe("ID of the project to delete"),
      confirmation: z.boolean().describe("Must be true to confirm deletion"),
    }),
    outputSchema: z.boolean().describe("True if deletion succeeded"),
  },
  async ({ projectId, confirmation }) => {
    if (!confirmation) {
      console.warn("Project deletion requires explicit confirmation");
      return false;
    }

    try {
      const exists = await getProjectForContext(projectId);
      if (!exists) {
        console.warn(`Project ${projectId} not found`);
        return false;
      }

      await deleteProjectService(projectId);
      return true;
    } catch (error) {
      console.error(`Error in deleteProjectTool: ${error}`);
      return false;
    }
  }
);

export const deleteChapterTool = ai.defineTool(
  {
    name: "deleteChapter",
    description: "Deletes a chapter and all its associated scenes and panels.",
    inputSchema: z.object({
      chapterId: z.string().describe("ID of the chapter to delete"),
    }),
    outputSchema: z.boolean().describe("True if deletion succeeded"),
  },
  async ({ chapterId }) => {
    try {
      const exists = await getChapterForContext(chapterId);
      if (!exists) {
        console.warn(`Chapter ${chapterId} not found`);
        return false;
      }

      await deleteChapterService(chapterId);
      return true;
    } catch (error) {
      console.error(`Error in deleteChapterTool: ${error}`);
      return false;
    }
  }
);

export const deleteSceneTool = ai.defineTool(
  {
    name: "deleteScene",
    description: "Deletes a scene and all its associated panels.",
    inputSchema: z.object({
      sceneId: z.string().describe("ID of the scene to delete"),
    }),
    outputSchema: z.boolean().describe("True if deletion succeeded"),
  },
  async ({ sceneId }) => {
    try {
      const exists = await getSceneForContext(sceneId);
      if (!exists) {
        console.warn(`Scene ${sceneId} not found`);
        return false;
      }

      await deleteSceneService(sceneId);
      return true;
    } catch (error) {
      console.error(`Error in deleteSceneTool: ${error}`);
      return false;
    }
  }
);

export const deletePanelTool = ai.defineTool(
  {
    name: "deletePanel",
    description: "Deletes a panel and all its associated dialogues.",
    inputSchema: z.object({
      panelId: z.string().describe("ID of the panel to delete"),
    }),
    outputSchema: z.boolean().describe("True if deletion succeeded"),
  },
  async ({ panelId }) => {
    try {
      const exists = await getPanelForContext(panelId);
      if (!exists) {
        console.warn(`Panel ${panelId} not found`);
        return false;
      }

      await deletePanelService(panelId);
      return true;
    } catch (error) {
      console.error(`Error in deletePanelTool: ${error}`);
      return false;
    }
  }
);

export const deletePanelDialogueTool = ai.defineTool(
  {
    name: "deletePanelDialogue",
    description: "Deletes a specific panel dialogue entry.",
    inputSchema: z.object({
      dialogueId: z.string().describe("ID of the dialogue to delete"),
    }),
    outputSchema: z.boolean().describe("True if deletion succeeded"),
  },
  async ({ dialogueId }) => {
    try {
      const exists = await getPanelDialogueForContext(dialogueId);
      if (!exists) {
        console.warn(`Dialogue ${dialogueId} not found`);
        return false;
      }

      await deletePanelDialogueService(dialogueId);
      return true;
    } catch (error) {
      console.error(`Error in deletePanelDialogueTool: ${error}`);
      return false;
    }
  }
);

export const deleteCharacterTool = ai.defineTool(
  {
    name: "deleteCharacter",
    description: "Deletes a character and removes all references to it.",
    inputSchema: z.object({
      characterId: z.string().describe("ID of the character to delete"),
    }),
    outputSchema: z.boolean().describe("True if deletion succeeded"),
  },
  async ({ characterId }) => {
    try {
      const exists = await getCharacterForContext(characterId);
      if (!exists) {
        console.warn(`Character ${characterId} not found`);
        return false;
      }

      await deleteCharacterService(characterId);
      return true;
    } catch (error) {
      console.error(`Error in deleteCharacterTool: ${error}`);
      return false;
    }
  }
);
