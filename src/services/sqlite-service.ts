// src/services/sqlite-service.ts
import type {
  Chapter,
  Character,
  LocationTemplate,
  MangaProject,
  OutfitTemplate,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import type { DeepPartial } from "@/types/utils";
import Database from "better-sqlite3";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import type { IDataService } from "./data-service.interface";

class SQLiteDataService implements IDataService {
  private db: Database.Database;
  private initialized = false;

  constructor(dbPath?: string) {
    // Default to 'manga.db' in the project root
    const defaultPath = join(process.cwd(), "manga.db");
    this.db = new Database(dbPath || defaultPath);
    this.db.pragma("journal_mode = WAL"); // Better performance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create tables
    this.createTables();
    this.initialized = true;
  }

  private createTables(): void {
    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'draft',
        initialPrompt TEXT,
        genre TEXT,
        artStyle TEXT,
        coverImageUrl TEXT,
        targetAudience TEXT,
        worldDetails TEXT, -- JSON
        concept TEXT,
        plotStructure TEXT, -- JSON
        themes TEXT, -- JSON array
        motifs TEXT, -- JSON array
        symbols TEXT, -- JSON array
        tags TEXT, -- JSON array
        creatorId TEXT,
        messages TEXT, -- JSON array
        viewCount INTEGER DEFAULT 0,
        likeCount INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Chapters table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        mangaProjectId TEXT NOT NULL,
        chapterNumber INTEGER NOT NULL,
        title TEXT NOT NULL,
        narrative TEXT NOT NULL,
        purpose TEXT,
        tone TEXT,
        keyCharacters TEXT, -- JSON array
        coverImageUrl TEXT,
        isAiGenerated BOOLEAN DEFAULT 0,
        isPublished BOOLEAN DEFAULT 0,
        viewCount INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (mangaProjectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Scenes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scenes (
        id TEXT PRIMARY KEY,
        chapterId TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        sceneContext TEXT NOT NULL, -- JSON object
        isAiGenerated BOOLEAN DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
      )
    `);

    // Panels table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS panels (
        id TEXT PRIMARY KEY,
        sceneId TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        imageUrl TEXT,
        panelContext TEXT NOT NULL, -- JSON object
        negativePrompt TEXT,
        isAiGenerated BOOLEAN DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (sceneId) REFERENCES scenes(id) ON DELETE CASCADE
      )
    `);

    // Panel dialogues table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS panel_dialogues (
        id TEXT PRIMARY KEY,
        panelId TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        style TEXT, -- JSON object
        emotion TEXT,
        subtextNote TEXT,
        speakerId TEXT,
        isAiGenerated BOOLEAN DEFAULT 0,
        config TEXT, -- JSON object
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (panelId) REFERENCES panels(id) ON DELETE CASCADE,
        FOREIGN KEY (speakerId) REFERENCES characters(id) ON DELETE SET NULL
      )
    `);

    // Characters table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        mangaProjectId TEXT NOT NULL,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        bodyAttributes TEXT, -- JSON object
        facialAttributes TEXT, -- JSON object
        hairAttributes TEXT, -- JSON object
        distinctiveFeatures TEXT, -- JSON array
        physicalMannerisms TEXT, -- JSON array
        posture TEXT,
        styleGuide TEXT, -- JSON object
        defaultOutfitId TEXT,
        outfitHistory TEXT, -- JSON array
        consistencyPrompt TEXT,
        negativePrompt TEXT,
        role TEXT DEFAULT 'supporting',
        briefDescription TEXT,
        personality TEXT,
        abilities TEXT,
        backstory TEXT,
        imgUrl TEXT,
        traits TEXT, -- JSON array
        arcs TEXT, -- JSON array
        isAiGenerated BOOLEAN DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (mangaProjectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Panel-Character many-to-many relationship
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS panel_characters (
        panelId TEXT NOT NULL,
        characterId TEXT NOT NULL,
        PRIMARY KEY (panelId, characterId),
        FOREIGN KEY (panelId) REFERENCES panels(id) ON DELETE CASCADE,
        FOREIGN KEY (characterId) REFERENCES characters(id) ON DELETE CASCADE
      )
    `);

    // Outfit templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS outfit_templates (
        id TEXT PRIMARY KEY,
        mangaProjectId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        subCategory TEXT,
        gender TEXT,
        ageGroup TEXT,
        season TEXT,
        style TEXT,
        components TEXT, -- JSON array
        colorSchemes TEXT, -- JSON array
        materials TEXT, -- JSON array
        variations TEXT, -- JSON array
        occasions TEXT, -- JSON array
        compatibility TEXT, -- JSON object
        tags TEXT, -- JSON array
        imagePrompt TEXT,
        imageUrl TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (mangaProjectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Location templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS location_templates (
        id TEXT PRIMARY KEY,
        mangaProjectId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        subCategory TEXT,
        timeOfDay TEXT,
        weather TEXT,
        mood TEXT,
        lighting TEXT, -- JSON object
        defaultTimeOfDay TEXT,
        defaultWeather TEXT,
        defaultMood TEXT,
        style TEXT,
        baseLighting TEXT, -- JSON object
        variations TEXT, -- JSON array
        cameraAngles TEXT, -- JSON array
        props TEXT, -- JSON array
        colors TEXT, -- JSON array
        tags TEXT, -- JSON array
        imagePrompt TEXT,
        baseImagePrompt TEXT,
        imageUrl TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (mangaProjectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(mangaProjectId);
      CREATE INDEX IF NOT EXISTS idx_scenes_chapter ON scenes(chapterId);
      CREATE INDEX IF NOT EXISTS idx_panels_scene ON panels(sceneId);
      CREATE INDEX IF NOT EXISTS idx_dialogues_panel ON panel_dialogues(panelId);
      CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(mangaProjectId);
      CREATE INDEX IF NOT EXISTS idx_outfit_templates_project ON outfit_templates(mangaProjectId);
      CREATE INDEX IF NOT EXISTS idx_location_templates_project ON location_templates(mangaProjectId);
    `);
  }

  // --- Project Methods ---
  async getAllProjects(): Promise<MangaProject[]> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM projects ORDER BY updatedAt DESC"
    );
    const rows = stmt.all();
    return rows.map(this.rowToProject);
  }

  async getProject(id: string): Promise<MangaProject | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM projects WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;

    const project = this.rowToProject(row);

    // Load relations
    project.chapters = await this.listChapters(id);
    project.characters = await this.listCharacters(id);
    project.outfitTemplates = await this.listOutfitTemplates({
      mangaProjectId: id,
    });
    project.locationTemplates = await this.listLocationTemplates({
      mangaProjectId: id,
    });

    return project;
  }

  async createProject(
    projectData: Partial<MangaProject>
  ): Promise<MangaProject> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const project: MangaProject = {
      id,
      title: projectData.title || "Untitled",
      description: projectData.description,
      status: projectData.status || MangaStatus.DRAFT,
      initialPrompt: projectData.initialPrompt,
      genre: projectData.genre,
      artStyle: projectData.artStyle,
      coverImageUrl: projectData.coverImageUrl,
      targetAudience: projectData.targetAudience,
      worldDetails: projectData.worldDetails,
      concept: projectData.concept,
      plotStructure: projectData.plotStructure,
      themes: projectData.themes || [],
      motifs: projectData.motifs || [],
      symbols: projectData.symbols || [],
      tags: projectData.tags || [],
      creatorId: projectData.creatorId,
      messages: projectData.messages || [],
      viewCount: projectData.viewCount || 0,
      likeCount: projectData.likeCount || 0,
      published: projectData.published || false,
      chapters: [],
      characters: [],
      outfitTemplates: [],
      locationTemplates: [],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, title, description, status, initialPrompt, genre, artStyle, coverImageUrl,
        targetAudience, worldDetails, concept, plotStructure, themes, motifs, symbols,
        tags, creatorId, messages, viewCount, likeCount, published, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      project.id,
      project.title,
      project.description,
      project.status,
      project.initialPrompt,
      project.genre,
      project.artStyle,
      project.coverImageUrl,
      project.targetAudience,
      JSON.stringify(project.worldDetails),
      project.concept,
      JSON.stringify(project.plotStructure),
      JSON.stringify(project.themes),
      JSON.stringify(project.motifs),
      JSON.stringify(project.symbols),
      JSON.stringify(project.tags),
      project.creatorId,
      JSON.stringify(project.messages),
      project.viewCount,
      project.likeCount,
      project.published ? 1 : 0,
      now,
      now
    );

    return project;
  }

  async updateProject(
    id: string,
    projectData: DeepPartial<
      Omit<
        MangaProject,
        "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
      >
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (projectData.title !== undefined) {
      updates.push("title = ?");
      values.push(projectData.title);
    }
    if (projectData.description !== undefined) {
      updates.push("description = ?");
      values.push(projectData.description);
    }
    if (projectData.status !== undefined) {
      updates.push("status = ?");
      values.push(projectData.status);
    }
    if (projectData.genre !== undefined) {
      updates.push("genre = ?");
      values.push(projectData.genre);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE projects SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deleteProject(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM projects WHERE id = ?");
    stmt.run(id);
  }

  private rowToProject(row: any): MangaProject {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      initialPrompt: row.initialPrompt,
      genre: row.genre,
      artStyle: row.artStyle,
      coverImageUrl: row.coverImageUrl,
      targetAudience: row.targetAudience,
      worldDetails: row.worldDetails ? JSON.parse(row.worldDetails) : undefined,
      concept: row.concept,
      plotStructure: row.plotStructure
        ? JSON.parse(row.plotStructure)
        : undefined,
      themes: row.themes ? JSON.parse(row.themes) : [],
      motifs: row.motifs ? JSON.parse(row.motifs) : [],
      symbols: row.symbols ? JSON.parse(row.symbols) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      creatorId: row.creatorId,
      messages: row.messages ? JSON.parse(row.messages) : [],
      viewCount: row.viewCount || 0,
      likeCount: row.likeCount || 0,
      published: Boolean(row.published),
      chapters: [],
      characters: [],
      outfitTemplates: [],
      locationTemplates: [],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- Chapter Methods ---
  async createChapter(
    chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  ): Promise<Chapter> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const chapter: Chapter = {
      ...chapterData,
      id,
      scenes: [],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO chapters (
        id, mangaProjectId, chapterNumber, title, narrative, purpose, tone,
        keyCharacters, coverImageUrl, isAiGenerated, isPublished, viewCount,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      chapter.id,
      chapter.mangaProjectId,
      chapter.chapterNumber,
      chapter.title,
      chapter.narrative,
      chapter.purpose,
      chapter.tone,
      JSON.stringify(chapter.keyCharacters || []),
      chapter.coverImageUrl,
      chapter.isAiGenerated ? 1 : 0,
      chapter.isPublished ? 1 : 0,
      chapter.viewCount || 0,
      now,
      now
    );

    return chapter;
  }

  async updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (chapterData.title !== undefined) {
      updates.push("title = ?");
      values.push(chapterData.title);
    }
    if (chapterData.narrative !== undefined) {
      updates.push("narrative = ?");
      values.push(chapterData.narrative);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE chapters SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deleteChapter(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM chapters WHERE id = ?");
    stmt.run(id);
  }

  async getChapterForContext(id: string): Promise<Chapter | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM chapters WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToChapter(row);
  }

  async listChapters(projectId: string): Promise<Chapter[]> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM chapters WHERE mangaProjectId = ? ORDER BY chapterNumber"
    );
    const rows = stmt.all(projectId);
    return rows.map(this.rowToChapter);
  }

  async getAllChapters(): Promise<Chapter[]> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM chapters");
    const rows = stmt.all();
    return rows.map(this.rowToChapter);
  }

  private rowToChapter(row: any): Chapter {
    return {
      id: row.id,
      mangaProjectId: row.mangaProjectId,
      chapterNumber: row.chapterNumber,
      title: row.title,
      narrative: row.narrative,
      purpose: row.purpose,
      tone: row.tone,
      keyCharacters: row.keyCharacters ? JSON.parse(row.keyCharacters) : [],
      coverImageUrl: row.coverImageUrl,
      isAiGenerated: Boolean(row.isAiGenerated),
      isPublished: Boolean(row.isPublished),
      viewCount: row.viewCount || 0,
      scenes: [],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- Scene Methods ---
  async createScene(
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<Scene> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const scene: Scene = {
      ...sceneData,
      id,
      panels: [],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO scenes (id, chapterId, order_index, title, description, sceneContext, isAiGenerated, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      scene.id,
      scene.chapterId,
      scene.order,
      scene.title,
      scene.description,
      JSON.stringify(scene.sceneContext),
      scene.isAiGenerated ? 1 : 0,
      now,
      now
    );

    return scene;
  }

  async updateScene(
    id: string,
    sceneData: DeepPartial<
      Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (sceneData.title !== undefined) {
      updates.push("title = ?");
      values.push(sceneData.title);
    }
    if (sceneData.description !== undefined) {
      updates.push("description = ?");
      values.push(sceneData.description);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE scenes SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deleteScene(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM scenes WHERE id = ?");
    stmt.run(id);
  }

  async getSceneForContext(id: string): Promise<Scene | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM scenes WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToScene(row);
  }

  async listScenes(chapterId: string): Promise<Scene[]> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM scenes WHERE chapterId = ? ORDER BY order_index"
    );
    const rows = stmt.all(chapterId);
    return rows.map(this.rowToScene);
  }

  async getAllScenes(): Promise<Scene[]> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM scenes");
    const rows = stmt.all();
    return rows.map(this.rowToScene);
  }

  private rowToScene(row: any): Scene {
    return {
      id: row.id,
      chapterId: row.chapterId,
      order: row.order_index,
      title: row.title,
      description: row.description,
      sceneContext: JSON.parse(row.sceneContext),
      isAiGenerated: Boolean(row.isAiGenerated),
      panels: [],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- Panel Methods ---
  async createPanel(
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<Panel> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const panel: Panel = {
      ...panelData,
      id,
      dialogues: [],
      characters: [],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO panels (id, sceneId, order_index, imageUrl, panelContext, negativePrompt, isAiGenerated, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      panel.id,
      panel.sceneId,
      panel.order,
      panel.imageUrl,
      JSON.stringify(panel.panelContext),
      panel.negativePrompt,
      panel.isAiGenerated ? 1 : 0,
      now,
      now
    );

    return panel;
  }

  async updatePanel(
    id: string,
    panelData: DeepPartial<
      Omit<Panel, "id" | "createdAt" | "updatedAt" | "dialogues" | "characters">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (panelData.imageUrl !== undefined) {
      updates.push("imageUrl = ?");
      values.push(panelData.imageUrl);
    }
    if (panelData.panelContext !== undefined) {
      updates.push("panelContext = ?");
      values.push(JSON.stringify(panelData.panelContext));
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE panels SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deletePanel(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM panels WHERE id = ?");
    stmt.run(id);
  }

  async assignCharacterToPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO panel_characters (panelId, characterId) VALUES (?, ?)
    `);
    stmt.run(panelId, characterId);
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare(`
      DELETE FROM panel_characters WHERE panelId = ? AND characterId = ?
    `);
    stmt.run(panelId, characterId);
  }

  async getPanelForContext(id: string): Promise<Panel | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM panels WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToPanel(row);
  }

  async listPanels(sceneId: string): Promise<Panel[]> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM panels WHERE sceneId = ? ORDER BY order_index"
    );
    const rows = stmt.all(sceneId);
    return rows.map(this.rowToPanel);
  }

  async getAllPanels(): Promise<Panel[]> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM panels");
    const rows = stmt.all();
    return rows.map(this.rowToPanel);
  }

  private rowToPanel(row: any): Panel {
    return {
      id: row.id,
      sceneId: row.sceneId,
      order: row.order_index,
      imageUrl: row.imageUrl,
      panelContext: JSON.parse(row.panelContext),
      negativePrompt: row.negativePrompt,
      isAiGenerated: Boolean(row.isAiGenerated),
      dialogues: [],
      characters: [],
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- Panel Dialogue Methods ---
  async createPanelDialogue(
    dialogueData: Omit<
      PanelDialogue,
      "id" | "createdAt" | "updatedAt" | "speaker"
    >
  ): Promise<PanelDialogue> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const dialogue: PanelDialogue = {
      ...dialogueData,
      id,
      speaker: null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO panel_dialogues (
        id, panelId, order_index, content, style, emotion, subtextNote,
        speakerId, isAiGenerated, config, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      dialogue.id,
      dialogue.panelId,
      dialogue.order,
      dialogue.content,
      JSON.stringify(dialogue.style),
      dialogue.emotion,
      dialogue.subtextNote,
      dialogue.speakerId,
      dialogue.isAiGenerated ? 1 : 0,
      JSON.stringify(dialogue.config),
      now,
      now
    );

    return dialogue;
  }

  async updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (dialogueData.content !== undefined) {
      updates.push("content = ?");
      values.push(dialogueData.content);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE panel_dialogues SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deletePanelDialogue(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM panel_dialogues WHERE id = ?");
    stmt.run(id);
  }

  async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM panel_dialogues WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToPanelDialogue(row);
  }

  async listPanelDialogues(panelId: string): Promise<PanelDialogue[]> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM panel_dialogues WHERE panelId = ? ORDER BY order_index"
    );
    const rows = stmt.all(panelId);
    return rows.map(this.rowToPanelDialogue);
  }

  async getAllPanelDialogues(): Promise<PanelDialogue[]> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM panel_dialogues");
    const rows = stmt.all();
    return rows.map(this.rowToPanelDialogue);
  }

  private rowToPanelDialogue(row: any): PanelDialogue {
    return {
      id: row.id,
      panelId: row.panelId,
      order: row.order_index,
      content: row.content,
      style: row.style ? JSON.parse(row.style) : undefined,
      emotion: row.emotion,
      subtextNote: row.subtextNote,
      speakerId: row.speakerId,
      isAiGenerated: Boolean(row.isAiGenerated),
      config: row.config ? JSON.parse(row.config) : undefined,
      speaker: null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- Character Methods ---
  async getCharacter(id: string): Promise<Character | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM characters WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToCharacter(row);
  }

  async createCharacter(
    characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<Character> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const character: Character = {
      ...characterData,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO characters (
        id, mangaProjectId, name, age, gender, bodyAttributes, facialAttributes,
        hairAttributes, distinctiveFeatures, physicalMannerisms, posture, styleGuide,
        defaultOutfitId, outfitHistory, consistencyPrompt, negativePrompt, role,
        briefDescription, personality, abilities, backstory, imgUrl, traits, arcs,
        isAiGenerated, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      character.id,
      character.mangaProjectId,
      character.name,
      character.age,
      character.gender,
      JSON.stringify(character.bodyAttributes),
      JSON.stringify(character.facialAttributes),
      JSON.stringify(character.hairAttributes),
      JSON.stringify(character.distinctiveFeatures || []),
      JSON.stringify(character.physicalMannerisms || []),
      character.posture,
      JSON.stringify(character.styleGuide),
      character.defaultOutfitId,
      JSON.stringify(character.outfitHistory || []),
      character.consistencyPrompt,
      character.negativePrompt,
      character.role,
      character.briefDescription,
      character.personality,
      character.abilities,
      character.backstory,
      character.imgUrl,
      JSON.stringify(character.traits || []),
      JSON.stringify(character.arcs || []),
      character.isAiGenerated ? 1 : 0,
      now,
      now
    );

    return character;
  }

  async updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (characterData.name !== undefined) {
      updates.push("name = ?");
      values.push(characterData.name);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE characters SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM characters WHERE id = ?");
    stmt.run(id);
  }

  async getCharacterForContext(id: string): Promise<Character | null> {
    return this.getCharacter(id);
  }

  async listCharacters(projectId: string): Promise<Character[]> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM characters WHERE mangaProjectId = ?"
    );
    const rows = stmt.all(projectId);
    return rows.map(this.rowToCharacter);
  }

  async getAllCharacters(): Promise<Character[]> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM characters");
    const rows = stmt.all();
    return rows.map(this.rowToCharacter);
  }

  private rowToCharacter(row: any): Character {
    return {
      id: row.id,
      mangaProjectId: row.mangaProjectId,
      name: row.name,
      age: row.age,
      gender: row.gender,
      bodyAttributes: row.bodyAttributes
        ? JSON.parse(row.bodyAttributes)
        : undefined,
      facialAttributes: row.facialAttributes
        ? JSON.parse(row.facialAttributes)
        : undefined,
      hairAttributes: row.hairAttributes
        ? JSON.parse(row.hairAttributes)
        : undefined,
      distinctiveFeatures: row.distinctiveFeatures
        ? JSON.parse(row.distinctiveFeatures)
        : [],
      physicalMannerisms: row.physicalMannerisms
        ? JSON.parse(row.physicalMannerisms)
        : [],
      posture: row.posture,
      styleGuide: row.styleGuide ? JSON.parse(row.styleGuide) : undefined,
      defaultOutfitId: row.defaultOutfitId,
      outfitHistory: row.outfitHistory ? JSON.parse(row.outfitHistory) : [],
      consistencyPrompt: row.consistencyPrompt,
      negativePrompt: row.negativePrompt,
      role: row.role,
      briefDescription: row.briefDescription,
      personality: row.personality,
      abilities: row.abilities,
      backstory: row.backstory,
      imgUrl: row.imgUrl,
      traits: row.traits ? JSON.parse(row.traits) : [],
      arcs: row.arcs ? JSON.parse(row.arcs) : [],
      isAiGenerated: Boolean(row.isAiGenerated),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- List Methods ---
  async listMangaProjects(): Promise<MangaProject[]> {
    return this.getAllProjects();
  }

  // --- Template Methods ---
  async createOutfitTemplate(
    templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<OutfitTemplate> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const template: OutfitTemplate = {
      ...templateData,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO outfit_templates (
        id, mangaProjectId, name, description, category, subCategory, gender, ageGroup,
        season, style, components, colorSchemes, materials, variations, occasions,
        compatibility, tags, imagePrompt, imageUrl, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      template.id,
      template.mangaProjectId,
      template.name,
      template.description,
      template.category,
      template.subCategory,
      template.gender,
      template.ageGroup,
      template.season,
      template.style,
      JSON.stringify(template.components),
      JSON.stringify(template.colorSchemes),
      JSON.stringify(template.materials),
      JSON.stringify(template.variations || []),
      JSON.stringify(template.occasions),
      JSON.stringify(template.compatibility),
      JSON.stringify(template.tags),
      template.imagePrompt,
      template.imageUrl,
      template.isActive ? 1 : 0,
      now,
      now
    );

    return template;
  }

  async getOutfitTemplate(id: string): Promise<OutfitTemplate | null> {
    await this.initialize();
    const stmt = this.db.prepare("SELECT * FROM outfit_templates WHERE id = ?");
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToOutfitTemplate(row);
  }

  async updateOutfitTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (templateData.name !== undefined) {
      updates.push("name = ?");
      values.push(templateData.name);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE outfit_templates SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deleteOutfitTemplate(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM outfit_templates WHERE id = ?");
    stmt.run(id);
  }

  async listOutfitTemplates(filters?: any): Promise<OutfitTemplate[]> {
    await this.initialize();
    let query = "SELECT * FROM outfit_templates";
    const params: any[] = [];

    if (filters?.mangaProjectId) {
      query += " WHERE mangaProjectId = ?";
      params.push(filters.mangaProjectId);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(this.rowToOutfitTemplate);
  }

  private rowToOutfitTemplate(row: any): OutfitTemplate {
    return {
      id: row.id,
      mangaProjectId: row.mangaProjectId,
      name: row.name,
      description: row.description,
      category: row.category,
      subCategory: row.subCategory,
      gender: row.gender,
      ageGroup: row.ageGroup,
      season: row.season,
      style: row.style,
      components: JSON.parse(row.components),
      colorSchemes: JSON.parse(row.colorSchemes),
      materials: JSON.parse(row.materials),
      variations: row.variations ? JSON.parse(row.variations) : [],
      occasions: JSON.parse(row.occasions),
      compatibility: JSON.parse(row.compatibility),
      tags: JSON.parse(row.tags),
      imagePrompt: row.imagePrompt,
      imageUrl: row.imageUrl,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // --- Location Template Methods ---
  async createLocationTemplate(
    templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<LocationTemplate> {
    await this.initialize();
    const id = uuidv4();
    const now = new Date().toISOString();

    const template: LocationTemplate = {
      ...templateData,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO location_templates (
        id, mangaProjectId, name, description, category, subCategory, timeOfDay,
        weather, mood, lighting, defaultTimeOfDay, defaultWeather, defaultMood,
        style, baseLighting, variations, cameraAngles, props, colors, tags,
        imagePrompt, baseImagePrompt, imageUrl, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      template.id,
      template.mangaProjectId,
      template.name,
      template.description,
      template.category,
      template.subCategory,
      template.timeOfDay,
      template.weather,
      template.mood,
      JSON.stringify(template.lighting),
      template.defaultTimeOfDay,
      template.defaultWeather,
      template.defaultMood,
      template.style,
      JSON.stringify(template.baseLighting),
      JSON.stringify(template.variations || []),
      JSON.stringify(template.cameraAngles),
      JSON.stringify(template.props),
      JSON.stringify(template.colors),
      JSON.stringify(template.tags),
      template.imagePrompt,
      template.baseImagePrompt,
      template.imageUrl,
      template.isActive ? 1 : 0,
      now,
      now
    );

    return template;
  }

  async getLocationTemplate(id: string): Promise<LocationTemplate | null> {
    await this.initialize();
    const stmt = this.db.prepare(
      "SELECT * FROM location_templates WHERE id = ?"
    );
    const row = stmt.get(id);
    if (!row) return null;
    return this.rowToLocationTemplate(row);
  }

  async updateLocationTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    await this.initialize();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (templateData.name !== undefined) {
      updates.push("name = ?");
      values.push(templateData.name);
    }

    if (updates.length === 0) return;

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE location_templates SET ${updates.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  async deleteLocationTemplate(id: string): Promise<void> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM location_templates WHERE id = ?");
    stmt.run(id);
  }

  async listLocationTemplates(filters?: any): Promise<LocationTemplate[]> {
    await this.initialize();
    let query = "SELECT * FROM location_templates";
    const params: any[] = [];

    if (filters?.mangaProjectId) {
      query += " WHERE mangaProjectId = ?";
      params.push(filters.mangaProjectId);
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(this.rowToLocationTemplate);
  }

  private rowToLocationTemplate(row: any): LocationTemplate {
    return {
      id: row.id,
      mangaProjectId: row.mangaProjectId,
      name: row.name,
      description: row.description,
      category: row.category,
      subCategory: row.subCategory,
      timeOfDay: row.timeOfDay,
      weather: row.weather,
      mood: row.mood,
      lighting: row.lighting ? JSON.parse(row.lighting) : undefined,
      defaultTimeOfDay: row.defaultTimeOfDay,
      defaultWeather: row.defaultWeather,
      defaultMood: row.defaultMood,
      style: row.style,
      baseLighting: row.baseLighting ? JSON.parse(row.baseLighting) : undefined,
      variations: row.variations ? JSON.parse(row.variations) : [],
      cameraAngles: JSON.parse(row.cameraAngles),
      props: JSON.parse(row.props),
      colors: JSON.parse(row.colors),
      tags: JSON.parse(row.tags),
      imagePrompt: row.imagePrompt,
      baseImagePrompt: row.baseImagePrompt,
      imageUrl: row.imageUrl,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export const sqliteDataService = new SQLiteDataService();
