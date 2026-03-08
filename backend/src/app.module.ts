/**
 * ============================================================
 * app.module.ts — Module racine de l'application NestJS
 * ============================================================
 * Rôle : Déclare et assemble tous les modules métier de l'API CLO-CLO.
 *        C'est le point d'entrée du système d'injection de dépendances NestJS.
 *
 * Ordre d'import important :
 *  1. ConfigModule    → doit être en premier (isGlobal: true) pour que
 *                       les autres modules puissent injecter ConfigService
 *  2. PrismaModule    → base de données (@Global, disponible partout sans ré-import)
 *  3. Modules métier  → AuthModule, UsersModule, ProductsModule, etc.
 *
 * Modules inclus :
 *  - AuthModule       : register / login / refresh / logout
 *  - UsersModule      : CRUD utilisateurs (admin protégé)
 *  - ProductsModule   : catalogue produits avec filtres et pagination
 *  - CategoriesModule : CRUD catégories
 *  - CartModule       : validation serveur du panier avant paiement
 *  - StripeModule     : session Checkout + webhook paiement
 *  - UploadsModule    : upload images vers Cloudinary
 *  - OrdersModule     : historique commandes + gestion admin
 * ============================================================
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { StripeModule } from './stripe/stripe.module';
import { UploadsModule } from './uploads/uploads.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // Config globale — doit être en premier
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de données
    PrismaModule,

    // Modules métier
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    StripeModule,
    UploadsModule,
    OrdersModule,
  ],
})
export class AppModule {}
