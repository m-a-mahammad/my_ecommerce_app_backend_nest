import { CreateProductDto } from './create-product.dto';
import { IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/mapped-types';

class UpdateImageDto {
  @IsUrl()
  url?: string;
}

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['image'] as const),
) {
  @ValidateNested()
  @Type(() => UpdateImageDto)
  image?: UpdateImageDto;
}
