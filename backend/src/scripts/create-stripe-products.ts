#!/usr/bin/env ts-node

/**
 * Script to create Stripe products for existing plans
 * Usage: npm run create-stripe-products
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PaymentSeederService } from '../modules/payments/payment-seeder.service';

async function createStripeProducts() {
  console.log('🚀 Starting Stripe products creation script...');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the PaymentSeederService
    const paymentSeederService = app.get(PaymentSeederService);

    // Create Stripe products for all existing plans
    await paymentSeederService.createStripeProductsForAllPlans();

    console.log('✅ Stripe products creation script completed successfully');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running Stripe products creation script:', error);
    process.exit(1);
  }
}

// Run the script
createStripeProducts();
