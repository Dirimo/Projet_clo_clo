import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Cookie parser (pour les refresh tokens httpOnly)
  app.use(cookieParser());

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true,
      transform: true,        // transforme les types automatiquement
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true, // nécessaire pour les cookies httpOnly
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Préfixe global de l'API
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`API running on http://localhost:${port}/api`);
}

bootstrap();
