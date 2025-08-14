import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateShareDto } from './dto/share.dto';
import { ShareTargetType } from './share.schema';
import { ShareService } from './share.service';

@Controller('social/share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createShare(@Req() req, @Body() dto: CreateShareDto) {
    return this.shareService.createShare(req.user._id, dto);
  }

  @Get()
  async getSharesByTarget(
    @Query('targetType') targetType: ShareTargetType,
    @Query('targetId') targetId: string,
  ) {
    return this.shareService.getSharesByTarget(targetType, targetId);
  }

  @Get('user/:userId')
  async getSharesByUser(@Param('userId') userId: string) {
    return this.shareService.getSharesByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async unshare(
    @Req() req,
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.shareService.unshare(req.user._id, targetType as any, targetId);
  }

  @Get('count')
  async countShares(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.shareService.countShares(targetType as any, targetId);
  }

  @Get('type/:targetType')
  async getSharesByType(@Param('targetType') targetType: string) {
    return this.shareService.getSharesByType(targetType as any);
  }

  // Admin: List all shares
  @Get('admin/all')
  async getAllShares() {
    return this.shareService.getAllShares();
  }

  // Admin: Delete any share
  @Delete('admin/:shareId')
  async adminDeleteShare(@Param('shareId') shareId: string) {
    return this.shareService.adminDeleteShare(shareId);
  }

  // Analytics: Share stats
  @Get('stats')
  async getShareStats() {
    return this.shareService.getShareStats();
  }
}
