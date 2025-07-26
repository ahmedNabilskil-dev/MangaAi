import {
  getAllProjects,
  getChapterForContext,
  getChapters,
  getCharacter as getCharacterForContext,
  getLocationTemplate,
  getOutfitTemplate,
  getPanelDialogueForContext,
  getPanelDialogues,
  getPanelForContext,
  getPanels,
  getProject as getProjectService,
  getSceneForContext,
  getScenes,
  listCharacters,
  listLocationTemplates,
  listOutfitTemplates,
} from "../../services/data-service.js";

export async function getProjectHandler(args: any) {
  try {
    const { projectId } = args;
    const result = await getProjectService(projectId);

    if (!result) {
      throw new Error(`Project ${projectId} not found`);
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
      `Failed to get project: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getChapterHandler(args: any) {
  try {
    const { chapterId } = args;
    const result = await getChapterForContext(chapterId);

    if (!result) {
      throw new Error(`Chapter ${chapterId} not found`);
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
      `Failed to get chapter: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getSceneHandler(args: any) {
  try {
    const { sceneId } = args;
    const result = await getSceneForContext(sceneId);

    if (!result) {
      throw new Error(`Scene ${sceneId} not found`);
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
      `Failed to get scene: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getPanelHandler(args: any) {
  try {
    const { panelId } = args;
    const result = await getPanelForContext(panelId);

    if (!result) {
      throw new Error(`Panel ${panelId} not found`);
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
      `Failed to get panel: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getCharacterHandler(args: any) {
  try {
    const { characterId } = args;
    const result = await getCharacterForContext(characterId);

    if (!result) {
      throw new Error(`Character ${characterId} not found`);
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
      `Failed to get character: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getPanelDialogueHandler(args: any) {
  try {
    const { dialogueId } = args;
    const result = await getPanelDialogueForContext(dialogueId);

    if (!result) {
      throw new Error(`Dialogue ${dialogueId} not found`);
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
      `Failed to get panel dialogue: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listProjectsHandler(args: any) {
  try {
    const { limit, offset } = args;
    const allProjects = await getAllProjects();

    // Apply pagination
    let result = allProjects;
    if (offset) {
      result = result.slice(offset);
    }
    if (limit) {
      result = result.slice(0, limit);
    }

    // Return only basic project information
    const projectSummaries = result.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      genre: project.genre,
      coverImageUrl: project.coverImageUrl,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(projectSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list projects: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listChaptersForProjectHandler(args: any) {
  try {
    const { projectId, publishedOnly } = args;
    let chapters = await getChapters(projectId);

    if (publishedOnly) {
      chapters = chapters.filter((chapter: any) => chapter.isPublished);
    }

    // Return only summary information
    const chapterSummaries = chapters.map((chapter: any) => ({
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      isPublished: chapter.isPublished,
      coverImageUrl: chapter.coverImageUrl,
      narrative: chapter.narrative,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(chapterSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list chapters: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listScenesForChapterHandler(args: any) {
  try {
    const { chapterId } = args;
    const scenes = await getScenes(chapterId);

    // Return only summary information
    const sceneSummaries = scenes.map((scene: any) => ({
      id: scene.id,
      order: scene.order,
      title: scene.title,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(sceneSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list scenes: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listPanelsForSceneHandler(args: any) {
  try {
    const { sceneId } = args;
    const panels = await getPanels(sceneId);

    // Return only summary information
    const panelSummaries = panels.map((panel: any) => ({
      id: panel.id,
      order: panel.order,
      imageUrl: panel.imageUrl,
      panelContext: panel.panelContext,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(panelSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list panels: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listDialoguesForPanelHandler(args: any) {
  try {
    const { panelId } = args;
    const dialogues = await getPanelDialogues(panelId);

    // Return only summary information
    const dialogueSummaries = dialogues.map((dialogue: any) => ({
      id: dialogue.id,
      order: dialogue.order,
      content: dialogue.content,
      speakerId: dialogue.speakerId,
      emotion: dialogue.emotion,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(dialogueSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list dialogues: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listCharactersForProjectHandler(args: any) {
  try {
    const { projectId, role } = args;
    let characters = await listCharacters(projectId);

    if (role) {
      characters = characters.filter(
        (character: any) => character.role === role
      );
    }

    // Return only summary information
    const characterSummaries = characters.map((character: any) => ({
      id: character.id,
      name: character.name,
      role: character.role,
      briefDescription: character.briefDescription,
      imgUrl: character.imgUrl,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(characterSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list characters: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getOutfitTemplateHandler(args: any) {
  try {
    const { outfitTemplateId } = args;
    const outfitTemplate = await getOutfitTemplate(outfitTemplateId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(outfitTemplate, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get outfit template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getLocationTemplateHandler(args: any) {
  try {
    const { locationTemplateId } = args;
    const locationTemplate = await getLocationTemplate(locationTemplateId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(locationTemplate, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get location template: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listOutfitTemplatesHandler(args: any) {
  try {
    const { mangaProjectId, limit, offset, ...filters } = args;
    const allOutfitTemplates = await listOutfitTemplates(filters);

    // Filter by project ID
    const projectOutfitTemplates = mangaProjectId
      ? allOutfitTemplates.filter(
          (template) => template.mangaProjectId === mangaProjectId
        )
      : allOutfitTemplates;

    // Apply pagination
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : projectOutfitTemplates.length;
    const paginatedTemplates = projectOutfitTemplates.slice(
      startIndex,
      endIndex
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              outfitTemplates: paginatedTemplates.map((template) => ({
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                gender: template.gender,
                isActive: template.isActive,
              })),
              total: paginatedTemplates.length,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list outfit templates: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listLocationTemplatesHandler(args: any) {
  try {
    const { mangaProjectId, limit, offset, ...filters } = args;
    const allLocationTemplates = await listLocationTemplates(filters);

    // Filter by project ID
    const projectLocationTemplates = mangaProjectId
      ? allLocationTemplates.filter(
          (template) => template.mangaProjectId === mangaProjectId
        )
      : allLocationTemplates;

    // Apply pagination
    const startIndex = offset || 0;
    const endIndex = limit
      ? startIndex + limit
      : projectLocationTemplates.length;
    const paginatedTemplates = projectLocationTemplates.slice(
      startIndex,
      endIndex
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              locationTemplates: paginatedTemplates.map((template) => ({
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                style: template.style,
                isActive: template.isActive,
              })),
              total: paginatedTemplates.length,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list location templates: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
