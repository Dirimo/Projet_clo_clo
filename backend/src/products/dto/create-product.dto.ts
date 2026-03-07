import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @IsOptional()
  priceAdjustment?: number;

  @IsString()
  @IsOptional()
  sku?: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string; // auto-généré si absent

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  price: number; // en centimes

  @IsInt()
  @IsOptional()
  comparePrice?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];
}
