/**
 * ============================================================
 * cart/cart.service.ts — Validation serveur du panier
 * ============================================================
 * Rôle : Valide le contenu du panier côté serveur avant tout paiement.
 *        Les prix et stocks affichés côté client ne sont JAMAIS utilisés
 *        pour facturer — tout est recalculé depuis la base de données.
 *
 * Règle de sécurité fondamentale :
 *  → Un client malveillant pourrait manipuler les prix dans le store Pinia.
 *    Ce service empêche toute fraude en rechargeant les prix depuis la DB.
 *
 * Méthode publique :
 *  - validate(dto) : valide chaque article et applique le code promo
 *    Étape 1 : Vérifie que le panier n'est pas vide
 *    Étape 2 : Pour chaque article → validateItem() :
 *              - Produit existant et actif (isActive = true)
 *              - Variante existante si variantId fourni
 *              - Stock suffisant (product.stock ou variant.stock)
 *              - Prix recalculé : product.price + variant.priceAdjustment
 *    Étape 3 : Calcule le sous-total (somme prix × quantité)
 *    Étape 4 : Si promoCode → validatePromoCode() :
 *              - Promo active, non expirée, limite d'utilisation non atteinte
 *              - Montant minimum de commande respecté
 *              - Calcul de la remise (PERCENTAGE ou FIXED en centimes)
 *    Étape 5 : Retourne ValidatedCart avec subtotal, discountAmount, total
 *
 * Types retournés :
 *  - ValidatedCartItem : article validé avec prix réel DB
 *  - ValidatedCart     : panier complet avec totaux calculés
 * ============================================================
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidateCartDto, CartItemDto } from './dto/validate-cart.dto';

export type ValidatedCartItem = {
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number; // en centimes, prix réel recalculé depuis la DB
  imageUrl?: string;
};

export type ValidatedCart = {
  items: ValidatedCartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCode?: string;
  promoId?: string;
};

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validation serveur obligatoire avant le checkout :
   * 1. Vérifie que chaque produit/variante existe et est actif
   * 2. Vérifie le stock disponible
   * 3. Recalcule les prix depuis la DB (jamais du client)
   * 4. Applique le code promo si fourni
   */
  async validate(dto: ValidateCartDto): Promise<ValidatedCart> {
    if (!dto.items.length) {
      throw new BadRequestException('Le panier est vide.');
    }

    const validatedItems: ValidatedCartItem[] = [];

    for (const item of dto.items) {
      const validatedItem = await this.validateItem(item);
      validatedItems.push(validatedItem);
    }

    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    let discountAmount = 0;
    let promoId: string | undefined;

    if (dto.promoCode) {
      const promo = await this.validatePromoCode(dto.promoCode, subtotal);
      promoId = promo.id;

      if (promo.type === 'PERCENTAGE') {
        discountAmount = Math.round(subtotal * (promo.value / 100));
      } else {
        // FIXED — ne peut pas dépasser le subtotal
        discountAmount = Math.min(promo.value, subtotal);
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    return {
      items: validatedItems,
      subtotal,
      discountAmount,
      total,
      promoCode: dto.promoCode,
      promoId,
    };
  }

  // ─── Helpers privés ─────────────────────────────────────────────

  private async validateItem(item: CartItemDto): Promise<ValidatedCartItem> {
    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Produit introuvable : ${item.productId}`);
    }

    let unitPrice = product.price;
    let variantLabel: string | undefined;
    let availableStock = product.stock;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new NotFoundException(
          `Variante introuvable pour le produit "${product.name}".`,
        );
      }
      unitPrice = product.price + variant.priceAdjustment;
      variantLabel = `${variant.name}: ${variant.value}`;
      availableStock = variant.stock;
    }

    if (availableStock < item.quantity) {
      throw new UnprocessableEntityException(
        `Stock insuffisant pour "${product.name}"${variantLabel ? ` (${variantLabel})` : ''}. Disponible : ${availableStock}.`,
      );
    }

    return {
      productId: product.id,
      variantId: item.variantId,
      productName: product.name,
      variantLabel,
      quantity: item.quantity,
      unitPrice,
      imageUrl: product.images[0]?.url,
    };
  }

  private async validatePromoCode(code: string, subtotal: number) {
    const promo = await this.prisma.promo.findUnique({ where: { code } });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Code promo invalide ou inactif.');
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new BadRequestException('Ce code promo a expiré.');
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Ce code promo a atteint sa limite d\'utilisation.');
    }

    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      const min = (promo.minOrderAmount / 100).toFixed(2);
      throw new BadRequestException(
        `Commande minimum de ${min}€ requise pour ce code promo.`,
      );
    }

    return promo;
  }
}
