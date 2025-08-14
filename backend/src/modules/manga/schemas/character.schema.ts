import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CharacterDocument = Character & Document;

@Schema({ _id: false })
export class BodyAttributes {
  @Prop()
  height?: string;

  @Prop()
  bodyType?: string;

  @Prop()
  proportions?: string;
}

@Schema({ _id: false })
export class FacialAttributes {
  @Prop()
  faceShape?: string;

  @Prop()
  skinTone?: string;

  @Prop()
  eyeColor?: string;

  @Prop()
  eyeShape?: string;

  @Prop()
  noseType?: string;

  @Prop()
  mouthType?: string;

  @Prop()
  jawline?: string;
}

@Schema({ _id: false })
export class HairAttributes {
  @Prop()
  hairColor?: string;

  @Prop()
  hairstyle?: string;

  @Prop()
  hairLength?: string;

  @Prop()
  hairTexture?: string;

  @Prop()
  specialHairFeatures?: string;
}

@Schema({ _id: false })
export class StyleGuide {
  @Prop()
  artStyle?: string;

  @Prop()
  lineweight?: string;

  @Prop()
  shadingStyle?: string;

  @Prop()
  colorStyle?: string;
}

@Schema({ _id: false })
export class OutfitHistory {
  @Prop({ required: true })
  sceneId: string;

  @Prop({ required: true })
  outfitId: string;
}

@Schema({ timestamps: true })
export class Character {
  @Prop({ required: true })
  name: string;

  @Prop()
  age?: number;

  @Prop()
  gender?: string;

  @Prop({ type: BodyAttributes })
  bodyAttributes?: BodyAttributes;

  @Prop({ type: FacialAttributes })
  facialAttributes?: FacialAttributes;

  @Prop({ type: HairAttributes })
  hairAttributes?: HairAttributes;

  @Prop([String])
  distinctiveFeatures?: string[];

  @Prop([String])
  physicalMannerisms?: string[];

  @Prop()
  posture?: string;

  @Prop({ type: StyleGuide })
  styleGuide?: StyleGuide;

  @Prop()
  defaultOutfitId?: string;

  @Prop([OutfitHistory])
  outfitHistory?: OutfitHistory[];

  @Prop()
  consistencyPrompt?: string;

  @Prop()
  negativePrompt?: string;

  @Prop({
    type: String,
    enum: ['protagonist', 'antagonist', 'supporting', 'minor'],
  })
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';

  @Prop()
  briefDescription?: string;

  @Prop()
  personality?: string;

  @Prop()
  abilities?: string;

  @Prop()
  backstory?: string;

  @Prop()
  imgUrl?: string;

  @Prop([String])
  traits?: string[];

  @Prop([String])
  arcs?: string[];

  @Prop({ default: false })
  isAiGenerated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'MangaProject', required: true })
  mangaProjectId: Types.ObjectId;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

// Add indexes
CharacterSchema.index({ mangaProjectId: 1 });
CharacterSchema.index({ name: 1 });
CharacterSchema.index({ role: 1 });
