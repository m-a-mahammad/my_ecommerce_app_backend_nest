import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async createProductService(
    createProductDto: CreateProductDto,
  ): Promise<ResponseFormItf<ProductResponseDto>> {
    const product = this.productsRepository.create(createProductDto);
    const createdProduct = await this.productsRepository.save(product);
    return {
      data: plainToInstance(
        ProductResponseDto,
        createdProduct,
      ) as ProductResponseDto,
      message: 'product created successfully',
    };
  }
}
