import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocationTemplateDocument = LocationTemplate & Document;

@Schema({ timestamps: true })
export class LocationTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  basePrompt: string;

  @Prop({
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true,
  })
  type: 'indoor' | 'outdoor';

  @Prop({
    type: String,
    enum: ['school', 'home', 'public', 'nature', 'fantasy'],
    required: true,
  })
  category: 'school' | 'home' | 'public' | 'nature' | 'fantasy';

  @Prop([String])
  cameraAngles: string[];

  @Prop([String])
  tags: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'MangaProject', required: true })
  mangaProjectId: Types.ObjectId;
}

export const LocationTemplateSchema =
  SchemaFactory.createForClass(LocationTemplate);

// Add indexes
LocationTemplateSchema.index({ mangaProjectId: 1 });
LocationTemplateSchema.index({ type: 1 });
LocationTemplateSchema.index({ category: 1 });
