import { BackendDataService } from '../../services/backend-data.service';

// Note: Some fetch operations are not implemented yet in BackendDataService
// These handlers will work where the underlying DatabaseService methods exist

export async function getProjectHandler(args: any) {
  try {
    const { projectId } = args;
    const result = await BackendDataService.getProject(projectId);

    if (!result) {
      throw new Error(`Project ${projectId} not found`);
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
      `Failed to get project: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function getChapterHandler(args: any) {
  try {
    const { chapterId } = args;
    const result = await BackendDataService.getChapter(chapterId);

    if (!result) {
      throw new Error(`Chapter ${chapterId} not found`);
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
      `Failed to get chapter: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function getCharacterHandler(args: any) {
  try {
    const { characterId } = args;
    const result = await BackendDataService.getCharacter(characterId);

    if (!result) {
      throw new Error(`Character ${characterId} not found`);
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
      `Failed to get character: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listProjectsHandler(args: any) {
  try {
    const { userId } = args;
    const result = await BackendDataService.getMangaProjects(userId);

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
      `Failed to list projects: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listCharactersForProjectHandler(args: any) {
  try {
    const { projectId, role } = args;
    let characters = await BackendDataService.getCharactersByProject(projectId);

    if (role) {
      characters = characters.filter(
        (character: any) => character.role === role,
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
          type: 'text',
          text: JSON.stringify(characterSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list characters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listChaptersForProjectHandler(args: any) {
  try {
    const { projectId, publishedOnly } = args;
    let chapters = await BackendDataService.getChaptersByProject(projectId);

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
          type: 'text',
          text: JSON.stringify(chapterSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list chapters: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listScenesForChapterHandler(args: any) {
  try {
    const { chapterId } = args;
    const scenes = await BackendDataService.getScenesByChapter(chapterId);

    // Return only summary information
    const sceneSummaries = scenes.map((scene: any) => ({
      id: scene.id,
      order: scene.order,
      title: scene.title,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sceneSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list scenes: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listPanelsForSceneHandler(args: any) {
  try {
    const { sceneId } = args;
    const panels = await BackendDataService.getPanelsByScene(sceneId);

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
          type: 'text',
          text: JSON.stringify(panelSummaries, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list panels: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listOutfitTemplatesHandler(args: any) {
  try {
    const { mangaProjectId, characterId, limit, offset } = args;

    let outfitTemplates;
    if (characterId) {
      outfitTemplates =
        await BackendDataService.getOutfitTemplatesByCharacter(characterId);
    } else if (mangaProjectId) {
      outfitTemplates =
        await BackendDataService.getOutfitTemplatesByProject(mangaProjectId);
    } else {
      throw new Error('Either mangaProjectId or characterId is required');
    }

    // Apply pagination if specified
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : outfitTemplates.length;
    const paginatedTemplates = outfitTemplates.slice(startIndex, endIndex);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              outfitTemplates: paginatedTemplates.map((template: any) => ({
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
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list outfit templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listLocationTemplatesHandler(args: any) {
  try {
    const { mangaProjectId, limit, offset } = args;

    if (!mangaProjectId) {
      throw new Error('mangaProjectId is required');
    }

    const locationTemplates =
      await BackendDataService.getLocationTemplatesByProject(mangaProjectId);

    // Apply pagination if specified
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : locationTemplates.length;
    const paginatedTemplates = locationTemplates.slice(startIndex, endIndex);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              locationTemplates: paginatedTemplates.map((template: any) => ({
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
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list location templates: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Handlers for operations not yet supported by DatabaseService - will throw errors
export async function getSceneHandler(args: any) {
  throw new Error('Get scene operation not supported by DatabaseService yet');
}

export async function getPanelHandler(args: any) {
  throw new Error('Get panel operation not supported by DatabaseService yet');
}

export async function getDialogueHandler(args: any) {
  throw new Error(
    'Get dialogue operation not supported by DatabaseService yet',
  );
}

export async function getOutfitTemplateHandler(args: any) {
  throw new Error(
    'Get outfit template operation not supported by DatabaseService yet',
  );
}

export async function getLocationTemplateHandler(args: any) {
  throw new Error(
    'Get location template operation not supported by DatabaseService yet',
  );
}

export async function listDialoguesForPanelHandler(args: any) {
  throw new Error(
    'List dialogues operation not supported by DatabaseService yet',
  );
}
