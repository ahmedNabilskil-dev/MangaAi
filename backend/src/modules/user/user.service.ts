import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreditTransaction,
  CreditTransactionDocument,
  User,
  UserDocument,
} from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CreditTransaction.name)
    private creditTransactionModel: Model<CreditTransactionDocument>,
  ) {}

  // User Profile Methods
  async createUser(userData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ emailVerificationToken: token }).exec();
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async updateStripeCustomerId(
    id: string,
    stripeCustomerId: string,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { stripeCustomerId }, { new: true })
      .exec();
  }

  async verifyEmail(token: string): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(
        { emailVerificationToken: token },
        {
          emailVerified: true,
          emailVerificationToken: undefined,
        },
        { new: true },
      )
      .exec();
  }

  async setPasswordResetToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(
        { email },
        {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
        { new: true },
      )
      .exec();
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(
        {
          passwordResetToken: token,
          passwordResetExpires: { $gt: new Date() },
        },
        {
          password: newPassword,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        },
        { new: true },
      )
      .exec();
  }

  // Credit Management Methods
  async getUserCredits(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId).select('credits').exec();
    return user?.credits || 0;
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
  ): Promise<void> {
    const session = await this.userModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Get current user credits
        const user = await this.userModel.findById(userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.credits < amount) {
          throw new Error('Insufficient credits');
        }

        const balanceBefore = user.credits;
        const balanceAfter = balanceBefore - amount;

        // Update user credits
        await this.userModel.findByIdAndUpdate(
          userId,
          { credits: balanceAfter },
          { session },
        );

        // Create transaction record
        await this.creditTransactionModel.create(
          [
            {
              userId,
              amount: -amount,
              type: 'deduction',
              description,
              balanceBefore,
              balanceAfter,
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async addCredits(
    userId: string,
    amount: number,
    description: string,
    reference?: string,
  ): Promise<void> {
    const session = await this.userModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        // Get current user credits
        const user = await this.userModel.findById(userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        const balanceBefore = user.credits;
        const balanceAfter = balanceBefore + amount;

        // Update user credits
        await this.userModel.findByIdAndUpdate(
          userId,
          { credits: balanceAfter },
          { session },
        );

        // Create transaction record
        await this.creditTransactionModel.create(
          [
            {
              userId,
              amount,
              type: 'purchase',
              description,
              reference,
              balanceBefore,
              balanceAfter,
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async getCreditTransactions(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<CreditTransaction[]> {
    return this.creditTransactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
