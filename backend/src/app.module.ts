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
