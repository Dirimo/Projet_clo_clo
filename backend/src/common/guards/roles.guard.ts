/**
 * ============================================================
 * common/guards/roles.guard.ts — Guard de contrôle des rôles
 * ============================================================
 * Rôle : Vérifie que l'utilisateur connecté possède le(s) rôle(s)
 *        requis pour accéder à un endpoint protégé.
 *
 * Fonctionnement :
 *  1. Lit les rôles requis depuis les métadonnées du handler/contrôleur
 *     (déclarés avec le décorateur @Roles(Role.ADMIN))
 *  2. Si aucun rôle requis → accès libre (return true)
 *  3. Extrait l'utilisateur depuis req.user (injecté par JwtAuthGuard)
 *  4. Vérifie que user.role correspond à l'un des rôles requis
 *  5. Accès refusé → ForbiddenException (403)
 *
 * Utilisation combinée (ordre important) :
 *  @UseGuards(JwtAuthGuard)   ← Étape 1 : vérifie l'authentification (JWT valide)
 *  @UseGuards(RolesGuard)     ← Étape 2 : vérifie le rôle (ADMIN, USER...)
 *  @Roles(Role.ADMIN)         ← Déclare le(s) rôle(s) accepté(s)
 *
 * Note : RolesGuard dépend de JwtAuthGuard pour que req.user soit défini.
 *        Il doit toujours être appliqué APRÈS JwtAuthGuard.
 * ============================================================
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user?.role === role);

    if (!hasRole) throw new ForbiddenException('Accès réservé aux administrateurs.');
    return true;
  }
}
