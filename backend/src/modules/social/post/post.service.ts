import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/post.dto';
import { Post, PostDocument } from './post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    const post = new this.postModel({
      userId: new Types.ObjectId(userId),
      ...dto,
    });
    return post.save();
  }

  async getPosts(limit = 20, offset = 0) {
    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getUserPosts(userId: string) {
    return this.postModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async updatePost(
    postId: string,
    userId: string,
    updates: Partial<Post>,
  ): Promise<Post | null> {
    // Only allow certain fields to be updated
    const allowed = [
      'content',
      'images',
      'targetId',
      'targetType',
      'visibility',
    ];
    const safeUpdates: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }
    return this.postModel
      .findOneAndUpdate({ _id: postId, userId: userId }, safeUpdates, {
        new: true,
      })
      .exec();
  }

  async deletePost(
    postId: string,
    userId: string,
  ): Promise<{ deleted: boolean }> {
    const res = await this.postModel.deleteOne({ _id: postId, userId: userId });
    return { deleted: res.deletedCount === 1 };
  }

  async countPosts(filter: any = {}): Promise<number> {
    return this.postModel.countDocuments(filter).exec();
  }

  async getPostById(postId: string): Promise<Post | null> {
    return this.postModel.findById(postId).exec();
  }

  async searchPosts(q: string, limit = 20, offset = 0) {
    return this.postModel
      .find({ content: { $regex: q, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async filterPosts(filter: any = {}, limit = 20, offset = 0) {
    return this.postModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async reportPost(postId: string, userId: string, reason: string) {
    // This is a stub. In production, you would store reports in a separate collection.
    return { reported: true, postId, userId, reason };
  }

  async hidePost(postId: string, userId: string) {
    // This is a stub. In production, you would store hidden posts per user.
    return { hidden: true, postId, userId };
  }

  async blockUserPosts(blockedUserId: string, userId: string) {
    // This is a stub. In production, you would store blocked users per user.
    return { blocked: true, blockedUserId, userId };
  }

  async getAllPosts() {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  async adminDeletePost(postId: string) {
    const res = await this.postModel.deleteOne({ _id: postId });
    return { deleted: res.deletedCount === 1 };
  }

  async getPostStats() {
    const total = await this.postModel.countDocuments();
    const publicCount = await this.postModel.countDocuments({
      visibility: 'public',
    });
    const privateCount = await this.postModel.countDocuments({
      visibility: 'private',
    });
    return { total, public: publicCount, private: privateCount };
  }

  async getPostsByHashtag(hashtag: string, limit = 20, offset = 0) {
    return this.postModel
      .find({ content: { $regex: `#${hashtag}(\s|$)`, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getPostsByMention(username: string, limit = 20, offset = 0) {
    return this.postModel
      .find({ content: { $regex: `@${username}(\s|$)`, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
