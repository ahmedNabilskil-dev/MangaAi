// Batch create/update handlers for entity tools
import { BackendDataService } from '../../services/backend-data.service';

// Helper function to determine if operation is create or update
function isUpdateOperation(entityData: any): boolean {
  return entityData.id !== undefined && entityData.id !== null;
}

// Project separate handlers
export async function createProjectHandler(args: any) {
  try {
    const projectData = args;

    // Create new project
    const result = await BackendDataService.createProject(projectData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create project: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateProjectHandler(args: any) {
  try {
    const { id, ...updates } = args;

    if (!id) {
      throw new Error('Project ID is required for updates');
    }

    // Update existing project
    const result = await BackendDataService.updateProject(id, updates);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update project: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Project handler (single entity only)
export async function createOrUpdateProjectHandler(args: any) {
  try {
    const projectData = args;

    let result;

    if (isUpdateOperation(projectData)) {
      // Update existing project
      const { id, ...updates } = projectData;
      result = await BackendDataService.updateProject(id, updates);
    } else {
      // Create new project
      result = await BackendDataService.createProject(projectData);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update project: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Panel separate handlers
export async function createPanelsHandler(args: any) {
  try {
    const { panels } = args;

    if (!Array.isArray(panels) || panels.length === 0) {
      throw new Error('panels must be a non-empty array');
    }

    const results = [];

    for (const panelData of panels) {
      // Create new panel
      const result = await BackendDataService.createPanel(panelData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              panels: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create panels: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updatePanelsHandler(args: any) {
  try {
    const { panels } = args;

    if (!Array.isArray(panels) || panels.length === 0) {
      throw new Error('panels must be a non-empty array');
    }

    const results = [];

    for (const panelData of panels) {
      // Update existing panel
      const { id, ...updates } = panelData;
      if (!id) {
        throw new Error('Panel ID is required for updates');
      }
      const result = await BackendDataService.updatePanel(id, updates);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              panels: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update panels: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Dialogue separate handlers
export async function createDialoguesHandler(args: any) {
  try {
    const { dialogues } = args;

    if (!Array.isArray(dialogues) || dialogues.length === 0) {
      throw new Error('dialogues must be a non-empty array');
    }

    const results = [];

    for (const dialogueData of dialogues) {
      // Create new dialogue
      const result = await BackendDataService.createPanelDialogue(dialogueData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              dialogues: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create dialogues: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateDialoguesHandler(args: any) {
  try {
    const { dialogues } = args;

    if (!Array.isArray(dialogues) || dialogues.length === 0) {
      throw new Error('dialogues must be a non-empty array');
    }

    const results = [];

    for (const dialogueData of dialogues) {
      // Update existing dialogue
      const { id, ...updates } = dialogueData;
      if (!id) {
        throw new Error('Dialogue ID is required for updates');
      }
      const result = await BackendDataService.updatePanelDialogue(id, updates);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              dialogues: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update dialogues: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Character separate handlers
export async function createCharactersHandler(args: any) {
  try {
    const { characters } = args;

    if (!Array.isArray(characters) || characters.length === 0) {
      throw new Error('characters must be a non-empty array');
    }

    const results = [];

    for (const characterData of characters) {
      // Create new character
      const result = await BackendDataService.createCharacter(characterData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              characters: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create characters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateCharactersHandler(args: any) {
  try {
    const { characters } = args;

    if (!Array.isArray(characters) || characters.length === 0) {
      throw new Error('characters must be a non-empty array');
    }

    const results = [];

    for (const characterData of characters) {
      // Update existing character
      const { id, ...updates } = characterData;
      if (!id) {
        throw new Error('Character ID is required for updates');
      }
      const result = await BackendDataService.updateCharacter(id, updates);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              characters: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update characters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Scene separate handlers
export async function createScenesHandler(args: any) {
  try {
    const { scenes } = args;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error('scenes must be a non-empty array');
    }

    const results = [];

    for (const sceneData of scenes) {
      // Create new scene
      const result = await BackendDataService.createScene(sceneData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              scenes: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create scenes: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateScenesHandler(args: any) {
  try {
    const { scenes } = args;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error('scenes must be a non-empty array');
    }

    const results = [];

    for (const sceneData of scenes) {
      // Update existing scene
      const { id, ...updates } = sceneData;
      if (!id) {
        throw new Error('Scene ID is required for updates');
      }
      const result = await BackendDataService.updateScene(id, updates);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              scenes: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update scenes: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Chapter separate handlers
export async function createChaptersHandler(args: any) {
  try {
    const { chapters } = args;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      throw new Error('chapters must be a non-empty array');
    }

    const results = [];

    for (const chapterData of chapters) {
      // Create new chapter
      const result = await BackendDataService.createChapter(chapterData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              chapters: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create chapters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateChaptersHandler(args: any) {
  try {
    const { chapters } = args;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      throw new Error('chapters must be a non-empty array');
    }

    const results = [];

    for (const chapterData of chapters) {
      // Update existing chapter
      const { id, ...updates } = chapterData;
      if (!id) {
        throw new Error('Chapter ID is required for updates');
      }
      const result = await BackendDataService.updateChapter(id, updates);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              chapters: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update chapters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Chapter batch handler
export async function createOrUpdateChaptersHandler(args: any) {
  try {
    const { chapters } = args;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      throw new Error('chapters must be a non-empty array');
    }

    const results = [];

    for (const chapterData of chapters) {
      let result;

      if (isUpdateOperation(chapterData)) {
        // Update existing chapter
        const { id, ...updates } = chapterData;
        result = await BackendDataService.updateChapter(id, updates);
      } else {
        // Create new chapter
        result = await BackendDataService.createChapter(chapterData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              chapters: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update chapters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Scene batch handler
export async function createOrUpdateScenesHandler(args: any) {
  try {
    const { scenes } = args;

    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error('scenes must be a non-empty array');
    }

    const results = [];

    for (const sceneData of scenes) {
      let result;

      if (isUpdateOperation(sceneData)) {
        // Update existing scene
        const { id, ...updates } = sceneData;
        result = await BackendDataService.updateScene(id, updates);
      } else {
        // Create new scene
        result = await BackendDataService.createScene(sceneData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              scenes: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update scenes: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Panel batch handler
export async function createOrUpdatePanelsHandler(args: any) {
  try {
    const { panels } = args;

    if (!Array.isArray(panels) || panels.length === 0) {
      throw new Error('panels must be a non-empty array');
    }

    const results = [];

    for (const panelData of panels) {
      let result;

      if (isUpdateOperation(panelData)) {
        // Update existing panel
        const { id, ...updates } = panelData;
        result = await BackendDataService.updatePanel(id, updates);
      } else {
        // Create new panel
        result = await BackendDataService.createPanel(panelData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              panels: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update panels: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Character batch handler
export async function createOrUpdateCharactersHandler(args: any) {
  try {
    const { characters } = args;

    if (!Array.isArray(characters) || characters.length === 0) {
      throw new Error('characters must be a non-empty array');
    }

    const results = [];

    for (const characterData of characters) {
      let result;

      if (isUpdateOperation(characterData)) {
        // Update existing character
        const { id, ...updates } = characterData;
        result = await BackendDataService.updateCharacter(id, updates);
      } else {
        // Create new character
        result = await BackendDataService.createCharacter(characterData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              characters: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update characters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Dialogue batch handler
export async function createOrUpdateDialoguesHandler(args: any) {
  try {
    const { dialogues } = args;

    if (!Array.isArray(dialogues) || dialogues.length === 0) {
      throw new Error('dialogues must be a non-empty array');
    }

    const results = [];

    for (const dialogueData of dialogues) {
      let result;

      if (isUpdateOperation(dialogueData)) {
        // Update existing dialogue
        const { id, ...updates } = dialogueData;
        result = await BackendDataService.updatePanelDialogue(id, updates);
      } else {
        // Create new dialogue
        result = await BackendDataService.createPanelDialogue(dialogueData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              dialogues: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update dialogues: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Outfit Template separate handlers
export async function createOutfitTemplatesHandler(args: any) {
  try {
    const { outfitTemplates } = args;

    if (!Array.isArray(outfitTemplates) || outfitTemplates.length === 0) {
      throw new Error('outfitTemplates must be a non-empty array');
    }

    const results = [];

    for (const templateData of outfitTemplates) {
      // Create new outfit template
      const result =
        await BackendDataService.createOutfitTemplate(templateData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              outfitTemplates: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create outfit templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateOutfitTemplatesHandler(args: any) {
  try {
    const { outfitTemplates } = args;

    if (!Array.isArray(outfitTemplates) || outfitTemplates.length === 0) {
      throw new Error('outfitTemplates must be a non-empty array');
    }

    const results = [];

    for (const templateData of outfitTemplates) {
      // Update existing outfit template
      const { id, ...updates } = templateData;
      if (!id) {
        throw new Error('Outfit template ID is required for updates');
      }
      const result = await BackendDataService.updateOutfitTemplate(id, updates);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              outfitTemplates: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update outfit templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Location Template separate handlers
export async function createLocationTemplatesHandler(args: any) {
  try {
    const { locationTemplates } = args;

    if (!Array.isArray(locationTemplates) || locationTemplates.length === 0) {
      throw new Error('locationTemplates must be a non-empty array');
    }

    const results = [];

    for (const templateData of locationTemplates) {
      // Create new location template
      const result =
        await BackendDataService.createLocationTemplate(templateData);
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              locationTemplates: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create location templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function updateLocationTemplatesHandler(args: any) {
  try {
    const { locationTemplates } = args;

    if (!Array.isArray(locationTemplates) || locationTemplates.length === 0) {
      throw new Error('locationTemplates must be a non-empty array');
    }

    const results = [];

    for (const templateData of locationTemplates) {
      // Update existing location template
      const { id, ...updates } = templateData;
      if (!id) {
        throw new Error('Location template ID is required for updates');
      }
      const result = await BackendDataService.updateLocationTemplate(
        id,
        updates,
      );
      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              locationTemplates: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to update location templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Outfit Template batch handler
export async function createOrUpdateOutfitTemplatesHandler(args: any) {
  try {
    const { outfitTemplates } = args;

    if (!Array.isArray(outfitTemplates) || outfitTemplates.length === 0) {
      throw new Error('outfitTemplates must be a non-empty array');
    }

    const results = [];

    for (const templateData of outfitTemplates) {
      let result;

      if (isUpdateOperation(templateData)) {
        // Update existing template
        const { id, ...updates } = templateData;
        result = await BackendDataService.updateOutfitTemplate(id, updates);
      } else {
        // Create new template
        result = await BackendDataService.createOutfitTemplate(templateData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              outfitTemplates: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update outfit templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Location Template batch handler
export async function createOrUpdateLocationTemplatesHandler(args: any) {
  try {
    const { locationTemplates } = args;

    if (!Array.isArray(locationTemplates) || locationTemplates.length === 0) {
      throw new Error('locationTemplates must be a non-empty array');
    }

    const results = [];

    for (const templateData of locationTemplates) {
      let result;

      if (isUpdateOperation(templateData)) {
        // Update existing template
        const { id, ...updates } = templateData;
        result = await BackendDataService.updateLocationTemplate(id, updates);
      } else {
        // Create new template
        result = await BackendDataService.createLocationTemplate(templateData);
      }

      results.push(result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              count: results.length,
              locationTemplates: results,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to create/update location templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
