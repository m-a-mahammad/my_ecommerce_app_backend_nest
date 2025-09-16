import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async getOrCreateWishlistByUserIdService(
    user: UserResponseDto,
  ): Promise<ResponseFormItf<WishlistResponseDto>> {
    const userId = user.id;

    if (!userId) {
      throw new NotFoundException('User ID not found');
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wishlist) {
      const newWishlistItem = this.wishlistRepository.create({
        user: { id: userId },
        items: [],
      });
      const createdWishlist =
        await this.wishlistRepository.save(newWishlistItem);
      return {
        data: plainToInstance(WishlistResponseDto, createdWishlist, {
          excludeExtraneousValues: true,
        }) as WishlistResponseDto,
        message: 'Wishlist created successfully',
      };
    }

    return {
      data: plainToInstance(WishlistResponseDto, wishlist, {
        excludeExtraneousValues: true,
      }) as WishlistResponseDto,
    };
  }
}
