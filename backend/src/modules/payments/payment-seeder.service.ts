import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentSeederService implements OnModuleInit {
  constructor(private paymentsService: PaymentsService) {}

  async onModuleInit() {
    await this.seedPlans();
  }

  /**
   * Manually create Stripe products for all existing plans
   * This can be called independently if needed
   */
  async createStripeProductsForAllPlans(): Promise<void> {
    console.log('Creating Stripe products for all existing plans...');

    const allPlans = await this.paymentsService.getPlans();
    const plansWithoutStripe = allPlans.filter(
      (plan) => !plan.stripeProductId || !plan.stripePriceId,
    );

    if (plansWithoutStripe.length === 0) {
      console.log('All plans already have Stripe products');
      return;
    }

    console.log(
      `Found ${plansWithoutStripe.length} plans without Stripe products`,
    );

    for (const plan of plansWithoutStripe) {
      try {
        await this.paymentsService.createStripeProductForPlan(plan.id);
        console.log(`✓ Created Stripe product for plan: ${plan.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to create Stripe product for plan ${plan.name}:`,
          error,
        );
      }
    }

    console.log('Stripe products creation completed');
  }

  private async seedPlans() {
    const existingPlans = await this.paymentsService.getPlans();
    if (existingPlans.length > 0) {
      console.log(
        'Plans already exist, checking for missing Stripe products...',
      );
      await this.createMissingStripeProducts(existingPlans);
      return;
    }

    console.log('Seeding payment plans...');

    const plans = [
      // One-time Credit Packages
      {
        id: 'starter',
        name: 'Starter Pack',
        description: '100 credits + 10 bonus credits for manga creation',
        priceCents: 999, // $9.99 in cents
        currency: 'USD',
        type: 'one_time' as const,
        credits: 100,
        bonus: 10,
        monthlyCredits: 0,
        isPopular: false,
        iconName: 'coins',
        color: 'from-gray-400 to-gray-500',
        features: ['100 Credits', '10 Bonus Credits', 'Basic Support'],
      },
      {
        id: 'creator',
        name: 'Creator Pack',
        description: '250 credits + 50 bonus credits for active creators',
        priceCents: 1999, // $19.99 in cents
        currency: 'USD',
        type: 'one_time' as const,
        credits: 250,
        bonus: 50,
        monthlyCredits: 0,
        isPopular: true,
        iconName: 'zap',
        color: 'from-blue-400 to-blue-500',
        features: [
          '250 Credits',
          '50 Bonus Credits',
          'Priority Support',
          'Advanced Features',
        ],
      },
      {
        id: 'artist',
        name: 'Artist Pack',
        description: '500 credits + 150 bonus credits for professional artists',
        priceCents: 3999, // $39.99 in cents
        currency: 'USD',
        type: 'one_time' as const,
        credits: 500,
        bonus: 150,
        monthlyCredits: 0,
        isPopular: false,
        iconName: 'star',
        color: 'from-purple-400 to-purple-500',
        features: [
          '500 Credits',
          '150 Bonus Credits',
          'Premium Support',
          'Commercial License',
        ],
      },
      {
        id: 'studio',
        name: 'Studio Pack',
        description: '1000 credits + 400 bonus credits for studios',
        priceCents: 7999, // $79.99 in cents
        currency: 'USD',
        type: 'one_time' as const,
        credits: 1000,
        bonus: 400,
        monthlyCredits: 0,
        isPopular: false,
        iconName: 'crown',
        color: 'from-yellow-400 to-yellow-500',
        features: [
          '1000 Credits',
          '400 Bonus Credits',
          'Team Support',
          'Commercial License',
          'API Access',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise Pack',
        description: '2500 credits + 1000 bonus credits for enterprises',
        priceCents: 14999, // $149.99 in cents
        currency: 'USD',
        type: 'one_time' as const,
        credits: 2500,
        bonus: 1000,
        monthlyCredits: 0,
        isPopular: false,
        iconName: 'crown',
        color: 'from-red-400 to-red-500',
        features: [
          '2500 Credits',
          '1000 Bonus Credits',
          'Enterprise Support',
          'White Label',
          'Custom Integration',
        ],
      },

      // Subscription Plans
      {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        description: '300 credits every month for regular creators',
        priceCents: 1999, // $19.99 in cents
        currency: 'USD',
        type: 'monthly' as const,
        credits: 0,
        bonus: 0,
        monthlyCredits: 300,
        isPopular: true,
        iconName: 'zap',
        color: 'from-green-400 to-green-500',
        features: [
          '300 Monthly Credits',
          'Priority Support',
          'Advanced Features',
          'Cancel Anytime',
        ],
      },
      {
        id: 'pro_yearly',
        name: 'Pro Yearly',
        description: '300 credits every month, billed annually (2 months free)',
        priceCents: 19999, // $199.99 in cents (normally $239.88)
        currency: 'USD',
        type: 'yearly' as const,
        credits: 0,
        bonus: 0,
        monthlyCredits: 300,
        isPopular: false,
        iconName: 'star',
        color: 'from-green-400 to-green-600',
        features: [
          '300 Monthly Credits',
          '2 Months Free',
          'Priority Support',
          'Advanced Features',
        ],
      },
      {
        id: 'business_monthly',
        name: 'Business Monthly',
        description: '1000 credits every month for businesses',
        priceCents: 4999, // $49.99 in cents
        currency: 'USD',
        type: 'monthly' as const,
        credits: 0,
        bonus: 0,
        monthlyCredits: 1000,
        isPopular: false,
        iconName: 'crown',
        color: 'from-purple-400 to-purple-500',
        features: [
          '1000 Monthly Credits',
          'Premium Support',
          'Commercial License',
          'Team Management',
        ],
      },
      {
        id: 'business_yearly',
        name: 'Business Yearly',
        description:
          '1000 credits every month, billed annually (2 months free)',
        priceCents: 49999, // $499.99 in cents (normally $599.88)
        currency: 'USD',
        type: 'yearly' as const,
        credits: 0,
        bonus: 0,
        monthlyCredits: 1000,
        isPopular: false,
        iconName: 'crown',
        color: 'from-purple-400 to-purple-600',
        features: [
          '1000 Monthly Credits',
          '2 Months Free',
          'Premium Support',
          'Commercial License',
          'API Access',
        ],
      },
    ];

    const createdPlans = [];

    for (const plan of plans) {
      try {
        const createdPlan = await this.paymentsService.createPlan(plan);
        createdPlans.push(createdPlan);
        console.log(`✓ Created plan: ${plan.name}`);
      } catch (error) {
        console.error(`✗ Failed to create plan ${plan.name}:`, error);
      }
    }

    console.log('Payment plans seeding completed');

    // Now create Stripe products for all created plans
    await this.createStripeProductsForPlans(createdPlans);
  }

  private async createStripeProductsForPlans(plans: any[]) {
    console.log('Creating Stripe products for plans...');

    for (const plan of plans) {
      try {
        await this.paymentsService.createStripeProductForPlan(plan.id);
        console.log(`✓ Created Stripe product for plan: ${plan.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to create Stripe product for plan ${plan.name}:`,
          error,
        );
      }
    }

    console.log('Stripe products creation completed');
  }

  private async createMissingStripeProducts(existingPlans: any[]) {
    const plansWithoutStripe = existingPlans.filter(
      (plan) => !plan.stripeProductId || !plan.stripePriceId,
    );

    if (plansWithoutStripe.length === 0) {
      console.log('All plans already have Stripe products');
      return;
    }

    console.log(
      `Found ${plansWithoutStripe.length} plans without Stripe products, creating them...`,
    );

    for (const plan of plansWithoutStripe) {
      try {
        await this.paymentsService.createStripeProductForPlan(plan.id);
        console.log(`✓ Created Stripe product for existing plan: ${plan.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to create Stripe product for existing plan ${plan.name}:`,
          error,
        );
      }
    }

    console.log('Missing Stripe products creation completed');
  }
}
