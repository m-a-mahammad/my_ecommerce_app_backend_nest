import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export enum PaymentMethod {
  CREDIT_CARD = Number(configService.get('CARD_INTEGRATION')),
  WALLET = Number(configService.get('WALLET_INTEGRATION')),
}
