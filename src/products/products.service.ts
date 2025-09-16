import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { ProductResponseDto } from './dto/product-response.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  async getProductByIdService(
    id: number,
  ): Promise<ResponseFormItf<ProductResponseDto>> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    return {
      data: plainToInstance(ProductResponseDto, product) as ProductResponseDto,
    };
  }

  async getProductBySlugService(
    slug: string,
  ): Promise<ResponseFormItf<ProductResponseDto>> {
    const product = await this.productsRepository.findOne({ where: { slug } });
    if (!product)
      throw new NotFoundException(`Product with slug name ${slug} not found`);
    return {
      data: plainToInstance(ProductResponseDto, product) as ProductResponseDto,
    };
  }

  async updateProductByIdService(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponseFormItf<ProductResponseDto>> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productsRepository.save(product);

    return {
      data: plainToInstance(
        ProductResponseDto,
        updatedProduct,
      ) as ProductResponseDto,
      message: `product ${id} has updated successfully`,
    };
  }
}
