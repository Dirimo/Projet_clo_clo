import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadProductImage(
    file: Express.Multer.File,
    productId: string,
    order = 0,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new BadRequestException('Produit introuvable.');

    const result = await this.uploadToCloudinary(file.buffer, `products/${productId}`);

    return this.prisma.productImage.create({
      data: {
        productId,
        url: result.secure_url,
        publicId: result.public_id,
        alt: product.name,
        order,
      },
    });
  }

  async uploadCategoryImage(file: Express.Multer.File, categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Catégorie introuvable.');

    // Supprime l'ancienne image Cloudinary si elle existe
    if (category.imagePublicId) {
      await cloudinary.uploader.destroy(category.imagePublicId);
    }

    const result = await this.uploadToCloudinary(file.buffer, `categories`);

    return this.prisma.category.update({
      where: { id: categoryId },
      data: { imageUrl: result.secure_url, imagePublicId: result.public_id },
    });
  }

  async deleteProductImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new BadRequestException('Image introuvable.');

    await cloudinary.uploader.destroy(image.publicId);
    await this.prisma.productImage.delete({ where: { id: imageId } });

    return { message: 'Image supprimée.' };
  }

  private uploadToCloudinary(
    buffer: Buffer,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `clo-clo/${folder}`,
            resource_type: 'image',
            // Transformation par défaut : WebP, max 1200px
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'webp' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!);
          },
        )
        .end(buffer);
    });
  }
}
