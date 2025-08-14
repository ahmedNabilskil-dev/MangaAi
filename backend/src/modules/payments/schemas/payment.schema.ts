import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;
export type PlanDocument = Plan & Document;
export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  priceCents: number; // Price in cents for Stripe's unit_amount (e.g., $10.00 = 1000 cents)

  @Prop({ required: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['one_time', 'monthly', 'yearly'],
    required: true,
  })
  type: 'one_time' | 'monthly' | 'yearly';

  // For one-time purchases
  @Prop({ default: 0 })
  credits: number;

  @Prop({ default: 0 })
  bonus: number;

  // For subscriptions
  @Prop({ default: 0 })
  monthlyCredits: number;

  // REQUIRED: Stripe product and price IDs (populated automatically)
  @Prop()
  stripeProductId?: string;

  @Prop()
  stripePriceId?: string; // This is the key - use Stripe's price directly

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop()
  features?: string[];

  @Prop()
  iconName?: string;

  @Prop()
  color?: string;
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  amountCents: number; // Amount in cents to match Stripe's unit_amount

  @Prop({ required: true })
  currency: string;

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

  @Prop({
    type: String,
    enum: ['one_time', 'subscription'],
    required: true,
  })
  type: 'one_time' | 'subscription';

  @Prop()
  stripeSessionId?: string;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeInvoiceId?: string; // For subscription invoice tracking

  @Prop()
  creditsAwarded?: number;

  @Prop({ default: false })
  creditsGranted: boolean; // Boolean flag for easier idempotency checks

  @Prop()
  completedAt?: Date;
}

// Webhook event tracking for idempotency
@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ required: true, unique: true })
  stripeEventId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ default: Date.now })
  processedAt: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
export const PaymentSchema = SchemaFactory.createForClass(Payment);
export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

// Add indexes for better performance
PlanSchema.index({ id: 1 });
PlanSchema.index({ type: 1, isActive: 1 });

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ stripeSessionId: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ stripeInvoiceId: 1 });
PaymentSchema.index({ creditsGranted: 1 }); // For idempotency checks
PaymentSchema.index({ createdAt: -1 });

WebhookEventSchema.index({ stripeEventId: 1 }, { unique: true });
WebhookEventSchema.index({ eventType: 1 });
WebhookEventSchema.index({ processedAt: -1 });
