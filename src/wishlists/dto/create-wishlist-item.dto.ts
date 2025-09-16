import { Expose } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateWishlistItemDto {
  @Expose()
  @IsNumber()
  @IsPositive()
  productId: number;
}
