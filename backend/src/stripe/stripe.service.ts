import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cartService: CartService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(dto: CreateCheckoutDto, userId?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // 1. Validation serveur du panier (prix, stock, promos)
    const validatedCart = await this.cartService.validate({
      items: dto.items,
      promoCode: dto.promoCode,
    });

    // 2. Construction des line_items Stripe depuis les données validées (pas du client)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedCart.items.map(
      (item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.productName,
            description: item.variantLabel,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: item.unitPrice, // centimes
        },
        quantity: item.quantity,
      }),
    );

    // 3. Gestion de la remise promo via Stripe Coupon
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (validatedCart.discountAmount > 0) {
      const coupon = await this.stripe.coupons.create({
        amount_off: validatedCart.discountAmount,
        currency: 'eur',
        name: `Promo: ${dto.promoCode}`,
        max_redemptions: 1,
      });
      discounts.push({ coupon: coupon.id });
    }

    // 4. Pré-création de la commande en statut PENDING
    const order = await this.prisma.order.create({
      data: {
        userId: userId ?? null,
        status: 'PENDING',
        subtotal: validatedCart.subtotal,
        discountAmount: validatedCart.discountAmount,
        total: validatedCart.total,
        promoCode: validatedCart.promoCode,
        promoId: validatedCart.promoId,
        items: {
          create: validatedCart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            productName: item.productName,
            variantLabel: item.variantLabel ?? null,
          })),
        },
      },
    });

    // 5. Création de la session Stripe Checkout
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      discounts: discounts.length ? discounts : undefined,
      success_url: dto.successUrl || `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: dto.cancelUrl || `${frontendUrl}/cart`,
      metadata: { orderId: order.id },
      payment_intent_data: {
        metadata: { orderId: order.id },
      },
      // Collecte de l'adresse de livraison côté Stripe
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU'],
      },
      // Autorise les codes promo Stripe (optionnel, en plus des nôtres)
      allow_promotion_codes: !dto.promoCode,
    });

    // 6. Liaison session Stripe → commande
    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url, sessionId: session.id, orderId: order.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Signature webhook invalide.');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // Ignorer les événements non gérés
        break;
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    // Mise à jour de la commande : PAID + snapshot adresse Stripe
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripePaymentId: session.payment_intent as string,
        shippingAddress: session.shipping_details ?? undefined,
      },
    });

    // Décrémenter le stock de chaque article
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      await Promise.all(
        order.items.map(async (item) => {
          if (item.variantId) {
            await this.prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          } else {
            await this.prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }),
      );

      // Incrémenter le compteur d'utilisation du code promo
      if (order.promoId) {
        await this.prisma.promo.update({
          where: { id: order.promoId },
          data: { usedCount: { increment: 1 } },
        });
      }
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }
}
