// Batch create/update handlers for entity tools
import {
  createChapter as createChapterService,
  createCharacter as createCharacterService,
  createLocationTemplate as createLocationTemplateService,
  createOutfitTemplate as createOutfitTemplateService,
  createPanelDialogue as createPanelDialogueService,
  createPanel as createPanelService,
  createProject as createProjectService,
  createScene as createSceneService,
  updateChapter as updateChapterService,
  updateCharacter as updateCharacterService,
  updateLocationTemplate as updateLocationTemplateService,
  updateOutfitTemplate as updateOutfitTemplateService,
  updatePanelDialogue as updatePanelDialogueService,
  updatePanel as updatePanelService,
  updateProject as updateProjectService,
  updateScene as updateSceneService,
} from "../../../services/data-service.js";

// Helper function to determine if operation is create or update
function isUpdateOperation(entityData: any): boolean {
  return entityData.id !== undefined && entityData.id !== null;
}

// Project handler (single entity only)
export async function createOrUpdateProjectHandler(args: any) {
  try {
    const projectData = args;

    let result;

    if (isUpdateOperation(projectData)) {
      // Update existing project
      const { id, ...updates } = projectData;
      result = await updateProjectService(id, updates);
    } else {
      // Create new project
      result = await createProjectService(projectData);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Chapter batch handler
export async function createOrUpdateChaptersHandler(args: any) {
  try {
    const { chapters } = args;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      throw new Error("chapters must be a non-empty array");
    }

    const results = [];

    for (const chapterData of chapters) {
      let result;

      if (isUpdateOperation(chapterData)) {
        // Update existing chapter
        const { id, ...updates } = chapterData;
        result = await updateChapterService(id, updates);
      } else {
        // Create new chapter
        result = await createChapterService(chapterData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              chapters: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update chapters: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Scene batch handler
export async function createOrUpdateScenesHandler(args: any) {
  try {
    const { scenes } = args;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error("scenes must be a non-empty array");
    }

    const results = [];

    for (const sceneData of scenes) {
      let result;

      if (isUpdateOperation(sceneData)) {
        // Update existing scene
        const { id, ...updates } = sceneData;
        result = await updateSceneService(id, updates);
      } else {
        // Create new scene
        result = await createSceneService(sceneData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              scenes: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update scenes: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Panel batch handler
export async function createOrUpdatePanelsHandler(args: any) {
  try {
    const { panels } = args;

    if (!Array.isArray(panels) || panels.length === 0) {
      throw new Error("panels must be a non-empty array");
    }

    const results = [];

    for (const panelData of panels) {
      let result;

      if (isUpdateOperation(panelData)) {
        // Update existing panel
        const { id, ...updates } = panelData;
        result = await updatePanelService(id, updates);
      } else {
        // Create new panel
        result = await createPanelService(panelData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              panels: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update panels: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Character batch handler
export async function createOrUpdateCharactersHandler(args: any) {
  try {
    const { characters } = args;

    if (!Array.isArray(characters) || characters.length === 0) {
      throw new Error("characters must be a non-empty array");
    }

    const results = [];

    for (const characterData of characters) {
      let result;

      if (isUpdateOperation(characterData)) {
        // Update existing character
        const { id, ...updates } = characterData;
        result = await updateCharacterService(id, updates);
      } else {
        // Create new character
        result = await createCharacterService(characterData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              characters: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update characters: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Dialogue batch handler
export async function createOrUpdateDialoguesHandler(args: any) {
  try {
    const { dialogues } = args;

    if (!Array.isArray(dialogues) || dialogues.length === 0) {
      throw new Error("dialogues must be a non-empty array");
    }

    const results = [];

    for (const dialogueData of dialogues) {
      let result;

      if (isUpdateOperation(dialogueData)) {
        // Update existing dialogue
        const { id, ...updates } = dialogueData;
        result = await updatePanelDialogueService(id, updates);
      } else {
        // Create new dialogue
        result = await createPanelDialogueService(dialogueData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              dialogues: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update dialogues: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Outfit Template batch handler
export async function createOrUpdateOutfitTemplatesHandler(args: any) {
  try {
    const { outfitTemplates } = args;

    if (!Array.isArray(outfitTemplates) || outfitTemplates.length === 0) {
      throw new Error("outfitTemplates must be a non-empty array");
    }

    const results = [];

    for (const templateData of outfitTemplates) {
      let result;

      if (isUpdateOperation(templateData)) {
        // Update existing template
        const { id, ...updates } = templateData;
        result = await updateOutfitTemplateService(id, updates);
      } else {
        // Create new template
        result = await createOutfitTemplateService(templateData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              outfitTemplates: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update outfit templates: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Location Template batch handler
export async function createOrUpdateLocationTemplatesHandler(args: any) {
  try {
    const { locationTemplates } = args;

    if (!Array.isArray(locationTemplates) || locationTemplates.length === 0) {
      throw new Error("locationTemplates must be a non-empty array");
    }

    const results = [];

    for (const templateData of locationTemplates) {
      let result;

      if (isUpdateOperation(templateData)) {
        // Update existing template
        const { id, ...updates } = templateData;
        result = await updateLocationTemplateService(id, updates);
      } else {
        // Create new template
        result = await createLocationTemplateService(templateData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              locationTemplates: results,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update location templates: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
