// src/services/db.ts
import type {
  Chapter,
  Character,
  MangaProject,
  Panel,
  PanelDialogue,
  Scene,
} from "@/types/entities";
import Dexie, { type Table } from "dexie";

export class MangaVerseDB extends Dexie {
  projects!: Table<MangaProject, string>;
  chapters!: Table<Chapter, string>;
  scenes!: Table<Scene, string>;
  panels!: Table<Panel, string>;
  dialogues!: Table<PanelDialogue, string>;
  characters!: Table<Character, string>;

  constructor() {
    super("mangaVerseDB");
    this.version(2).stores({
      projects: "id, title, status, genre, creatorId",
      chapters: "id, mangaProjectId, chapterNumber, title",
      scenes: "id, chapterId, order, title",
      panels: "id, sceneId, order, *characterIds",
      dialogues: "id, panelId, order, speakerId",
      characters: "id, mangaProjectId, name, role",
    });
  }
}

export const db = new MangaVerseDB();

export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  const project = await db.projects.get(id);
  if (!project) return null;

  const [chapters, characters] = await Promise.all([
    db.chapters.where("mangaProjectId").equals(id).sortBy("chapterNumber"),
    db.characters.where("mangaProjectId").equals(id).toArray(),
  ]);

  project.chapters = chapters;
  project.characters = characters;

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
