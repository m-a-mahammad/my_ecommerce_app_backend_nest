import { Expose, Type } from 'class-transformer';
import { WishlistItemDto } from './wishlist-item.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

export class WishlistResponseDto {
  @Expose()
  id: number;

  @Type(() => UserResponseDto)
  user: number;

  @Expose()
  @Type(() => WishlistItemDto)
  items: WishlistItemDto[];

  @Expose()
  createdAt: Date;
}
