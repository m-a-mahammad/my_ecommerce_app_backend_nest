import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getOrCreateWishlistByUserId(@Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const wishlist =
      await this.wishlistsService.getOrCreateWishlistByUserIdService(user);
    return wishlist;
  }

  @Post()
  @UseGuards(AuthGuard)
  async addProductToWishlist(
    @Req() req: Request,
    @Body() createWishlistDto: CreateWishlistItemDto,
  ) {
    const user = req.user;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const item = await this.wishlistsService.addProductToWishlistService(
      user,
      createWishlistDto,
    );

    if (!item) {
      throw new NotFoundException('Wishlist not found');
    }

    return item;
  }

  @Delete('id/:productId')
  @UseGuards(AuthGuard)
  async deleteProductFromWishlist(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const user = req.user;
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deletedItem =
      await this.wishlistsService.deleteProductFromWishlistService(
        user,
        +productId,
      );

    return deletedItem;
  }
}
