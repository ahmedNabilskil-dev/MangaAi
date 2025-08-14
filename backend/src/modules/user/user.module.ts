import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreditTransaction,
  CreditTransactionSchema,
  User,
  UserSchema,
} from './schemas/user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CreditTransaction.name, schema: CreditTransactionSchema },
    ]),
  ],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
