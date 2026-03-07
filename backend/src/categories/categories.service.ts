import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
          take: 20,
        },
      },
    });
    if (!category) throw new NotFoundException('Catégorie introuvable.');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Ce slug est déjà utilisé.');

    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    await this.findOneById(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneById(id);
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Catégorie supprimée.' };
  }

  private async findOneById(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Catégorie introuvable.');
    return cat;
  }
}
