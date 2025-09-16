import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  productId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;
}
