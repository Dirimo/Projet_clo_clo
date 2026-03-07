import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [CartModule],
  providers: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
