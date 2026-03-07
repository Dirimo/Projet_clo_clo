import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  },
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Historique de commandes de l'utilisateur connecté
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Détail d'une commande (utilisateur ou admin)
  async findOne(id: string, userId: string, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) throw new NotFoundException('Commande introuvable.');
    if (userRole !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé.');
    }

    return order;
  }

  // Admin : toutes les commandes avec pagination
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, orders] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Admin : mise à jour du statut
  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable.');

    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: ORDER_INCLUDE,
    });
  }
}
