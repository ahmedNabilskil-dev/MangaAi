import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [String] })
  images?: string[];

  @Prop({ type: [String] })
  attachments?: string[];

  @Prop({ type: Types.ObjectId, refPath: 'targetType' })
  targetId?: Types.ObjectId;

  @Prop({ type: String })
  targetType?: string; // e.g., 'manga', 'chapter', etc.

  @Prop({
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public',
  })
  visibility: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
