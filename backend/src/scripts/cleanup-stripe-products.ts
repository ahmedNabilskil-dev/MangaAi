#!/usr/bin/env ts-node

/**
 * Script to clean up duplicate Stripe products and prices
 * Usage: npm run cleanup-stripe-products
 */

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import Stripe from 'stripe';
import { AppModule } from '../app.module';
import { PaymentsService } from '../modules/payments/payments.service';

async function cleanupStripeProducts() {
  console.log('🧹 Starting Stripe products cleanup script...');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get services
    const paymentsService = app.get(PaymentsService);
    const configService = app.get(ConfigService);

    // Initialize Stripe
    const stripeSecret = configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeSecret, {});

    // Get all current plans from database
    const currentPlans = await paymentsService.getPlans();
    const activePlanIds = new Set(currentPlans.map((plan) => plan.id));
    const activeStripeProductIds = new Set(
      currentPlans
        .filter((plan) => plan.stripeProductId)
        .map((plan) => plan.stripeProductId),
    );
    const activeStripePriceIds = new Set(
      currentPlans
        .filter((plan) => plan.stripePriceId)
        .map((plan) => plan.stripePriceId),
    );

    console.log(`Found ${currentPlans.length} active plans in database`);
    console.log(
      `Active Stripe Product IDs: ${Array.from(activeStripeProductIds).length}`,
    );
    console.log(
      `Active Stripe Price IDs: ${Array.from(activeStripePriceIds).length}`,
    );

    // Get all Stripe products (only active ones)
    console.log('\n📦 Fetching all Stripe products...');
    const allProducts = await stripe.products.list({
      limit: 100,
      active: true, // Only get active products
    });
    console.log(`Found ${allProducts.data.length} active Stripe products`);

    // Get all Stripe prices (only active ones)
    console.log('\n💰 Fetching all Stripe prices...');
    const allPrices = await stripe.prices.list({
      limit: 100,
      active: true, // Only get active prices
    });
    console.log(`Found ${allPrices.data.length} active Stripe prices`);

    // Find duplicate and orphaned products
    const duplicateProducts = [];
    const orphanedProducts = [];
    const planProductMap = new Map();

    for (const product of allProducts.data) {
      const planId = product.metadata?.planId;

      if (!planId) {
        orphanedProducts.push(product);
        continue;
      }

      if (!activePlanIds.has(planId)) {
        orphanedProducts.push(product);
        continue;
      }

      if (!activeStripeProductIds.has(product.id)) {
        duplicateProducts.push(product);
        continue;
      }

      // Track products by plan ID to find duplicates
      if (planProductMap.has(planId)) {
        duplicateProducts.push(product);
      } else {
        planProductMap.set(planId, product);
      }
    }

    // Find duplicate and orphaned prices
    const duplicatePrices = [];
    const orphanedPrices = [];
    const planPriceMap = new Map();

    for (const price of allPrices.data) {
      const planId = price.metadata?.planId;

      if (!planId) {
        orphanedPrices.push(price);
        continue;
      }

      if (!activePlanIds.has(planId)) {
        orphanedPrices.push(price);
        continue;
      }

      if (!activeStripePriceIds.has(price.id)) {
        duplicatePrices.push(price);
        continue;
      }

      // Track prices by plan ID to find duplicates
      if (planPriceMap.has(planId)) {
        duplicatePrices.push(price);
      } else {
        planPriceMap.set(planId, price);
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`• Duplicate products: ${duplicateProducts.length}`);
    console.log(`• Orphaned products: ${orphanedProducts.length}`);
    console.log(`• Duplicate prices: ${duplicatePrices.length}`);
    console.log(`• Orphaned prices: ${orphanedPrices.length}`);

    if (
      duplicateProducts.length === 0 &&
      orphanedProducts.length === 0 &&
      duplicatePrices.length === 0 &&
      orphanedPrices.length === 0
    ) {
      console.log(
        '\n✅ No cleanup needed - all Stripe products and prices are properly organized!',
      );
      await app.close();
      process.exit(0);
    }

    // List items to be deleted
    console.log('\n🗑️  Items to be deleted:');

    if (duplicateProducts.length > 0) {
      console.log('\nDuplicate Products:');
      duplicateProducts.forEach((product) => {
        console.log(
          `  • ${product.name} (${product.id}) - Plan: ${product.metadata?.planId}`,
        );
      });
    }

    if (orphanedProducts.length > 0) {
      console.log('\nOrphaned Products:');
      orphanedProducts.forEach((product) => {
        console.log(
          `  • ${product.name} (${product.id}) - Plan: ${product.metadata?.planId || 'N/A'}`,
        );
      });
    }

    if (duplicatePrices.length > 0) {
      console.log('\nDuplicate Prices:');
      duplicatePrices.forEach((price) => {
        console.log(
          `  • ${price.id} - ${price.unit_amount ? price.unit_amount / 100 : 'N/A'} ${price.currency} - Plan: ${price.metadata?.planId}`,
        );
      });
    }

    if (orphanedPrices.length > 0) {
      console.log('\nOrphaned Prices:');
      orphanedPrices.forEach((price) => {
        console.log(
          `  • ${price.id} - ${price.unit_amount ? price.unit_amount / 100 : 'N/A'} ${price.currency} - Plan: ${price.metadata?.planId || 'N/A'}`,
        );
      });
    }

    // Ask for confirmation (in a real scenario, you might want to add a command line flag)
    console.log(
      '\n⚠️  WARNING: This will permanently delete the above Stripe products and prices!',
    );
    console.log(
      '💡 To proceed with deletion, run: npm run cleanup-stripe-products -- --confirm',
    );

    // Check if --confirm flag is passed
    const shouldDelete = process.argv.includes('--confirm');

    if (!shouldDelete) {
      console.log(
        '\n🔍 Dry run completed. Use --confirm flag to actually delete items.',
      );
      await app.close();
      process.exit(0);
    }

    console.log('\n🗑️  Starting deletion process...');

    // Delete duplicate and orphaned prices first (prices depend on products)
    const allPricesToDelete = [...duplicatePrices, ...orphanedPrices];
    for (const price of allPricesToDelete) {
      try {
        // Note: Prices cannot be deleted, only archived/deactivated
        await stripe.prices.update(price.id, { active: false });
        console.log(`✓ Deactivated price: ${price.id}`);
      } catch (error) {
        console.error(
          `✗ Failed to deactivate price ${price.id}:`,
          error.message,
        );
      }
    }

    // Delete duplicate and orphaned products
    const allProductsToDelete = [...duplicateProducts, ...orphanedProducts];
    for (const product of allProductsToDelete) {
      try {
        await stripe.products.update(product.id, { active: false });
        console.log(`✓ Deactivated product: ${product.name} (${product.id})`);
      } catch (error) {
        console.error(
          `✗ Failed to deactivate product ${product.id}:`,
          error.message,
        );
      }
    }

    console.log('\n✅ Stripe cleanup completed successfully!');
    console.log(
      '📝 Note: Stripe products and prices are deactivated (not deleted) to maintain payment history.',
    );

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running Stripe cleanup script:', error);
    process.exit(1);
  }
}

// Run the script
cleanupStripeProducts();
