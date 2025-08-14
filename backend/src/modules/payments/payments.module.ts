import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../manga/database.module';
import { UserModule } from '../user/user.module';
import { PaymentSeederService } from './payment-seeder.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import {
  Payment,
  PaymentSchema,
  Plan,
  PlanSchema,
  WebhookEvent,
  WebhookEventSchema,
} from './schemas/payment.schema';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentSeederService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
