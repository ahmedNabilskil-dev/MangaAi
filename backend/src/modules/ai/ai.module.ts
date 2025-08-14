import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesModule } from '../../services/services.module';
import { DatabaseModule } from '../manga/database.module';
import { UserModule } from '../user/user.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import {
  ChatMessage,
  ChatMessageSchema,
  ChatSession,
  ChatSessionSchema,
} from './schemas/chat.schema';
import { MangaGenerationService } from './services/manga-generation.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DatabaseModule), // Use forwardRef to avoid circular dependency
    UserModule,
    ServicesModule,
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, MangaGenerationService],
  exports: [AiService, MangaGenerationService],
})
export class AiModule {}
