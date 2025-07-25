// src/services/db.ts
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
import Dexie, { type Table } from "dexie";

export class MangaVerseDB extends Dexie {
  projects!: Table<MangaProject, string>;
  chapters!: Table<Chapter, string>;
  scenes!: Table<Scene, string>;
  panels!: Table<Panel, string>;
  dialogues!: Table<PanelDialogue, string>;
  characters!: Table<Character, string>;
  outfitTemplates!: Table<OutfitTemplate, string>;
  locationTemplates!: Table<LocationTemplate, string>;

  constructor() {
    super("mangaVerseDB");
    this.version(4).stores({
      projects: "id, title, status, genre, creatorId",
      chapters: "id, mangaProjectId, chapterNumber, title",
      scenes: "id, chapterId, order, title",
      panels: "id, sceneId, order",
      dialogues: "id, panelId, order, speakerId",
      characters: "id, mangaProjectId, name, role",
      outfitTemplates:
        "id, mangaProjectId, name, category, gender, ageGroup, season, style, isActive",
      locationTemplates:
        "id, mangaProjectId, name, category, timeOfDay, weather, mood, style, isActive",
    });
  }
}

export const db = new MangaVerseDB();

export async function getProjectWithRelations(
  id: string
): Promise<MangaProject | null> {
  const project = await db.projects.get(id);
  if (!project) return null;

  const [chapters, characters, outfitTemplates, locationTemplates] =
    await Promise.all([
      db.chapters.where("mangaProjectId").equals(id).sortBy("chapterNumber"),
      db.characters.where("mangaProjectId").equals(id).toArray(),
      db.outfitTemplates.where("mangaProjectId").equals(id).toArray(),
      db.locationTemplates.where("mangaProjectId").equals(id).toArray(),
    ]);

  project.chapters = chapters;
  project.characters = characters;
  project.outfitTemplates = outfitTemplates;
  project.locationTemplates = locationTemplates;

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
        // Note: Characters are loaded separately via the characters relation
        panel.characters = panel.characters || [];
      }
    }
  }
  return project;
}

// Helper functions for template management
export async function createOutfitTemplate(
  template: OutfitTemplate
): Promise<string> {
  return await db.outfitTemplates.add(template);
}

export async function createLocationTemplate(
  template: LocationTemplate
): Promise<string> {
  return await db.locationTemplates.add(template);
}

export async function updateOutfitTemplate(
  id: string,
  updates: Partial<OutfitTemplate>
): Promise<number> {
  return await db.outfitTemplates.update(id, updates);
}

export async function updateLocationTemplate(
  id: string,
  updates: Partial<LocationTemplate>
): Promise<number> {
  return await db.locationTemplates.update(id, updates);
}

export async function deleteTemplate(
  templateType: "outfit" | "location",
  id: string
): Promise<void> {
  switch (templateType) {
    case "outfit":
      await db.outfitTemplates.delete(id);
      break;
    case "location":
      await db.locationTemplates.delete(id);
      break;
  }
}
