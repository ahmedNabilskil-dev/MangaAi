import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MangaGenerationService } from '../ai/services/manga-generation.service';
import { DatabaseService } from './database.service';

@ApiTags('manga')
@Controller('manga')
export class MangaController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mangaGenerationService: MangaGenerationService,
  ) {}

  @Post('projects')
  @ApiOperation({
    summary: 'Create AI-generated manga project from idea',
    description:
      'Long-running operation - may take 30+ seconds for complex ideas',
  })
  @ApiResponse({
    status: 201,
    description: 'AI-generated manga project created successfully',
  })
  async createProject(
    @Body() body: { mangaIdea: string },
    @Req() req: Request,
  ) {
    const { mangaIdea } = body;

    // Extract user ID from request (assuming it's added by auth middleware)
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      throw new Error('User authentication required');
    }

    if (!mangaIdea || !mangaIdea.trim()) {
      throw new Error('Manga idea is required');
    }

    try {
      // Generate structured project data using dedicated service
      const structuredProjectData =
        await this.mangaGenerationService.generateMangaProject(
          mangaIdea.trim(),
        );

      // Create the project with the AI-generated structure plus manual fields
      const project = await this.databaseService.createMangaProject({
        ...structuredProjectData,
        status: 'draft', // Set manually
        creatorId: userId,
        initialPrompt: mangaIdea,
        viewCount: 0, // Set manually
        likeCount: 0, // Set manually
        published: false, // Set manually
      });

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error('Manga project creation failed:', error);
      throw new Error(
        `Failed to create manga project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get manga project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Manga project retrieved successfully',
  })
  async getProject(@Param('id') id: string) {
    const project = await this.databaseService.getMangaProject(id);
    return {
      success: true,
      data: project,
    };
  }

  @Put('projects/:id')
  @ApiOperation({ summary: 'Update manga project' })
  @ApiResponse({
    status: 200,
    description: 'Manga project updated successfully',
  })
  async updateProject(@Param('id') id: string, @Body() updates: any) {
    const project = await this.databaseService.updateMangaProject(id, updates);
    return {
      success: true,
      data: project,
    };
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete manga project' })
  @ApiResponse({
    status: 200,
    description: 'Manga project deleted successfully',
  })
  async deleteProject(@Param('id') id: string) {
    await this.databaseService.deleteMangaProject(id);
    return {
      success: true,
      message: 'Project deleted successfully',
    };
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get manga projects' })
  @ApiResponse({
    status: 200,
    description: 'Manga projects retrieved successfully',
  })
  async getProjects(
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const { page: currentPage = 1, limit: currentLimit = 20 } = { page, limit };
    const offset = (currentPage - 1) * currentLimit;

    const { data, count } = await this.databaseService.getMangaProjects(
      userId,
      currentLimit,
      offset,
    );

    const result = {
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: count,
        totalPages: Math.ceil(count / currentLimit),
        hasNext: offset + currentLimit < count,
        hasPrev: currentPage > 1,
      },
    };

    return {
      success: true,
      ...result,
    };
  }

  @Post('projects/:projectId/characters')
  @ApiOperation({ summary: 'Create character for project' })
  @ApiResponse({ status: 201, description: 'Character created successfully' })
  async createCharacter(
    @Param('projectId') projectId: string,
    @Body() characterData: any,
  ) {
    const character = await this.databaseService.createCharacter({
      ...characterData,
      projectId,
    });
    return {
      success: true,
      data: character,
    };
  }

  @Get('projects/:projectId/characters')
  @ApiOperation({ summary: 'Get characters for project' })
  @ApiResponse({
    status: 200,
    description: 'Characters retrieved successfully',
  })
  async getProjectCharacters(@Param('projectId') projectId: string) {
    const characters =
      await this.databaseService.getCharactersByProject(projectId);
    return {
      success: true,
      data: characters,
    };
  }

  @Post('projects/:projectId/chapters')
  @ApiOperation({ summary: 'Create chapter for project' })
  @ApiResponse({ status: 201, description: 'Chapter created successfully' })
  async createChapter(
    @Param('projectId') projectId: string,
    @Body() chapterData: any,
  ) {
    const chapter = await this.databaseService.createChapter({
      ...chapterData,
      projectId,
    });
    return {
      success: true,
      data: chapter,
    };
  }

  @Get('projects/:projectId/chapters')
  @ApiOperation({ summary: 'Get chapters for project' })
  @ApiResponse({ status: 200, description: 'Chapters retrieved successfully' })
  async getProjectChapters(@Param('projectId') projectId: string) {
    const chapters = await this.databaseService.getChaptersByProject(projectId);
    return {
      success: true,
      data: chapters,
    };
  }
}
