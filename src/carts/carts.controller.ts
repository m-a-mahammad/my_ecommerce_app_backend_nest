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
import { UpdateCartDto } from './dto/update-cart.dto';

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

  @Post('create-or-update')
  @UseGuards(AuthGuard)
  async addOrUpdateCartItem(
    @Req() req: Request,
    @Body() createOrUpdateCartDto: CreateCartDto | UpdateCartDto,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not logged in');
    }
    const cartItem = await this.cartService.addOrUpdateCartItemService(
      user,
      createOrUpdateCartDto,
    );
    return cartItem;
  }

  @Delete('id/:productId')
  @UseGuards(AuthGuard)
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
