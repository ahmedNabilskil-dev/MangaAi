#!/usr/bin/env ts-node

/**
 * Script to reset plans and re-seed them with correct structure
 * Usage: npm run reset-plans
 */

import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { PaymentSeederService } from '../modules/payments/payment-seeder.service';
import { Plan, PlanDocument } from '../modules/payments/schemas/payment.schema';

async function resetPlans() {
  console.log('🚀 Starting plan reset and re-seed script...');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the Plan model
    const planModel = app.get<Model<PlanDocument>>(getModelToken(Plan.name));

    // Get the PaymentSeederService
    const paymentSeederService = app.get(PaymentSeederService);

    // Delete all existing plans
    const deleteResult = await planModel.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing plans`);

    // Force re-seed plans by calling the seeder method
    console.log('Re-seeding plans with correct structure...');
    await (paymentSeederService as any).seedPlans();

    console.log('✅ Plan reset and re-seed completed successfully');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running plan reset script:', error);
    process.exit(1);
  }
}

// Run the script
resetPlans();
