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
  getChapters,
  getCharacterForContext,
  getLocationTemplate,
  getOutfitTemplate,
  getPanelDialogueForContext,
  listPanelDialogues as getPanelDialogues,
  getPanelForContext,
  listPanels as getPanels,
  getProject as getProjectService,
  getSceneForContext,
  getScenes,
  listCharacters,
  listLocationTemplates,
  listMangaProjects,
  listOutfitTemplates,
} from "../../../services/data-service.js";

// Entity type to getter function mapping
const entityGetters = {
  project: getProjectService,
  chapter: getChapterForContext,
  scene: getSceneForContext,
  panel: getPanelForContext,
  character: getCharacterForContext,
  dialogue: getPanelDialogueForContext,
  outfitTemplate: getOutfitTemplate,
  locationTemplate: getLocationTemplate,
};

// Entity type to deleter function mapping
const entityDeleters = {
  project: deleteProjectService,
  chapter: deleteChapterService,
  scene: deleteSceneService,
  panel: deletePanelService,
  character: deleteCharacterService,
  dialogue: deletePanelDialogueService,
  outfitTemplate: deleteOutfitTemplateService,
  locationTemplate: deleteLocationTemplateService,
};

// Entity type to lister function mapping
const entityListers = {
  projects: () => listMangaProjects(),
  chapters: (parentId: string, filters?: any) => {
    if (filters?.publishedOnly) {
      return getChapters(parentId).then((chapters: any[]) =>
        chapters.filter((chapter: any) => chapter.isPublished)
      );
    }
    return getChapters(parentId);
  },
  scenes: (parentId: string) => getScenes(parentId),
  panels: (parentId: string) => getPanels(parentId),
  characters: (parentId: string, filters?: any) => {
    return listCharacters(parentId).then((characters: any[]) => {
      if (filters?.role) {
        return characters.filter(
          (character: any) => character.role === filters.role
        );
      }
      return characters;
    });
  },
  dialogues: (parentId: string) => getPanelDialogues(parentId),
  outfitTemplates: (parentId: string, filters?: any) => {
    return listOutfitTemplates(filters || {}).then((templates: any[]) =>
      templates.filter((template: any) => template.mangaProjectId === parentId)
    );
  },
  locationTemplates: (parentId: string, filters?: any) => {
    return listLocationTemplates(filters || {}).then((templates: any[]) =>
      templates.filter((template: any) => template.mangaProjectId === parentId)
    );
  },
};

export async function getEntityHandler(args: any) {
  try {
    const { entityType, entityId } = args;

    const getter = entityGetters[entityType as keyof typeof entityGetters];
    if (!getter) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const result = await getter(entityId);

    if (!result) {
      throw new Error(`${entityType} ${entityId} not found`);
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
      `Failed to get ${args.entityType}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function listEntitiesHandler(args: any) {
  try {
    const { entityType, parentId, filters } = args;

    const lister = entityListers[entityType as keyof typeof entityListers];
    if (!lister) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Check if parentId is required for this entity type
    const requiresParent = !["projects"].includes(entityType);
    if (requiresParent && !parentId) {
      throw new Error(`parentId is required for listing ${entityType}`);
    }

    let result;
    if (parentId) {
      result = await lister(parentId, filters);
    } else {
      // For entity types that don't require parentId, call without arguments
      result = await (lister as () => Promise<any>)();
    }

    // Apply summary transformations based on entity type
    let summaryResult;
    switch (entityType) {
      case "projects":
        summaryResult = result;
        break;
      case "chapters":
        summaryResult = result.map((chapter: any) => ({
          id: chapter.id,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          isPublished: chapter.isPublished,
          coverImageUrl: chapter.coverImageUrl,
          narrative: chapter.narrative,
        }));
        break;
      case "scenes":
        summaryResult = result.map((scene: any) => ({
          id: scene.id,
          order: scene.order,
          title: scene.title,
        }));
        break;
      case "panels":
        summaryResult = result.map((panel: any) => ({
          id: panel.id,
          order: panel.order,
          imageUrl: panel.imageUrl,
          panelContext: panel.panelContext,
        }));
        break;
      case "characters":
        summaryResult = result.map((character: any) => ({
          id: character.id,
          name: character.name,
          role: character.role,
          briefDescription: character.briefDescription,
          imgUrl: character.imgUrl,
        }));
        break;
      case "dialogues":
        summaryResult = result.map((dialogue: any) => ({
          id: dialogue.id,
          order: dialogue.order,
          content: dialogue.content,
          speakerId: dialogue.speakerId,
          emotion: dialogue.emotion,
        }));
        break;
      case "outfitTemplates":
        summaryResult = {
          outfitTemplates: result.map((template: any) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            gender: template.gender,
            isActive: template.isActive,
          })),
          total: result.length,
        };
        break;
      case "locationTemplates":
        summaryResult = {
          locationTemplates: result.map((template: any) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            style: template.style,
            isActive: template.isActive,
          })),
          total: result.length,
        };
        break;
      default:
        summaryResult = result;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(summaryResult, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to list ${args.entityType}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function deleteEntityHandler(args: any) {
  try {
    const { entityType, entityId, confirmation } = args;

    // Special handling for project deletion - requires confirmation
    if (entityType === "project" && !confirmation) {
      throw new Error("Project deletion requires explicit confirmation=true");
    }

    const getter = entityGetters[entityType as keyof typeof entityGetters];
    const deleter = entityDeleters[entityType as keyof typeof entityDeleters];

    if (!getter || !deleter) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Check if entity exists before attempting deletion
    const exists = await getter(entityId);
    if (!exists) {
      throw new Error(`${entityType} ${entityId} not found`);
    }

    // Perform the deletion
    const result = await deleter(entityId);

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
      `Failed to delete ${args.entityType}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
