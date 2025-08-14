import { MangaStatus } from '@/common/types/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MangaProjectDocument = MangaProject & Document;

@Schema({ _id: false })
export class WorldDetails {
  @Prop()
  summary?: string;

  @Prop()
  history?: string;

  @Prop()
  society?: string;

  @Prop()
  uniqueSystems?: string;
}

@Schema({ _id: false })
export class PlotStructure {
  @Prop()
  incitingIncident?: string;

  @Prop()
  plotTwist?: string;

  @Prop()
  climax?: string;

  @Prop()
  resolution?: string;
}

@Schema({ _id: false })
export class MessagePart {
  @Prop({ required: true })
  text: string;
}

@Schema({ _id: false })
export class Message {
  @Prop({ required: true })
  role: string;

  @Prop([MessagePart])
  parts: MessagePart[];
}

@Schema({ timestamps: true })
export class MangaProject {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'published', 'archived'],
    default: 'draft',
  })
  status: MangaStatus;

  @Prop()
  initialPrompt?: string;

  @Prop()
  genre?: string;

  @Prop()
  artStyle?: string;

  @Prop()
  coverImageUrl?: string;

  @Prop({
    type: String,
    enum: ['children', 'teen', 'young-adult', 'adult'],
  })
  targetAudience?: 'children' | 'teen' | 'young-adult' | 'adult';

  @Prop({ type: WorldDetails })
  worldDetails?: WorldDetails;

  @Prop()
  concept?: string;

  @Prop({ type: PlotStructure })
  plotStructure?: PlotStructure;

  @Prop([String])
  themes?: string[];

  @Prop([String])
  motifs?: string[];

  @Prop([String])
  symbols?: string[];

  @Prop([String])
  tags?: string[];

  @Prop()
  creatorId?: string;

  @Prop([Message])
  messages?: Message[];

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: false })
  published: boolean;

  // References to related collections
  @Prop([{ type: Types.ObjectId, ref: 'Chapter' }])
  chapters?: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Character' }])
  characters?: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'OutfitTemplate' }])
  outfitTemplates?: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'LocationTemplate' }])
  locationTemplates?: Types.ObjectId[];
}

export const MangaProjectSchema = SchemaFactory.createForClass(MangaProject);

// Add indexes for better query performance
MangaProjectSchema.index({ creatorId: 1 });
MangaProjectSchema.index({ status: 1 });
MangaProjectSchema.index({ published: 1 });
MangaProjectSchema.index({ createdAt: -1 });
