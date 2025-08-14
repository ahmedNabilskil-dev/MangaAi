import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [String] })
  attachments?: string[];

  @Prop({
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public',
  })
  visibility: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
