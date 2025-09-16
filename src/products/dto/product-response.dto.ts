import { Expose, Type } from 'class-transformer';

class ImageDto {
  @Expose()
  url: string;
}

export class ProductResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  brand: string;

  @Expose()
  category: string;

  @Expose()
  stock: number;

  @Expose()
  @Type(() => ImageDto)
  image: ImageDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
