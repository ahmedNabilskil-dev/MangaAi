import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export type CreditTransactionDocument = CreditTransaction & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string; // Optional for OAuth users

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ default: 0 })
  credits: number;

  @Prop({
    type: String,
    enum: ['user', 'admin', 'creator'],
    default: 'user',
  })
  role: 'user' | 'admin' | 'creator';

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  // OAuth providers
  @Prop()
  googleId?: string;

  @Prop()
  facebookId?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  // Refresh token for JWT
  @Prop()
  refreshToken?: string;

  // Stripe customer ID for payments
  @Prop()
  stripeCustomerId?: string;
}

@Schema({ timestamps: true })
export class CreditTransaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: ['purchase', 'deduction', 'refund', 'bonus', 'admin_adjustment'],
    required: true,
  })
  type: 'purchase' | 'deduction' | 'refund' | 'bonus' | 'admin_adjustment';

  @Prop({ required: true })
  description: string;

  @Prop()
  reference?: string; // For tracking related transactions (e.g., payment ID)

  @Prop({ default: 0 })
  balanceBefore: number;

  @Prop({ default: 0 })
  balanceAfter: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const CreditTransactionSchema =
  SchemaFactory.createForClass(CreditTransaction);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
CreditTransactionSchema.index({ userId: 1 });
CreditTransactionSchema.index({ createdAt: -1 });
CreditTransactionSchema.index({ type: 1 });
