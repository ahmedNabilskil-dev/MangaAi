import {
  Body,
  Controller,
  Delete,
  Get,
  Post as HttpPost,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateFollowDto } from './dto/follow.dto';
import { FollowService } from './follow.service';

@Controller('social/follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async follow(@Req() req, @Body() dto: CreateFollowDto) {
    return this.followService.follow(req.user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':followingId')
  async unfollow(@Req() req, @Param('followingId') followingId: string) {
    return this.followService.unfollow(req.user._id, followingId);
  }

  @Get('mutual/:userIdA/:userIdB')
  async getMutualFollowers(
    @Param('userIdA') userIdA: string,
    @Param('userIdB') userIdB: string,
  ) {
    return this.followService.getMutualFollowers(userIdA, userIdB);
  }

  @Get('status/:followerId/:followingId')
  async isFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followService.isFollowing(followerId, followingId);
  }

  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.followService.getFollowers(
      userId,
      Number(limit),
      Number(offset),
    );
  }

  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.followService.getFollowing(
      userId,
      Number(limit),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('block/:blockedUserId')
  async blockUser(@Req() req, @Param('blockedUserId') blockedUserId: string) {
    return this.followService.blockUser(req.user._id, blockedUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unblock/:blockedUserId')
  async unblockUser(@Req() req, @Param('blockedUserId') blockedUserId: string) {
    return this.followService.unblockUser(req.user._id, blockedUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('report/:reportedUserId')
  async reportUser(
    @Req() req,
    @Param('reportedUserId') reportedUserId: string,
    @Body('reason') reason: string,
  ) {
    return this.followService.reportUser(req.user._id, reportedUserId, reason);
  }

  // Admin: List all follows
  @Get('admin/all')
  async getAllFollows() {
    return this.followService.getAllFollows();
  }

  // Admin: Delete any follow
  @Delete('admin/:followId')
  async adminDeleteFollow(@Param('followId') followId: string) {
    return this.followService.adminDeleteFollow(followId);
  }

  // Analytics: Follow stats
  @Get('stats')
  async getFollowStats() {
    return this.followService.getFollowStats();
  }
}
