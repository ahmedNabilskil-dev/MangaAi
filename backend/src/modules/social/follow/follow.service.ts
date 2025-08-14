import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFollowDto } from './dto/follow.dto';
import { Follow, FollowDocument } from './follow.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  async follow(followerId: string, dto: CreateFollowDto): Promise<Follow> {
    return this.followModel.findOneAndUpdate(
      {
        followerId: new Types.ObjectId(followerId),
        followingId: new Types.ObjectId(dto.followingId),
      },
      {},
      { upsert: true, new: true },
    );
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.followModel.deleteOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
  }

  async getMutualFollowers(userIdA: string, userIdB: string) {
    const followersA = await this.getFollowers(userIdA);
    const followersB = await this.getFollowers(userIdB);
    const setB = new Set(followersB.map((f) => f.followerId.toString()));
    return followersA.filter((f) => setB.has(f.followerId.toString()));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
    return !!follow;
  }

  async getFollowers(userId: string, limit = 20, offset = 0) {
    return this.followModel
      .find({ followingId: new Types.ObjectId(userId) })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getFollowing(userId: string, limit = 20, offset = 0) {
    return this.followModel
      .find({ followerId: new Types.ObjectId(userId) })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async blockUser(followerId: string, blockedUserId: string) {
    // This is a stub. In production, you would store blocked users per user.
    return { blocked: true, blockedUserId, followerId };
  }

  async unblockUser(followerId: string, blockedUserId: string) {
    return { unblocked: true, blockedUserId, followerId };
  }

  async reportUser(reporterId: string, reportedUserId: string, reason: string) {
    return { reported: true, reportedUserId, reporterId, reason };
  }

  async getAllFollows() {
    return this.followModel.find().sort({ createdAt: -1 }).exec();
  }

  async adminDeleteFollow(followId: string) {
    const res = await this.followModel.deleteOne({ _id: followId });
    return { deleted: res.deletedCount === 1 };
  }

  async getFollowStats() {
    const total = await this.followModel.countDocuments();
    return { total };
  }
}
