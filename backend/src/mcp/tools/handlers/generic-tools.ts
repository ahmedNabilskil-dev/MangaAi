import { BackendDataService } from '../../services/backend-data.service';

// Generic handlers for entities - route to specific implementations based on entity type

export async function getEntityHandler(args: any) {
  try {
    const { entityType, entityId } = args;

    switch (entityType) {
      case 'project':
        return await BackendDataService.getProject(entityId);
      case 'chapter':
        return await BackendDataService.getChapter(entityId);
      case 'character':
        return await BackendDataService.getCharacter(entityId);
      default:
        throw new Error(
          `Get operation not supported for entity type: ${entityType}`,
        );
    }
  } catch (error) {
    throw new Error(
      `Failed to get entity: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function listEntitiesHandler(args: any) {
  try {
    const { entityType, projectId, chapterId, sceneId, characterId, userId } =
      args;

    switch (entityType) {
      case 'projects':
        if (!userId) throw new Error('userId required for listing projects');
        return await BackendDataService.getMangaProjects(userId);

      case 'characters':
        if (!projectId)
          throw new Error('projectId required for listing characters');
        return await BackendDataService.getCharactersByProject(projectId);

      case 'chapters':
        if (!projectId)
          throw new Error('projectId required for listing chapters');
        return await BackendDataService.getChaptersByProject(projectId);

      case 'scenes':
        if (!chapterId)
          throw new Error('chapterId required for listing scenes');
        return await BackendDataService.getScenesByChapter(chapterId);

      case 'panels':
        if (!sceneId) throw new Error('sceneId required for listing panels');
        return await BackendDataService.getPanelsByScene(sceneId);

      case 'outfitTemplates':
        if (characterId) {
          return await BackendDataService.getOutfitTemplatesByCharacter(
            characterId,
          );
        } else if (projectId) {
          return await BackendDataService.getOutfitTemplatesByProject(
            projectId,
          );
        } else {
          throw new Error(
            'Either projectId or characterId required for listing outfit templates',
          );
        }

      case 'locationTemplates':
        if (!projectId)
          throw new Error('projectId required for listing location templates');
        return await BackendDataService.getLocationTemplatesByProject(
          projectId,
        );

      default:
        throw new Error(
          `List operation not supported for entity type: ${entityType}`,
        );
    }
  } catch (error) {
    throw new Error(
      `Failed to list entities: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function deleteEntityHandler(args: any) {
  try {
    const { entityType, entityId } = args;

    switch (entityType) {
      case 'project':
        return await BackendDataService.deleteProject(entityId);
      case 'chapter':
        return await BackendDataService.deleteChapter(entityId);
      case 'character':
        return await BackendDataService.deleteCharacter(entityId);
      default:
        throw new Error(
          `Delete operation not supported for entity type: ${entityType}`,
        );
    }
  } catch (error) {
    throw new Error(
      `Failed to delete entity: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
