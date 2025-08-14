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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/comment.dto';

@Controller('social/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async createComment(@Req() req, @Body() dto: CreateCommentDto) {
    return this.commentService.createComment(req.user._id, dto);
  }

  @Get('post/:postId')
  async getCommentsByPost(@Param('postId') postId: string) {
    return this.commentService.getCommentsByPost(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':commentId')
  async updateComment(
    @Req() req,
    @Param('commentId') commentId: string,
    @Body() updates: any,
  ) {
    return this.commentService.updateComment(commentId, req.user._id, updates);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async deleteComment(@Req() req, @Param('commentId') commentId: string) {
    return this.commentService.deleteComment(commentId, req.user._id);
  }

  @Get('count')
  async countComments(@Query() query: any) {
    return this.commentService.countComments(query);
  }

  @Get('user/:userId')
  async getCommentsByUser(@Param('userId') userId: string) {
    return this.commentService.getCommentsByUser(userId);
  }

  @Get(':commentId')
  async getCommentById(@Param('commentId') commentId: string) {
    return this.commentService.getCommentById(commentId);
  }

  @Get('search')
  async searchComments(
    @Query('q') q: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.commentService.searchComments(q, Number(limit), Number(offset));
  }

  @Get('filter')
  async filterComments(@Query() query: any) {
    const { limit = 20, offset = 0, ...filter } = query;
    return this.commentService.filterComments(
      filter,
      Number(limit),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/report')
  async reportComment(
    @Req() req,
    @Param('commentId') commentId: string,
    @Body('reason') reason: string,
  ) {
    return this.commentService.reportComment(commentId, req.user._id, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/hide')
  async hideComment(@Req() req, @Param('commentId') commentId: string) {
    return this.commentService.hideComment(commentId, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('block/:blockedUserId')
  async blockUserComments(
    @Req() req,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.commentService.blockUserComments(blockedUserId, req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':commentId/visibility')
  async updateCommentVisibility(
    @Req() req,
    @Param('commentId') commentId: string,
    @Body('visibility') visibility: string,
  ) {
    return this.commentService.updateComment(commentId, req.user._id, {
      visibility,
    });
  }

  // Admin: List all comments
  @Get('admin/all')
  async getAllComments() {
    return this.commentService.getAllComments();
  }

  // Admin: Delete any comment
  @Delete('admin/:commentId')
  async adminDeleteComment(@Param('commentId') commentId: string) {
    return this.commentService.adminDeleteComment(commentId);
  }

  // Analytics: Comment stats
  @Get('stats')
  async getCommentStats() {
    return this.commentService.getCommentStats();
  }

  @Get('hashtag/:hashtag')
  async getCommentsByHashtag(
    @Param('hashtag') hashtag: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.commentService.getCommentsByHashtag(
      hashtag,
      Number(limit),
      Number(offset),
    );
  }

  @Get('mention/:username')
  async getCommentsByMention(
    @Param('username') username: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.commentService.getCommentsByMention(
      username,
      Number(limit),
      Number(offset),
    );
  }
}
