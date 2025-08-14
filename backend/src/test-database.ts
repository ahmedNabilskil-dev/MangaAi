import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './modules/manga/database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const databaseService = app.get(DatabaseService);

  try {
    console.log('Testing database connection...');

    // Test creating a simple manga project
    const testProject = await databaseService.createMangaProject({
      title: 'Test Manga Project',
      description: 'A test project to verify MongoDB connection',
      status: 'draft',
      genre: 'adventure',
      artStyle: 'anime',
      targetAudience: 'teen',
      published: false,
      viewCount: 0,
      likeCount: 0,
    });

    console.log(
      '✅ Successfully created test manga project:',
      testProject.title,
    );

    // Test retrieving the project
    const projectId = (testProject as any)._id.toString();
    const retrievedProject = await databaseService.getMangaProject(projectId);
    console.log('✅ Successfully retrieved project:', retrievedProject?.title);

    // Cleanup - delete the test project
    await databaseService.deleteMangaProject(projectId);
    console.log('✅ Successfully cleaned up test project');

    console.log('🎉 Database connection and schemas are working correctly!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
