import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiPropertyOptional({
    description:
      'User ID (optional, will use authenticated user if not provided)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ description: 'Success URL' })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Cancel URL' })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Stripe session ID' })
  @IsString()
  sessionId: string;
}

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Plan name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Price in cents' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Plan type',
    enum: ['one_time', 'monthly', 'yearly'],
  })
  @IsEnum(['one_time', 'monthly', 'yearly'])
  type: 'one_time' | 'monthly' | 'yearly';

  @ApiPropertyOptional({ description: 'Credits for one-time purchases' })
  @IsOptional()
  @IsNumber()
  credits?: number;

  @ApiPropertyOptional({ description: 'Bonus credits' })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional({ description: 'Monthly credits for subscriptions' })
  @IsOptional()
  @IsNumber()
  monthlyCredits?: number;

  @ApiPropertyOptional({ description: 'Features list' })
  @IsOptional()
  @IsArray()
  features?: string[];

  @ApiPropertyOptional({ description: 'Is popular plan' })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({ description: 'Icon name' })
  @IsOptional()
  @IsString()
  iconName?: string;

  @ApiPropertyOptional({ description: 'Color theme' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ description: 'Cancel at period end' })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @ApiPropertyOptional({ description: 'New plan ID' })
  @IsOptional()
  @IsString()
  newPlanId?: string;
}

export class WebhookDto {
  @ApiProperty({ description: 'Stripe webhook payload' })
  payload: any;

  @ApiProperty({ description: 'Stripe signature' })
  @IsString()
  signature: string;
}
