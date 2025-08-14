import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { UserModule } from '../user/user.module';
import { DatabaseService } from './database.service';
import { MangaController } from './manga.controller';
import {
  Chapter,
  ChapterSchema,
  Panel,
  PanelDialogue,
  PanelDialogueSchema,
  PanelSchema,
  Scene,
  SceneSchema,
} from './schemas/chapter.schema';
import { Character, CharacterSchema } from './schemas/character.schema';
import {
  LocationTemplate,
  LocationTemplateSchema,
} from './schemas/location-template.schema';
import {
  MangaProject,
  MangaProjectSchema,
} from './schemas/manga-project.schema';
import {
  OutfitTemplate,
  OutfitTemplateSchema,
} from './schemas/outfit-template.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: MangaProject.name, schema: MangaProjectSchema },
      { name: Character.name, schema: CharacterSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: Scene.name, schema: SceneSchema },
      { name: Panel.name, schema: PanelSchema },
      { name: PanelDialogue.name, schema: PanelDialogueSchema },
      { name: OutfitTemplate.name, schema: OutfitTemplateSchema },
      { name: LocationTemplate.name, schema: LocationTemplateSchema },
    ]),
    forwardRef(() => AiModule), // Use forwardRef to avoid circular dependency
    UserModule,
  ],
  controllers: [MangaController],
  providers: [DatabaseService],
  exports: [DatabaseService, MongooseModule],
})
export class DatabaseModule {}
