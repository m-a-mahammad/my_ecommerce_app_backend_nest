import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cart-item.entity';
import { User } from 'src/users/entities/user.entity';
import { CartsService } from 'src/carts/carts.service';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { PaymobResponseItf } from 'src/interfaces/paymob-response.interface';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
    @InjectRepository(Cart) private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartsItemRepository: Repository<CartItem>,
    @InjectRepository(User) private usersRepository: Repository<User>,

    private readonly cartsService: CartsService,
    private readonly httpService: HttpService,
  ) {}

  async createPaymentService(
    user: UserResponseDto,
    createPaymentDto: CreatePaymentDto,
  ): Promise<ResponseFormItf<CreatePaymentDto>> {
    const userId = user.id;
    const { payment_method_id, payment_billing_data, payment_currency } =
      createPaymentDto;

    const userEntity = await this.usersRepository.findOneBy({ id: userId });
    if (!userEntity) throw new NotFoundException('User not found');

    const cart = await this.cartsRepository.findOneBy({ user: { id: userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const items = await this.cartsItemRepository.find({
      where: { cart: { id: cart.id } },
    });
    if (!items.length) throw new NotFoundException('Cart is empty');

    const totalEGP = this.cartsService.calculateTotalPrice(cart);
    const amount = Number(totalEGP * 100);
    const MethodId = payment_method_id;
    const currency = payment_currency || 'EGP';
    const billingData = payment_billing_data;

    if (amount < 100)
      throw new BadRequestException('Amount should be at least 1 pound');

    const payload = {
      amount,
      currency,
      payment_methods: [MethodId],
      billing_data: billingData,
    };

    const response = await firstValueFrom(
      this.httpService.post<PaymobResponseItf>(
        'https://accept.paymob.com/v1/intention/',
        payload,
        {
          headers: {
            Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const responseStatus = response.status;
    const { client_secret, id, status, created } = response.data;

    if (!responseStatus || responseStatus >= 400 || !client_secret)
      throw new BadGatewayException('Failed to get client_secret from Paymob');

    const createdPayment = new Payment();

    createdPayment.user = userEntity;
    createdPayment.amount = amount;
    createdPayment.currency = currency;
    createdPayment.method = MethodId;
    createdPayment.client_secret = client_secret;
    createdPayment.intention_id = id;
    createdPayment.status = status || 'intended';
    createdPayment.created_at = new Date(created);

    await this.paymentsRepository.save(createdPayment);

    return {
      message: 'client secret key created successfully',
      client_secret,
    };
  }
}
