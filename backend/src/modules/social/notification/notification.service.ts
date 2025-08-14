import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNotificationDto } from './dto/notification.dto';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      sourceId: dto.sourceId ? new Types.ObjectId(dto.sourceId) : undefined,
    });
    return notification.save();
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true },
    );
    return { success: true };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const res = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
    return { deleted: res.deletedCount === 1 };
  }

  async countNotifications(userId: string, filter: any = {}) {
    return this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId), ...filter })
      .exec();
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getAllNotifications() {
    return this.notificationModel.find().sort({ createdAt: -1 }).exec();
  }

  async adminDeleteNotification(notificationId: string) {
    const res = await this.notificationModel.deleteOne({ _id: notificationId });
    return { deleted: res.deletedCount === 1 };
  }

  async getNotificationStats() {
    const total = await this.notificationModel.countDocuments();
    const unread = await this.notificationModel.countDocuments({ read: false });
    return { total, unread };
  }

  // Real-time notification stub
  async emitRealtimeNotification(userId: string, payload: any) {
    // In production, emit via WebSocket or gateway
    return { emitted: true, userId, payload };
  }
}
