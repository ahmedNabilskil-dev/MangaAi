import {
  Body,
  Controller,
  Delete,
  Get,
  Post as HttpPost,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/post.dto';
import { PostService } from './post.service';

@Controller('social/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async createPost(@Req() req, @Body() dto: CreatePostDto) {
    return this.postService.createPost(req.user._id, dto);
  }

  @Get()
  async getPosts(@Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.postService.getPosts(Number(limit), Number(offset));
  }

  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string) {
    return this.postService.getUserPosts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId')
  async updatePost(
    @Req() req,
    @Param('postId') postId: string,
    @Body() updates: any,
  ) {
    return this.postService.updatePost(postId, req.user._id, updates);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  async deletePost(@Req() req, @Param('postId') postId: string) {
    return this.postService.deletePost(postId, req.user._id);
  }

  @Get('count')
  async countPosts(@Query() query: any) {
    // Optionally filter by userId, targetType, etc.
    return this.postService.countPosts(query);
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string) {
    return this.postService.getPostById(postId);
  }

  @Get('search')
  async searchPosts(
    @Query('q') q: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.searchPosts(q, Number(limit), Number(offset));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId/visibility')
  async updatePostVisibility(
    @Req() req,
    @Param('postId') postId: string,
    @Body('visibility') visibility: string,
  ) {
    return this.postService.updatePost(postId, req.user._id, { visibility });
  }

  @Get('filter')
  async filterPosts(@Query() query: any) {
    const { limit = 20, offset = 0, ...filter } = query;
    return this.postService.filterPosts(filter, Number(limit), Number(offset));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/report')
  async reportPost(
    @Req() req,
    @Param('postId') postId: string,
    @Body('reason') reason: string,
  ) {
    return this.postService.reportPost(postId, req.user._id, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/hide')
  async hidePost(@Req() req, @Param('postId') postId: string) {
    return this.postService.hidePost(postId, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('block/:blockedUserId')
  async blockUserPosts(
    @Req() req,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.postService.blockUserPosts(blockedUserId, req.user._id);
  }

  // Admin: List all posts
  @Get('admin/all')
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  // Admin: Delete any post
  @Delete('admin/:postId')
  async adminDeletePost(@Param('postId') postId: string) {
    return this.postService.adminDeletePost(postId);
  }

  // Analytics: Post stats
  @Get('stats')
  async getPostStats() {
    return this.postService.getPostStats();
  }

  @Get('hashtag/:hashtag')
  async getPostsByHashtag(
    @Param('hashtag') hashtag: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getPostsByHashtag(
      hashtag,
      Number(limit),
      Number(offset),
    );
  }

  @Get('mention/:username')
  async getPostsByMention(
    @Param('username') username: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getPostsByMention(
      username,
      Number(limit),
      Number(offset),
    );
  }
}
