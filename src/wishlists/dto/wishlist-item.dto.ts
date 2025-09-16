import { Expose, Type } from 'class-transformer';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';

export class WishlistItemDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => ProductResponseDto)
  product: ProductResponseDto;

  @Expose()
  addedAt: Date;
}
