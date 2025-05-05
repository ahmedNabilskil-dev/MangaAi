
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
      panels: 'id, sceneId, order, &characterIds', // Index by foreign key, order, and character IDs (multiEntry)
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
    await db.projects.add({
        id: 'proj-initial-1', // Use a specific UUID for the initial project
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
