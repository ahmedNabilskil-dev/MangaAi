import {
  getChapterForContext,
  getCharacter as getCharacterForContext,
  getPanelDialogueForContext,
  getPanelForContext,
  getProject as getProjectForContext,
  getSceneForContext,
  updateChapter as updateChapterService,
  updateCharacter as updateCharacterService,
  updateLocationTemplate as updateLocationTemplateService,
  updateOutfitTemplate as updateOutfitTemplateService,
  updatePanelDialogue as updatePanelDialogueService,
  updatePanel as updatePanelService,
  updateProject as updateProjectService,
  updateScene as updateSceneService,
} from "../../services/data-service.js";

export async function updateProjectHandler(args: any) {
  try {
    const { projectId, updates } = args;

    // Check if project exists
    const exists = await getProjectForContext(projectId);
    if (!exists) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Process updates - handle string arrays if needed
    const processedUpdates = { ...updates };
    if (typeof updates.worldDetails === "string") {
      try {
        processedUpdates.worldDetails = JSON.parse(updates.worldDetails);
      } catch {
        // If it's not valid JSON, treat as a single string
        processedUpdates.worldDetails = [updates.worldDetails];
      }
    }

    if (typeof updates.plotStructure === "string") {
      try {
        processedUpdates.plotStructure = JSON.parse(updates.plotStructure);
      } catch {
        processedUpdates.plotStructure = [updates.plotStructure];
      }
    }

    if (typeof updates.themes === "string") {
      try {
        processedUpdates.themes = JSON.parse(updates.themes);
      } catch {
        processedUpdates.themes = [updates.themes];
      }
    }

    if (typeof updates.motifs === "string") {
      try {
        processedUpdates.motifs = JSON.parse(updates.motifs);
      } catch {
        processedUpdates.motifs = [updates.motifs];
      }
    }

    if (typeof updates.symbols === "string") {
      try {
        processedUpdates.symbols = JSON.parse(updates.symbols);
      } catch {
        processedUpdates.symbols = [updates.symbols];
      }
    }

    const result = await updateProjectService(projectId, processedUpdates);

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
      `Failed to update project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updateChapterHandler(args: any) {
  try {
    const { chapterId, updates } = args;

    const exists = await getChapterForContext(chapterId);
    if (!exists) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    const result = await updateChapterService(chapterId, updates);

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
      `Failed to update chapter: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updateSceneHandler(args: any) {
  try {
    const { sceneId, updates } = args;

    const exists = await getSceneForContext(sceneId);
    if (!exists) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    const result = await updateSceneService(sceneId, updates);

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
      `Failed to update scene: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updatePanelHandler(args: any) {
  try {
    const { panelId, updates } = args;

    const exists = await getPanelForContext(panelId);
    if (!exists) {
      throw new Error(`Panel ${panelId} not found`);
    }

    const result = await updatePanelService(panelId, updates);

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
      `Failed to update panel: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updateCharacterHandler(args: any) {
  try {
    const { characterId, updates } = args;

    const exists = await getCharacterForContext(characterId);
    if (!exists) {
      throw new Error(`Character ${characterId} not found`);
    }

    const result = await updateCharacterService(characterId, updates);

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
      `Failed to update character: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updatePanelDialogueHandler(args: any) {
  try {
    const { dialogueId, updates, speakerName } = args;

    const exists = await getPanelDialogueForContext(dialogueId);
    if (!exists) {
      throw new Error(`Dialogue ${dialogueId} not found`);
    }

    // Handle speaker name if provided
    let processedUpdates = { ...updates };
    if (speakerName) {
      // You would implement logic to find character by name and set speakerId
      console.log(`Updating dialogue speaker to: ${speakerName}`);
    }

    const result = await updatePanelDialogueService(
      dialogueId,
      processedUpdates
    );

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
      `Failed to update panel dialogue: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updateOutfitTemplateHandler(args: any) {
  try {
    const { outfitTemplateId, updates } = args;
    const result = await updateOutfitTemplateService(outfitTemplateId, updates);

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
      `Failed to update outfit template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function updateLocationTemplateHandler(args: any) {
  try {
    const { locationTemplateId, updates } = args;
    const result = await updateLocationTemplateService(
      locationTemplateId,
      updates
    );

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
      `Failed to update location template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
