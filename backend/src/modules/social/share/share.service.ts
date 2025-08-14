import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateShareDto } from './dto/share.dto';
import { Share, ShareDocument, ShareTargetType } from './share.schema';

@Injectable()
export class ShareService {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<ShareDocument>,
  ) {}

  async createShare(userId: string, dto: CreateShareDto): Promise<Share> {
    const share = new this.shareModel({
      userId: new Types.ObjectId(userId),
      ...dto,
    });
    return share.save();
  }

  async getSharesByTarget(targetType: ShareTargetType, targetId: string) {
    return this.shareModel
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
      })
      .populate('userId', 'name email')
      .exec();
  }

  async getSharesByUser(userId: string) {
    return this.shareModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }

  async unshare(
    userId: string,
    targetType: ShareTargetType,
    targetId: string,
  ): Promise<{ deleted: boolean }> {
    const res = await this.shareModel.deleteOne({
      userId: new Types.ObjectId(userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
    });
    return { deleted: res.deletedCount === 1 };
  }

  async countShares(
    targetType: ShareTargetType,
    targetId: string,
  ): Promise<number> {
    return this.shareModel
      .countDocuments({ targetType, targetId: new Types.ObjectId(targetId) })
      .exec();
  }

  async getSharesByType(targetType: ShareTargetType) {
    return this.shareModel.find({ targetType }).exec();
  }

  async getAllShares() {
    return this.shareModel.find().sort({ createdAt: -1 }).exec();
  }

  async adminDeleteShare(shareId: string) {
    const res = await this.shareModel.deleteOne({ _id: shareId });
    return { deleted: res.deletedCount === 1 };
  }

  async getShareStats() {
    const total = await this.shareModel.countDocuments();
    const byType = await this.shareModel.aggregate([
      { $group: { _id: '$targetType', count: { $sum: 1 } } },
    ]);
    const typeCounts: Record<string, number> = {};
    for (const t of byType) {
      typeCounts[t._id] = t.count;
    }
    return { total, byType: typeCounts };
  }
}
