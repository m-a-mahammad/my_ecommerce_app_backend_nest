import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const createdProduct =
      await this.productsService.createProductService(createProductDto);
    return createdProduct;
  }

  @Get()
  async getAllProducts(@Query() paginationDto: PaginationDto) {
    const products =
      await this.productsService.getAllProductsService(paginationDto);
    return products;
  }
}
