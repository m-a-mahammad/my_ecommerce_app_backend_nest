import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';

export class CartItemDto {
  id: number;

  @Type(() => ProductResponseDto)
  product: ProductResponseDto;

  @IsNumber()
  @Min(1)
  quantity: number;
}
