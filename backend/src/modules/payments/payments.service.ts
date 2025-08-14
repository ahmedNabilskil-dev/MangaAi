import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { UserService } from '../user/user.service';
import {
  Payment,
  PaymentDocument,
  Plan,
  PlanDocument,
  WebhookEvent,
  WebhookEventDocument,
} from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(WebhookEvent.name)
    private webhookEventModel: Model<WebhookEventDocument>,
  ) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecret) {
      this.stripe = new Stripe(stripeSecret, {
        // Use account's default API version from Stripe dashboard
      });
    }
  }

  // Validate currency code against Stripe's supported currencies
  private validateCurrency(currency: string): boolean {
    const supportedCurrencies = [
      'usd',
      'eur',
      'gbp',
      'jpy',
      'aud',
      'cad',
      'chf',
      'cny',
      'dkk',
      'hkd',
      'inr',
      'krw',
      'mxn',
      'nok',
      'nzd',
      'pln',
      'sek',
      'sgd',
      'thb',
      'try',
      // Add more as needed
    ];
    return supportedCurrencies.includes(currency.toLowerCase());
  }

  // Plan Management (simplified - can create with or without Stripe)
  async createPlan(planData: Partial<Plan>): Promise<Plan> {
    // Validate currency if provided
    if (planData.currency && !this.validateCurrency(planData.currency)) {
      throw new BadRequestException(
        `Unsupported currency: ${planData.currency}`,
      );
    }

    // For now, just create the plan without automatically creating Stripe products
    // This allows for both manual Stripe setup and automatic creation
    const plan = new this.planModel(planData);
    return plan.save();
  }

  // Helper method to create Stripe product and price for existing plan
  async createStripeProductForPlan(planId: string): Promise<Plan> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.stripeProductId && plan.stripePriceId) {
      return plan; // Already has Stripe integration
    }

    // Create Stripe product for this plan
    const stripeProduct = await this.stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        planId: plan.id,
        credits: plan.credits?.toString() || '0',
        bonus: plan.bonus?.toString() || '0',
        monthlyCredits: plan.monthlyCredits?.toString() || '0',
      },
    });

    // Create Stripe price for this plan
    const stripePriceData: Stripe.PriceCreateParams = {
      product: stripeProduct.id,
      unit_amount: plan.priceCents || (plan as any).price || 0, // Handle both priceCents and legacy price field
      currency: plan.currency.toLowerCase(),
      metadata: {
        planId: plan.id,
      },
    };

    // Add recurring configuration for subscription plans
    if (plan.type !== 'one_time') {
      stripePriceData.recurring = {
        interval: plan.type === 'monthly' ? 'month' : 'year',
      };
    }

    const stripePrice = await this.stripe.prices.create(stripePriceData);

    // Update plan with Stripe IDs
    const updatedPlan = await this.planModel.findOneAndUpdate(
      { id: planId },
      {
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
      { new: true },
    );

    return updatedPlan;
  }

  async getPlans(type?: 'one_time' | 'monthly' | 'yearly'): Promise<Plan[]> {
    const filter: any = { isActive: true };
    if (type) {
      filter.type = type;
    }
    return this.planModel.find(filter).sort({ priceCents: 1 }).exec();
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return this.planModel.findOne({ id, isActive: true }).exec();
  }

  // Simplified checkout with concurrency protection
  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl?: string,
    cancelUrl?: string,
  ) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (!plan.stripePriceId) {
      throw new BadRequestException('Plan not properly configured with Stripe');
    }

    // For subscription plans, check for existing active subscriptions
    if (plan.type !== 'one_time') {
      const existingSubscription = await this.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        throw new BadRequestException(
          'User already has an active subscription. Use changeSubscriptionPlan instead.',
        );
      }
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get or create Stripe customer
    const customer = await this.getOrCreateStripeCustomer(user);

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId, // Use Stripe's price ID directly
          quantity: 1,
        },
      ],
      mode: plan.type === 'one_time' ? 'payment' : 'subscription',
      success_url:
        successUrl ||
        `${this.configService.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
      metadata: {
        userId,
        planId,
      },
      // For subscriptions, let Stripe handle trials, proration, etc.
      ...(plan.type !== 'one_time' && {
        subscription_data: {
          metadata: {
            userId,
            planId,
          },
        },
      }),
    };

    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    // Only track the payment initiation - let webhooks handle completion
    const payment = new this.paymentModel({
      userId,
      planId,
      amountCents: plan.priceCents,
      currency: plan.currency,
      type: plan.type === 'one_time' ? 'one_time' : 'subscription',
      status: 'pending',
      stripeSessionId: session.id,
    });
    await payment.save();

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  private async getOrCreateStripeCustomer(user: any): Promise<Stripe.Customer> {
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      try {
        const customer = await this.stripe.customers.retrieve(
          user.stripeCustomerId,
        );

        // Check if customer is deleted (Stripe returns a deleted customer object)
        if ('deleted' in customer && (customer as any).deleted) {
          this.logger.warn(
            `Stripe customer ${user.stripeCustomerId} was deleted, creating new one`,
          );
        } else {
          return customer as Stripe.Customer;
        }
      } catch (error) {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) {
          this.logger.warn(
            `Stripe customer ${user.stripeCustomerId} not found, creating new one`,
          );
        } else {
          this.logger.error('Error retrieving Stripe customer:', error);
          throw error; // Re-throw non-404 errors
        }
      }
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name || user.username,
      metadata: {
        userId: user._id.toString(),
      },
    });

    // Save customer ID to user
    await this.userService.updateStripeCustomerId(user._id, customer.id);

    return customer;
  }

  // Get user's subscription directly from Stripe
  async getUserSubscription(
    userId: string,
  ): Promise<Stripe.Subscription | null> {
    const user = await this.userService.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return null;
    }

    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      return subscriptions.data[0] || null;
    } catch (error) {
      this.logger.error('Error fetching subscription:', error);
      return null;
    }
  }

  // Change subscription - let Stripe handle proration
  async changeSubscriptionPlan(userId: string, newPlanId: string) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.getPlanById(newPlanId);
    if (!newPlan || newPlan.type === 'one_time') {
      throw new BadRequestException('Invalid subscription plan');
    }

    // Update subscription with new price - Stripe handles proration automatically
    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPlan.stripePriceId,
          },
        ],
        proration_behavior: 'always_invoice', // or 'create_prorations'
        metadata: {
          ...subscription.metadata,
          planId: newPlanId,
        },
      },
    );

    return updatedSubscription;
  }

  // Cancel subscription
  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (cancelAtPeriodEnd) {
      // Cancel at period end - user keeps access until end of billing period
      return await this.stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      return await this.stripe.subscriptions.cancel(subscription.id);
    }
  }

  // Create customer portal session for self-service
  async createCustomerPortalSession(userId: string, returnUrl: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const user = await this.userService.findById(userId);
    if (!user || !user.stripeCustomerId) {
      throw new NotFoundException('User not found or no payment methods');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async verifyPayment(sessionId: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      this.logger.log('Verifying payment for session:', sessionId);

      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'subscription'],
      });

      const payment = await this.paymentModel.findOne({
        stripeSessionId: sessionId,
      });

      if (!payment) {
        this.logger.error('Payment not found for session:', sessionId);
        throw new NotFoundException('Payment not found');
      }

      if (session.payment_status === 'paid') {
        this.logger.log('Payment confirmed as paid');
        return {
          success: true,
          paymentStatus: 'completed',
          userId: payment.userId,
          type: payment.type,
        };
      }

      return {
        success: false,
        paymentStatus: session.payment_status,
        userId: payment.userId,
      };
    } catch (error) {
      this.logger.error('Error in verifyPayment:', error);
      throw new BadRequestException('Failed to verify payment');
    }
  }

  // Webhook handling with idempotency
  async handleWebhook(payload: any, signature: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );

      // Check if we've already processed this event (idempotency)
      const existingEvent = await this.webhookEventModel.findOne({
        stripeEventId: event.id,
      });

      if (existingEvent) {
        this.logger.log(
          `Webhook event ${event.id} already processed, skipping`,
        );
        return { received: true, alreadyProcessed: true };
      }

      // Mark event as processing (atomic operation)
      try {
        await this.webhookEventModel.create({
          stripeEventId: event.id,
          eventType: event.type,
          processedAt: new Date(),
          metadata: { objectId: (event.data.object as any).id },
        });
      } catch (error) {
        // If creation fails due to duplicate key, another instance is processing
        if (error.code === 11000) {
          this.logger.log(
            `Webhook event ${event.id} being processed by another instance`,
          );
          return { received: true, alreadyProcessed: true };
        }
        throw error;
      }

      // Process the event
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { userId, planId } = session.metadata || {};

    if (!userId || !planId) {
      this.logger.error('Missing metadata in checkout session', {
        sessionId: session.id,
      });
      return;
    }

    // Check if we've already processed this session (idempotency)
    const existingPayment = await this.paymentModel.findOne({
      stripeSessionId: session.id,
      creditsGranted: true,
    });

    if (existingPayment) {
      this.logger.log(
        `Credits already granted for session ${session.id}, skipping`,
      );
      return;
    }

    // Update payment record
    const payment = await this.paymentModel.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        status: 'completed',
        completedAt: new Date(),
        stripePaymentIntentId: session.payment_intent?.toString(),
      },
      { new: true },
    );

    if (!payment) {
      this.logger.error('Payment record not found for session', {
        sessionId: session.id,
      });
      return;
    }

    const plan = await this.getPlanById(planId);
    if (!plan) {
      this.logger.error('Plan not found for checkout session', {
        planId,
        sessionId: session.id,
      });
      return;
    }

    // For one-time payments, add credits immediately
    if (session.mode === 'payment') {
      const totalCredits = (plan.credits || 0) + (plan.bonus || 0);
      if (totalCredits > 0) {
        await this.userService.addCredits(
          userId,
          totalCredits,
          `Purchase: ${plan.name}`,
          session.id,
        );

        // Mark credits as granted (atomic operation)
        await this.paymentModel.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            creditsAwarded: totalCredits,
            creditsGranted: true,
          },
        );
      }
    } else if (session.mode === 'subscription') {
      // For subscriptions, handle initial signup credits if applicable
      const initialCredits = plan.credits || 0;
      if (initialCredits > 0) {
        await this.userService.addCredits(
          userId,
          initialCredits,
          `Initial credits: ${plan.name}`,
          session.id,
        );

        // Mark initial credits as granted
        await this.paymentModel.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            creditsAwarded: initialCredits,
            creditsGranted: true,
          },
        );
      }
      // Monthly credits will be handled in invoice.payment_succeeded
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;

    const subscription = await this.stripe.subscriptions.retrieve(
      (invoice as any).subscription.toString(),
    );

    const userId = subscription.metadata.userId;
    const planId = subscription.metadata.planId;

    if (!userId || !planId) {
      this.logger.error('Missing metadata in subscription', {
        subscriptionId: subscription.id,
      });
      return;
    }

    // Check if we've already processed this invoice (idempotency)
    const existingPayment = await this.paymentModel.findOne({
      stripeInvoiceId: invoice.id,
      creditsGranted: true,
    });

    if (existingPayment) {
      this.logger.log(
        `Credits already granted for invoice ${invoice.id}, skipping`,
      );
      return;
    }

    const plan = await this.getPlanById(planId);
    if (plan && plan.monthlyCredits && plan.monthlyCredits > 0) {
      await this.userService.addCredits(
        userId,
        plan.monthlyCredits,
        `Monthly credits: ${plan.name}`,
        subscription.id,
      );

      // Create or update payment record for this invoice
      await this.paymentModel.findOneAndUpdate(
        { stripeInvoiceId: invoice.id },
        {
          userId,
          planId,
          amountCents: invoice.amount_paid || 0,
          currency: invoice.currency || 'usd',
          type: 'subscription',
          status: 'completed',
          stripeInvoiceId: invoice.id,
          creditsAwarded: plan.monthlyCredits,
          creditsGranted: true,
          completedAt: new Date(),
        },
        { upsert: true, new: true },
      );
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // You can track subscription changes here if needed
    // But the source of truth is always Stripe
    this.logger.log('Subscription updated:', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Handle subscription cancellation cleanup if needed
    this.logger.log('Subscription deleted:', subscription.id);
  }

  // Get payment history (simplified)
  async getPaymentHistory(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Payment[]> {
    return this.paymentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  // Check if user can subscribe to a plan
  async canSubscribeToPlan(
    userId: string,
    planId: string,
  ): Promise<{
    canSubscribe: boolean;
    reason?: string;
    currentSubscription?: Stripe.Subscription;
  }> {
    const currentSubscription = await this.getUserSubscription(userId);
    const plan = await this.getPlanById(planId);

    if (!plan) {
      return { canSubscribe: false, reason: 'Plan not found' };
    }

    // One-time plans can always be purchased
    if (plan.type === 'one_time') {
      return { canSubscribe: true };
    }

    // If user has active subscription, they need to change it instead
    if (currentSubscription && currentSubscription.status === 'active') {
      if (currentSubscription.metadata.planId === planId) {
        return {
          canSubscribe: false,
          reason: 'Already subscribed to this plan',
          currentSubscription,
        };
      }
      return {
        canSubscribe: false,
        reason: 'Must change existing subscription instead of creating new one',
        currentSubscription,
      };
    }

    return { canSubscribe: true };
  }
}
