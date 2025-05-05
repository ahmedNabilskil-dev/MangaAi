// src/services/db.ts

import Dexie, { type Table } from 'dexie';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';

/**
 * Defines the structure of the IndexedDB database using Dexie.
 * Each property represents a table (Object Store) in the database.
 * The string value defines the schema, including primary key (++) and indexes (&, *).
 */
export class MangaVerseDB extends Dexie {
  // Declare tables with their types
  projects!: Table<MangaProject, string>; // Primary key is string (UUID)
  chapters!: Table<Chapter, string>;
  scenes!: Table<Scene, string>;
  panels!: Table<Panel, string>;
  dialogues!: Table<PanelDialogue, string>;
  characters!: Table<Character, string>;

  constructor() {
    super('mangaVerseDB'); // Database name
    this.version(1).stores({
      // Define tables and their indexes
      // 'id' is the primary key (UUID string)
      // '&uniqueIndex' creates a unique index
      // '*multiEntryIndex' creates an index on array elements
      // 'indexedField' creates a regular index
      projects: 'id, title, status, genre, creatorId', // Index common query fields
      chapters: 'id, mangaProjectId, chapterNumber, title', // Index by foreign key and order/title
      scenes: 'id, chapterId, order, title', // Index by foreign key and order/title
      panels: 'id, sceneId, order, *characterIds', // Index by foreign key, order, and character IDs (multiEntry)
      dialogues: 'id, panelId, order, speakerId', // Index by foreign key, order, and speaker
      characters: 'id, mangaProjectId, name, role', // Index by foreign key and name/role
    });

    // Optionally map classes to tables if you want Dexie to instantiate specific classes
    // this.projects.mapToClass(MangaProject); // Example - requires classes, not just interfaces
  }
}

// Create a singleton instance of the database
export const db = new MangaVerseDB();

// Optional: Function to populate initial data if needed (e.g., for development)
export async function populateInitialData() {
  const projectCount = await db.projects.count();
  if (projectCount === 0) {
    console.log("Populating Dexie with initial project...");
    const initialProjectId = 'proj-initial-1'; // Use a fixed ID
    await db.projects.add({
        id: initialProjectId, // Use the fixed ID
        title: 'My First Manga Project',
        description: 'Start creating your manga here!',
        status: 'draft',
        viewCount: 0,
        likeCount: 0,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: [],
        characters: [],
    });
    console.log("Initial project added to Dexie.");
  }
}

// Call populate on DB open event or manually after DB instance creation
db.on('populate', populateInitialData);

// Open the database
db.open().catch((err) => {
  console.error(`Failed to open Dexie DB: ${err.stack || err}`);
});


// --- Function to fetch project with full relations ---
export async function getProjectWithRelations(id: string): Promise<MangaProject | null> {
    console.log(`DexieService (db.ts): Fetching project ${id} and related data`);
    const project = await db.projects.get(id);
    if (!project) return null;

    const [chaptersData, charactersData] = await Promise.all([
        db.chapters.where('mangaProjectId').equals(id).sortBy('chapterNumber'),
        db.characters.where('mangaProjectId').equals(id).toArray()
    ]);

    project.chapters = chaptersData;
    project.characters = charactersData;

    for (const chapter of project.chapters) {
        chapter.scenes = await db.scenes.where('chapterId').equals(chapter.id).sortBy('order');
        for (const scene of chapter.scenes) {
            scene.panels = await db.panels.where('sceneId').equals(scene.id).sortBy('order');
            for (const panel of scene.panels) {
                const dialoguesData = await db.dialogues.where('panelId').equals(panel.id).sortBy('order');
                const speakerIds = dialoguesData.map(d => d.speakerId).filter((spkId): spkId is string => !!spkId);
                const speakers = speakerIds.length > 0 ? await db.characters.bulkGet(speakerIds) : [];
                const speakerMap = new Map(speakers.filter((s): s is Character => !!s).map(s => [s!.id, s]));

                panel.dialogues = dialoguesData.map(d => ({
                    ...d,
                    speaker: d.speakerId ? speakerMap.get(d.speakerId) ?? null : null
                }));

                panel.characters = panel.characterIds && panel.characterIds.length > 0
                    ? (await db.characters.bulkGet(panel.characterIds)).filter((c): c is Character => !!c)
                    : [];
            }
        }
    }
    return project;
}

// --- Function to get the default project ---
// Centralizing this logic here instead of duplicating in services
export async function getDefaultProject(): Promise<MangaProject | null> {
    console.log("DexieService (db.ts): Attempting to fetch default project (proj-initial-1)");
    let project = await getProjectWithRelations('proj-initial-1');

    if (!project) {
        console.log("DexieService (db.ts): Initial project not found, checking if any project exists...");
        const allProjects = await db.projects.toArray(); // Fetch directly from Dexie
        if (allProjects.length > 0) {
             console.log(`DexieService (db.ts): Found ${allProjects.length} projects, using the first one: ${allProjects[0].id}`);
             project = await getProjectWithRelations(allProjects[0].id);
        } else {
             console.log("DexieService (db.ts): No projects found. Ensure populateInitialData ran.");
             // Attempt to trigger population again (might not run if already populated but empty)
             // This is less ideal, better to ensure initial population works reliably.
             // await populateInitialData();
             // project = await getProjectWithRelations('proj-initial-1');
        }
    }

    if (!project) {
         console.error("DexieService (db.ts): Failed to get or create a default project.");
         return null;
    }

    console.log("DexieService (db.ts): Default project fetched:", project.id);
    return project;
}
