export type MangaStatus =
  | 'draft'
  | 'in-progress'
  | 'completed'
  | 'published'
  | 'archived';

export type UserRole = 'user' | 'admin' | 'creator';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'past_due'
  | 'unpaid';

export type CreditTransactionType =
  | 'purchase'
  | 'deduction'
  | 'refund'
  | 'bonus'
  | 'admin_adjustment';

export type AIProvider = 'gemini' | 'openai' | 'claude';

export type ImageQuality = 'standard' | 'hd' | 'ultra';
