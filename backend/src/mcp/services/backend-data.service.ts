// Backend data service for MCP tools to interact with MongoDB/Mongoose
import { DatabaseService } from '../../modules/manga/database.service';

// This service provides a bridge between MCP tools and the actual database service
// It will need a DatabaseService instance to be passed in
export class BackendDataService {
  private static databaseService: DatabaseService;

  static setDatabaseService(dbService: DatabaseService) {
    this.databaseService = dbService;
  }

  private static ensureDatabase() {
    if (!this.databaseService) {
      throw new Error(
        'DatabaseService not initialized. Call setDatabaseService first.',
      );
    }
  }

  // Project operations
  static async createProject(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createMangaProject(data);
  }

  static async updateProject(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.updateMangaProject(id, updates);
  }

  static async getProject(id: string): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.getMangaProject(id);
  }

  static async deleteProject(id: string): Promise<boolean> {
    this.ensureDatabase();
    await this.databaseService.deleteMangaProject(id);
    return true;
  }

  // Character operations
  static async createCharacter(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createCharacter(data);
  }

  static async updateCharacter(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.updateCharacter(id, updates);
  }

  static async getCharacter(id: string): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.getCharacter(id);
  }

  static async deleteCharacter(id: string): Promise<boolean> {
    this.ensureDatabase();
    await this.databaseService.deleteCharacter(id);
    return true;
  }

  // Chapter operations
  static async createChapter(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createChapter(data);
  }

  static async updateChapter(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.updateChapter(id, updates);
  }

  static async getChapter(id: string): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.getChapter(id);
  }

  static async deleteChapter(id: string): Promise<boolean> {
    this.ensureDatabase();
    await this.databaseService.deleteChapter(id);
    return true;
  }

  // Scene operations
  static async createScene(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createScene(data);
  }

  static async updateScene(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have updateScene method, would need to be added
    throw new Error('Scene update not implemented in DatabaseService yet');
  }

  static async getScene(id: string): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have getScene method, would need to be added
    throw new Error('Scene get not implemented in DatabaseService yet');
  }

  static async deleteScene(id: string): Promise<boolean> {
    this.ensureDatabase();
    // DatabaseService doesn't have deleteScene method, would need to be added
    throw new Error('Scene delete not implemented in DatabaseService yet');
  }

  static async getScenesByChapter(chapterId: string): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getScenesByChapter(chapterId);
  }

  // Panel operations
  static async createPanel(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createPanel(data);
  }

  static async updatePanel(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have updatePanel method, would need to be added
    throw new Error('Panel update not implemented in DatabaseService yet');
  }

  static async getPanel(id: string): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have getPanel method, would need to be added
    throw new Error('Panel get not implemented in DatabaseService yet');
  }

  static async deletePanel(id: string): Promise<boolean> {
    this.ensureDatabase();
    // DatabaseService doesn't have deletePanel method, would need to be added
    throw new Error('Panel delete not implemented in DatabaseService yet');
  }

  static async getPanelsByScene(sceneId: string): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getPanelsByScene(sceneId);
  }

  // Panel Dialogue operations
  static async createPanelDialogue(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createPanelDialogue(data);
  }

  static async updatePanelDialogue(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have updatePanelDialogue method, would need to be added
    throw new Error(
      'Panel dialogue update not implemented in DatabaseService yet',
    );
  }

  static async getPanelDialogue(id: string): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have getPanelDialogue method, would need to be added
    throw new Error(
      'Panel dialogue get not implemented in DatabaseService yet',
    );
  }

  static async deletePanelDialogue(id: string): Promise<boolean> {
    this.ensureDatabase();
    // DatabaseService doesn't have deletePanelDialogue method, would need to be added
    throw new Error(
      'Panel dialogue delete not implemented in DatabaseService yet',
    );
  }

  // Outfit Template operations
  static async createOutfitTemplate(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createOutfitTemplate(data);
  }

  static async updateOutfitTemplate(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have updateOutfitTemplate method, would need to be added
    throw new Error(
      'Outfit template update not implemented in DatabaseService yet',
    );
  }

  static async getOutfitTemplate(id: string): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have getOutfitTemplate method, would need to be added
    throw new Error(
      'Outfit template get not implemented in DatabaseService yet',
    );
  }

  static async deleteOutfitTemplate(id: string): Promise<boolean> {
    this.ensureDatabase();
    // DatabaseService doesn't have deleteOutfitTemplate method, would need to be added
    throw new Error(
      'Outfit template delete not implemented in DatabaseService yet',
    );
  }

  static async getOutfitTemplatesByProject(projectId: string): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getOutfitTemplatesByProject(projectId);
  }

  static async getOutfitTemplatesByCharacter(
    characterId: string,
  ): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getOutfitTemplatesByCharacter(
      characterId,
    );
  }

  // Location Template operations
  static async createLocationTemplate(data: any): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.createLocationTemplate(data);
  }

  static async updateLocationTemplate(id: string, updates: any): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have updateLocationTemplate method, would need to be added
    throw new Error(
      'Location template update not implemented in DatabaseService yet',
    );
  }

  static async getLocationTemplate(id: string): Promise<any> {
    this.ensureDatabase();
    // DatabaseService doesn't have getLocationTemplate method, would need to be added
    throw new Error(
      'Location template get not implemented in DatabaseService yet',
    );
  }

  static async deleteLocationTemplate(id: string): Promise<boolean> {
    this.ensureDatabase();
    // DatabaseService doesn't have deleteLocationTemplate method, would need to be added
    throw new Error(
      'Location template delete not implemented in DatabaseService yet',
    );
  }

  static async getLocationTemplatesByProject(
    projectId: string,
  ): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getLocationTemplatesByProject(projectId);
  }

  // Batch operations
  static async getProjectData(projectId: string): Promise<any> {
    this.ensureDatabase();
    const [project, characters, chapters, outfitTemplates, locationTemplates] =
      await Promise.all([
        this.databaseService.getMangaProject(projectId),
        this.databaseService.getCharactersByProject(projectId),
        this.databaseService.getChaptersByProject(projectId),
        this.databaseService.getOutfitTemplatesByProject(projectId),
        this.databaseService.getLocationTemplatesByProject(projectId),
      ]);

    return {
      project,
      characters,
      chapters,
      outfitTemplates,
      locationTemplates,
    };
  }

  // Additional list methods
  static async getMangaProjects(
    userId?: string,
    limit = 20,
    offset = 0,
  ): Promise<any> {
    this.ensureDatabase();
    return await this.databaseService.getMangaProjects(userId, limit, offset);
  }

  static async getCharactersByProject(projectId: string): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getCharactersByProject(projectId);
  }

  static async getChaptersByProject(projectId: string): Promise<any[]> {
    this.ensureDatabase();
    return await this.databaseService.getChaptersByProject(projectId);
  }
}
