/**
 * ============================================================
 * prisma/prisma.service.ts — Service Prisma partagé
 * ============================================================
 * Rôle : Fournit une instance unique de PrismaClient à toute l'application
 *        via le système d'injection de dépendances NestJS.
 *
 * Pourquoi étendre PrismaClient ?
 *  → PrismaService hérite de toutes les méthodes Prisma (prisma.user.findMany, etc.)
 *    tout en bénéficiant du cycle de vie NestJS (OnModuleInit, OnModuleDestroy).
 *
 * Cycle de vie :
 *  - onModuleInit()    : appelé au démarrage → ouvre la connexion PostgreSQL
 *  - onModuleDestroy() : appelé à l'arrêt   → ferme proprement la connexion
 *
 * Utilisation :
 *  Ce service est déclaré dans PrismaModule avec @Global(),
 *  ce qui le rend disponible dans tous les modules sans ré-import.
 *  Injection : constructor(private prisma: PrismaService) {}
 * ============================================================
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
