import {
  Body,
  Controller,
  Delete,
  Get,
  Post as HttpPost,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateLikeDto } from './dto/like.dto';
import { LikeService } from './like.service';

@Controller('social/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async like(@Req() req, @Body() dto: CreateLikeDto) {
    return this.likeService.like(req.user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async unlike(@Req() req, @Body() dto: CreateLikeDto) {
    return this.likeService.unlike(req.user._id, dto);
  }

  @Get()
  async getLikes(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.likeService.getLikes(targetType, targetId);
  }

  @Get('count')
  async countLikes(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.likeService.countLikes(targetType, targetId);
  }

  @Get('count-by-reaction')
  async countLikesByReaction(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    // Returns an object { like: n, love: n, ... }
    return this.likeService.countLikesByReaction(targetType, targetId);
  }

  @Get('user/:userId')
  async getLikesByUser(@Param('userId') userId: string) {
    return this.likeService.getLikesByUser(userId);
  }

  // Admin: List all likes
  @Get('admin/all')
  async getAllLikes() {
    return this.likeService.getAllLikes();
  }

  // Admin: Delete any like
  @Delete('admin/:likeId')
  async adminDeleteLike(@Param('likeId') likeId: string) {
    return this.likeService.adminDeleteLike(likeId);
  }

  // Analytics: Like stats
  @Get('stats')
  async getLikeStats() {
    return this.likeService.getLikeStats();
  }
}
