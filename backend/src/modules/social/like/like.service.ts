import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLikeDto } from './dto/like.dto';
import { Like, LikeDocument } from './like.schema';

@Injectable()
export class LikeService {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async like(userId: string, dto: CreateLikeDto): Promise<Like> {
    // Support reaction type
    return this.likeModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(dto.targetId),
        targetType: dto.targetType,
      },
      { reaction: dto.reaction || 'like' },
      { upsert: true, new: true },
    );
  }

  async unlike(userId: string, dto: CreateLikeDto): Promise<void> {
    await this.likeModel.deleteOne({
      userId: new Types.ObjectId(userId),
      ...dto,
    });
  }

  async getLikes(targetType: string, targetId: string) {
    return this.likeModel
      .find({ targetType, targetId: new Types.ObjectId(targetId) })
      .exec();
  }

  async countLikes(targetType: string, targetId: string): Promise<number> {
    return this.likeModel
      .countDocuments({ targetType, targetId: new Types.ObjectId(targetId) })
      .exec();
  }

  async getLikesByUser(userId: string) {
    return this.likeModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async countLikesByReaction(targetType: string, targetId: string) {
    const pipeline = [
      { $match: { targetType, targetId: new Types.ObjectId(targetId) } },
      { $group: { _id: '$reaction', count: { $sum: 1 } } },
    ];
    const results = await this.likeModel.aggregate(pipeline).exec();
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async getAllLikes() {
    return this.likeModel.find().sort({ createdAt: -1 }).exec();
  }

  async adminDeleteLike(likeId: string) {
    const res = await this.likeModel.deleteOne({ _id: likeId });
    return { deleted: res.deletedCount === 1 };
  }

  async getLikeStats() {
    const total = await this.likeModel.countDocuments();
    const byReaction = await this.likeModel.aggregate([
      { $group: { _id: '$reaction', count: { $sum: 1 } } },
    ]);
    const reactionCounts: Record<string, number> = {};
    for (const r of byReaction) {
      reactionCounts[r._id] = r.count;
    }
    return { total, byReaction: reactionCounts };
  }
}
