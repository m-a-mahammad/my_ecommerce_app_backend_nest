import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { WishlistItemDto } from './dto/wishlist-item.dto';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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

  async addProductToWishlistService(
    user: UserResponseDto,
    createWishlistDto: CreateWishlistItemDto,
  ): Promise<ResponseFormItf<WishlistItemDto>> {
    const userId = user.id;
    if (!userId) throw new NotFoundException('User ID not found');

    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    const product = await this.productRepository.findOne({
      where: { id: createWishlistDto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const exists = await this.wishlistItemRepository.findOne({
      where: {
        wishlist: { id: wishlist.id },
        product: { id: product.id },
      },
    });
    if (exists) throw new ConflictException('Product already in wishlist');

    const wishlistItem = this.wishlistItemRepository.create({
      product,
      wishlist,
    });

    const createdItem = await this.wishlistItemRepository.save(wishlistItem);
    return {
      data: plainToInstance(WishlistItemDto, createdItem, {
        excludeExtraneousValues: true,
      }) as WishlistItemDto,
      message: 'Product added to wishlist',
    };
  }
}
