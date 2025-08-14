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
import { CreateNotificationDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';

@Controller('social/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/all')
  async markAllAsRead(@Req() req) {
    return this.notificationService.markAllAsRead(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  async countNotifications(@Req() req, @Query() query: any) {
    return this.notificationService.countNotifications(req.user._id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserNotifications(
    @Req() req,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.notificationService.getUserNotifications(
      req.user._id,
      Number(limit),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':notificationId')
  async deleteNotification(
    @Req() req,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.deleteNotification(
      notificationId,
      req.user._id,
    );
  }

  // Real-time notification stub (to be implemented with WebSocket/gateway)
  @UseGuards(JwtAuthGuard)
  @Post('realtime')
  async sendRealtimeNotification(@Req() req, @Body() dto: any) {
    // Stub: In production, emit via WebSocket
    return { sent: true, userId: req.user._id, ...dto };
  }

  // Admin: List all notifications
  @Get('admin/all')
  async getAllNotifications() {
    return this.notificationService.getAllNotifications();
  }

  // Admin: Delete any notification
  @Delete('admin/:notificationId')
  async adminDeleteNotification(
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.adminDeleteNotification(notificationId);
  }

  // Analytics: Notification stats
  @Get('stats')
  async getNotificationStats() {
    return this.notificationService.getNotificationStats();
  }
}
