/**
 * ============================================================
 * main.ts — Point d'entrée de l'application NestJS
 * ============================================================
 * Rôle : Bootstrap (démarrage) de l'API CLO-CLO.
 *        Configure les middlewares globaux, la validation,
 *        le CORS et le préfixe de routes avant d'écouter.
 *
 * Étapes de démarrage :
 *  1. Création de l'application NestJS (avec AppModule)
 *  2. Activation du cookie-parser (nécessaire pour lire les refresh tokens httpOnly)
 *  3. Configuration de la validation globale des DTOs (class-validator)
 *  4. Configuration CORS (origine = FRONTEND_URL depuis .env)
 *  5. Préfixe global "/api" → toutes les routes deviennent /api/...
 *  6. Écoute sur le port défini dans .env (défaut : 3001)
 *
 * Variables d'environnement utilisées :
 *  - PORT          : port d'écoute (défaut 3001)
 *  - FRONTEND_URL  : origine autorisée pour CORS (défaut http://localhost:3000)
 *  - NODE_ENV      : production/development (affecte secure cookie flag)
 * ============================================================
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Étape 1 : Création de l'app NestJS à partir du module racine
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Étape 2 : Cookie parser — permet de lire req.cookies (refresh_token httpOnly)
  app.use(cookieParser());

  // Étape 3 : Validation globale des DTOs via class-validator
  //   whitelist              → supprime les champs non déclarés dans le DTO (sécurité)
  //   forbidNonWhitelisted   → renvoie 400 si des champs inconnus sont envoyés
  //   transform              → convertit automatiquement les types (string → number, etc.)
  //   enableImplicitConversion → conversion implicite sans décorateur @Type()
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

  // Étape 4 : CORS — autorise le frontend Nuxt à appeler l'API avec cookies
  //   credentials: true → indispensable pour envoyer/recevoir les cookies httpOnly
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true, // nécessaire pour les cookies httpOnly
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Étape 5 : Préfixe global → /products devient /api/products, etc.
  app.setGlobalPrefix('api');

  // Étape 6 : Démarrage du serveur HTTP
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`API running on http://localhost:${port}/api`);
}

bootstrap();
