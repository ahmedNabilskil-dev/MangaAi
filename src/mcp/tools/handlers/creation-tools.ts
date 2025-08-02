import {
  createChapter as createChapterService,
  createCharacter as createCharacterService,
  createLocationTemplate as createLocationTemplateService,
  createOutfitTemplate as createOutfitTemplateService,
  createPanelDialogue as createPanelDialogueService,
  createPanel as createPanelService,
  createProject as createProjectService,
  createScene as createSceneService,
} from "../../../services/data-service.js";

export async function createProjectHandler(args: any) {
  try {
    const result = await createProjectService(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ createdProject: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    console.log("Error creating project:", JSON.stringify(error));
    throw new Error(
      `Failed to create project: ${
        error instanceof Error ? JSON.stringify(error.message) : String(error)
      }`
    );
  }
}

export async function createChapterHandler(args: any) {
  try {
    const { mangaProjectId, ...chapterData } = args;
    const result = await createChapterService({
      ...chapterData,
      mangaProjectId,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ chapterId: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create chapter: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function createSceneHandler(args: any) {
  try {
    const { chapterId, ...sceneData } = args;
    const result = await createSceneService({
      ...sceneData,
      chapterId,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ sceneId: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create scene: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function createPanelHandler(args: any) {
  try {
    const { sceneId, characterNames, ...panelData } = args;

    // Create the panel first
    const panelId = await createPanelService({
      ...panelData,
      sceneId,
    });

    // If character names are provided, link them to the panel
    if (characterNames && characterNames.length > 0) {
      // For now, we'll just store the character names in the panel context
      // In a full implementation, you'd want to resolve character IDs and link them
      console.log(
        `Panel ${panelId} created with characters: ${characterNames.join(", ")}`
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ panelId }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create panel: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function createCharacterHandler(args: any) {
  try {
    const { mangaProjectId, ...characterData } = args;
    const result = await createCharacterService({
      ...characterData,
      mangaProjectId,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ characterId: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create character: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function createPanelDialogueHandler(args: any) {
  try {
    const { panelId, speakerName, ...dialogueData } = args;

    // If speaker name is provided, try to find the character
    let speakerId = undefined;
    if (speakerName) {
      // You'd need to implement a way to get the project ID from the panel
      // For now, we'll leave speakerId as undefined and handle it in the service
      console.log(`Creating dialogue for speaker: ${speakerName}`);
    }

    const result = await createPanelDialogueService({
      ...dialogueData,
      panelId,
      speakerId,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ dialogueId: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create panel dialogue: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function createOutfitTemplateHandler(args: any) {
  try {
    const result = await createOutfitTemplateService(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ outfitTemplateId: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create outfit template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function createLocationTemplateHandler(args: any) {
  try {
    const result = await createLocationTemplateService(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ locationTemplateId: result }, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create location template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
