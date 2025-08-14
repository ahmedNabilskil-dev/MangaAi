import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:9002',
      'http://localhost:3000',
      'http://0.0.0.0:9002',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MangaAI Backend API')
    .setDescription('Backend API for MangaAI application')
    .setVersion('1.0')
    .addTag('ai', 'AI-related endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('manga', 'Manga project endpoints')
    .addTag('credits', 'Credit management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('mcp', 'Model Context Protocol endpoints')
    .addTag('health', 'System health and monitoring endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MangaAI Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`⏰ All timeouts disabled for long-running AI operations`);
}

bootstrap();
