import {
  deleteChapter as deleteChapterService,
  deleteCharacter as deleteCharacterService,
  deleteLocationTemplate as deleteLocationTemplateService,
  deleteOutfitTemplate as deleteOutfitTemplateService,
  deletePanelDialogue as deletePanelDialogueService,
  deletePanel as deletePanelService,
  deleteProject as deleteProjectService,
  deleteScene as deleteSceneService,
  getChapterForContext,
  getCharacterForContext,
  getPanelDialogueForContext,
  getPanelForContext,
  getProject as getProjectForContext,
  getSceneForContext,
} from "../../../services/data-service.js";

export async function deleteProjectHandler(args: any) {
  try {
    const { projectId, confirmation } = args;

    if (!confirmation) {
      throw new Error("Project deletion requires explicit confirmation");
    }

    const exists = await getProjectForContext(projectId);
    if (!exists) {
      throw new Error(`Project ${projectId} not found`);
    }

    const result = await deleteProjectService(projectId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteChapterHandler(args: any) {
  try {
    const { chapterId } = args;

    const exists = await getChapterForContext(chapterId);
    if (!exists) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    const result = await deleteChapterService(chapterId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete chapter: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteSceneHandler(args: any) {
  try {
    const { sceneId } = args;

    const exists = await getSceneForContext(sceneId);
    if (!exists) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    const result = await deleteSceneService(sceneId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete scene: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deletePanelHandler(args: any) {
  try {
    const { panelId } = args;

    const exists = await getPanelForContext(panelId);
    if (!exists) {
      throw new Error(`Panel ${panelId} not found`);
    }

    const result = await deletePanelService(panelId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete panel: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteCharacterHandler(args: any) {
  try {
    const { characterId } = args;

    const exists = await getCharacterForContext(characterId);
    if (!exists) {
      throw new Error(`Character ${characterId} not found`);
    }

    const result = await deleteCharacterService(characterId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete character: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deletePanelDialogueHandler(args: any) {
  try {
    const { dialogueId } = args;

    const exists = await getPanelDialogueForContext(dialogueId);
    if (!exists) {
      throw new Error(`Dialogue ${dialogueId} not found`);
    }

    const result = await deletePanelDialogueService(dialogueId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete panel dialogue: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteOutfitTemplateHandler(args: any) {
  try {
    const { outfitTemplateId } = args;
    const result = await deleteOutfitTemplateService(outfitTemplateId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete outfit template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteLocationTemplateHandler(args: any) {
  try {
    const { locationTemplateId } = args;
    const result = await deleteLocationTemplateService(locationTemplateId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete location template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
