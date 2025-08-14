import { BackendDataService } from '../../services/backend-data.service';

export async function updateChapterHandler(args: any) {
  try {
    const { chapterId, updates } = args;

    // const exists = await getChapterForContext(chapterId);
    // if (!exists) {
    //   throw new Error(`Chapter ${chapterId} not found`);
    // }

    const result = await BackendDataService.updateChapter(chapterId, updates);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update chapter: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateSceneHandler(args: any) {
  try {
    const { sceneId, updates } = args;

    // const exists = await getSceneForContext(sceneId);
    // if (!exists) {
    //   throw new Error(`Scene ${sceneId} not found`);
    // }

    const result = await BackendDataService.updateScene(sceneId, updates);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update scene: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updatePanelHandler(args: any) {
  try {
    const { panelId, updates } = args;

    // const exists = await getPanelForContext(panelId);
    // if (!exists) {
    //   throw new Error(`Panel ${panelId} not found`);
    // }

    const result = await BackendDataService.updatePanel(panelId, updates);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update panel: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateCharacterHandler(args: any) {
  try {
    const { characterId, updates } = args;

    // const exists = await getCharacterForContext(characterId);
    // if (!exists) {
    //   throw new Error(`Character ${characterId} not found`);
    // }

    const result = await BackendDataService.updateCharacter(
      characterId,
      updates,
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update character: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updatePanelDialogueHandler(args: any) {
  try {
    const { dialogueId, updates, speakerName } = args;

    // const exists = await getPanelDialogueForContext(dialogueId);
    // if (!exists) {
    //   throw new Error(`Dialogue ${dialogueId} not found`);
    // }

    // Handle speaker name if provided
    let processedUpdates = { ...updates };
    if (speakerName) {
    }

    const result = await BackendDataService.updatePanelDialogue(
      dialogueId,
      processedUpdates,
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update panel dialogue: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateOutfitTemplateHandler(args: any) {
  try {
    const { outfitTemplateId, updates } = args;
    const result = await BackendDataService.updateOutfitTemplate(
      outfitTemplateId,
      updates,
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update outfit template: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateLocationTemplateHandler(args: any) {
  try {
    const { locationTemplateId, updates } = args;
    const result = await BackendDataService.updateLocationTemplate(
      locationTemplateId,
      updates,
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update location template: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
