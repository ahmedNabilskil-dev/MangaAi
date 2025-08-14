import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OutfitTemplateDocument = OutfitTemplate & Document;

@Schema({ timestamps: true })
export class OutfitTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Character', required: true })
  characterId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  aiPrompt: string;

  @Prop({
    type: String,
    enum: ['casual', 'formal', 'school', 'special'],
    required: true,
  })
  category: 'casual' | 'formal' | 'school' | 'special';

  @Prop({
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'all'],
    required: true,
  })
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

  @Prop({ default: false })
  isDefault: boolean;

  @Prop([String])
  tags: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'MangaProject', required: true })
  mangaProjectId: Types.ObjectId;
}

export const OutfitTemplateSchema =
  SchemaFactory.createForClass(OutfitTemplate);

// Add indexes
OutfitTemplateSchema.index({ characterId: 1 });
OutfitTemplateSchema.index({ mangaProjectId: 1 });
OutfitTemplateSchema.index({ category: 1 });
OutfitTemplateSchema.index({ isDefault: 1 });
