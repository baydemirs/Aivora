import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe — ensures all DTOs are validated automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
