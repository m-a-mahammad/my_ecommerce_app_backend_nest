import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { ProductResponseDto } from './dto/product-response.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';
import { PaginationDto } from './dto/pagination.dto';

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

  async getAllProductsService(
    paginationDto: PaginationDto,
  ): Promise<ResponseFormItf<ProductResponseDto[]>> {
    const limit = paginationDto.limit ?? DEFAULT_PAGE_SIZE;
    const page = paginationDto.page ?? 0;
    const skip = page * limit;
    const product = await this.productsRepository.find({
      skip,
      take: limit,
    });
    return {
      data: plainToInstance(
        ProductResponseDto,
        product,
      ) as ProductResponseDto[],
    };
  }
}
