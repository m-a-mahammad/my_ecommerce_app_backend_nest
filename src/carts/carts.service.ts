import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { CartResponseDto } from './dto/cart-reponse.dto';
import { plainToInstance } from 'class-transformer';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartItemDto } from './dto/cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
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

  async addOrUpdateCartItemService(
    user: UserResponseDto,
    createOrUpdateCartDto: CreateCartDto | UpdateCartDto,
  ): Promise<ResponseFormItf<CartItemDto>> {
    const { productId, quantity } = createOrUpdateCartDto;

    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
    });

    const product = await this.productRepository.findOneBy({
      id: productId,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cartItem = await this.cartItemRepository.findOneBy({
      product: { id: productId },
    });

    if (!cartItem) throw new NotFoundException('Cart item not found');

    if (!cart) {
      const cart = this.cartRepository.create({
        user,
        items: [],
        totalPrice: 0,
      });
      await this.cartRepository.save(cart);
      return { data: cartItem, message: 'Cart created successfully' };
    }

    const existingItem = cart.items.find(
      (item) => item.product.id === product.id,
    );

    if (!existingItem) {
      const cartItem = new CartItem();
      cartItem.product = product;
      cartItem.quantity = Number(quantity) || 1;
      cartItem.cart = cart;
      cart.items.push(cartItem);
    } else {
      existingItem.quantity = Number(quantity) || 1;
      await this.cartItemRepository.save(existingItem);
    }

    const totalItemsPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalItemsPrice;
    await this.cartRepository.save(cart);
    return {
      data: plainToInstance(CartItemDto, existingItem) as CartItemDto,
      message: 'Cart updated successfully',
    };
  }

  async deleteCartItemService(
    userId: number,
    productId: number,
  ): Promise<ResponseFormItf<CartItemDto>> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const deletedItem = await this.cartItemRepository.delete({
      cart: { id: cart.id },
      product: { id: productId },
    });
    return {
      data: plainToInstance(CartItemDto, deletedItem) as CartItemDto,
      message: 'Item removed from cart',
    };
  }

  calculateTotalPrice(cart: CartResponseDto): number {
    return cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }
}
