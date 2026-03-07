import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  /**
   * POST /api/stripe/checkout
   * Crée une session Stripe Checkout.
   * Optionnellement authentifié (supporte les commandes invité).
   */
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
  ) {
    // Essaie de récupérer l'userId si un token JWT est présent, sinon null
    const user = (req as any).user;
    return this.stripeService.createCheckoutSession(dto, user?.id);
  }

  /**
   * POST /api/stripe/webhook
   * Endpoint webhook Stripe — IMPORTANT : doit recevoir le raw body (pas parsé en JSON).
   * Configuré dans main.ts ou via un middleware express dédié.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    // req.body doit être le Buffer brut — voir configuration dans main.ts
    return this.stripeService.handleWebhook(req.body as Buffer, signature);
  }
}
