import {
  ImageGenerationParams,
  Message,
  TextGenerationParams,
  Tool,
} from '@/common/types/ai';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { ChatAdapterFactory } from './adapters/factory';
import {
  ChatMessage,
  ChatMessageDocument,
  ChatSession,
  ChatSessionDocument,
} from './schemas/chat.schema';

export interface CreditUsage {
  textGeneration?: number;
  imageGeneration?: number;
  total: number;
  details: Array<{
    operation: string;
    cost: number;
    description: string;
  }>;
}

export interface ChatResponse {
  sessionId: string;
  messageId: string;
  content: string;
  imageUrl?: string;
  creditsUsed: CreditUsage;
  remainingCredits: number;
  tokensUsed: number;
  responseTime: number;
  toolsUsed: string[];
}

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
  ) {
    // Register adapters
    ChatAdapterFactory.registerAdapter('gemini', (apiKey: string) => {
      const { GeminiAdapter } = require('./adapters/gemini.adapter');
      return new GeminiAdapter(apiKey);
    });
  }

  // Chat Session Management
  async createChatSession(
    userId: string,
    projectId: string,
    title: string,
    description?: string,
  ): Promise<ChatSession> {
    const session = new this.chatSessionModel({
      userId,
      projectId,
      title,
      description,
      status: 'active',
      messageCount: 0,
      totalCreditsUsed: 0,
    });

    return session.save();
  }

  async getChatSession(
    sessionId: string,
    userId: string,
  ): Promise<ChatSession | null> {
    return this.chatSessionModel
      .findOne({
        _id: sessionId,
        userId,
        status: { $ne: 'deleted' },
      })
      .exec();
  }

  async getUserChatSessions(
    userId: string,
    projectId?: string,
    limit = 20,
    offset = 0,
  ): Promise<ChatSession[]> {
    const filter: any = { userId, status: { $ne: 'deleted' } };
    if (projectId) {
      filter.projectId = projectId;
    }

    return this.chatSessionModel
      .find(filter)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getSessionMessages(
    sessionId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessage[]> {
    // Verify user has access to this session
    const session = await this.getChatSession(sessionId, userId);
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return this.chatMessageModel
      .find({ sessionId, status: { $ne: 'deleted' } })
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  // Enhanced Chat Processing with Credit Management
  async processChatMessage(
    userId: string,
    projectId: string,
    message: string,
    sessionId?: string,
    imageData?: string,
    fileUrl?: string,
    tools: Tool[] = [],
    params: TextGenerationParams = {},
    provider = 'gemini',
    callTool = false,
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    // Verify user exists and has credits
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.credits <= 0) {
      throw new BadRequestException('Insufficient credits');
    }

    // Get or create chat session
    let session: ChatSessionDocument;
    if (sessionId) {
      const existingSession = await this.getChatSession(sessionId, userId);
      if (!existingSession) {
        throw new NotFoundException('Chat session not found');
      }
      session = existingSession as ChatSessionDocument;
    } else {
      // Create new session with auto-generated title
      const autoTitle =
        message.length > 50 ? message.substring(0, 47) + '...' : message;
      session = (await this.createChatSession(
        userId,
        projectId,
        autoTitle,
        'Auto-generated chat session',
      )) as ChatSessionDocument;
    }

    // Save user message
    const userMessage = new this.chatMessageModel({
      sessionId: session._id,
      userId,
      projectId,
      role: 'user',
      content: message,
      messageType: imageData ? 'image' : fileUrl ? 'file' : 'text',
      imageData,
      fileUrl,
      creditsUsed: 0,
      tokensUsed: 0,
      status: 'completed',
    });
    await userMessage.save();

    try {
      // Get recent conversation context
      const recentMessages = await this.getSessionMessages(
        session._id.toString(),
        userId,
        10,
      );

      // Prepare messages for AI
      const aiMessages: Message[] = recentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        metadata: {
          timestamp: (msg as any).createdAt?.getTime(),
          model: msg.model,
          tokens: msg.tokensUsed,
        },
      }));

      // Get API key from config or user settings
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('AI service not configured');
      }

      // Process with AI adapter
      const adapter = ChatAdapterFactory.getAdapter(provider, apiKey);
      if (!adapter) {
        throw new Error(`No adapter found for provider: ${provider}`);
      }

      const aiResponses = await adapter.send(
        aiMessages,
        tools,
        params,
        callTool,
      );

      // Calculate credits and tokens used
      let totalTokensUsed = 0;
      let imagesGenerated = 0;
      const toolsUsed: string[] = [];
      let finalContent = '';
      let generatedImageUrl: string | undefined;

      for (const response of aiResponses) {
        if (response.role === 'assistant') {
          finalContent += response.content || '';
          totalTokensUsed +=
            response.metadata?.tokens ||
            Math.ceil((response.content?.length || 0) / 4);
        }
      }

      // Calculate credit costs
      const creditUsage = this.calculateCreditUsage(
        totalTokensUsed,
        imagesGenerated,
        toolsUsed,
      );

      // Verify user has enough credits
      if (user.credits < creditUsage.total) {
        throw new BadRequestException(
          'Insufficient credits for this operation',
        );
      }

      // Deduct credits
      await this.userService.deductCredits(
        userId,
        creditUsage.total,
        `AI Chat: ${creditUsage.details.map((d) => d.description).join(', ')}`,
      );

      // Save AI response
      const aiMessage = new this.chatMessageModel({
        sessionId: session._id,
        userId,
        projectId,
        role: 'assistant',
        content: finalContent || 'I processed your request.',
        messageType: generatedImageUrl ? 'image' : 'text',
        imageUrl: generatedImageUrl,
        creditsUsed: creditUsage.total,
        aiProvider: provider,
        model: (params as any).model || 'gemini-2.0-flash',
        tokensUsed: totalTokensUsed,
        responseTime: Date.now() - startTime,
        toolsUsed,
        status: 'completed',
      });
      await aiMessage.save();

      // Update session stats
      await this.chatSessionModel.findByIdAndUpdate(session._id, {
        messageCount: session.messageCount + 2, // user + assistant
        totalCreditsUsed: session.totalCreditsUsed + creditUsage.total,
        lastMessageAt: new Date(),
      });

      const updatedUser = await this.userService.findById(userId);

      return {
        sessionId: session._id.toString(),
        messageId: aiMessage._id.toString(),
        content: finalContent,
        imageUrl: generatedImageUrl,
        creditsUsed: creditUsage,
        remainingCredits: updatedUser?.credits || 0,
        tokensUsed: totalTokensUsed,
        responseTime: Date.now() - startTime,
        toolsUsed,
      };
    } catch (error) {
      // Save error message
      const errorMessage = new this.chatMessageModel({
        sessionId: session._id,
        userId,
        projectId,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        messageType: 'text',
        creditsUsed: 0,
        tokensUsed: 0,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      await errorMessage.save();

      throw error;
    }
  }

  // Image Generation with Credit Management
  async generateImage(
    userId: string,
    projectId: string,
    params: ImageGenerationParams,
    sessionId?: string,
    provider = 'gemini',
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    // Verify user exists and has credits
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate image generation cost
    const imageCost = this.calculateImageCost(params);
    if (user.credits < imageCost) {
      throw new BadRequestException(
        'Insufficient credits for image generation',
      );
    }

    // Get or create session
    let session: ChatSessionDocument;
    if (sessionId) {
      const existingSession = await this.getChatSession(sessionId, userId);
      if (!existingSession) {
        throw new NotFoundException('Chat session not found');
      }
      session = existingSession as ChatSessionDocument;
    } else {
      session = (await this.createChatSession(
        userId,
        projectId,
        `Image: ${params.prompt.substring(0, 30)}...`,
        'Image generation session',
      )) as ChatSessionDocument;
    }

    try {
      // Get API key
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('AI service not configured');
      }

      // Generate image
      const adapter = ChatAdapterFactory.getAdapter(provider, apiKey);
      if (!adapter || !adapter.generateImage) {
        throw new Error(
          `Image generation not supported for provider: ${provider}`,
        );
      }

      const result = await adapter.generateImage(params);

      // Deduct credits
      await this.userService.deductCredits(
        userId,
        imageCost,
        `Image Generation: ${params.prompt.substring(0, 50)}...`,
      );

      // Save generation record
      const imageMessage = new this.chatMessageModel({
        sessionId: session._id,
        userId,
        projectId,
        role: 'assistant',
        content: `Generated image: ${params.prompt}`,
        messageType: 'image',
        imageUrl: result.url,
        creditsUsed: imageCost,
        aiProvider: provider,
        model: 'image-generation',
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
        toolsUsed: ['image_generation'],
        status: 'completed',
        metadata: {
          imageParams: params,
          imageResult: result,
        },
      });
      await imageMessage.save();

      // Update session
      await this.chatSessionModel.findByIdAndUpdate(session._id, {
        messageCount: session.messageCount + 1,
        totalCreditsUsed: session.totalCreditsUsed + imageCost,
        lastMessageAt: new Date(),
      });

      const updatedUser = await this.userService.findById(userId);

      return {
        sessionId: session._id.toString(),
        messageId: imageMessage._id.toString(),
        content: `Generated image: ${params.prompt}`,
        imageUrl: result.url,
        creditsUsed: {
          imageGeneration: imageCost,
          total: imageCost,
          details: [
            {
              operation: 'image_generation',
              cost: imageCost,
              description: `${params.width || 1024}x${params.height || 1024} ${params.quality || 'standard'}`,
            },
          ],
        },
        remainingCredits: updatedUser?.credits || 0,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
        toolsUsed: ['image_generation'],
      };
    } catch (error) {
      // Save error
      const errorMessage = new this.chatMessageModel({
        sessionId: session._id,
        userId,
        projectId,
        role: 'assistant',
        content: 'Failed to generate image.',
        messageType: 'text',
        creditsUsed: 0,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      await errorMessage.save();

      throw error;
    }
  }

  // Credit Calculation Methods
  private calculateCreditUsage(
    tokensUsed: number,
    imagesGenerated: number,
    toolsUsed: string[],
  ): CreditUsage {
    const details: Array<{
      operation: string;
      cost: number;
      description: string;
    }> = [];

    let textCost = 0;
    if (tokensUsed > 0) {
      textCost = Math.ceil(tokensUsed / 1000); // 1 credit per 1000 tokens
      details.push({
        operation: 'text_generation',
        cost: textCost,
        description: `${tokensUsed} tokens`,
      });
    }

    let imageCost = 0;
    if (imagesGenerated > 0) {
      imageCost = imagesGenerated * 10; // 10 credits per image
      details.push({
        operation: 'image_generation',
        cost: imageCost,
        description: `${imagesGenerated} images`,
      });
    }

    let toolCost = 0;
    if (toolsUsed.length > 0) {
      toolCost = toolsUsed.length * 2; // 2 credits per tool call
      details.push({
        operation: 'tool_calls',
        cost: toolCost,
        description: `${toolsUsed.length} tool calls`,
      });
    }

    return {
      textGeneration: textCost,
      imageGeneration: imageCost,
      total: textCost + imageCost + toolCost,
      details,
    };
  }

  private calculateImageCost(params: ImageGenerationParams): number {
    let baseCost = 10; // Base cost

    // Quality multiplier
    if (params.quality === 'hd') baseCost *= 1.5;
    if (params.quality === 'ultra') baseCost *= 2;

    // Size multiplier
    const width = params.width || 1024;
    const height = params.height || 1024;
    const pixels = width * height;

    if (pixels > 1024 * 1024) {
      baseCost *= 1.5; // 50% more for larger images
    }

    return Math.ceil(baseCost);
  }

  validateApiKey(apiKey: string, provider: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    switch (provider) {
      case 'gemini':
        return apiKey.startsWith('AIza') && apiKey.length > 20;
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 40;
      default:
        return apiKey.length > 10;
    }
  }

  sanitizeMessage(message: Message): Message {
    return {
      ...message,
      content: message.content.trim(),
      metadata: {
        ...message.metadata,
        timestamp: Date.now(),
      },
    };
  }
}
