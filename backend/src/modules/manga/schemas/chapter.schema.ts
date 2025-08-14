import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChapterDocument = Chapter & Document;
export type SceneDocument = Scene & Document;
export type PanelDocument = Panel & Document;
export type PanelDialogueDocument = PanelDialogue & Document;

// Scene Context Schemas
@Schema({ _id: false })
export class LocationOverrides {
  @Prop({
    type: String,
    enum: ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'],
  })
  timeOfDay?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

  @Prop({
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'],
  })
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';

  @Prop()
  customPrompt?: string;
}

@Schema({ _id: false })
export class CustomOutfit {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  aiPrompt: string;
}

@Schema({ _id: false })
export class CharacterOutfit {
  @Prop({ required: true })
  characterId: string;

  @Prop()
  outfitId?: string;

  @Prop({ type: CustomOutfit })
  customOutfit?: CustomOutfit;

  @Prop()
  reason?: string;
}

@Schema({ _id: false })
export class Lighting {
  @Prop({
    type: String,
    enum: ['natural', 'artificial', 'mixed'],
  })
  type?: 'natural' | 'artificial' | 'mixed';

  @Prop({
    type: String,
    enum: ['dim', 'moderate', 'bright'],
  })
  intensity?: 'dim' | 'moderate' | 'bright';

  @Prop()
  color?: string;

  @Prop()
  direction?: string;
}

@Schema({ _id: false })
export class EnvironmentOverrides {
  @Prop({
    type: String,
    enum: ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'],
  })
  timeOfDay?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

  @Prop({
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'],
  })
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';

  @Prop({
    type: String,
    enum: [
      'peaceful',
      'mysterious',
      'energetic',
      'romantic',
      'tense',
      'cheerful',
      'somber',
    ],
  })
  mood?:
    | 'peaceful'
    | 'mysterious'
    | 'energetic'
    | 'romantic'
    | 'tense'
    | 'cheerful'
    | 'somber';

  @Prop({ type: Lighting })
  lighting?: Lighting;

  @Prop([String])
  additionalProps?: string[];

  @Prop()
  atmosphere?: string;
}

@Schema({ _id: false })
export class SceneContext {
  @Prop({ required: true })
  locationId: string;

  @Prop({ type: LocationOverrides })
  locationOverrides?: LocationOverrides;

  @Prop([CharacterOutfit])
  characterOutfits: CharacterOutfit[];

  @Prop([String])
  presentCharacters: string[];

  @Prop({ type: EnvironmentOverrides })
  environmentOverrides?: EnvironmentOverrides;

  @Prop()
  sceneNotes?: string;
}

// Panel Context Schemas
@Schema({ _id: false })
export class CharacterPose {
  @Prop({ required: true })
  characterId: string;

  @Prop({ required: true })
  characterName: string;

  @Prop()
  outfitId?: string;

  @Prop({ type: CustomOutfit })
  customOutfit?: CustomOutfit;

  @Prop({ required: true })
  pose: string;

  @Prop({ required: true })
  expression: string;

  @Prop()
  position?: string;
}

@Schema({ _id: false })
export class CameraSettings {
  @Prop({
    type: String,
    enum: ['close-up', 'medium', 'wide', "bird's eye", 'low angle'],
  })
  angle?: 'close-up' | 'medium' | 'wide' | "bird's eye" | 'low angle';

  @Prop({
    type: String,
    enum: ['action', 'reaction', 'establishing', 'detail', 'transition'],
  })
  shotType?: 'action' | 'reaction' | 'establishing' | 'detail' | 'transition';

  @Prop()
  focus?: string;
}

@Schema({ _id: false })
export class PanelContext {
  @Prop({ required: true })
  locationId: string;

  @Prop({ type: LocationOverrides })
  locationOverrides?: LocationOverrides;

  @Prop()
  action?: string;

  @Prop([CharacterPose])
  characterPoses: CharacterPose[];

  @Prop({ type: EnvironmentOverrides })
  environmentOverrides?: EnvironmentOverrides;

  @Prop({ type: CameraSettings })
  cameraSettings?: CameraSettings;

  @Prop([String])
  visualEffects?: string[];

  @Prop()
  panelNotes?: string;
}

// Dialogue Schema
@Schema({ _id: false })
export class DialogueStyle {
  @Prop({
    type: String,
    enum: ['normal', 'thought', 'scream', 'whisper', 'narration'],
  })
  bubbleType?: 'normal' | 'thought' | 'scream' | 'whisper' | 'narration';
}

@Schema({ timestamps: true })
export class PanelDialogue {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: DialogueStyle })
  style?: DialogueStyle;

  @Prop()
  emotion?: string;

  @Prop()
  subtextNote?: string;

  @Prop({ type: Types.ObjectId, ref: 'Panel', required: true })
  panelId: Types.ObjectId;

  @Prop()
  speakerId?: string;

  @Prop({ default: false })
  isAiGenerated: boolean;

  @Prop({ type: Object })
  config?: any;

  // Reference to speaker character
  @Prop({ type: Types.ObjectId, ref: 'Character' })
  speaker?: Types.ObjectId;
}

// Panel Schema
@Schema({ timestamps: true })
export class Panel {
  @Prop({ required: true })
  order: number;

  @Prop()
  imageUrl?: string;

  @Prop({ type: PanelContext, required: true })
  panelContext: PanelContext;

  @Prop({ type: Types.ObjectId, ref: 'Scene', required: true })
  sceneId: Types.ObjectId;

  @Prop({ default: false })
  isAiGenerated: boolean;

  @Prop()
  negativePrompt?: string;

  // References to dialogues and characters
  @Prop([{ type: Types.ObjectId, ref: 'PanelDialogue' }])
  dialogues?: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Character' }])
  characters?: Types.ObjectId[];
}

// Scene Schema
@Schema({ timestamps: true })
export class Scene {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: SceneContext, required: true })
  sceneContext: SceneContext;

  @Prop({ type: Types.ObjectId, ref: 'Chapter', required: true })
  chapterId: Types.ObjectId;

  @Prop({ default: false })
  isAiGenerated: boolean;

  // Reference to panels
  @Prop([{ type: Types.ObjectId, ref: 'Panel' }])
  panels?: Types.ObjectId[];
}

// Chapter Schema
@Schema({ timestamps: true })
export class Chapter {
  @Prop({ required: true })
  chapterNumber: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  narrative: string;

  @Prop()
  purpose?: string;

  @Prop()
  tone?: string;

  @Prop([String])
  keyCharacters?: string[];

  @Prop()
  coverImageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'MangaProject', required: true })
  mangaProjectId: Types.ObjectId;

  @Prop({ default: false })
  isAiGenerated?: boolean;

  @Prop({ default: false })
  isPublished?: boolean;

  @Prop({ default: 0 })
  viewCount?: number;

  // Reference to scenes
  @Prop([{ type: Types.ObjectId, ref: 'Scene' }])
  scenes?: Types.ObjectId[];
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
export const SceneSchema = SchemaFactory.createForClass(Scene);
export const PanelSchema = SchemaFactory.createForClass(Panel);
export const PanelDialogueSchema = SchemaFactory.createForClass(PanelDialogue);

// Add indexes
ChapterSchema.index({ mangaProjectId: 1 });
ChapterSchema.index({ chapterNumber: 1 });
SceneSchema.index({ chapterId: 1 });
SceneSchema.index({ order: 1 });
PanelSchema.index({ sceneId: 1 });
PanelSchema.index({ order: 1 });
PanelDialogueSchema.index({ panelId: 1 });
PanelDialogueSchema.index({ order: 1 });
