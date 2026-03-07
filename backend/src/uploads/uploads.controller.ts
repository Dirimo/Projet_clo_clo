import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const imageValidator = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB max
    new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
  ],
});

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  // POST /api/uploads/product-image/:productId?order=0
  @Post('product-image/:productId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadProductImage(
    @UploadedFile(imageValidator) file: Express.Multer.File,
    @Param('productId') productId: string,
    @Query('order') order?: string,
  ) {
    return this.uploadsService.uploadProductImage(file, productId, order ? parseInt(order) : 0);
  }

  // POST /api/uploads/category-image/:categoryId
  @Post('category-image/:categoryId')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadCategoryImage(
    @UploadedFile(imageValidator) file: Express.Multer.File,
    @Param('categoryId') categoryId: string,
  ) {
    return this.uploadsService.uploadCategoryImage(file, categoryId);
  }

  // DELETE /api/uploads/product-image/:imageId
  @Delete('product-image/:imageId')
  deleteProductImage(@Param('imageId') imageId: string) {
    return this.uploadsService.deleteProductImage(imageId);
  }
}
