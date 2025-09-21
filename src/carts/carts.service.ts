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
        data: plainToInstance(CartResponseDto, createdCart),
      };
    } else {
      this.calculateTotalPrice(cart);
      await this.cartRepository.save(cart);
    }
    const totalItemsPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalItemsPrice;
    return { data: plainToInstance(CartResponseDto, cart) };
  }

  async addOrUpdateCartItemService(
    user: UserResponseDto,
    createCartDto: CreateCartDto,
  ): Promise<ResponseFormItf<CartItemDto>> {
    const { productId, quantity } = createCartDto;
    let isNew: boolean = false;

    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    if (!cart) {
      cart = this.cartRepository.create({
        user,
        items: [],
        totalPrice: 0,
      });
      await this.cartRepository.save(cart);
      isNew = true;
    }

    let cartItem = cart.items.find((item) => item.product.id === productId);

    if (!cartItem) {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: quantity || 1,
      });
      cart.items.push(cartItem);
    } else {
      cartItem.quantity = quantity || 1;
    }

    await this.cartItemRepository.save(cartItem);

    cart.totalPrice = this.calculateTotalPrice(cart);
    await this.cartRepository.save(cart);

    return {
      data: plainToInstance(CartItemDto, cartItem, {
        excludeExtraneousValues: true,
      }),
      message: isNew
        ? 'Cart created successfully'
        : 'Cart updated successfully',
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

    const deletedItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (!deletedItem) throw new NotFoundException('Cart item not found');

    await this.cartItemRepository.delete(deletedItem.id);
    return {
      data: plainToInstance(CartItemDto, deletedItem),
      message: 'Item deleted from cart',
    };
  }

  calculateTotalPrice(cart: CartResponseDto): number {
    return cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }
}
