import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';

import { IsNumber } from 'class-validator';
import { CartItemDto } from './cart-item.dto';

export class CartResponseDto {
  @Expose()
  id: number;

  @Exclude()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @Expose()
  @IsNumber()
  totalPrice: number;
}
