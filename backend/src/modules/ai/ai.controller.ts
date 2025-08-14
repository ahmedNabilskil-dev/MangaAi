import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import {
  ChatRequestDto,
  ChatSessionCreateDto,
  ImageGenerationRequestDto,
} from './dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // Enhanced Chat Endpoints
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send chat message with credit management' })
  @ApiResponse({
    status: 200,
    description: 'Chat response received successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient credits',
  })
  @ApiResponse({ status: 404, description: 'User or session not found' })
  async chat(
    @Body() chatRequest: ChatRequestDto,
    @GetUser('id') userId: string,
  ) {
    const response = await this.aiService.processChatMessage(
      userId,
      chatRequest.projectId,
      chatRequest.message,
      chatRequest.sessionId,
      chatRequest.imageData,
      chatRequest.fileUrl,
      chatRequest.tools || [],
      chatRequest.params || {},
      chatRequest.provider || 'gemini',
      chatRequest.callTool || false,
    );

    return {
      success: true,
      data: response,
    };
  }

  @Post('generate-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate image with credit management' })
  @ApiResponse({ status: 200, description: 'Image generated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient credits',
  })
  async generateImage(
    @Body() imageRequest: ImageGenerationRequestDto,
    @GetUser('id') userId: string,
  ) {
    const imageParams = {
      prompt: imageRequest.prompt,
      width: imageRequest.width,
      height: imageRequest.height,
      quality: imageRequest.quality,
      style: imageRequest.style,
      negativePrompt: imageRequest.negativePrompt,
    };

    const response = await this.aiService.generateImage(
      userId,
      imageRequest.projectId,
      imageParams,
      imageRequest.sessionId,
      imageRequest.provider || 'gemini',
    );

    return {
      success: true,
      data: response,
    };
  }

  // Chat Session Management
  @Post('sessions')
  @ApiOperation({ summary: 'Create new chat session' })
  @ApiResponse({
    status: 201,
    description: 'Chat session created successfully',
  })
  async createSession(
    @Body() sessionData: ChatSessionCreateDto,
    @GetUser('id') userId: string,
  ) {
    const session = await this.aiService.createChatSession(
      userId,
      sessionData.projectId,
      sessionData.title,
      sessionData.description,
    );

    return {
      success: true,
      data: session,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user chat sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getUserSessions(
    @GetUser('id') userId: string,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const sessions = await this.aiService.getUserChatSessions(
      userId,
      projectId,
      limit || 20,
      offset || 0,
    );

    return {
      success: true,
      data: sessions,
    };
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get chat session details' })
  @ApiResponse({
    status: 200,
    description: 'Session details retrieved successfully',
  })
  async getSession(
    @Param('sessionId') sessionId: string,
    @GetUser('id') userId: string,
  ) {
    const session = await this.aiService.getChatSession(sessionId, userId);
    return {
      success: true,
      data: session,
    };
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get messages from chat session' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getSessionMessages(
    @Param('sessionId') sessionId: string,
    @GetUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const messages = await this.aiService.getSessionMessages(
      sessionId,
      userId,
      limit || 50,
      offset || 0,
    );

    return {
      success: true,
      data: messages,
    };
  }

  @Get('tools')
  @ApiOperation({ summary: 'Get available AI tools' })
  @ApiResponse({
    status: 200,
    description: 'Available AI tools retrieved successfully',
  })
  async getAvailableTools() {
    const { mcpClient } = await import('../../services/mcp-client');

    const tools = await mcpClient.getAvailableTools();
    return {
      success: true,
      data: tools,
    };
  }

  @Get('prompts')
  @ApiOperation({ summary: 'Get available AI prompts' })
  @ApiResponse({
    status: 200,
    description: 'Available AI prompts retrieved successfully',
  })
  async getAvailablePrompts() {
    const { mcpClient } = await import('../../services/mcp-client');

    const prompts = await mcpClient.getAvailablePrompts();
    return {
      success: true,
      data: prompts,
    };
  }

  @Get('prompts/:name')
  @ApiOperation({ summary: 'Get specific AI prompt by name' })
  @ApiResponse({
    status: 200,
    description: 'AI prompt retrieved successfully',
  })
  async getPrompt(@Param('name') name: string, @Query('args') args: any) {
    const { mcpClient } = await import('../../services/mcp-client');

    const prompt = await mcpClient.getPrompt(name, args);
    return {
      success: true,
      data: prompt,
    };
  }
}
