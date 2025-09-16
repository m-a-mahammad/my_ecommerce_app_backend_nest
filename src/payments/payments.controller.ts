import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async createPayment(
    @Req() req: Request,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not authorized');
    const clientSecret = await this.paymentsService.createPaymentService(
      user,
      createPaymentDto,
    );
    return clientSecret;
  }
}
