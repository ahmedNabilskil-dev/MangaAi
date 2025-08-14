import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareController } from './share.controller';
import { Share, ShareSchema } from './share.schema';
import { ShareService } from './share.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Share.name, schema: ShareSchema }]),
  ],
  providers: [ShareService],
  controllers: [ShareController],
  exports: [ShareService],
})
export class ShareModule {}
