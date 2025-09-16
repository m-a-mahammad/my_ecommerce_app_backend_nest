export enum PaymentMethod {
  CREDIT_CARD = Number(process.env.CARD_INTEGRATION),
  WALLET = Number(process.env.WALLET_INTEGRATION),
}
