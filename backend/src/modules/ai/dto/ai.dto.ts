import {
  ImageGenerationParams,
  Message,
  TextGenerationParams,
  Tool,
} from '@/common/types/ai';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ description: 'Array of chat messages' })
  @IsArray()
  messages: Message[];

  @ApiProperty({ description: 'Available tools for the AI', required: false })
  @IsOptional()
  @IsArray()
  tools?: Tool[];

  @ApiProperty({ description: 'Text generation parameters', required: false })
  @IsOptional()
  @IsObject()
  params?: TextGenerationParams;

  @ApiProperty({
    description: 'Whether to call tools',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  callTool?: boolean;

  @ApiProperty({ description: 'API key for the AI provider' })
  @IsString()
  apiKey: string;

  @ApiProperty({
    description: 'AI provider name',
    required: false,
    default: 'gemini',
  })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class ImageGenerationDto {
  @ApiProperty({ description: 'Image generation parameters' })
  @IsObject()
  params: ImageGenerationParams;

  @ApiProperty({ description: 'API key for the AI provider' })
  @IsString()
  apiKey: string;

  @ApiProperty({
    description: 'AI provider name',
    required: false,
    default: 'gemini',
  })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class MessageDto {
  @ApiProperty({
    description: 'Message role',
    enum: ['user', 'assistant', 'system'],
  })
  @IsEnum(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Message metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    timestamp?: number;
    tokens?: number;
    model?: string;
  };
}

export class TextGenerationParamsDto {
  @ApiProperty({ description: 'AI model to use', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Temperature for randomness', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ description: 'Maximum tokens to generate', required: false })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiProperty({ description: 'Top P sampling', required: false })
  @IsOptional()
  @IsNumber()
  topP?: number;

  @ApiProperty({ description: 'Top K sampling', required: false })
  @IsOptional()
  @IsNumber()
  topK?: number;

  @ApiProperty({ description: 'Frequency penalty', required: false })
  @IsOptional()
  @IsNumber()
  frequencyPenalty?: number;

  @ApiProperty({ description: 'Presence penalty', required: false })
  @IsOptional()
  @IsNumber()
  presencePenalty?: number;

  @ApiProperty({ description: 'Stop sequences', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stopSequences?: string[];

  @ApiProperty({ description: 'System prompt', required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ description: 'Additional context', required: false })
  @IsOptional()
  context?: Record<string, any>;
}

// Enhanced DTOs for the new AI module
export class ChatRequestDto {
  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({
    description: 'Chat session ID (optional for new sessions)',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Image data (base64)' })
  @IsOptional()
  @IsString()
  imageData?: string;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Previous messages for context' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages?: MessageDto[];

  @ApiPropertyOptional({ description: 'Available tools' })
  @IsOptional()
  @IsArray()
  tools?: any[];

  @ApiPropertyOptional({ description: 'Generation parameters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TextGenerationParamsDto)
  params?: TextGenerationParamsDto;

  @ApiPropertyOptional({ description: 'AI provider to use', default: 'gemini' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Force tool calling' })
  @IsOptional()
  @IsBoolean()
  callTool?: boolean;
}

export class ImageGenerationRequestDto {
  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'Chat session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: 'Image generation prompt' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'Image width' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: 'Image height' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({
    description: 'Image quality',
    enum: ['standard', 'hd', 'ultra'],
  })
  @IsOptional()
  @IsEnum(['standard', 'hd', 'ultra'])
  quality?: 'standard' | 'hd' | 'ultra';

  @ApiPropertyOptional({ description: 'Art style' })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({ description: 'Negative prompt' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiPropertyOptional({ description: 'AI provider to use', default: 'gemini' })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class ChatSessionCreateDto {
  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Session title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Session description' })
  @IsOptional()
  @IsString()
  description?: string;
}
