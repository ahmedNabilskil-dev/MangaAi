import {
  getAllProjects,
  getChapterForContext,
  getChapters,
  getCharacter,
  getLocationTemplate,
  getOutfitTemplate,
  getPanelForContext,
  getProject,
  getSceneForContext,
  getScenes,
  listCharacters,
  listLocationTemplates,
  listOutfitTemplates,
} from "../../services/data-service.js";

export async function getProjectResourceHandler(uri: string) {
  const projectId = uri.replace("manga://project/", "");

  try {
    const project = await getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(project, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get project resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getChapterResourceHandler(uri: string) {
  const chapterId = uri.replace("manga://chapter/", "");

  try {
    const chapter = await getChapterForContext(chapterId);
    if (!chapter) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(chapter, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get chapter resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getSceneResourceHandler(uri: string) {
  const sceneId = uri.replace("manga://scene/", "");

  try {
    const scene = await getSceneForContext(sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(scene, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get scene resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getPanelResourceHandler(uri: string) {
  const panelId = uri.replace("manga://panel/", "");

  try {
    const panel = await getPanelForContext(panelId);
    if (!panel) {
      throw new Error(`Panel ${panelId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(panel, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get panel resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getCharacterResourceHandler(uri: string) {
  const characterId = uri.replace("manga://character/", "");

  try {
    const character = await getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(character, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get character resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getProjectStructureResourceHandler(uri: string) {
  const projectId = uri.replace("manga://project-structure/", "");

  try {
    const project = await getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const chapters = await getChapters(projectId);
    const characters = await listCharacters(projectId);

    // Build a structured overview
    const structure = {
      project: {
        id: project.id,
        title: project.title,
        genre: project.genre,
        description: project.description,
        status: project.status,
      },
      chapters: await Promise.all(
        chapters.map(async (chapter) => {
          const scenes = await getScenes(chapter.id);
          return {
            id: chapter.id,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            narrative: chapter.narrative,
            sceneCount: scenes.length,
            scenes: scenes.map((scene) => ({
              id: scene.id,
              title: scene.title,
              order: scene.order,
            })),
          };
        })
      ),
      characters: characters.map((character) => ({
        id: character.id,
        name: character.name,
        role: character.role,
        briefDescription: character.briefDescription,
      })),
    };

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(structure, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get project structure: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listProjectsResourceHandler() {
  try {
    const projects = await getAllProjects();

    const projectList = projects.map((project) => ({
      id: project.id,
      title: project.title,
      genre: project.genre,
      status: project.status,
      description: project.description,
    }));

    return {
      contents: [
        {
          uri: "manga://projects",
          mimeType: "application/json",
          text: JSON.stringify(projectList, null, 2),
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

export async function getOutfitTemplateResourceHandler(uri: string) {
  const outfitTemplateId = uri.replace("manga://outfit-template/", "");

  try {
    const outfitTemplate = await getOutfitTemplate(outfitTemplateId);
    if (!outfitTemplate) {
      throw new Error(`Outfit template ${outfitTemplateId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(outfitTemplate, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get outfit template resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getLocationTemplateResourceHandler(uri: string) {
  const locationTemplateId = uri.replace("manga://location-template/", "");

  try {
    const locationTemplate = await getLocationTemplate(locationTemplateId);
    if (!locationTemplate) {
      throw new Error(`Location template ${locationTemplateId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(locationTemplate, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to get location template resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listOutfitTemplatesResourceHandler(uri: string) {
  try {
    const outfitTemplates = await listOutfitTemplates();
    const templateList = outfitTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      gender: template.gender,
      uri: `manga://outfit-template/${template.id}`,
    }));

    return {
      contents: [
        {
          uri: "manga://outfit-templates",
          mimeType: "application/json",
          text: JSON.stringify(templateList, null, 2),
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

export async function listLocationTemplatesResourceHandler(uri: string) {
  try {
    const locationTemplates = await listLocationTemplates();
    const templateList = locationTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      style: template.style,
      uri: `manga://location-template/${template.id}`,
    }));

    return {
      contents: [
        {
          uri: "manga://location-templates",
          mimeType: "application/json",
          text: JSON.stringify(templateList, null, 2),
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
