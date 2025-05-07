// src/services/db.ts
import type {
  Chapter,
  Character,
  KeyEvent,
  MangaLocation,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
  User,
} from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import Dexie, { type Table } from "dexie";

export class MangaVerseDB extends Dexie {
  projects!: Table<MangaProject, string>;
  chapters!: Table<Chapter, string>;
  scenes!: Table<Scene, string>;
  panels!: Table<Panel, string>;
  dialogues!: Table<PanelDialogue, string>;
  characters!: Table<Character, string>;
  locations!: Table<MangaLocation, string>;
  keyEvents!: Table<KeyEvent, string>;
  users!: Table<User, string>;

  constructor() {
    super("mangaVerseDB");
    this.version(2).stores({
      projects: "id, title, status, genre, creatorId",
      chapters: "id, mangaProjectId, chapterNumber, title",
      scenes: "id, chapterId, order, title",
      panels: "id, sceneId, order, *characterIds",
      dialogues: "id, panelId, order, speakerId",
      characters: "id, mangaProjectId, name, role",
      locations: "id, projectId, name",
      keyEvents: "id, projectId, sequence",
      users: "id, username, email",
    });
  }
}

export const db = new MangaVerseDB();

// Helper functions
export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  const project = await db.projects.get(id);
  if (!project) return null;

  const [chapters, characters, locations, keyEvents] = await Promise.all([
    db.chapters.where("mangaProjectId").equals(id).sortBy("chapterNumber"),
    db.characters.where("mangaProjectId").equals(id).toArray(),
    db.locations.where("projectId").equals(id).toArray(),
    db.keyEvents.where("projectId").equals(id).sortBy("sequence"),
  ]);

  project.chapters = chapters;
  project.characters = characters;
  project.locations = locations;
  project.keyEvents = keyEvents;

  // Load nested relations
  for (const chapter of project.chapters) {
    chapter.scenes = await db.scenes
      .where("chapterId")
      .equals(chapter.id)
      .sortBy("order");
    for (const scene of chapter.scenes) {
      scene.panels = await db.panels
        .where("sceneId")
        .equals(scene.id)
        .sortBy("order");
      for (const panel of scene.panels) {
        panel.dialogues = await db.dialogues
          .where("panelId")
          .equals(panel.id)
          .sortBy("order");
        panel.characters =
          panel.characterIds && panel.characterIds.length > 0
            ? (await db.characters.bulkGet(panel.characterIds)).filter(
                (c): c is Character => !!c
              )
            : [];
      }
    }
  }
  return project;
}

export async function getDefaultProject(): Promise<MangaProject | null> {
  let project = await getProjectWithRelations("proj-initial-1");
  if (!project) {
    const allProjects = await db.projects.toArray();
    if (allProjects.length > 0) {
      project = await getProjectWithRelations(allProjects[0].id);
    }
  }
  return project;
}

// Initialize database
db.on("populate", async () => {
  // Create initial project if none exists
  const projectCount = await db.projects.count();
  if (projectCount === 0) {
    await db.projects.add({
      id: "proj-initial-1",
      title: "My First Manga Project",
      description: "Start creating your manga here!",
      status: MangaStatus.DRAFT,
      viewCount: 0,
      likeCount: 0,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: [],
      locations: [],
      keyEvents: [],
    });
  }
});

db.open().catch((err) => {
  console.error("Failed to open database:", err);
});
