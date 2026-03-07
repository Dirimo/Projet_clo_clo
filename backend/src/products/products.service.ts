import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const PRODUCT_INCLUDE = {
  images: { orderBy: { order: 'asc' as const } },
  variants: true,
  category: { select: { id: true, name: true, slug: true } },
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const { search, categorySlug, minPrice, maxPrice, isFeatured, sortBy, page = 1, limit = 12 } = query;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'name_asc') orderBy = { name: 'asc' };

    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Produit introuvable.');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Produit introuvable.');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug || slugify(dto.name);

    const { variants, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    await this.findById(id);
    const { variants, ...data } = dto;

    return this.prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produit supprimé.' };
  }

  async toggleActive(id: string) {
    const product = await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      select: { id: true, isActive: true },
    });
  }
}
