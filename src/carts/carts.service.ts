import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { CartResponseDto } from './dto/cart-reponse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async getCartService(
    user: UserResponseDto,
  ): Promise<ResponseFormItf<CartResponseDto>> {
    const cart = await this.cartRepository.findOneBy({
      user: { id: user.id },
    });
    if (!cart) {
      const createdCart = this.cartRepository.create({
        user,
        items: [],
        totalPrice: 0,
      });
      await this.cartRepository.save(createdCart);
      return {
        data: plainToInstance(CartResponseDto, createdCart) as CartResponseDto,
      };
    } else {
      this.calculateTotalPrice(cart);
      await this.cartRepository.save(cart);
    }
    const totalItemsPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalItemsPrice;
    return { data: plainToInstance(CartResponseDto, cart) as CartResponseDto };
  }

  calculateTotalPrice(cart: CartResponseDto): number {
    return cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }
}
