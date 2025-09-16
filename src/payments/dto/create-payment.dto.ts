import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { BillingDataDto } from './billing-data.dto';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  payment_method_id: PaymentMethod;

  @ValidateNested()
  @Type(() => BillingDataDto)
  payment_billing_data: BillingDataDto;

  @IsOptional()
  payment_currency?: string = 'EGP';
}
