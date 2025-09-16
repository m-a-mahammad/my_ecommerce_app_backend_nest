import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartService: CartsService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getCart(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User is not found in request');
    }

    const cart = await this.cartService.getCartService(user);
    return cart;
  }
}
