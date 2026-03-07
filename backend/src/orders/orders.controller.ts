import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // GET /api/orders/me
  @Get('me')
  getMyOrders(@GetUser('id') userId: string) {
    return this.ordersService.findMyOrders(userId);
  }

  // GET /api/orders/:id
  @Get(':id')
  getOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
  ) {
    return this.ordersService.findOne(id, userId, role);
  }

  // GET /api/orders — admin
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  // PATCH /api/orders/:id/status — admin
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
