import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { ValidateCartDto } from './dto/validate-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  /**
   * POST /api/cart/validate
   * Appelé avant le checkout pour valider les prix, le stock et les promos.
   * Accessible sans authentification (commandes invité supportées).
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() dto: ValidateCartDto) {
    return this.cartService.validate(dto);
  }
}
