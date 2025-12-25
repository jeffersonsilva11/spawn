/**
 * Main Application Bootstrap
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  const corsOrigin = configService.get('CORS_ORIGIN') || '*';
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Port
  const port = configService.get('BACKEND_PORT') || 3000;
  const host = configService.get('BACKEND_HOST') || '0.0.0.0';

  await app.listen(port, host);

  logger.log(`🚀 Backend API is running on http://${host}:${port}`);
  logger.log(`📊 Environment: ${configService.get('NODE_ENV') || 'development'}`);
  logger.log(`🔐 CORS enabled for: ${corsOrigin}`);
}

bootstrap();
