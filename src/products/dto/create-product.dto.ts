import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';

class CreateImageDto {
  @IsUrl()
  url: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsInt()
  stock: number;

  @ValidateNested()
  @Type(() => CreateImageDto)
  image: CreateImageDto;
}
