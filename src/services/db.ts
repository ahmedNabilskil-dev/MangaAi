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
// Database population script for manga creation app

/**
 * This script populates the database with initial manga project data.
 * There are two ways to trigger population:
 *
 * Option 1: Call populateDatabase() function directly after database initialization
 * Option 2: Emit the "populate" event on the database object
 */

export async function populateDatabase(db: MangaVerseDB) {
  // Check if data already exists
  const projectCount = await db.projects.count();
  if (projectCount > 0) {
    return;
  }

  // Create project with locations and key events included directly
  const projectId = "proj-samurai-destiny";
  await db.projects.add({
    id: projectId,
    title: "Samurai Destiny",
    description:
      "A tale of honor and revenge set in feudal Japan. Follow the journey of a dishonored samurai seeking redemption.",
    status: MangaStatus.DRAFT,
    genre: "Historical Fantasy",
    artStyle: "Semi-realistic",
    coverImageUrl:
      "https://images.unsplash.com/photo-1516566023345-ca8042a333cc?q=80&w=1000",
    targetAudience: "young-adult",
    worldDetails: {
      summary:
        "A fictional version of feudal Japan where mystical powers exist alongside samurai traditions.",
      history:
        "The land has been ruled by warring clans for centuries, with the Tokugawa clan recently rising to dominance.",
      society:
        "Strict hierarchical system with samurai at the top and merchants/peasants below.",
      uniqueSystems:
        "Some individuals possess 'spirit techniques' - martial abilities enhanced by spiritual energy.",
    },
    // Add locations directly to the project
    locations: [
      {
        name: "The Forbidden Forest",
        description:
          "A dense, mist-shrouded forest said to be haunted by the spirits of fallen warriors. Ancient trees tower overhead, blocking sunlight and creating an eerie atmosphere.",
        significance:
          "Where Takeshi trains in isolation and discovers ancient spiritual techniques.",
      },
      {
        name: "Edo City",
        description:
          "The bustling capital city with distinct districts ranging from opulent noble quarters to poverty-stricken slums.",
        significance:
          "Center of political power and the site of Lord Kaito's stronghold.",
      },
      {
        name: "Mountain Shrine of the Four Winds",
        description:
          "An ancient shrine built into a mountainside, accessible only by a treacherous path. Cherry blossoms bloom year-round due to spiritual energy.",
        significance:
          "Sacred ground where Takeshi learns the truth about his family's heritage and unlocks his full potential.",
      },
    ],
    // Add key events directly to the project
    keyEvents: [
      {
        name: "The Great Betrayal",
        description:
          "Takeshi is framed for the assassination of his lord by Lord Kaito, stripped of his rank and forced to flee as a wanted criminal.",
        sequence: 1,
      },
      {
        name: "Meeting Miyako",
        description:
          "Takeshi encounters Miyako while being hunted in the forest. After initial mistrust, they form an alliance when they discover a common enemy.",
        sequence: 2,
      },
      {
        name: "Spirit Technique Awakening",
        description:
          "During a desperate battle, Takeshi's dormant spiritual powers awaken, revealing his family's secret legacy.",
        sequence: 3,
      },
    ],
    themes: ["Honor", "Redemption", "Sacrifice"],
    viewCount: 157,
    likeCount: 42,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create characters
  const characterIds = await Promise.all([
    db.characters.add({
      id: "char-takeshi",
      name: "Takeshi Himura",
      age: 28,
      gender: "Male",
      bodyAttributes: {
        height: "Tall",
        bodyType: "Athletic, lean",
        proportions: "Broad shoulders, narrow waist",
      },
      facialAttributes: {
        faceShape: "Square jaw",
        skinTone: "Tan",
        eyeColor: "Dark brown",
        eyeShape: "Narrow, intense",
        noseType: "Straight, defined",
        mouthType: "Thin-lipped, often set in determination",
        jawline: "Strong",
      },
      hairAttributes: {
        hairColor: "Black",
        hairstyle: "Topknot with shaved sides",
        hairLength: "Medium-long on top",
        hairTexture: "Straight",
        specialHairFeatures: "Single gray streak from stress",
      },
      distinctiveFeatures: [
        "Cross-shaped scar on left cheek",
        "Burns on right forearm",
      ],
      role: "protagonist",
      briefDescription:
        "A former high-ranking samurai who lost his position after being framed for treason.",
      personality:
        "Stoic, honorable, struggles with inner rage but maintains self-discipline.",
      abilities:
        "Master swordsman, specializes in Iaijutsu (quick-draw techniques) and has developed a unique 'Ghost Blade' technique.",
      imgUrl:
        "https://images.unsplash.com/photo-1583889659384-33716255a8b7?q=80&w=1000",
      expressionImages: {
        determined:
          "https://images.unsplash.com/photo-1583889659384-33716255a8b7?q=80&w=1000",
        angry:
          "https://images.unsplash.com/photo-1590002893558-64f0d58dcca4?q=80&w=1000",
        solemn:
          "https://images.unsplash.com/photo-1611874434183-e229b307c1c3?q=80&w=1000",
      },
      isAiGenerated: false,
      mangaProjectId: projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.characters.add({
      id: "char-miyako",
      name: "Miyako",
      age: 25,
      gender: "Female",
      bodyAttributes: {
        height: "Average",
        bodyType: "Slender but strong",
        proportions: "Athletic",
      },
      facialAttributes: {
        faceShape: "Heart-shaped",
        skinTone: "Fair",
        eyeColor: "Amber",
        eyeShape: "Almond, sharp",
        noseType: "Small, straight",
        mouthType: "Full lips, often smirking",
        jawline: "Soft but defined",
      },
      hairAttributes: {
        hairColor: "Dark brown",
        hairstyle: "Long ponytail",
        hairLength: "Waist-length",
        hairTexture: "Silky with slight waves",
        specialHairFeatures: "Red ribbon woven through",
      },
      role: "supporting",
      briefDescription:
        "A skilled hunter and tracker who joins Takeshi's quest for her own reasons.",
      personality:
        "Independent, pragmatic, witty, hides her compassion behind sarcasm.",
      abilities:
        "Expert archer, tracker, and has some knowledge of medicinal herbs.",
      imgUrl:
        "https://images.unsplash.com/photo-1528498033373-321c09a8a1c8?q=80&w=1000",
      expressionImages: {
        serious:
          "https://images.unsplash.com/photo-1528498033373-321c09a8a1c8?q=80&w=1000",
        smirking:
          "https://images.unsplash.com/photo-1484399172022-72a90b12e3c1?q=80&w=1000",
      },
      isAiGenerated: false,
      mangaProjectId: projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.characters.add({
      id: "char-lord-kaito",
      name: "Lord Kaito",
      age: 45,
      gender: "Male",
      bodyAttributes: {
        height: "Tall",
        bodyType: "Imposing, broad",
        proportions: "Powerful build",
      },
      facialAttributes: {
        faceShape: "Sharp, angular",
        skinTone: "Pale",
        eyeColor: "Nearly black",
        eyeShape: "Narrow, calculating",
        noseType: "Prominent, slightly hooked",
        mouthType: "Thin, often in a cruel smile",
        jawline: "Defined, square",
      },
      hairAttributes: {
        hairColor: "Black with gray streaks",
        hairstyle: "Traditional samurai style",
        hairLength: "Long, tied back",
        hairTexture: "Straight",
        specialHairFeatures: "Perfectly maintained",
      },
      role: "antagonist",
      briefDescription:
        "A powerful daimyo who orchestrated Takeshi's downfall to hide his own treachery.",
      personality:
        "Calculating, ruthless, power-hungry, maintains a facade of honor and tradition.",
      abilities:
        "Skilled swordsman, political mastermind, commands loyalty through fear and manipulation.",
      imgUrl:
        "https://images.unsplash.com/photo-1615266508369-f94e329b2371?q=80&w=1000",
      expressionImages: {
        commanding:
          "https://images.unsplash.com/photo-1615266508369-f94e329b2371?q=80&w=1000",
        malicious:
          "https://images.unsplash.com/photo-1563132337-f159f484226c?q=80&w=1000",
      },
      isAiGenerated: false,
      mangaProjectId: projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);

  // Create a chapter
  const chapterId = "chap-beginning-end";
  await db.chapters.add({
    id: chapterId,
    chapterNumber: 1,
    title: "The Beginning of the End",
    summary:
      "Takeshi's life as a respected samurai is shattered when he's framed for murder and must flee the capital with assassins in pursuit.",
    purpose: "Establish the protagonist and the central conflict.",
    tone: "Tense, dramatic",
    keyCharacters: ["Takeshi Himura", "Lord Kaito"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1611413790393-3dad6c3eb795?q=80&w=1000",
    mangaProjectId: projectId,
    isAiGenerated: false,
    isPublished: true,
    viewCount: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create scenes for the chapter
  const sceneIds = await Promise.all([
    db.scenes.add({
      id: "scene-ceremony",
      order: 1,
      title: "Honor Ceremony",
      description:
        "Takeshi is honored by his lord for his service, unaware of the plot against him.",
      sceneContext: {
        setting: "Castle main hall",
        mood: "Ceremonial, formal",
        presentCharacters: ["Takeshi Himura", "Lord Kaito"],
        timeOfDay: "Midday",
        weather: "Clear",
      },
      chapterId: chapterId,
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.scenes.add({
      id: "scene-accusation",
      order: 2,
      title: "False Accusation",
      description:
        "Takeshi is accused of murder with falsified evidence presented against him.",
      sceneContext: {
        setting: "Castle courtyard",
        mood: "Shocking, tense",
        presentCharacters: ["Takeshi Himura", "Lord Kaito"],
        timeOfDay: "Dusk",
        weather: "Gathering storm clouds",
      },
      chapterId: chapterId,
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.scenes.add({
      id: "scene-escape",
      order: 3,
      title: "Desperate Escape",
      description:
        "Takeshi fights his way out of the castle and flees into the night.",
      sceneContext: {
        setting: "Castle gates and city streets",
        mood: "Desperate, intense",
        presentCharacters: ["Takeshi Himura"],
        timeOfDay: "Night",
        weather: "Heavy rain",
      },
      chapterId: chapterId,
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);

  // Create panels for the first scene
  const panelIds = await Promise.all([
    db.panels.add({
      id: "panel-ceremony-wide",
      order: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1600180869922-9fe8556feae6?q=80&w=1000",
      panelContext: {
        action:
          "A wide shot of the ceremonial hall with Takeshi kneeling before his lord",
        characterPoses: [
          {
            characterName: "Takeshi Himura",
            pose: "Formal kneeling position",
            expression: "Solemn",
          },
          {
            characterName: "Lord Kaito",
            pose: "Standing with hands behind back",
            expression: "False benevolence",
          },
        ],
        cameraAngle: "wide",
        shotType: "establishing",
        backgroundDescription:
          "Ornate ceremonial hall with banners, guards at attention",
        backgroundImageUrl:
          "https://images.unsplash.com/photo-1577448564674-9a525ed57c0f?q=80&w=1000",
        lighting: "Bright, formal",
        effects: ["Beam of sunlight through window highlighting Takeshi"],
        dramaticPurpose: "Establish the status quo that will soon be disrupted",
        narrativePosition: "Beginning of the story",
      },
      sceneId: "scene-ceremony",
      characterIds: ["char-takeshi", "char-lord-kaito"],
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.panels.add({
      id: "panel-ceremony-closeup",
      order: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1583889659384-33716255a8b7?q=80&w=1000",
      panelContext: {
        action: "Close-up of Takeshi's face as he receives a commendation",
        characterPoses: [
          {
            characterName: "Takeshi Himura",
            pose: "Head bowed slightly",
            expression: "Pride mixed with humility",
          },
        ],
        cameraAngle: "close-up",
        shotType: "detail",
        lighting: "Dramatic side-lighting",
        effects: ["Focus lines to emphasize importance"],
        dramaticPurpose: "Connect audience to protagonist before his fall",
        narrativePosition: "Character introduction",
      },
      sceneId: "scene-ceremony",
      characterIds: ["char-takeshi"],
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.panels.add({
      id: "panel-kaito-smirk",
      order: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1563132337-f159f484226c?q=80&w=1000",
      panelContext: {
        action:
          "Behind Takeshi's back, Lord Kaito gives a subtle, sinister smirk",
        characterPoses: [
          {
            characterName: "Lord Kaito",
            pose: "Standing tall, slightly turned",
            expression: "Concealed malice",
          },
        ],
        cameraAngle: "medium",
        shotType: "reaction",
        lighting: "Partially shadowed",
        effects: ["Subtle dark aura suggestion"],
        dramaticPurpose: "Foreshadow the betrayal to come",
        narrativePosition: "Hint of conflict",
      },
      sceneId: "scene-ceremony",
      characterIds: ["char-lord-kaito"],
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);

  // Create dialogues for panels
  await Promise.all([
    db.dialogues.add({
      id: "dialogue-lord-praise",
      content:
        "For your unwavering loyalty and exceptional service, I bestow upon you this honor, Takeshi Himura.",
      order: 1,
      style: {
        bubbleType: "normal",
        fontSize: "medium",
        emphasis: false,
      },
      emotion: "Formal, concealing deceit",
      subtextNote:
        "The words are hollow as Lord Kaito has already planned Takeshi's downfall",
      panelId: "panel-ceremony-wide",
      speakerId: "char-lord-kaito",
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.dialogues.add({
      id: "dialogue-takeshi-thanks",
      content:
        "I am humbled by your generosity, my lord. I live to serve with honor.",
      order: 1,
      style: {
        bubbleType: "normal",
        fontSize: "medium",
        emphasis: false,
      },
      emotion: "Sincere, respectful",
      subtextNote:
        "Takeshi's genuine dedication contrasts with the betrayal to come",
      panelId: "panel-ceremony-closeup",
      speakerId: "char-takeshi",
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    db.dialogues.add({
      id: "dialogue-kaito-thoughts",
      content:
        "Enjoy this moment, Himura. It will be your last taste of honor.",
      order: 1,
      style: {
        bubbleType: "thought",
        fontSize: "small",
        emphasis: true,
      },
      emotion: "Malicious",
      subtextNote: "Reveals true intentions to the reader",
      panelId: "panel-kaito-smirk",
      speakerId: "char-lord-kaito",
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);
}
// Option 1: Event-based initialization
// This attaches a handler that runs when the "populate" event is emitted
db.on("populate", async () => {
  await populateDatabase(db);
});

db.open()
  .then(() => {})
  .catch((err) => {
    console.error("Failed to open database:", err);
  });
