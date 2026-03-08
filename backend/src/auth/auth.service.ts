/**
 * ============================================================
 * auth/auth.service.ts — Logique métier d'authentification
 * ============================================================
 * Rôle : Implémente les 4 opérations d'authentification :
 *        register, login, refresh (renouvellement token), logout.
 *
 * Stratégie double token :
 *  - accessToken  : JWT signé avec JWT_SECRET, expire en 15 min
 *                   → Envoyé dans le corps de la réponse, stocké en sessionStorage
 *  - refreshToken : JWT signé avec JWT_REFRESH_SECRET, expire en 7 jours
 *                   → Envoyé en cookie httpOnly (invisible au JS → anti-XSS)
 *                   → Hashé en bcrypt avant stockage en DB (anti-vol DB)
 *
 * Sécurité :
 *  - Mots de passe hashés bcrypt (10 rounds) avant stockage
 *  - Messages d'erreur génériques pour login ("Identifiants invalides")
 *    → Évite l'énumération des emails
 *  - Refresh token comparé via bcrypt.compare() (jamais stocké en clair)
 *
 * Méthodes publiques :
 *  - register(dto)              : crée un compte + retourne les tokens
 *  - login(dto)                 : vérifie identifiants + retourne les tokens
 *  - refresh(userId, rawToken)  : renouvelle les 2 tokens si refresh valide
 *  - logout(userId)             : invalide le refresh token en DB (null)
 *
 * Méthodes privées :
 *  - generateTokens()    : génère accessToken + refreshToken en parallèle
 *  - saveRefreshToken()  : hashe et sauvegarde le refresh token en DB
 * ============================================================
 */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides.');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Identifiants invalides.');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refresh(userId: string, rawRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new ForbiddenException();

    const tokenMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!tokenMatch) throw new ForbiddenException('Refresh token invalide.');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ─── Helpers privés ───────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}
