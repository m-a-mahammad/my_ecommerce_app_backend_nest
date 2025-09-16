import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartService: CartsService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getCart(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User is not found in request');
    }

    const cart = await this.cartService.getCartService(user);
    return cart;
  }

  @UseGuards(AuthGuard)
  @Post('create-or-update')
  async addOrUpdateCartItem(
    @Req() req: Request,
    @Body() createCartDto: CreateCartDto,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not logged in');
    }
    const cartItem = await this.cartService.addOrUpdateCartItemService(
      user,
      createCartDto,
    );
    return cartItem;
  }

  @UseGuards(AuthGuard)
  @Delete('id/:productId')
  async deleteCartItem(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const userId = req.userId;
    if (!userId) {
      throw new UnauthorizedException('User not logged in');
    }
    return this.cartService.deleteCartItemService(+userId, +productId);
  }
}
