import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

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
}
