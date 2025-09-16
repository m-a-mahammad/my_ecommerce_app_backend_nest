import { Expose, Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';

export class CartItemDto {
  @Expose()
  id: number;

  @Type(() => ProductResponseDto)
  @Expose()
  product: ProductResponseDto;

  @IsNumber()
  @Min(1)
  @Expose()
  quantity: number;
}
