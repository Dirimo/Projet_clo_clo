/**
 * ============================================================
 * auth/auth.controller.ts — Contrôleur des routes d'authentification
 * ============================================================
 * Rôle : Expose les endpoints HTTP d'auth et gère le cookie refresh token.
 *        Délègue toute la logique métier à AuthService.
 *
 * Routes exposées (préfixe /api/auth) :
 *  POST /api/auth/register  → Création de compte
 *  POST /api/auth/login     → Connexion (200 OK)
 *  POST /api/auth/refresh   → Renouvellement du token (JwtRefreshGuard)
 *  POST /api/auth/logout    → Déconnexion (JwtAuthGuard)
 *
 * Gestion du cookie refresh_token :
 *  - httpOnly: true  → inaccessible au JavaScript (protection XSS)
 *  - secure: true    → envoyé uniquement en HTTPS (production)
 *  - sameSite: 'lax' → protection CSRF partielle
 *  - maxAge: 7 jours → durée de vie du cookie
 *  - path: '/'       → accessible sur toutes les routes
 *
 * Pattern @Res({ passthrough: true }) :
 *  Permet d'utiliser res.cookie() tout en laissant NestJS sérialiser
 *  le retour de la méthode en JSON automatiquement.
 *
 * Note sécurité :
 *  Le refreshToken n'est JAMAIS renvoyé dans le corps de la réponse —
 *  uniquement dans le cookie httpOnly → invisible au frontend JS.
 * ============================================================
 */
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.register(dto);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user, accessToken };
  }

  // POST /api/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user, accessToken };
  }

  // POST /api/auth/refresh
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    const { accessToken, refreshToken } = await this.authService.refresh(
      user.sub,
      user.refreshToken,
    );
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken };
  }

  // POST /api/auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Déconnecté avec succès.' };
  }
}
