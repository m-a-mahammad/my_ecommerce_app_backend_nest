import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  @Get('id/:id')
  async getProductById(@Param('id') id: string) {
    const product = await this.productsService.getProductByIdService(+id);
    return product;
  }

  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.getProductBySlugService(slug);
    return product;
  }

  @Patch(':id')
  async updateProductById(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = await this.productsService.updateProductByIdService(
      +id,
      updateProductDto,
    );
    return updatedProduct;
  }
}
