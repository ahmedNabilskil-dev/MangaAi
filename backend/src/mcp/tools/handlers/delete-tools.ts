import { BackendDataService } from '../../services/backend-data.service';

export async function deleteChapterHandler(args: any) {
  try {
    const { chapterId } = args;
    const result = await BackendDataService.deleteChapter(chapterId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { success: true, deletedChapterId: chapterId },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete chapter: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function deleteCharacterHandler(args: any) {
  try {
    const { characterId } = args;
    const result = await BackendDataService.deleteCharacter(characterId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { success: true, deletedCharacterId: characterId },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to delete character: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Delete operations not yet supported by DatabaseService - will throw errors
export async function deleteSceneHandler(args: any) {
  throw new Error(
    'Scene delete operation not supported by DatabaseService yet',
  );
}

export async function deletePanelHandler(args: any) {
  throw new Error(
    'Panel delete operation not supported by DatabaseService yet',
  );
}

export async function deletePanelDialogueHandler(args: any) {
  throw new Error(
    'Panel dialogue delete operation not supported by DatabaseService yet',
  );
}

export async function deleteOutfitTemplateHandler(args: any) {
  throw new Error(
    'Outfit template delete operation not supported by DatabaseService yet',
  );
}

export async function deleteLocationTemplateHandler(args: any) {
  throw new Error(
    'Location template delete operation not supported by DatabaseService yet',
  );
}
