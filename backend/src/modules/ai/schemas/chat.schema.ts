import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatSessionDocument = ChatSession & Document;
export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  })
  status: 'active' | 'archived' | 'deleted';

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ default: 0 })
  totalCreditsUsed: number;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  })
  role: 'user' | 'assistant' | 'system';

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  })
  messageType: 'text' | 'image' | 'file';

  @Prop()
  imageUrl?: string;

  @Prop()
  imageData?: string; // Base64 for temporary storage

  @Prop()
  fileUrl?: string;

  @Prop()
  fileName?: string;

  @Prop({ default: 0 })
  creditsUsed: number;

  @Prop()
  aiProvider?: string; // gemini, openai, etc.

  @Prop()
  model?: string; // specific model used

  @Prop({ default: 0 })
  tokensUsed: number;

  @Prop()
  responseTime?: number; // ms

  @Prop()
  toolsUsed?: string[]; // Array of tool names used

  @Prop()
  parentMessageId?: string; // For threading/replies

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed',
  })
  status: 'pending' | 'completed' | 'failed' | 'cancelled';

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Add indexes for better performance
ChatSessionSchema.index({ userId: 1, projectId: 1 });
ChatSessionSchema.index({ status: 1 });
ChatSessionSchema.index({ lastMessageAt: -1 });

ChatMessageSchema.index({ sessionId: 1 });
ChatMessageSchema.index({ userId: 1, projectId: 1 });
ChatMessageSchema.index({ role: 1 });
ChatMessageSchema.index({ createdAt: -1 });
ChatMessageSchema.index({ status: 1 });
ChatMessageSchema.index({ parentMessageId: 1 });
