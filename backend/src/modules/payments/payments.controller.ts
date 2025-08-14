import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateCheckoutSessionDto,
  CreatePlanDto,
  UpdateSubscriptionDto,
  VerifyPaymentDto,
} from './dto/payments.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Plan Management (Admin only)
  @Post('plans')
  @Roles('admin')
  @ApiOperation({ summary: 'Create payment plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    const plan = await this.paymentsService.createPlan(createPlanDto);
    return {
      success: true,
      data: plan,
    };
  }

  @Post('plans/:id/stripe-integration')
  @Roles('admin')
  @ApiOperation({
    summary: 'Create Stripe product/price for existing plan (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stripe integration created successfully',
  })
  async createStripeIntegration(@Param('id') planId: string) {
    const plan = await this.paymentsService.createStripeProductForPlan(planId);
    return {
      success: true,
      data: plan,
      message: 'Stripe integration created successfully',
    };
  }

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get available payment plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans(@Query('type') type?: 'one_time' | 'monthly' | 'yearly') {
    const plans = await this.paymentsService.getPlans(type);
    return {
      success: true,
      data: plans,
    };
  }

  @Get('plans/:id')
  @Public()
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  async getPlan(@Param('id') id: string) {
    const plan = await this.paymentsService.getPlanById(id);
    return {
      success: true,
      data: plan,
    };
  }

  // Payment Processing
  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @GetUser('id') userId: string,
  ) {
    const session = await this.paymentsService.createCheckoutSession(
      body.userId || userId,
      body.planId,
      body.successUrl,
      body.cancelUrl,
    );
    return {
      success: true,
      data: session,
    };
  }

  @Post('verify-payment')
  @Public()
  @ApiOperation({ summary: 'Verify payment completion' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  async verifyPayment(@Body() body: VerifyPaymentDto) {
    const result = await this.paymentsService.verifyPayment(body.sessionId);
    return {
      success: true,
      data: result,
    };
  }

  // Subscription Management
  @Get('subscription')
  @ApiOperation({ summary: 'Get user subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
  })
  async getUserSubscription(@GetUser('id') userId: string) {
    const subscription = await this.paymentsService.getUserSubscription(userId);
    return {
      success: true,
      data: subscription,
    };
  }

  @Put('subscription/cancel')
  @ApiOperation({ summary: 'Cancel user subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(
    @GetUser('id') userId: string,
    @Body() body: UpdateSubscriptionDto,
  ) {
    const result = await this.paymentsService.cancelSubscription(
      userId,
      body.cancelAtPeriodEnd ?? true,
    );
    return {
      success: true,
      data: result,
      message: 'Subscription cancelled successfully',
    };
  }

  @Post('customer-portal')
  @ApiOperation({ summary: 'Create customer portal session' })
  @ApiResponse({
    status: 200,
    description: 'Customer portal session created successfully',
  })
  async createCustomerPortalSession(
    @GetUser('id') userId: string,
    @Body() body: { returnUrl: string },
  ) {
    const result = await this.paymentsService.createCustomerPortalSession(
      userId,
      body.returnUrl,
    );
    return {
      success: true,
      data: result,
    };
  }

  // Payment History
  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async getPaymentHistory(
    @GetUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const payments = await this.paymentsService.getPaymentHistory(
      userId,
      limit || 20,
      offset || 0,
    );
    return {
      success: true,
      data: payments,
    };
  }

  // Webhook (Public endpoint)
  @Post('webhooks')
  @Public()
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Body() payload: any,
    @Body('signature') signature: string,
  ) {
    const result = await this.paymentsService.handleWebhook(
      payload,
      signature || '',
    );
    return result;
  }

  // Advanced Subscription Management
  @Put('subscription/change-plan')
  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan changed successfully',
  })
  async changeSubscriptionPlan(
    @Body() body: { planId: string },
    @GetUser('id') userId: string,
  ) {
    const result = await this.paymentsService.changeSubscriptionPlan(
      userId,
      body.planId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('subscription/can-subscribe/:planId')
  @ApiOperation({ summary: 'Check if user can subscribe to a plan' })
  @ApiResponse({ status: 200, description: 'Subscription eligibility checked' })
  async canSubscribeToPlan(
    @Param('planId') planId: string,
    @GetUser('id') userId: string,
  ) {
    const result = await this.paymentsService.canSubscribeToPlan(
      userId,
      planId,
    );
    return {
      success: true,
      data: result,
    };
  }
}
