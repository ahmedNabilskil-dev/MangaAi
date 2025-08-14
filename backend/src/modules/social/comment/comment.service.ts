import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment(userId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = new this.commentModel({
      userId: new Types.ObjectId(userId),
      ...dto,
    });
    return comment.save();
  }

  async getCommentsByPost(postId: string) {
    return this.commentModel
      .find({ postId: new Types.ObjectId(postId) })
      .exec();
  }

  async updateComment(
    commentId: string,
    userId: string,
    updates: Partial<Comment>,
  ): Promise<Comment | null> {
    // Only allow certain fields to be updated
    const allowed = ['content', 'attachments', 'visibility'];
    const safeUpdates: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }
    return this.commentModel
      .findOneAndUpdate({ _id: commentId, userId: userId }, safeUpdates, {
        new: true,
      })
      .exec();
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<{ deleted: boolean }> {
    const res = await this.commentModel.deleteOne({
      _id: commentId,
      userId: userId,
    });
    return { deleted: res.deletedCount === 1 };
  }

  async countComments(filter: any = {}): Promise<number> {
    return this.commentModel.countDocuments(filter).exec();
  }

  async getCommentsByUser(userId: string) {
    return this.commentModel.find({ userId: userId }).exec();
  }

  async getCommentById(commentId: string): Promise<Comment | null> {
    return this.commentModel.findById(commentId).exec();
  }

  async searchComments(q: string, limit = 20, offset = 0) {
    return this.commentModel
      .find({ content: { $regex: q, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async filterComments(filter: any = {}, limit = 20, offset = 0) {
    return this.commentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async reportComment(commentId: string, userId: string, reason: string) {
    return { reported: true, commentId, userId, reason };
  }

  async hideComment(commentId: string, userId: string) {
    return { hidden: true, commentId, userId };
  }

  async blockUserComments(blockedUserId: string, userId: string) {
    return { blocked: true, blockedUserId, userId };
  }

  async getAllComments() {
    return this.commentModel.find().sort({ createdAt: -1 }).exec();
  }

  async adminDeleteComment(commentId: string) {
    const res = await this.commentModel.deleteOne({ _id: commentId });
    return { deleted: res.deletedCount === 1 };
  }

  async getCommentStats() {
    const total = await this.commentModel.countDocuments();
    const publicCount = await this.commentModel.countDocuments({
      visibility: 'public',
    });
    const privateCount = await this.commentModel.countDocuments({
      visibility: 'private',
    });
    return { total, public: publicCount, private: privateCount };
  }

  async getCommentsByHashtag(hashtag: string, limit = 20, offset = 0) {
    return this.commentModel
      .find({
        content: { $regex: `#${hashtag}(\\s|$)`, $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getCommentsByMention(username: string, limit = 20, offset = 0) {
    return this.commentModel
      .find({
        content: { $regex: `@${username}(\\s|$)`, $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
