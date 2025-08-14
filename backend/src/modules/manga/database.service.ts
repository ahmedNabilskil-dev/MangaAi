import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Chapter,
  ChapterDocument,
  Panel,
  PanelDialogue,
  PanelDialogueDocument,
  PanelDocument,
  Scene,
  SceneDocument,
} from './schemas/chapter.schema';
import { Character, CharacterDocument } from './schemas/character.schema';
import {
  LocationTemplate,
  LocationTemplateDocument,
} from './schemas/location-template.schema';
import {
  MangaProject,
  MangaProjectDocument,
} from './schemas/manga-project.schema';
import {
  OutfitTemplate,
  OutfitTemplateDocument,
} from './schemas/outfit-template.schema';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(MangaProject.name)
    private mangaProjectModel: Model<MangaProjectDocument>,
    @InjectModel(Character.name)
    private characterModel: Model<CharacterDocument>,
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    @InjectModel(Scene.name) private sceneModel: Model<SceneDocument>,
    @InjectModel(Panel.name) private panelModel: Model<PanelDocument>,
    @InjectModel(PanelDialogue.name)
    private panelDialogueModel: Model<PanelDialogueDocument>,
    @InjectModel(OutfitTemplate.name)
    private outfitTemplateModel: Model<OutfitTemplateDocument>,
    @InjectModel(LocationTemplate.name)
    private locationTemplateModel: Model<LocationTemplateDocument>,
  ) {}

  // Manga Projects
  async createMangaProject(
    project: Partial<MangaProject>,
  ): Promise<MangaProject> {
    const createdProject = new this.mangaProjectModel(project);
    return createdProject.save();
  }

  async getMangaProject(id: string): Promise<MangaProject | null> {
    return this.mangaProjectModel
      .findById(id)
      .populate('characters')
      .populate('chapters')
      .populate('outfitTemplates')
      .populate('locationTemplates')
      .exec();
  }

  async updateMangaProject(
    id: string,
    updates: Partial<MangaProject>,
  ): Promise<MangaProject | null> {
    return this.mangaProjectModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
  }

  async deleteMangaProject(id: string): Promise<void> {
    await this.mangaProjectModel.findByIdAndDelete(id).exec();
  }

  async getMangaProjects(
    userId?: string,
    limit = 20,
    offset = 0,
  ): Promise<{ data: MangaProject[]; count: number }> {
    const filter = userId ? { creatorId: userId } : {};

    const [data, count] = await Promise.all([
      this.mangaProjectModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('characters')
        .populate('chapters')
        .exec(),
      this.mangaProjectModel.countDocuments(filter),
    ]);

    return { data, count };
  }

  // Characters
  async createCharacter(character: Partial<Character>): Promise<Character> {
    const createdCharacter = new this.characterModel(character);
    const savedCharacter = await createdCharacter.save();

    // Add character reference to the manga project
    if (character.mangaProjectId) {
      await this.mangaProjectModel
        .findByIdAndUpdate(character.mangaProjectId, {
          $push: { characters: savedCharacter._id },
        })
        .exec();
    }

    return savedCharacter;
  }

  async getCharactersByProject(projectId: string): Promise<Character[]> {
    return this.characterModel
      .find({ mangaProjectId: projectId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getCharacter(id: string): Promise<Character | null> {
    return this.characterModel.findById(id).exec();
  }

  async updateCharacter(
    id: string,
    updates: Partial<Character>,
  ): Promise<Character | null> {
    return this.characterModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
  }

  async deleteCharacter(id: string): Promise<void> {
    const character = await this.characterModel.findById(id).exec();
    if (character) {
      // Remove character reference from manga project
      await this.mangaProjectModel
        .findByIdAndUpdate(character.mangaProjectId, {
          $pull: { characters: id },
        })
        .exec();

      await this.characterModel.findByIdAndDelete(id).exec();
    }
  }

  // Chapters
  async createChapter(chapter: Partial<Chapter>): Promise<Chapter> {
    const createdChapter = new this.chapterModel(chapter);
    const savedChapter = await createdChapter.save();

    // Add chapter reference to the manga project
    if (chapter.mangaProjectId) {
      await this.mangaProjectModel
        .findByIdAndUpdate(chapter.mangaProjectId, {
          $push: { chapters: savedChapter._id },
        })
        .exec();
    }

    return savedChapter;
  }

  async getChaptersByProject(projectId: string): Promise<Chapter[]> {
    return this.chapterModel
      .find({ mangaProjectId: projectId })
      .sort({ chapterNumber: 1 })
      .populate('scenes')
      .exec();
  }

  async getChapter(id: string): Promise<Chapter | null> {
    return this.chapterModel.findById(id).populate('scenes').exec();
  }

  async updateChapter(
    id: string,
    updates: Partial<Chapter>,
  ): Promise<Chapter | null> {
    return this.chapterModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
  }

  async deleteChapter(id: string): Promise<void> {
    const chapter = await this.chapterModel.findById(id).exec();
    if (chapter) {
      // Remove chapter reference from manga project
      await this.mangaProjectModel
        .findByIdAndUpdate(chapter.mangaProjectId, { $pull: { chapters: id } })
        .exec();

      await this.chapterModel.findByIdAndDelete(id).exec();
    }
  }

  // Scenes
  async createScene(scene: Partial<Scene>): Promise<Scene> {
    const createdScene = new this.sceneModel(scene);
    const savedScene = await createdScene.save();

    // Add scene reference to the chapter
    if (scene.chapterId) {
      await this.chapterModel
        .findByIdAndUpdate(scene.chapterId, {
          $push: { scenes: savedScene._id },
        })
        .exec();
    }

    return savedScene;
  }

  async getScenesByChapter(chapterId: string): Promise<Scene[]> {
    return this.sceneModel
      .find({ chapterId })
      .sort({ order: 1 })
      .populate('panels')
      .exec();
  }

  // Panels
  async createPanel(panel: Partial<Panel>): Promise<Panel> {
    const createdPanel = new this.panelModel(panel);
    const savedPanel = await createdPanel.save();

    // Add panel reference to the scene
    if (panel.sceneId) {
      await this.sceneModel
        .findByIdAndUpdate(panel.sceneId, { $push: { panels: savedPanel._id } })
        .exec();
    }

    return savedPanel;
  }

  async getPanelsByScene(sceneId: string): Promise<Panel[]> {
    return this.panelModel
      .find({ sceneId })
      .sort({ order: 1 })
      .populate('dialogues')
      .populate('characters')
      .exec();
  }

  // Panel Dialogues
  async createPanelDialogue(
    dialogue: Partial<PanelDialogue>,
  ): Promise<PanelDialogue> {
    const createdDialogue = new this.panelDialogueModel(dialogue);
    const savedDialogue = await createdDialogue.save();

    // Add dialogue reference to the panel
    if (dialogue.panelId) {
      await this.panelModel
        .findByIdAndUpdate(dialogue.panelId, {
          $push: { dialogues: savedDialogue._id },
        })
        .exec();
    }

    return savedDialogue;
  }

  // Outfit Templates
  async createOutfitTemplate(
    outfit: Partial<OutfitTemplate>,
  ): Promise<OutfitTemplate> {
    const createdOutfit = new this.outfitTemplateModel(outfit);
    const savedOutfit = await createdOutfit.save();

    // Add outfit reference to the manga project
    if (outfit.mangaProjectId) {
      await this.mangaProjectModel
        .findByIdAndUpdate(outfit.mangaProjectId, {
          $push: { outfitTemplates: savedOutfit._id },
        })
        .exec();
    }

    return savedOutfit;
  }

  async getOutfitTemplatesByProject(
    projectId: string,
  ): Promise<OutfitTemplate[]> {
    return this.outfitTemplateModel
      .find({ mangaProjectId: projectId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getOutfitTemplatesByCharacter(
    characterId: string,
  ): Promise<OutfitTemplate[]> {
    return this.outfitTemplateModel
      .find({ characterId })
      .sort({ isDefault: -1, createdAt: 1 })
      .exec();
  }

  // Location Templates
  async createLocationTemplate(
    location: Partial<LocationTemplate>,
  ): Promise<LocationTemplate> {
    const createdLocation = new this.locationTemplateModel(location);
    const savedLocation = await createdLocation.save();

    // Add location reference to the manga project
    if (location.mangaProjectId) {
      await this.mangaProjectModel
        .findByIdAndUpdate(location.mangaProjectId, {
          $push: { locationTemplates: savedLocation._id },
        })
        .exec();
    }

    return savedLocation;
  }

  async getLocationTemplatesByProject(
    projectId: string,
  ): Promise<LocationTemplate[]> {
    return this.locationTemplateModel
      .find({ mangaProjectId: projectId })
      .sort({ createdAt: 1 })
      .exec();
  }
}
