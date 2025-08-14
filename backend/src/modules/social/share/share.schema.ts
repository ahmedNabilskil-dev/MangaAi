import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShareDocument = Share & Document;

export enum ShareTargetType {
  MANGA = 'manga',
  CHAPTER = 'chapter',
  SCENE = 'scene',
  PANEL = 'panel',
}

@Schema({ timestamps: true })
export class Share {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ShareTargetType, required: true })
  targetType: ShareTargetType;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String })
  comment?: string;
}

export const ShareSchema = SchemaFactory.createForClass(Share);
